import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scoreRoom, scoreAllRooms } from '@/lib/vastu'
import { z } from 'zod'

const roomSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  floor: z.number().int().default(1),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await db.project.findFirst({ where: { id, userId: session.user.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const rooms = z.array(roomSchema).parse(body)

  // Score all rooms
  const scoredRooms = rooms.map(r => {
    const { direction, vastuScore, warnings } = scoreRoom(
      r.type, r.x, r.y, r.width, r.height, project.plotWidth, project.plotHeight
    )
    return { ...r, direction, vastuScore, warnings }
  })

  const overallScore = scoreAllRooms(
    scoredRooms.map(r => ({ type: r.type, x: r.x, y: r.y, width: r.width, height: r.height })),
    project.plotWidth, project.plotHeight
  )

  // Replace all rooms
  await db.room.deleteMany({ where: { projectId: id } })
  let newRooms
  try {
    newRooms = await db.room.createManyAndReturn({
      data: scoredRooms.map(r => ({
        projectId: id,
        name: r.name,
        type: r.type,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        floor: r.floor,
        direction: r.direction,
        vastuScore: r.vastuScore,
        warnings: r.warnings,
      })),
    })
  } catch {
    // Fallback for Prisma versions that don't support createManyAndReturn
    newRooms = await Promise.all(
      scoredRooms.map(r => db.room.create({
        data: {
          projectId: id,
          name: r.name,
          type: r.type,
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          floor: r.floor,
          direction: r.direction,
          vastuScore: r.vastuScore,
          warnings: r.warnings,
        },
      }))
    )
  }

  // Update project score
  await db.project.update({ where: { id }, data: { vastuScore: overallScore } })

  // Auto-snapshot revision
  const lastRevision = await db.revision.findFirst({
    where: { projectId: id },
    orderBy: { version: 'desc' },
  })
  await db.revision.create({
    data: {
      projectId: id,
      version: (lastRevision?.version ?? 0) + 1,
      label: 'Auto-save',
      roomsSnapshot: JSON.parse(JSON.stringify(newRooms)),
    },
  })

  return NextResponse.json({ rooms: newRooms, vastuScore: overallScore })
}
