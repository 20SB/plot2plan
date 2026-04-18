/**
 * Multi-AI provider module.
 * Builds a shared prompt from the same logic as claude.ts, then dispatches
 * to Claude / Gemini / Qwen independently so results can be compared.
 */
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  inferBHKType, getBHKTemplate, computeVastuZones, getEntranceZone,
  clampToBoundary, enforceMinSizes,
  type SimpleRoom,
} from './floor-plan-engine'
import type { GenerateLayoutInput, GeneratedRoom } from './claude'
import type { TemplateMatch } from './templates'

export type AIProvider = 'claude' | 'gemini' | 'opus'

export interface AIResult {
  provider: AIProvider
  rooms: GeneratedRoom[]
  vastuScore: number
  timingMs: number
  error?: string
  referenceTemplates?: { id: string; description: string | null; vastuScore: number }[]
}

// ─── Lazy-initialised clients (safe for Next.js — only created when called) ──

let _claude: Anthropic | null = null
let _gemini: GoogleGenerativeAI | null = null

function getClaudeClient() {
  if (!_claude) _claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _claude
}
function getGeminiClient() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? '')
  return _gemini
}

// ─── Shared prompt builder ────────────────────────────────────────────────────

function normalizeFacing(facing: string): string {
  const map: Record<string, string> = {
    north: 'N', south: 'S', east: 'E', west: 'W',
    'north-east': 'NE', northeast: 'NE',
    'north-west': 'NW', northwest: 'NW',
    'south-east': 'SE', southeast: 'SE',
    'south-west': 'SW', southwest: 'SW',
  }
  return map[facing.toLowerCase()] ?? facing
}

function facingLabel(f: string) {
  const m: Record<string, string> = { N:'North', S:'South', E:'East', W:'West', NE:'North-East', NW:'North-West', SE:'South-East', SW:'South-West' }
  return m[f] ?? f
}

export function buildSharedPrompt(
  input: GenerateLayoutInput,
  templates: TemplateMatch[]
): { systemPrompt: string; userMessage: string } {
  const { plotWidth, plotHeight, plotUnit, numFloors, style, rooms: requestedRoomTypes } = input
  const facing = normalizeFacing(input.facing)

  const plotSqft = plotUnit === 'm'
    ? (plotWidth * 3.28084) * (plotHeight * 3.28084)
    : plotWidth * plotHeight
  const bhkType = inferBHKType(plotSqft, requestedRoomTypes)
  const template = getBHKTemplate(bhkType)
  const zones = computeVastuZones(plotWidth, plotHeight)
  const entranceZone = getEntranceZone(plotWidth, plotHeight, facing)

  const templateRoomTypes = template.rooms.map(r => r.type)
  const allRoomTypes = [
    ...templateRoomTypes,
    ...requestedRoomTypes.filter(t => !templateRoomTypes.includes(t)),
  ]
  const roomList = template.rooms
    .filter(r => allRoomTypes.includes(r.type) || requestedRoomTypes.includes(r.type))
    .sort((a, b) => a.priority - b.priority)

  // Build reference-template section from DB-matched templates
  const refSection = templates.length > 0
    ? `## REFERENCE FLOOR PLANS (use as geometric anchors — adapt proportionally to this plot)\n` +
      templates.map((t, i) =>
        `### Reference ${i + 1}: ${t.bhkType}, ${t.facing}-facing, ${t.plotWidth}×${t.plotHeight}ft, Vastu ${t.vastuScore}/100\n` +
        `Description: ${t.description ?? 'N/A'}\n` +
        `Validated room layout:\n${JSON.stringify(t.rooms, null, 2)}`
      ).join('\n\n')
    : ''

  const systemPrompt = `You are a licensed Indian residential architect and Vastu Shastra expert with 20+ years of experience. You generate precise, conflict-free floor plan layouts as JSON.

## COORDINATE SYSTEM (critical — never deviate)
- Origin (0,0) is TOP-LEFT corner of the plot
- x increases to the RIGHT (East direction)
- y increases DOWNWARD (South direction)
- North = top (y=0), South = bottom (y=${plotHeight}), East = right (x=${plotWidth}), West = left (x=0)
- All values in ${plotUnit === 'm' ? 'meters' : 'feet'}

## PLOT DETAILS
- Dimensions: ${plotWidth} × ${plotHeight} ${plotUnit === 'm' ? 'meters' : 'feet'}
- Facing: ${facingLabel(facing)}
- Style: ${style}
- Floors: ${numFloors}
- BHK Category: ${template.label} (${template.description})

## PRE-COMPUTED VASTU ZONES (place each room INSIDE its assigned zone)
${Object.entries(zones).map(([name, z]) =>
  `${name}: x=${z.x}–${z.x + z.width}, y=${z.y}–${z.y + z.height}`
).join('\n')}
BRAHMASTHANA (center — keep clear): x=${zones.CENTER.x}–${zones.CENTER.x + zones.CENTER.width}, y=${zones.CENTER.y}–${zones.CENTER.y + zones.CENTER.height}

## ENTRANCE ZONE
Main entrance: x=${entranceZone.x}–${entranceZone.x + entranceZone.width}, y=${entranceZone.y}

## ROOMS TO PLACE (priority order)
${roomList.map((r, i) =>
  `${i + 1}. ${r.name} (type: ${r.type}) → Zone: ${r.zone}${r.mustAdjacentTo ? ` → Adjacent to: ${r.mustAdjacentTo.join(', ')}` : ''}`
).join('\n')}

## HARD CONSTRAINTS
1. Every room must fit ENTIRELY within: x=0 to ${plotWidth}, y=0 to ${plotHeight}
2. NO two rooms on the same floor may overlap
3. Aspect ratio of every room: 1.0–2.2
4. Minimum sizes (${plotUnit === 'm' ? 'meters' : 'feet'}): living_room 12×12, dining_room 9×9, master_bedroom 12×11, bedroom 10×10, kitchen 8×8, bathroom 5×5, pooja_room 4×4
5. Kitchen must NOT be adjacent to any toilet or bathroom
6. Pooja Room must NOT be adjacent to any toilet or bathroom
7. Do NOT place any room inside the Brahmasthana zone
8. If numFloors > 1, distribute bedrooms across floors (floor 0=ground, floor 1=first)

## OUTPUT FORMAT
Return ONLY a valid JSON array. No explanation, no markdown, no code fences.
Each object: {"name": string, "type": string, "x": number, "y": number, "width": number, "height": number, "floor": number}

Valid types: living_room, dining_room, kitchen, master_bedroom, bedroom, bathroom, toilet, pooja_room, utility, foyer, store, servant_room, garage, corridor, staircase, study, guest_room, balcony, courtyard

${refSection}`

  const userMessage = `Generate a ${template.label} floor plan for a ${plotWidth}×${plotHeight} ${plotUnit === 'm' ? 'meter' : 'foot'} plot facing ${facingLabel(facing)} in ${style} style with ${numFloors} floor(s). Return ONLY the JSON array.`

  return { systemPrompt, userMessage }
}

// ─── JSON extraction helper ────────────────────────────────────────────────────

function extractRooms(text: string): GeneratedRoom[] | null {
  try { return JSON.parse(text) } catch {}
  const m = text.match(/\[[\s\S]*\]/)
  if (m) { try { return JSON.parse(m[0]) } catch {} }
  return null
}

function postProcess(rooms: GeneratedRoom[], input: GenerateLayoutInput): GeneratedRoom[] {
  let r = clampToBoundary(rooms as SimpleRoom[], input.plotWidth, input.plotHeight) as GeneratedRoom[]
  r = enforceMinSizes(r as SimpleRoom[], input.plotWidth, input.plotHeight) as GeneratedRoom[]
  return r
}

// ─── Claude ───────────────────────────────────────────────────────────────────

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  input: GenerateLayoutInput
): Promise<GeneratedRoom[]> {
  const msg = await getClaudeClient().messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const rooms = extractRooms(text)
  if (!rooms || rooms.length === 0) throw new Error('Claude returned empty layout')
  return postProcess(rooms, input)
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  input: GenerateLayoutInput
): Promise<GeneratedRoom[]> {
  const model = getGeminiClient().getGenerativeModel({
    model: 'gemini-2.5-flash-preview-05-20',
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
  })
  const result = await model.generateContent(userMessage)
  const text = result.response.text()
  const rooms = extractRooms(text)
  if (!rooms || rooms.length === 0) throw new Error('Gemini returned empty layout')
  return postProcess(rooms, input)
}

// ─── Claude Opus ──────────────────────────────────────────────────────────────

export async function callOpus(
  systemPrompt: string,
  userMessage: string,
  input: GenerateLayoutInput
): Promise<GeneratedRoom[]> {
  const msg = await getClaudeClient().messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const rooms = extractRooms(text)
  if (!rooms || rooms.length === 0) throw new Error('Claude Opus returned empty layout')
  return postProcess(rooms, input)
}
