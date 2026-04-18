import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chatWithCopilot } from '@/lib/claude'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1),
  projectId: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).default([]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = schema.parse(await req.json())

    const project = await db.project.findFirst({
      where: { id: body.projectId, userId: session.user.id },
      include: { rooms: true },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const context = `Plot: ${project.plotWidth}×${project.plotHeight} ${project.plotUnit}, ${project.numFloors} floor(s), facing ${project.facing}. Overall Vastu score: ${project.vastuScore}/100. Rooms: ${project.rooms.map(r => `${r.name} (${r.type}, score: ${r.vastuScore})`).join(', ')}`

    const reply = await chatWithCopilot(body.message, context, body.history)
    return NextResponse.json({ reply })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    console.error('Copilot error:', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
