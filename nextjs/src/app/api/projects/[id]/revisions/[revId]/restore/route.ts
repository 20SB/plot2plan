import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scoreAllRooms } from '@/lib/vastu'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; revId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, revId } = await params

  const project = await db.project.findFirst({ where: { id, userId: session.user.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const revision = await db.revision.findFirst({ where: { id: revId, projectId: id } })
  if (!revision) return NextResponse.json({ error: 'Revision not found' }, { status: 404 })

  const rooms = revision.roomsSnapshot as Array<{
    name: string; type: string; x: number; y: number; width: number; height: number; floor: number; direction?: string; vastuScore: number; warnings: string[]
  }>

  await db.room.deleteMany({ where: { projectId: id } })
  const newRooms = await db.room.createManyAndReturn({
    data: rooms.map(r => ({ projectId: id, ...r, direction: r.direction ?? null })),
  })

  const overallScore = scoreAllRooms(
    rooms.map(r => ({ type: r.type, x: r.x, y: r.y, width: r.width, height: r.height })),
    project.plotWidth, project.plotHeight
  )
  await db.project.update({ where: { id }, data: { vastuScore: overallScore } })

  return NextResponse.json({ rooms: newRooms, vastuScore: overallScore })
}
