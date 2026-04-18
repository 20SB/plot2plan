import Anthropic from '@anthropic-ai/sdk'
import {
  inferBHKType, getBHKTemplate, computeVastuZones, getEntranceZone,
  clampToBoundary, enforceMinSizes, validateLayout,
  REFERENCE_2BHK_NORTH, REFERENCE_3BHK_EAST,
  type SimpleRoom,
} from './floor-plan-engine'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GeneratedRoom {
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  floor: number
}

// Keep Room as an alias so we can cast SimpleRoom[] properly
type Room = GeneratedRoom

export interface GenerateLayoutInput {
  plotWidth: number
  plotHeight: number
  plotUnit: string
  numFloors: number
  style: string
  facing: string
  rooms: string[]
  title: string
}

/** Normalize facing value to single-letter code used by floor-plan-engine */
function normalizeFacing(facing: string): string {
  const map: Record<string, string> = {
    north: 'N', south: 'S', east: 'E', west: 'W',
    'north-east': 'NE', 'northeast': 'NE',
    'north-west': 'NW', 'northwest': 'NW',
    'south-east': 'SE', 'southeast': 'SE',
    'south-west': 'SW', 'southwest': 'SW',
  }
  return map[facing.toLowerCase()] ?? facing
}

export async function generateLayout(input: GenerateLayoutInput): Promise<Room[]> {
  const { plotWidth, plotHeight, plotUnit, numFloors, style, rooms: requestedRoomTypes } = input
  const facing = normalizeFacing(input.facing)

  // 1. Compute plot area and infer BHK type
  const plotSqft = plotUnit === 'm'
    ? (plotWidth * 3.28084) * (plotHeight * 3.28084)
    : plotWidth * plotHeight
  const bhkType = inferBHKType(plotSqft, requestedRoomTypes)
  const template = getBHKTemplate(bhkType)

  // 2. Pre-compute Vastu zones as coordinates (inject into prompt — not natural language)
  const zones = computeVastuZones(plotWidth, plotHeight)
  const entranceZone = getEntranceZone(plotWidth, plotHeight, facing)

  // 3. Build the priority-ordered room list from the BHK template
  //    Merge with user's requested rooms — respect user's extra rooms, use template as default
  const templateRoomTypes = template.rooms.map(r => r.type)
  const allRoomTypes = [
    ...templateRoomTypes,
    ...requestedRoomTypes.filter(t => !templateRoomTypes.includes(t))
  ]
  const roomList = template.rooms
    .filter(r => allRoomTypes.includes(r.type) || requestedRoomTypes.includes(r.type))
    .sort((a, b) => a.priority - b.priority)

  // 4. Select appropriate few-shot example
  const exampleLayout = bhkType === '2BHK' || bhkType === '1BHK'
    ? JSON.stringify(REFERENCE_2BHK_NORTH, null, 2)
    : JSON.stringify(REFERENCE_3BHK_EAST, null, 2)
  const exampleDim = bhkType === '2BHK' || bhkType === '1BHK'
    ? '30×40 ft, North-facing, 2BHK'
    : '40×60 ft, East-facing, 3BHK'

  // 5. Build the system prompt
  const systemPrompt = `You are a licensed Indian residential architect and Vastu Shastra expert with 20+ years of experience. You generate precise, conflict-free floor plan layouts as JSON.

## COORDINATE SYSTEM (critical — never deviate)
- Origin (0,0) is TOP-LEFT corner of the plot
- x increases to the RIGHT (East direction)
- y increases DOWNWARD (South direction)
- North = top (y=0), South = bottom (y=${plotHeight}), East = right (x=${plotWidth}), West = left (x=0)
- All values in ${plotUnit === 'm' ? 'meters' : 'feet'}

## PLOT DETAILS
- Dimensions: ${plotWidth} × ${plotHeight} ${plotUnit === 'm' ? 'meters' : 'feet'}
- Facing: ${facing === 'N' ? 'North' : facing === 'S' ? 'South' : facing === 'E' ? 'East' : 'West'}
- Style: ${style}
- Floors: ${numFloors}
- BHK Category: ${template.label} (${template.description})

## PRE-COMPUTED VASTU ZONES (place each room INSIDE its assigned zone)
${Object.entries(zones).map(([name, z]) =>
  `${name}: x=${z.x}–${z.x + z.width}, y=${z.y}–${z.y + z.height}`
).join('\n')}
BRAHMASTHANA (center — keep clear, no solid rooms): x=${zones.CENTER.x}–${zones.CENTER.x + zones.CENTER.width}, y=${zones.CENTER.y}–${zones.CENTER.y + zones.CENTER.height}

## ENTRANCE ZONE
Main entrance should be placed at: x=${entranceZone.x}–${entranceZone.x + entranceZone.width}, y=${entranceZone.y}

## ROOMS TO PLACE (in this exact priority order)
${roomList.map((r, i) =>
  `${i + 1}. ${r.name} (type: ${r.type}) → Zone: ${r.zone}${r.mustAdjacentTo ? ` → Must share wall with: ${r.mustAdjacentTo.join(', ')}` : ''}`
).join('\n')}

## HARD CONSTRAINTS (all must be satisfied)
1. Every room must fit ENTIRELY within: x=0 to ${plotWidth}, y=0 to ${plotHeight}
2. NO two rooms on the same floor may overlap (check all x/y bounding boxes)
3. Every room must share at least one full wall edge with another room or the plot boundary
4. Aspect ratio of every room must be between 1.0 and 2.2 (no corridor-shaped rooms)
5. Minimum sizes (in ${plotUnit === 'm' ? 'meters' : 'feet'}):
   - living_room: 12×12, dining_room: 9×9, master_bedroom: 12×11, bedroom: 10×10
   - kitchen: 8×8, bathroom: 5×5, toilet: 4×4, pooja_room: 4×4
   - utility: 5×5, foyer: 5×4, store: 5×5, servant_room: 8×8
6. Kitchen must NOT be adjacent to any toilet or bathroom
7. Pooja Room must NOT be adjacent to any toilet or bathroom
8. Do NOT place any room inside the Brahmasthana zone (use it as open corridor only)
9. If numFloors > 1, distribute bedrooms across floors (floor 0 = ground, floor 1 = first, etc.)
10. Every bathroom must be adjacent to the bedroom it serves

## OUTPUT FORMAT
Return ONLY a valid JSON array. No explanation, no markdown, no code fences.
Each room object must have exactly these fields:
{"name": string, "type": string, "x": number, "y": number, "width": number, "height": number, "floor": number}

Valid type values: living_room, dining_room, kitchen, master_bedroom, bedroom, bathroom, toilet, pooja_room, utility, foyer, store, servant_room, garage, corridor, staircase, study, guest_room, balcony, courtyard

## FEW-SHOT EXAMPLE
Input: ${exampleDim}
Output:
${exampleLayout}`

  const userMessage = `Generate a ${template.label} floor plan for a ${plotWidth}×${plotHeight} ${plotUnit === 'm' ? 'meter' : 'foot'} plot facing ${facing === 'N' ? 'North' : facing === 'S' ? 'South' : facing === 'E' ? 'East' : 'West'} in ${style} style with ${numFloors} floor(s). Place rooms in the priority order specified. Return ONLY the JSON array.`

  // 6. Call Claude
  let rooms: Room[] = []
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Multi-strategy JSON extraction
    let parsed: Room[] | null = null
    try {
      parsed = JSON.parse(text)
    } catch {
      const arrayMatch = text.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        try { parsed = JSON.parse(arrayMatch[0]) } catch {}
      }
    }

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return getFallbackLayout(input)
    }

    rooms = parsed

  } catch (err) {
    console.error('Claude generateLayout error:', err)
    return getFallbackLayout(input)
  }

  // 7. Post-generation validation and auto-fix
  rooms = clampToBoundary(rooms as SimpleRoom[], plotWidth, plotHeight) as Room[]
  rooms = enforceMinSizes(rooms as SimpleRoom[], plotWidth, plotHeight) as Room[]

  // Log validation issues but don't fail
  const issues = validateLayout(rooms as SimpleRoom[], plotWidth, plotHeight)
  if (issues.length > 0) {
    console.warn(`Layout validation: ${issues.length} issues`, issues.slice(0, 5))
  }

  return rooms
}

function getFallbackLayout(input: GenerateLayoutInput): Room[] {
  // Simple deterministic fallback — grid of rooms
  const { plotWidth, plotHeight } = input
  const hw = Math.round(plotWidth / 2)
  const hh = Math.round(plotHeight / 2)
  return [
    { name: 'Living Room',    type: 'living_room',    x: 0,  y: 0,  width: hw, height: hh, floor: 0 },
    { name: 'Kitchen',        type: 'kitchen',        x: hw, y: hh, width: Math.round(plotWidth * 0.3), height: Math.round(plotHeight * 0.3), floor: 0 },
    { name: 'Master Bedroom', type: 'master_bedroom', x: 0,  y: hh, width: hw, height: hh, floor: 0 },
    { name: 'Bathroom',       type: 'bathroom',       x: hw, y: 0,  width: Math.round(plotWidth * 0.3), height: Math.round(plotHeight * 0.25), floor: 0 },
  ]
}

export async function chatWithCopilot(
  message: string,
  projectContext: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const systemPrompt = `You are a certified Vastu Shastra consultant with 30 years of practice and a licensed architect. You advise on the ancient Indian science of spatial arrangement (Vastu Shastra) while respecting modern architectural realities.

CURRENT PROJECT CONTEXT:
${projectContext}

VASTU SHASTRA REFERENCE — 16-ZONE RULESET (Shodasha Vastu Pada):
| Direction | Zone Name    | Pancha Bhuta | Ideal Room Types                        | Forbidden Room Types          |
|-----------|-------------|--------------|----------------------------------------|-------------------------------|
| N         | Kubera      | Jal (Water)  | Bathroom, treasury, study               | Kitchen, master bedroom       |
| NNE       | Soma        | Jal          | Pooja room, meditation space            | Toilet, heavy storage         |
| NE        | Ishanya     | Akasha+Jal   | Pooja room, open space, courtyard       | Kitchen, toilet, heavy rooms  |
| ENE       | Bhallat     | Agni+Akasha  | Study, library                          | Toilet, kitchen               |
| E         | Indra       | Akasha       | Living room, verandah, entrance         | Bedroom, toilet               |
| ESE       | Vitatha     | Agni         | Bathroom (water OK near fire), powder   | Kitchen, master bedroom       |
| SE        | Agni        | Agni (Fire)  | Kitchen (mandatory fire zone)           | Bedroom, pooja, main entrance |
| SSE       | Graha Kshata| Agni         | Guest bedroom, dining                   | Pooja, main entrance          |
| S         | Yama        | Prithvi      | Bedroom, store                          | Main entrance, living room    |
| SSW       | Vithi       | Prithvi      | Bedroom, store, garage                  | Pooja, kitchen                |
| SW        | Nairuti     | Prithvi (Earth)| Master bedroom, heavy store            | Entrance, kitchen, pooja      |
| WSW       | Pitra       | Prithvi+Vayu | Garage, storage                         | Pooja, bedroom for children   |
| W         | Varuna      | Vayu (Air)   | Dining, children's bedroom              | Kitchen, main entrance        |
| WNW       | Pushpadanta | Vayu         | Guest room, recreation                  | Pooja, main entrance          |
| NW        | Vayu        | Vayu         | Guest room, garage, toilet              | Kitchen, master bedroom       |
| NNW       | Mukhya      | Vayu+Akasha  | Living room extension, verandah         | Master bedroom, store         |
| Centre    | Brahmasthana| Akasha (Space)| MUST be open — courtyard or lobby only | ALL solid rooms strictly forbidden |

PANCHA BHUTA (Five Elements) DOSHAS TO REFERENCE BY NAME:
- Agni Dosha: Fire-zone conflict (e.g., kitchen in N/NE displaces water energy)
- Jal Dosha: Water-zone conflict (e.g., toilet in SE disturbs fire energy)
- Prithvi Dosha: Earth-zone conflict (e.g., lightweight rooms in SW destabilise)
- Vayu Dosha: Air-zone conflict (e.g., heavy store blocking NW airflow)
- Akasha Dosha: Space-zone conflict (e.g., obstruction in Brahmasthana centre)

RESPONSE STYLE — strictly follow:
1. Acknowledge EACH violation the user lists by name and zone (e.g., "Your kitchen in the NE zone creates an Agni Dosha in the Ishanya pada…")
2. Give SPECIFIC, ACTIONABLE remedies — never vague: say "Move the kitchen from NE (x=60,y=5) to the SE corner (x=80,y=5)" not just "kitchen is wrong"
3. Reference Pancha Bhuta elements and dosha names when explaining WHY a placement is wrong
4. When suggesting a move, give approximate target coordinates or compass directions relative to the plot
5. If a constraint cannot be fully satisfied (e.g., small plot), suggest the best compromise and name the partial dosha it creates
6. Keep responses concise but complete — use bullet points for multiple violations
7. You may cite classical Vastu texts (Manasara, Mayamata, Vishwakarma Prakash) where relevant`

  const messages = [
    ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: message },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response'
}
