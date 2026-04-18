import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type RoomSnapshot = { id?: string; name: string; type: string; x: number; y: number; width: number; height: number; vastuScore: number }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; a: string; b: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, a, b } = await params

  const project = await db.project.findFirst({ where: { id, userId: session.user.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [revA, revB] = await Promise.all([
    db.revision.findFirst({ where: { id: a, projectId: id } }),
    db.revision.findFirst({ where: { id: b, projectId: id } }),
  ])

  if (!revA || !revB) return NextResponse.json({ error: 'Revision not found' }, { status: 404 })

  const roomsA = (revA.roomsSnapshot as RoomSnapshot[]) || []
  const roomsB = (revB.roomsSnapshot as RoomSnapshot[]) || []

  const scoreA = roomsA.length ? Math.round(roomsA.reduce((s, r) => s + r.vastuScore, 0) / roomsA.length) : 0
  const scoreB = roomsB.length ? Math.round(roomsB.reduce((s, r) => s + r.vastuScore, 0) / roomsB.length) : 0

  return NextResponse.json({
    revisionA: { id: revA.id, version: revA.version, label: revA.label, rooms: roomsA, vastuScore: scoreA },
    revisionB: { id: revB.id, version: revB.version, label: revB.label, rooms: roomsB, vastuScore: scoreB },
    scoreDelta: scoreB - scoreA,
  })
}
