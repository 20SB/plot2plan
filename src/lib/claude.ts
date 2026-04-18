import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GeneratedRoom {
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  floor: number
}

export async function generateLayout(input: {
  plotWidth: number
  plotHeight: number
  plotUnit: string
  numFloors: number
  style: string
  facing: string
  rooms: string[]
  title: string
}): Promise<GeneratedRoom[]> {
  // Canvas uses SCALE=8: plot dimensions in canvas units = plotWidth * SCALE / some_factor
  // We work in canvas units where each unit = 8px
  // Plot canvas: plotWidth (ft) → canvas units ≈ plotWidth (keep as-is, canvas scales visually)
  const canvasW = input.plotWidth
  const canvasH = input.plotHeight

  // Brahmasthana zone: central 1/9th of the plot (33–66% in both axes) must stay open
  const bsX1 = Math.round(canvasW * 0.33)
  const bsX2 = Math.round(canvasW * 0.66)
  const bsY1 = Math.round(canvasH * 0.33)
  const bsY2 = Math.round(canvasH * 0.66)

  const prompt = `You are a certified Vastu Shastra architect with 30 years of practice. Generate a precise, non-overlapping floor plan layout for a ${input.plotWidth}×${input.plotHeight} ${input.plotUnit} plot.

PLOT DETAILS:
- Plot size: ${input.plotWidth} × ${input.plotHeight} ${input.plotUnit}
- Plot facing: ${input.facing}
- Style: ${input.style}
- Number of floors: ${input.numFloors}
- Required rooms: ${input.rooms.join(', ')}

COORDINATE SYSTEM (strictly follow):
- Origin (0,0) is the TOP-LEFT corner
- North = top of plot (y = 0)
- South = bottom of plot (y = ${canvasH})
- East = right of plot (x = ${canvasW})
- West = left of plot (x = 0)
- NE corner: x near 0, y near 0
- SE corner: x near ${canvasW}, y near 0  (NOTE: East is RIGHT, not left)
- SW corner: x near ${canvasW}, y near ${canvasH}
- NW corner: x near 0, y near ${canvasH}

BRAHMASTHANA (sacred centre) — MANDATORY:
- The central zone x:[${bsX1}–${bsX2}], y:[${bsY1}–${bsY2}] MUST remain open
- No solid room may be placed entirely within this zone
- Only a courtyard, lobby, or open passage (type: "courtyard" or "lobby") is permitted here
- Always include a small courtyard or open lobby in this zone

VASTU PLACEMENT RULES (strictly follow):
1. NE (top-right area): Pooja Room or open space — this is the Ishanya zone (divine energy)
2. SE (right side, top-to-mid): Kitchen — Agni (fire) zone; ideal for cooking
3. SW (bottom-right): Master Bedroom — Prithvi (earth) zone; heaviest, most stable
4. NW (left side, bottom-to-mid): Guest Room or Garage — Vayu (air) zone
5. N or NE: Bathroom/Toilet is acceptable (Jal/water energy flows North)
6. S or SW: Bedrooms are acceptable (earth energy = rest and stability)
7. Living Room: near the entrance face (${input.facing} face) — South or East entrance = S or E side
8. Dining Room: adjacent to Kitchen (share a wall or be directly next to it)
9. Study/Office: N or NE (Mercury energy supports intellect)
10. Store/Garage: NW or SW (heavy items in SW, vehicles in NW)

PER-ROOM MINIMUM SIZES (in plot units — enforce strictly):
- Master Bedroom: min width 10, min height 12
- Bedroom: min width 10, min height 12
- Living Room: min width 12, min height 15
- Kitchen: min width 8, min height 10
- Dining Room: min width 10, min height 10
- Bathroom / Toilet: min width 4, min height 5
- Pooja Room: min width 4, min height 4
- Garage / Store: min width 8, min height 10
- Staircase: min width 4, min height 6

ADJACENCY REQUIREMENTS:
- Kitchen MUST share a wall with Dining Room (place them directly adjacent)
- Master Bedroom MUST have its attached Bathroom directly adjacent to it
- Living Room MUST be on the ${input.facing} face side (near the main entrance)
- Staircase must appear on EVERY floor at the same (x, y) coordinates

GENERAL LAYOUT RULES:
- All rooms must fit strictly inside the plot: x ∈ [2, ${canvasW - 2}], y ∈ [2, ${canvasH - 2}]
- x + width ≤ ${canvasW - 2} and y + height ≤ ${canvasH - 2} for every room
- Rooms must NOT overlap each other (check bounding boxes)
- Leave at least 2 units margin from all plot boundary walls
- Distribute rooms across floors when numFloors > 1
- Ground floor (floor 1): living areas (living room, kitchen, dining, pooja, garage)
- Upper floors: bedrooms, bathrooms, study
- x, y, width, height are in plot units (NOT pixels)

Return ONLY a valid JSON array with no explanation, no markdown fences, no extra text:
[
  {
    "name": "Living Room",
    "type": "living_room",
    "x": 5,
    "y": ${canvasH - 20},
    "width": 20,
    "height": 15,
    "floor": 1
  }
]

Valid room type values: master_bedroom, bedroom, living_room, kitchen, bathroom, toilet, study, pooja, guest_room, store, garage, staircase, dining, verandah, courtyard, lobby`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Try to find the JSON array with a more robust approach
  let rooms: GeneratedRoom[] = []
  try {
    // First try: direct JSON parse of the whole response
    rooms = JSON.parse(text)
  } catch {
    try {
      // Second try: extract first complete JSON array
      const match = text.match(/\[[\s\S]*?\](?=\s*$|\s*\n\s*$|\s*```)/) ||
                    text.match(/\[[\s\S]*\]/)
      if (match) rooms = JSON.parse(match[0])
      else return getFallbackLayout(input)
    } catch {
      return getFallbackLayout(input)
    }
  }
  return rooms.map(r => ({ ...r, floor: r.floor || 1 }))
}

function getFallbackLayout(input: { plotWidth: number; plotHeight: number; rooms: string[]; numFloors: number }): GeneratedRoom[] {
  const { plotWidth: w, plotHeight: h } = input
  return [
    { name: 'Living Room', type: 'living_room', x: 2, y: 2, width: Math.floor(w * 0.4), height: Math.floor(h * 0.3), floor: 1 },
    { name: 'Master Bedroom', type: 'master_bedroom', x: Math.floor(w * 0.55), y: Math.floor(h * 0.55), width: Math.floor(w * 0.4), height: Math.floor(h * 0.35), floor: 1 },
    { name: 'Kitchen', type: 'kitchen', x: Math.floor(w * 0.55), y: 2, width: Math.floor(w * 0.3), height: Math.floor(h * 0.25), floor: 1 },
    { name: 'Bathroom', type: 'bathroom', x: 2, y: Math.floor(h * 0.65), width: Math.floor(w * 0.2), height: Math.floor(h * 0.2), floor: 1 },
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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response'
}
