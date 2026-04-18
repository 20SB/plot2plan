import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const itemSchema = z.object({
  type: z.string(),
  x: z.number(),
  y: z.number(),
  floor: z.number().int().default(1),
  label: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await db.project.findFirst({ where: { id, userId: session.user.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = z.array(itemSchema).parse(await req.json())

  await db.plumbingItem.deleteMany({ where: { projectId: id } })
  const created = await db.plumbingItem.createManyAndReturn({
    data: items.map(i => ({ projectId: id, ...i })),
  })

  return NextResponse.json(created)
}
