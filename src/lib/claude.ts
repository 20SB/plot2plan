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

  const prompt = `You are a Vastu Shastra expert and architect. Generate a floor plan layout for a ${input.plotWidth}×${input.plotHeight} ${input.plotUnit} plot facing ${input.facing} in ${input.style} style.

Floors: ${input.numFloors}
Required rooms: ${input.rooms.join(', ')}

RULES:
1. Place rooms following strict Vastu principles:
   - Kitchen: SE or NW quadrant
   - Master Bedroom: SW
   - Pooja/Temple: NE
   - Living Room: N or NE
   - Bathroom/Toilet: NW or SE
   - Study: N or NE
2. All rooms must fit within the plot (0 to ${canvasW} width, 0 to ${canvasH} height)
3. Rooms must NOT overlap each other
4. Leave ~2 units margin from walls
5. If numFloors > 1, distribute rooms across floors (add staircase on EVERY floor at same x,y)
6. Room widths/heights should be realistic (min 8 units, max 40 units)
7. x, y, width, height are in plot units (not pixels)

Return ONLY a valid JSON array, no explanation:
[
  {
    "name": "Living Room",
    "type": "living_room",
    "x": 5,
    "y": 5,
    "width": 20,
    "height": 15,
    "floor": 1
  }
]

Room types must be one of: master_bedroom, bedroom, living_room, kitchen, bathroom, toilet, study, pooja, guest_room, store, garage, staircase, dining, verandah`

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
  const systemPrompt = `You are a Vastu Shastra expert and architectural assistant for Plot2Plan.
You help architects optimize floor plans for Vastu compliance and spatial efficiency.
Current project context: ${projectContext}
Give concise, actionable advice about room placement, Vastu compliance, and layout optimization.`

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
