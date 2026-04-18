// Vastu Shastra scoring engine — authentic Vedic principles
// Covers: 16-zone Mandala, Brahmasthana, Pancha Bhuta, entrance, doshas, remedies

export type Direction8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type Direction16 = 'N' | 'NNE' | 'NE' | 'ENE' | 'E' | 'ESE' | 'SE' | 'SSE' |
  'S' | 'SSW' | 'SW' | 'WSW' | 'W' | 'WNW' | 'NW' | 'NNW'

export type PanchaBhuta = 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'SPACE'
export type DoshaSeverity = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'

export interface VastuDosha {
  type: string
  severity: DoshaSeverity
  description: string
  remedy: string
}

export interface VastuResult {
  direction: Direction8
  zone16: Direction16
  element: PanchaBhuta
  vastuScore: number
  doshas: VastuDosha[]
  warnings: string[]
  isInBrahmasthana: boolean
}

export interface ProjectVastuResult {
  overallScore: number
  brahmasthanaViolation: boolean
  entranceIssue: string | null
  elementConflicts: string[]
  roomResults: Map<string, VastuResult>
  projectDoshas: VastuDosha[]
}

// ─── Compass Angles ──────────────────────────────────────────────────────────

const ANGLES_8: Record<Direction8, number> = {
  E: 0, NE: 45, N: 90, NW: 135, W: 180, SW: 225, S: 270, SE: 315,
}

const ANGLES_16: Record<Direction16, number> = {
  E: 0, ENE: 22.5, NE: 45, NNE: 67.5,
  N: 90, NNW: 112.5, NW: 135, WNW: 157.5,
  W: 180, WSW: 202.5, SW: 225, SSW: 247.5,
  S: 270, SSE: 292.5, SE: 315, ESE: 337.5,
}

// ─── Pancha Bhuta Zone Mapping ────────────────────────────────────────────────
// Each of the 16 zones is assigned a primary element

const ZONE_ELEMENT: Record<Direction16, PanchaBhuta> = {
  NE: 'WATER', NNE: 'WATER', ENE: 'WATER', E: 'WATER',  // NE quadrant = Water
  SE: 'FIRE', ESE: 'FIRE', SSE: 'FIRE', S: 'FIRE',        // SE quadrant = Fire
  SW: 'EARTH', SSW: 'EARTH', WSW: 'EARTH', W: 'EARTH',   // SW quadrant = Earth
  NW: 'AIR', WNW: 'AIR', NNW: 'AIR', N: 'AIR',           // NW quadrant = Air
  // Space (Akasha) = Brahmasthana (center) — handled separately
}

// ─── Room Type → Ideal Directions & Elements ─────────────────────────────────

interface RoomVastuSpec {
  idealDirs: Direction8[]
  acceptableDirs: Direction8[]
  prohibitedDirs: Direction8[]
  preferredElement: PanchaBhuta
  conflictElements: PanchaBhuta[]
  doshaTemplates: Partial<Record<Direction8, { severity: DoshaSeverity; description: string; remedy: string }>>
}

const ROOM_SPECS: Record<string, RoomVastuSpec> = {
  master_bedroom: {
    idealDirs: ['SW'],
    acceptableDirs: ['S', 'W'],
    prohibitedDirs: ['NE', 'N', 'SE'],
    preferredElement: 'EARTH',
    conflictElements: ['FIRE', 'WATER'],
    doshaTemplates: {
      NE: { severity: 'CRITICAL', description: 'Master bedroom in NE (Water zone) causes financial instability and health issues', remedy: 'Shift master bedroom to SW; place heavy furniture in SW corner; use blue/green colors sparingly' },
      SE: { severity: 'SEVERE', description: 'Master bedroom in SE (Fire zone) causes marital discord and sleep disorders', remedy: 'Move to SW or S; avoid red/orange colors; add earth-tone décor' },
      N: { severity: 'MODERATE', description: 'Master bedroom in N disrupts career and finances', remedy: 'Use dark earthy colors; place heavy bed against S or W wall' },
    },
  },
  bedroom: {
    idealDirs: ['NW', 'S', 'SW'],
    acceptableDirs: ['W', 'SE'],
    prohibitedDirs: ['NE'],
    preferredElement: 'AIR',
    conflictElements: ['FIRE'],
    doshaTemplates: {
      NE: { severity: 'MODERATE', description: 'Bedroom in NE (sacred zone) affects sleep and creates restlessness', remedy: 'Convert to study or meditation room; if unavoidable, use calming blue tones' },
    },
  },
  living_room: {
    idealDirs: ['N', 'NE', 'E'],
    acceptableDirs: ['NW'],
    prohibitedDirs: ['SW', 'SE'],
    preferredElement: 'AIR',
    conflictElements: ['EARTH'],
    doshaTemplates: {
      SW: { severity: 'MODERATE', description: 'Living room in SW (Earth zone) creates heaviness and instability for guests', remedy: 'Keep SW corner uncluttered; add light colors; place tall plant in SE' },
      SE: { severity: 'MILD', description: 'Living room in SE (Fire zone) can cause arguments and restlessness', remedy: 'Use cool colors; add water feature in NE corner of the room' },
    },
  },
  kitchen: {
    idealDirs: ['SE'],
    acceptableDirs: ['NW'],
    prohibitedDirs: ['NE', 'SW', 'N', 'W'],
    preferredElement: 'FIRE',
    conflictElements: ['WATER'],
    doshaTemplates: {
      NE: { severity: 'CRITICAL', description: 'Kitchen in NE (sacred Water zone) creates severe Vastu dosha — financial loss and health problems', remedy: 'Relocate kitchen to SE immediately; add red coral in NE to counteract; never place water and fire in same zone' },
      SW: { severity: 'SEVERE', description: 'Kitchen in SW causes conflicts, accidents, and digestive diseases', remedy: 'Move to SE; apply red/orange color on SE wall; install fire element symbol' },
      N: { severity: 'SEVERE', description: 'Kitchen in N (career zone) blocks prosperity', remedy: 'Move to SE; use copper vessels; avoid black/blue colors' },
    },
  },
  bathroom: {
    idealDirs: ['NW', 'SE'],
    acceptableDirs: ['W', 'S'],
    prohibitedDirs: ['NE', 'SW', 'N', 'E'],
    preferredElement: 'WATER',
    conflictElements: ['FIRE', 'EARTH'],
    doshaTemplates: {
      NE: { severity: 'CRITICAL', description: 'Bathroom in NE (sacred zone) is the most severe Vastu dosha — causes serious illness and mental disturbances', remedy: 'Remove immediately; convert to Pooja room or meditation space; perform Vastu shanti puja' },
      SW: { severity: 'SEVERE', description: 'Bathroom in SW (master zone) causes health issues for head of household', remedy: 'Move to NW; seal SW bathroom; use heavy objects in SW instead' },
    },
  },
  toilet: {
    idealDirs: ['NW', 'SE', 'W', 'S'],
    acceptableDirs: ['SW'],
    prohibitedDirs: ['NE', 'N', 'E'],
    preferredElement: 'AIR',
    conflictElements: ['WATER', 'FIRE'],
    doshaTemplates: {
      NE: { severity: 'CRITICAL', description: 'Toilet in NE zone is highly inauspicious and causes maximum Vastu dosha', remedy: 'Relocate; hang Vastu pyramid on that wall; do not use that toilet if unavoidable' },
    },
  },
  study: {
    idealDirs: ['N', 'NE', 'E'],
    acceptableDirs: ['NW'],
    prohibitedDirs: ['SW', 'SE', 'S'],
    preferredElement: 'WATER',
    conflictElements: ['FIRE'],
    doshaTemplates: {
      SW: { severity: 'MODERATE', description: 'Study in SW reduces focus and memory retention', remedy: 'Use green/blue colors; face North or East while studying; keep books in W or SW' },
    },
  },
  pooja: {
    idealDirs: ['NE', 'E', 'N'],
    acceptableDirs: [],
    prohibitedDirs: ['SW', 'SE', 'S', 'W'],
    preferredElement: 'WATER',
    conflictElements: ['FIRE', 'EARTH'],
    doshaTemplates: {
      SW: { severity: 'CRITICAL', description: 'Pooja room in SW (Pitru zone) is inauspicious and offends ancestors', remedy: 'Move pooja to NE corner; temporarily cover with white cloth; perform Ganesha puja daily' },
      SE: { severity: 'SEVERE', description: 'Pooja room in SE (Fire zone) creates agitation during worship', remedy: 'Move to NE; use white/yellow colors in SE pooja room; add water element nearby' },
    },
  },
  guest_room: {
    idealDirs: ['NW', 'NE'],
    acceptableDirs: ['E', 'N'],
    prohibitedDirs: ['SW'],
    preferredElement: 'AIR',
    conflictElements: ['EARTH'],
    doshaTemplates: {
      SW: { severity: 'MODERATE', description: 'Guest room in SW causes guests to overstay and creates dependency', remedy: 'Move to NW; use light colors; avoid keeping extra furniture' },
    },
  },
  store: {
    idealDirs: ['NW', 'SW', 'W'],
    acceptableDirs: ['S', 'SE'],
    prohibitedDirs: ['NE', 'N', 'E'],
    preferredElement: 'EARTH',
    conflictElements: ['WATER', 'AIR'],
    doshaTemplates: {},
  },
  garage: {
    idealDirs: ['NW', 'SE'],
    acceptableDirs: ['SW', 'S'],
    prohibitedDirs: ['NE'],
    preferredElement: 'AIR',
    conflictElements: ['WATER'],
    doshaTemplates: {},
  },
  staircase: {
    idealDirs: ['S', 'SW', 'W', 'SE'],
    acceptableDirs: ['NW'],
    prohibitedDirs: ['NE', 'N', 'E'],
    preferredElement: 'EARTH',
    conflictElements: ['WATER'],
    doshaTemplates: {
      NE: { severity: 'CRITICAL', description: 'Staircase in NE (sacred zone) blocks positive energy flow and causes obstacles in life', remedy: 'Relocate staircase to S or SW; if unavoidable, install Vastu pyramid at base; keep NE light and open' },
      N: { severity: 'SEVERE', description: 'Staircase in N blocks career and financial growth', remedy: 'Move to S or SW; apply red color on N staircase wall' },
    },
  },
  dining: {
    idealDirs: ['W', 'E'],
    acceptableDirs: ['N', 'NW'],
    prohibitedDirs: ['SE', 'SW'],
    preferredElement: 'EARTH',
    conflictElements: ['FIRE'],
    doshaTemplates: {},
  },
  verandah: {
    idealDirs: ['N', 'E', 'NE'],
    acceptableDirs: ['NW'],
    prohibitedDirs: ['SW', 'SE', 'S'],
    preferredElement: 'AIR',
    conflictElements: ['EARTH'],
    doshaTemplates: {},
  },
}

// ─── Helper: Angle to 8-Direction ────────────────────────────────────────────

function angleToDirection8(angleDeg: number): Direction8 {
  const normalized = ((angleDeg % 360) + 360) % 360
  const dirs: Direction8[] = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE']
  const idx = Math.round(normalized / 45) % 8
  return dirs[idx]
}

function angleToDirection16(angleDeg: number): Direction16 {
  const normalized = ((angleDeg % 360) + 360) % 360
  const dirs: Direction16[] = [
    'E', 'ENE', 'NE', 'NNE', 'N', 'NNW', 'NW', 'WNW',
    'W', 'WSW', 'SW', 'SSW', 'S', 'SSE', 'SE', 'ESE',
  ]
  const idx = Math.round(normalized / 22.5) % 16
  return dirs[idx]
}

// ─── Circular Angular Distance ────────────────────────────────────────────────

function circularDiff(a: number, b: number): number {
  const diff = Math.abs(a - b)
  return diff > 180 ? 360 - diff : diff
}

// ─── Brahmasthana Detection ───────────────────────────────────────────────────
// The central 1/9th of the plot must remain open and void (sacred center)
// Traditionally a 3×3 grid; center cell = Brahmasthana

export function isInBrahmasthana(
  roomX: number, roomY: number, roomWidth: number, roomHeight: number,
  plotWidth: number, plotHeight: number
): boolean {
  // Brahmasthana = central 1/9th zone (±1/6 from each axis center)
  const bX1 = plotWidth / 3
  const bX2 = (2 * plotWidth) / 3
  const bY1 = plotHeight / 3
  const bY2 = (2 * plotHeight) / 3

  // Check if room significantly overlaps the central zone (>10% overlap)
  const overlapX = Math.max(0, Math.min(roomX + roomWidth, bX2) - Math.max(roomX, bX1))
  const overlapY = Math.max(0, Math.min(roomY + roomHeight, bY2) - Math.max(roomY, bY1))
  const overlapArea = overlapX * overlapY
  const roomArea = roomWidth * roomHeight
  return overlapArea / roomArea > 0.1
}

// ─── Core Room Scorer ─────────────────────────────────────────────────────────

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

  // Canvas Y flipped relative to compass (canvas Y increases downward; compass N is up)
  const dx = centerX - plotCenterX
  const dy = -(centerY - plotCenterY)
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
  const direction = angleToDirection8(angleDeg)
  const zone16 = angleToDirection16(angleDeg)
  const element = ZONE_ELEMENT[zone16]
  const inBrahmasthana = isInBrahmasthana(roomX, roomY, roomWidth, roomHeight, plotWidth, plotHeight)

  const typeKey = roomType.toLowerCase().replace(/[\s-]+/g, '_')
  const spec = ROOM_SPECS[typeKey]
  const doshas: VastuDosha[] = []
  const warnings: string[] = []
  let score = 75 // default if room type unknown

  if (spec) {
    // Score based on direction category
    if (spec.idealDirs.includes(direction)) {
      score = 100
    } else if (spec.acceptableDirs.includes(direction)) {
      score = 72
    } else if (spec.prohibitedDirs.includes(direction)) {
      score = 25
      // Add specific dosha if template exists
      const doshaTemplate = spec.doshaTemplates[direction]
      if (doshaTemplate) {
        doshas.push({
          type: `${typeKey}_${direction}_dosha`,
          severity: doshaTemplate.severity,
          description: doshaTemplate.description,
          remedy: doshaTemplate.remedy,
        })
        warnings.push(doshaTemplate.description)
      } else {
        warnings.push(`${roomType} is in a prohibited direction (${direction}). Consider moving to ${spec.idealDirs.join(' or ')}.`)
      }
    } else {
      // Neutral direction — score by angular distance from nearest ideal
      const actualAngle = ANGLES_8[direction]
      let minDist = Infinity
      for (const ideal of spec.idealDirs) {
        const dist = circularDiff(actualAngle, ANGLES_8[ideal])
        minDist = Math.min(minDist, dist)
      }
      const sectorsAway = Math.round(minDist / 45)
      score = Math.max(30, 100 - sectorsAway * 18)
    }

    // Element conflict penalty
    if (spec.conflictElements.includes(element)) {
      score = Math.max(0, score - 15)
      doshas.push({
        type: `element_conflict_${element}`,
        severity: 'MILD',
        description: `${roomType} is in a ${element} zone but prefers ${spec.preferredElement} energy — creates subtle imbalance`,
        remedy: `Use ${spec.preferredElement === 'FIRE' ? 'red/orange' : spec.preferredElement === 'WATER' ? 'blue/black' : spec.preferredElement === 'EARTH' ? 'yellow/brown' : spec.preferredElement === 'AIR' ? 'white/grey' : 'purple/violet'} colors to strengthen preferred element`,
      })
    }
  }

  // Brahmasthana penalty — regardless of room type, being in center is bad
  if (inBrahmasthana) {
    score = Math.min(score, 20)
    doshas.push({
      type: 'brahmasthana_violation',
      severity: 'CRITICAL',
      description: `${roomType} encroaches on the Brahmasthana (sacred center of the plot). This is the most severe Vastu dosha — blocks prosperity and cosmic energy flow.`,
      remedy: 'Clear the central zone entirely. No rooms, walls, columns, or heavy objects in the central 1/9th of the plot. Create an open courtyard, light well, or garden.',
    })
    warnings.unshift('CRITICAL: Room occupies the sacred Brahmasthana (plot center) — clear this area immediately')
  }

  return {
    direction,
    zone16,
    element,
    vastuScore: Math.round(score),
    doshas,
    warnings,
    isInBrahmasthana: inBrahmasthana,
  }
}

// ─── Project-Level Analysis ───────────────────────────────────────────────────

export function analyzeProject(
  rooms: Array<{ id: string; name: string; type: string; x: number; y: number; width: number; height: number; floor: number }>,
  plotWidth: number,
  plotHeight: number
): ProjectVastuResult {
  const roomResults = new Map<string, VastuResult>()
  const projectDoshas: VastuDosha[] = []
  const elementConflicts: string[] = []

  let brahmasthanaViolation = false
  const groundFloorRooms = rooms.filter(r => r.floor === 1)

  // Score each room
  for (const room of groundFloorRooms) {
    const result = scoreRoom(room.type, room.x, room.y, room.width, room.height, plotWidth, plotHeight)
    roomResults.set(room.id, result)
    if (result.isInBrahmasthana) brahmasthanaViolation = true
  }

  // Check master bedroom floor rule
  const masterOnUpperFloor = rooms.find(r =>
    r.type === 'master_bedroom' && r.floor > 1
  )
  if (masterOnUpperFloor) {
    projectDoshas.push({
      type: 'master_upper_floor',
      severity: 'SEVERE',
      description: 'Master bedroom is on an upper floor. Vedic Vastu requires the master bedroom to be on the ground floor (earth contact = stability).',
      remedy: 'Move master bedroom to ground floor SW zone; use upper floor for children\'s bedrooms or guest rooms.',
    })
  }

  // Check for kitchen-bathroom adjacency
  const kitchens = groundFloorRooms.filter(r => r.type === 'kitchen')
  const bathrooms = groundFloorRooms.filter(r => r.type === 'bathroom' || r.type === 'toilet')
  for (const kitchen of kitchens) {
    for (const bath of bathrooms) {
      const adjacent = Math.abs(kitchen.x - (bath.x + bath.width)) < 2 ||
                       Math.abs((kitchen.x + kitchen.width) - bath.x) < 2 ||
                       Math.abs(kitchen.y - (bath.y + bath.height)) < 2 ||
                       Math.abs((kitchen.y + kitchen.height) - bath.y) < 2
      if (adjacent) {
        projectDoshas.push({
          type: 'kitchen_bathroom_adjacent',
          severity: 'SEVERE',
          description: 'Kitchen (Fire) and bathroom (Water) are adjacent — opposing elements create perpetual conflict energy.',
          remedy: 'Separate kitchen and bathroom by at least one room; place a bedroom or store room between them.',
        })
        elementConflicts.push('Kitchen (Fire) adjacent to Bathroom (Water) — opposing elements')
      }
    }
  }

  // Check pooja room adjacent to toilet
  const poojaRooms = groundFloorRooms.filter(r => r.type === 'pooja')
  for (const pooja of poojaRooms) {
    for (const bath of bathrooms) {
      const sharedWall =
        Math.abs(pooja.x - (bath.x + bath.width)) < 1 ||
        Math.abs((pooja.x + pooja.width) - bath.x) < 1 ||
        Math.abs(pooja.y - (bath.y + bath.height)) < 1 ||
        Math.abs((pooja.y + pooja.height) - bath.y) < 1
      if (sharedWall) {
        projectDoshas.push({
          type: 'pooja_toilet_shared_wall',
          severity: 'CRITICAL',
          description: 'Pooja room shares a wall with a bathroom/toilet — sacred and impure zones must never share walls.',
          remedy: 'Ensure at least one structural wall gap between pooja and toilet; alternatively relocate pooja to NE corner.',
        })
      }
    }
  }

  const scoredRooms = Array.from(roomResults.values())
  const overallScore = scoredRooms.length
    ? Math.round(scoredRooms.reduce((sum, r) => sum + r.vastuScore, 0) / scoredRooms.length)
    : 0

  return {
    overallScore,
    brahmasthanaViolation,
    entranceIssue: null,
    elementConflicts,
    roomResults,
    projectDoshas,
  }
}

// ─── Convenience: score all rooms and return simple score ─────────────────────

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
