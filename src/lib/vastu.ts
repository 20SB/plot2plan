export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

const DIRECTION_ANGLES: Record<Direction, number> = {
  E: 0, NE: 45, N: 90, NW: 135, W: 180, SW: 225, S: 270, SE: 315,
}

// Ideal Vastu directions per room type (primary + acceptable)
const ROOM_VASTU: Record<string, { ideal: Direction[]; warnings: string[] }> = {
  master_bedroom: {
    ideal: ['SW', 'NW', 'S'],
    warnings: ['Master bedroom in NE brings financial loss', 'Master bedroom in E disrupts health'],
  },
  bedroom: {
    ideal: ['NW', 'S', 'SW', 'W'],
    warnings: ['Bedroom in NE not recommended'],
  },
  living_room: {
    ideal: ['N', 'NE', 'E', 'NW'],
    warnings: ['Living room in SW creates instability'],
  },
  kitchen: {
    ideal: ['SE', 'NW'],
    warnings: ['Kitchen in NE is inauspicious', 'Kitchen in SW causes conflicts'],
  },
  bathroom: {
    ideal: ['NW', 'SE', 'W'],
    warnings: ['Bathroom in NE is highly inauspicious', 'Bathroom in SW causes health issues'],
  },
  toilet: {
    ideal: ['NW', 'SE', 'W', 'S'],
    warnings: ['Toilet in NE is highly inauspicious'],
  },
  study: {
    ideal: ['N', 'NE', 'E'],
    warnings: ['Study in SW reduces concentration'],
  },
  pooja: {
    ideal: ['NE', 'E', 'N'],
    warnings: ['Pooja room in S or SW is inauspicious'],
  },
  guest_room: {
    ideal: ['NW', 'NE', 'E'],
    warnings: ['Guest room in SW may cause overstay issues'],
  },
  store: {
    ideal: ['NW', 'SW', 'W'],
    warnings: [],
  },
  garage: {
    ideal: ['NW', 'SE', 'SW'],
    warnings: [],
  },
  staircase: {
    ideal: ['S', 'SW', 'SE', 'W'],
    warnings: ['Staircase in NE causes obstacles', 'Staircase in center is inauspicious'],
  },
  dining: {
    ideal: ['W', 'E', 'NW'],
    warnings: ['Dining in SE causes financial loss'],
  },
  verandah: {
    ideal: ['N', 'E', 'NE'],
    warnings: [],
  },
}

function angleToDirection(angleDeg: number): Direction {
  const normalized = ((angleDeg % 360) + 360) % 360
  const dirs: Direction[] = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE']
  const idx = Math.round(normalized / 45) % 8
  return dirs[idx]
}

function directionScore(actual: Direction, ideal: Direction[]): number {
  if (ideal.includes(actual)) return 100

  const actualAngle = DIRECTION_ANGLES[actual]
  let minAngularDist = Infinity

  for (const d of ideal) {
    const idealAngle = DIRECTION_ANGLES[d]
    let diff = Math.abs(actualAngle - idealAngle)
    // Correct circular wrap: shortest path around the circle
    if (diff > 180) diff = 360 - diff
    minAngularDist = Math.min(minAngularDist, diff)
  }

  // Vastu scoring: each 45° sector = -20 points, min 0
  const sectorsAway = Math.round(minAngularDist / 45)
  return Math.max(0, 100 - sectorsAway * 20)
}

export interface VastuResult {
  direction: Direction
  vastuScore: number
  warnings: string[]
}

export function scoreRoom(
  roomType: string,
  roomX: number,
  roomY: number,
  roomWidth: number,
  roomHeight: number,
  plotWidth: number,
  plotHeight: number
): VastuResult {
  const centerX = roomX + roomWidth / 2
  const centerY = roomY + roomHeight / 2
  const plotCenterX = plotWidth / 2
  const plotCenterY = plotHeight / 2

  // Canvas: Y increases downward, so invert Y for compass
  const dx = centerX - plotCenterX
  const dy = -(centerY - plotCenterY) // flip Y for compass bearing
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
  const direction = angleToDirection(angleDeg)

  const typeKey = roomType.toLowerCase().replace(/\s+/g, '_')
  const vastu = ROOM_VASTU[typeKey] || { ideal: [], warnings: [] }

  const score = vastu.ideal.length > 0 ? directionScore(direction, vastu.ideal) : 75
  const activeWarnings: string[] = []

  if (score < 60 && vastu.warnings.length > 0) {
    activeWarnings.push(vastu.warnings[0])
  }

  return { direction, vastuScore: Math.round(score), warnings: activeWarnings }
}

export function scoreAllRooms(
  rooms: Array<{ type: string; x: number; y: number; width: number; height: number }>,
  plotWidth: number,
  plotHeight: number
): number {
  if (rooms.length === 0) return 0
  const total = rooms.reduce((sum, r) => {
    const { vastuScore } = scoreRoom(r.type, r.x, r.y, r.width, r.height, plotWidth, plotHeight)
    return sum + vastuScore
  }, 0)
  return Math.round(total / rooms.length)
}
