import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const RATES_PER_SQFT: Record<string, number> = {
  living_room: 1500,
  master_bedroom: 1200,
  bedroom: 1000,
  kitchen: 2000,
  bathroom: 2500,
  toilet: 2200,
  study: 1100,
  pooja: 1800,
  guest_room: 1000,
  store: 600,
  garage: 700,
  staircase: 900,
  dining: 1400,
  verandah: 800,
  default: 1000,
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await db.project.findFirst({
    where: { id, userId: session.user.id },
    include: { rooms: true },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = project.rooms.map(r => {
    const area = r.width * r.height
    const sqftArea = project.plotUnit === 'm' ? area * 10.7639 : area
    const rate = RATES_PER_SQFT[r.type] ?? RATES_PER_SQFT.default
    return {
      roomName: r.name,
      roomType: r.type,
      area: Math.round(area * 10) / 10,           // display in original units
      unit: project.plotUnit,
      ratePerSqft: rate,
      subtotal: Math.round(sqftArea * rate),        // cost always in sqft basis
    }
  })

  const totalArea = items.reduce((s, i) => s + i.area, 0)
  const totalCost = project.rooms.reduce((s, r) => {
    const area = r.width * r.height
    const sqftArea = project.plotUnit === 'm' ? area * 10.7639 : area
    const rate = RATES_PER_SQFT[r.type] ?? RATES_PER_SQFT.default
    return s + Math.round(sqftArea * rate)
  }, 0)

  return NextResponse.json({ items, totalArea: Math.round(totalArea * 10) / 10, totalCost, currency: 'INR' })
}
