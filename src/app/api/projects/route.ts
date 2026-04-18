import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateLayout } from '@/lib/claude'
import { scoreRoom, scoreAllRooms } from '@/lib/vastu'
import { z } from 'zod'

const generateSchema = z.object({
  title: z.string().min(1),
  plotWidth: z.number().positive(),
  plotHeight: z.number().positive(),
  plotUnit: z.enum(['ft', 'm']).default('ft'),
  numFloors: z.number().int().min(1).max(5).default(1),
  style: z.string().default('Modern'),
  facing: z.string().default('North'),
  rooms: z.array(z.string()).min(1),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    include: { rooms: true, _count: { select: { rooms: true, revisions: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const input = generateSchema.parse(body)

    // Generate layout via Claude
    const generatedRooms = await generateLayout({ ...input, title: input.title })

    // Score each room
    const scoredRooms = generatedRooms.map(r => {
      const { direction, vastuScore, warnings } = scoreRoom(
        r.type, r.x, r.y, r.width, r.height, input.plotWidth, input.plotHeight
      )
      return { ...r, direction, vastuScore, warnings }
    })

    const overallScore = scoreAllRooms(
      scoredRooms.map(r => ({ type: r.type, x: r.x, y: r.y, width: r.width, height: r.height })),
      input.plotWidth, input.plotHeight
    )

    // Persist
    const project = await db.project.create({
      data: {
        userId: session.user.id,
        title: input.title,
        plotWidth: input.plotWidth,
        plotHeight: input.plotHeight,
        plotUnit: input.plotUnit,
        numFloors: input.numFloors,
        style: input.style,
        facing: input.facing,
        vastuScore: overallScore,
        rooms: {
          create: scoredRooms.map(r => ({
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
        },
      },
      include: { rooms: true, plumbing: true, electrical: true, revisions: true },
    })

    // Create initial revision
    await db.revision.create({
      data: {
        projectId: project.id,
        version: 1,
        label: 'Initial AI Layout',
        roomsSnapshot: JSON.parse(JSON.stringify(project.rooms)),
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Layout generation failed' }, { status: 500 })
  }
}
