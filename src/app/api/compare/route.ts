import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { findMatchingTemplates } from '@/lib/templates'
import { buildSharedPrompt, callClaude, callGemini, callQwen, type AIProvider } from '@/lib/ai-providers'
import { scoreAllRooms } from '@/lib/vastu'
import type { GenerateLayoutInput, GeneratedRoom } from '@/lib/claude'

const compareSchema = z.object({
  provider: z.enum(['claude', 'gemini', 'qwen']),
  plotWidth: z.number().positive(),
  plotHeight: z.number().positive(),
  plotUnit: z.enum(['ft', 'm']).default('ft'),
  numFloors: z.number().int().min(1).max(5).default(1),
  style: z.string().default('Modern'),
  facing: z.string().default('North'),
  rooms: z.array(z.string()).min(1),
  title: z.string().default('Comparison'),
})

type CallerFn = (s: string, u: string, i: GenerateLayoutInput) => Promise<GeneratedRoom[]>
const callers: Record<AIProvider, CallerFn> = {
  claude: callClaude,
  gemini: callGemini,
  qwen: callQwen,
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const input = compareSchema.parse(body)
    const { provider, ...layoutInput } = input

    const t0 = Date.now()

    // 1. RAG: fetch best-matching templates from DB
    const templates = await findMatchingTemplates(layoutInput, 2)

    // 2. Build shared prompt (same for all AIs — fair comparison)
    const { systemPrompt, userMessage } = buildSharedPrompt(layoutInput, templates)

    // 3. Call the selected AI
    const callFn = callers[provider]
    const rooms = await callFn(systemPrompt, userMessage, layoutInput)

    const timingMs = Date.now() - t0

    // 4. Vastu score
    const vastuScore = scoreAllRooms(
      rooms.map(r => ({ type: r.type, x: r.x, y: r.y, width: r.width, height: r.height })),
      input.plotWidth,
      input.plotHeight
    )

    return NextResponse.json({
      provider,
      rooms,
      vastuScore,
      timingMs,
      referenceTemplates: templates.map(t => ({
        id: t.id,
        description: t.description,
        vastuScore: t.vastuScore,
      })),
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[compare] error:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
