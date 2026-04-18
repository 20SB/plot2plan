/**
 * Floor Plan Constraint Engine
 * Based on NBC 2016, Vastu Shastra, and Indian residential design standards.
 * Coordinates: origin (0,0) = bottom-left, x increases right (East), y increases up (North).
 * Canvas renders with y-flip (y=0 = top = North), so all zone/room y values here match canvas convention.
 * North = y=0 (top), South = y=plotHeight (bottom), East = x=plotWidth (right), West = x=0 (left).
 */

// ─── Minimum Room Sizes (in plot units = feet) ───────────────────────────────

export const ROOM_MIN_SIZES: Record<string, { width: number; height: number }> = {
  living_room:     { width: 12, height: 12 },
  dining_room:     { width: 9,  height: 9  },
  master_bedroom:  { width: 12, height: 11 },
  bedroom:         { width: 10, height: 10 },
  kitchen:         { width: 8,  height: 8  },
  bathroom:        { width: 5,  height: 5  },
  toilet:          { width: 4,  height: 4  },
  pooja_room:      { width: 4,  height: 4  },
  utility:         { width: 5,  height: 5  },
  foyer:           { width: 5,  height: 4  },
  store:           { width: 5,  height: 5  },
  servant_room:    { width: 8,  height: 8  },
  garage:          { width: 10, height: 18 },
  corridor:        { width: 3,  height: 3  },
  staircase:       { width: 4,  height: 8  },
  study:           { width: 8,  height: 8  },
  guest_room:      { width: 10, height: 10 },
  balcony:         { width: 4,  height: 6  },
  courtyard:       { width: 8,  height: 8  },
}

export const ROOM_RECOMMENDED_SIZES: Record<string, { width: number; height: number }> = {
  living_room:     { width: 16, height: 14 },
  dining_room:     { width: 12, height: 10 },
  master_bedroom:  { width: 14, height: 13 },
  bedroom:         { width: 12, height: 11 },
  kitchen:         { width: 10, height: 10 },
  bathroom:        { width: 7,  height: 6  },
  pooja_room:      { width: 5,  height: 5  },
  utility:         { width: 7,  height: 6  },
  foyer:           { width: 8,  height: 6  },
  store:           { width: 7,  height: 6  },
}

export const MAX_ASPECT_RATIO = 2.2

// ─── BHK Category Templates ──────────────────────────────────────────────────

export interface RoomSpec {
  type: string
  name: string
  priority: number          // placement order (1 = first)
  zone: string              // preferred Vastu zone: 'NE'|'NW'|'SE'|'SW'|'N'|'S'|'E'|'W'|'CENTER'|'ANY'
  mustAdjacentTo?: string[] // room names that must share a wall
  attached?: boolean        // attached bathroom etc.
}

export interface BHKTemplate {
  bhkType: '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'VILLA'
  label: string
  description: string
  minPlotSqft: number
  maxPlotSqft: number
  targetBUA: number         // built-up area as fraction of plot area
  rooms: RoomSpec[]
}

export const BHK_TEMPLATES: BHKTemplate[] = [
  {
    bhkType: '1BHK',
    label: '1 BHK',
    description: 'Studio to 1 Bedroom — compact living for 1–2 people',
    minPlotSqft: 300,
    maxPlotSqft: 900,
    targetBUA: 0.65,
    rooms: [
      { type: 'foyer',          name: 'Foyer',          priority: 1, zone: 'ANY' },
      { type: 'living_room',    name: 'Living Room',    priority: 2, zone: 'N',  mustAdjacentTo: ['Foyer'] },
      { type: 'kitchen',        name: 'Kitchen',        priority: 3, zone: 'SE', mustAdjacentTo: ['Living Room'] },
      { type: 'master_bedroom', name: 'Master Bedroom', priority: 4, zone: 'SW' },
      { type: 'bathroom',       name: 'Bathroom',       priority: 5, zone: 'ANY', mustAdjacentTo: ['Master Bedroom'] },
      { type: 'pooja_room',     name: 'Pooja Room',     priority: 6, zone: 'NE' },
    ]
  },
  {
    bhkType: '2BHK',
    label: '2 BHK',
    description: '2 Bedrooms — ideal for nuclear families of 3–4',
    minPlotSqft: 800,
    maxPlotSqft: 1600,
    targetBUA: 0.65,
    rooms: [
      { type: 'foyer',          name: 'Foyer',          priority: 1, zone: 'ANY' },
      { type: 'living_room',    name: 'Living Room',    priority: 2, zone: 'N',   mustAdjacentTo: ['Foyer'] },
      { type: 'dining_room',    name: 'Dining Room',    priority: 3, zone: 'ANY', mustAdjacentTo: ['Living Room'] },
      { type: 'kitchen',        name: 'Kitchen',        priority: 4, zone: 'SE',  mustAdjacentTo: ['Dining Room'] },
      { type: 'utility',        name: 'Utility',        priority: 5, zone: 'SE',  mustAdjacentTo: ['Kitchen'] },
      { type: 'master_bedroom', name: 'Master Bedroom', priority: 6, zone: 'SW' },
      { type: 'bathroom',       name: 'Master Bath',    priority: 7, zone: 'ANY', mustAdjacentTo: ['Master Bedroom'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 2',      priority: 8, zone: 'NW' },
      { type: 'bathroom',       name: 'Common Bath',    priority: 9, zone: 'W' },
      { type: 'pooja_room',     name: 'Pooja Room',     priority: 10, zone: 'NE' },
    ]
  },
  {
    bhkType: '3BHK',
    label: '3 BHK',
    description: '3 Bedrooms — for families of 4–6, most popular Indian configuration',
    minPlotSqft: 1400,
    maxPlotSqft: 2800,
    targetBUA: 0.60,
    rooms: [
      { type: 'foyer',          name: 'Foyer',          priority: 1,  zone: 'ANY' },
      { type: 'living_room',    name: 'Living Room',    priority: 2,  zone: 'N',   mustAdjacentTo: ['Foyer'] },
      { type: 'dining_room',    name: 'Dining Room',    priority: 3,  zone: 'ANY', mustAdjacentTo: ['Living Room'] },
      { type: 'kitchen',        name: 'Kitchen',        priority: 4,  zone: 'SE',  mustAdjacentTo: ['Dining Room'] },
      { type: 'utility',        name: 'Utility',        priority: 5,  zone: 'SE',  mustAdjacentTo: ['Kitchen'] },
      { type: 'master_bedroom', name: 'Master Bedroom', priority: 6,  zone: 'SW' },
      { type: 'bathroom',       name: 'Master Bath',    priority: 7,  zone: 'SW',  mustAdjacentTo: ['Master Bedroom'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 2',      priority: 8,  zone: 'NW' },
      { type: 'bathroom',       name: 'Bedroom 2 Bath', priority: 9,  zone: 'W',   mustAdjacentTo: ['Bedroom 2'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 3',      priority: 10, zone: 'E' },
      { type: 'bathroom',       name: 'Common Bath',    priority: 11, zone: 'W' },
      { type: 'pooja_room',     name: 'Pooja Room',     priority: 12, zone: 'NE' },
      { type: 'store',          name: 'Store Room',     priority: 13, zone: 'ANY' },
    ]
  },
  {
    bhkType: '4BHK',
    label: '4 BHK',
    description: '4 Bedrooms — joint families or premium residences',
    minPlotSqft: 2400,
    maxPlotSqft: 5000,
    targetBUA: 0.60,
    rooms: [
      { type: 'foyer',          name: 'Foyer',          priority: 1,  zone: 'ANY' },
      { type: 'living_room',    name: 'Living Room',    priority: 2,  zone: 'N',   mustAdjacentTo: ['Foyer'] },
      { type: 'dining_room',    name: 'Dining Room',    priority: 3,  zone: 'ANY', mustAdjacentTo: ['Living Room'] },
      { type: 'kitchen',        name: 'Kitchen',        priority: 4,  zone: 'SE',  mustAdjacentTo: ['Dining Room'] },
      { type: 'utility',        name: 'Utility',        priority: 5,  zone: 'SE',  mustAdjacentTo: ['Kitchen'] },
      { type: 'master_bedroom', name: 'Master Bedroom', priority: 6,  zone: 'SW' },
      { type: 'bathroom',       name: 'Master Bath',    priority: 7,  zone: 'SW',  mustAdjacentTo: ['Master Bedroom'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 2',      priority: 8,  zone: 'NW' },
      { type: 'bathroom',       name: 'Bedroom 2 Bath', priority: 9,  zone: 'W',   mustAdjacentTo: ['Bedroom 2'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 3',      priority: 10, zone: 'E' },
      { type: 'bathroom',       name: 'Bedroom 3 Bath', priority: 11, zone: 'E',   mustAdjacentTo: ['Bedroom 3'], attached: true },
      { type: 'guest_room',     name: 'Guest Room',     priority: 12, zone: 'NW' },
      { type: 'bathroom',       name: 'Guest Bath',     priority: 13, zone: 'NW',  mustAdjacentTo: ['Guest Room'], attached: true },
      { type: 'study',          name: 'Study',          priority: 14, zone: 'N' },
      { type: 'pooja_room',     name: 'Pooja Room',     priority: 15, zone: 'NE' },
      { type: 'servant_room',   name: 'Servant Room',   priority: 16, zone: 'SE' },
      { type: 'store',          name: 'Store Room',     priority: 17, zone: 'ANY' },
      { type: 'garage',         name: 'Garage',         priority: 18, zone: 'NW' },
    ]
  },
  {
    bhkType: 'VILLA',
    label: 'Villa',
    description: 'Independent villa with garden, garage, servant quarters',
    minPlotSqft: 4000,
    maxPlotSqft: 99999,
    targetBUA: 0.50,
    rooms: [
      { type: 'foyer',          name: 'Foyer',          priority: 1,  zone: 'ANY' },
      { type: 'living_room',    name: 'Living Room',    priority: 2,  zone: 'N',   mustAdjacentTo: ['Foyer'] },
      { type: 'dining_room',    name: 'Dining Room',    priority: 3,  zone: 'ANY', mustAdjacentTo: ['Living Room'] },
      { type: 'kitchen',        name: 'Kitchen',        priority: 4,  zone: 'SE',  mustAdjacentTo: ['Dining Room'] },
      { type: 'utility',        name: 'Utility',        priority: 5,  zone: 'SE',  mustAdjacentTo: ['Kitchen'] },
      { type: 'master_bedroom', name: 'Master Bedroom', priority: 6,  zone: 'SW' },
      { type: 'bathroom',       name: 'Master Bath',    priority: 7,  zone: 'SW',  mustAdjacentTo: ['Master Bedroom'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 2',      priority: 8,  zone: 'NW' },
      { type: 'bathroom',       name: 'Bedroom 2 Bath', priority: 9,  zone: 'W',   mustAdjacentTo: ['Bedroom 2'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 3',      priority: 10, zone: 'E' },
      { type: 'bathroom',       name: 'Bedroom 3 Bath', priority: 11, zone: 'E',   mustAdjacentTo: ['Bedroom 3'], attached: true },
      { type: 'bedroom',        name: 'Bedroom 4',      priority: 12, zone: 'W' },
      { type: 'guest_room',     name: 'Guest Room',     priority: 13, zone: 'NW' },
      { type: 'study',          name: 'Study',          priority: 14, zone: 'N' },
      { type: 'pooja_room',     name: 'Pooja Room',     priority: 15, zone: 'NE' },
      { type: 'servant_room',   name: 'Servant Room',   priority: 16, zone: 'SE' },
      { type: 'store',          name: 'Store Room',     priority: 17, zone: 'ANY' },
      { type: 'garage',         name: 'Garage',         priority: 18, zone: 'NW' },
      { type: 'courtyard',      name: 'Courtyard',      priority: 19, zone: 'CENTER' },
      { type: 'balcony',        name: 'Sit-out',        priority: 20, zone: 'N' },
    ]
  }
]

// ─── Vastu Zone Computation ───────────────────────────────────────────────────

export interface VastuZone {
  x: number; y: number; width: number; height: number
}

/**
 * Returns bounding boxes for all 9 Vastu zones given plot dimensions.
 * Coordinate system: N=top (y=0), S=bottom (y=plotHeight), E=right (x=plotWidth), W=left (x=0).
 * Zone proportions: corner zones = 30% each axis; center = middle 40%.
 */
export function computeVastuZones(
  plotWidth: number,
  plotHeight: number
): Record<string, VastuZone> {
  const cx1 = Math.round(plotWidth * 0.30)
  const cx2 = Math.round(plotWidth * 0.70)
  const cy1 = Math.round(plotHeight * 0.30)
  const cy2 = Math.round(plotHeight * 0.70)

  return {
    NW: { x: 0,    y: 0,    width: cx1,           height: cy1           }, // top-left
    N:  { x: cx1,  y: 0,    width: cx2 - cx1,     height: cy1           }, // top-center
    NE: { x: cx2,  y: 0,    width: plotWidth-cx2, height: cy1           }, // top-right
    W:  { x: 0,    y: cy1,  width: cx1,           height: cy2 - cy1     }, // left-center
    CENTER: { x: cx1, y: cy1, width: cx2-cx1,     height: cy2 - cy1     }, // center (Brahmasthana)
    E:  { x: cx2,  y: cy1,  width: plotWidth-cx2, height: cy2 - cy1     }, // right-center
    SW: { x: 0,    y: cy2,  width: cx1,           height: plotHeight-cy2 }, // bottom-left
    S:  { x: cx1,  y: cy2,  width: cx2 - cx1,     height: plotHeight-cy2 }, // bottom-center
    SE: { x: cx2,  y: cy2,  width: plotWidth-cx2, height: plotHeight-cy2 }, // bottom-right
  }
}

/**
 * Get Vastu placement rule for a room type and plot facing direction.
 * Returns the ideal zone name for placement.
 */
export function getVastuZoneForRoom(roomType: string, facing: string): string {
  const rules: Record<string, string> = {
    pooja_room: 'NE',
    kitchen: 'SE',
    master_bedroom: 'SW',
    store: 'SW',
    servant_room: 'SE',
    garage: 'NW',
    guest_room: 'NW',
    staircase: 'SW',
    study: 'N',
    living_room: facing === 'E' ? 'E' : facing === 'S' ? 'N' : 'N',
    foyer: facing === 'E' ? 'E' : facing === 'S' ? 'S' : facing === 'W' ? 'W' : 'N',
    utility: 'SE',
    bathroom: 'W',
    toilet: 'W',
  }
  return rules[roomType] || 'ANY'
}

/**
 * Get entrance placement (x range) based on plot facing and width.
 * Returns { x, y, width, height } of the recommended entrance door zone.
 */
export function getEntranceZone(plotWidth: number, plotHeight: number, facing: string): VastuZone {
  const doorWidth = Math.min(6, Math.round(plotWidth * 0.18))
  const doorHeight = 4
  switch (facing) {
    case 'N': return { x: Math.round(plotWidth * 0.35), y: 0, width: doorWidth, height: doorHeight }
    case 'S': return { x: Math.round(plotWidth * 0.45), y: plotHeight - doorHeight, width: doorWidth, height: doorHeight }
    case 'E': return { x: plotWidth - doorHeight, y: Math.round(plotHeight * 0.35), width: doorHeight, height: doorWidth }
    case 'W': return { x: 0, y: Math.round(plotHeight * 0.35), width: doorHeight, height: doorWidth }
    default:  return { x: Math.round(plotWidth * 0.35), y: 0, width: doorWidth, height: doorHeight }
  }
}

// ─── Geometric Validation ────────────────────────────────────────────────────

export interface SimpleRoom {
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  floor: number
}

export function roomsOverlap(a: SimpleRoom, b: SimpleRoom): boolean {
  if (a.floor !== b.floor) return false
  return !(
    a.x + a.width  <= b.x ||
    b.x + b.width  <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  )
}

export interface LayoutIssue {
  type: 'OVERLAP' | 'OUT_OF_BOUNDS' | 'TOO_SMALL' | 'BAD_ASPECT'
  roomA: string
  roomB?: string
  message: string
}

export function validateLayout(
  rooms: SimpleRoom[],
  plotWidth: number,
  plotHeight: number
): LayoutIssue[] {
  const issues: LayoutIssue[] = []
  const TOLERANCE = 0.1

  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i]

    // Boundary check
    if (r.x < -TOLERANCE || r.y < -TOLERANCE ||
        r.x + r.width > plotWidth + TOLERANCE ||
        r.y + r.height > plotHeight + TOLERANCE) {
      issues.push({
        type: 'OUT_OF_BOUNDS', roomA: r.name,
        message: `${r.name} exceeds plot boundary (x:${r.x} y:${r.y} w:${r.width} h:${r.height})`
      })
    }

    // Minimum size check
    const minSize = ROOM_MIN_SIZES[r.type]
    if (minSize && (r.width < minSize.width - TOLERANCE || r.height < minSize.height - TOLERANCE)) {
      issues.push({
        type: 'TOO_SMALL', roomA: r.name,
        message: `${r.name} is ${r.width}×${r.height} — minimum is ${minSize.width}×${minSize.height}`
      })
    }

    // Aspect ratio check (only for rooms wider than min)
    if (r.width > 0 && r.height > 0) {
      const ratio = Math.max(r.width, r.height) / Math.min(r.width, r.height)
      if (ratio > MAX_ASPECT_RATIO) {
        issues.push({
          type: 'BAD_ASPECT', roomA: r.name,
          message: `${r.name} aspect ratio ${ratio.toFixed(1)}:1 exceeds max ${MAX_ASPECT_RATIO}`
        })
      }
    }

    // Overlap check
    for (let j = i + 1; j < rooms.length; j++) {
      if (roomsOverlap(rooms[i], rooms[j])) {
        issues.push({
          type: 'OVERLAP', roomA: rooms[i].name, roomB: rooms[j].name,
          message: `${rooms[i].name} overlaps ${rooms[j].name}`
        })
      }
    }
  }

  return issues
}

// ─── Auto-Fix Functions ───────────────────────────────────────────────────────

/** Clamp all rooms to stay within plot boundary */
export function clampToBoundary(
  rooms: SimpleRoom[],
  plotWidth: number,
  plotHeight: number
): SimpleRoom[] {
  return rooms.map(r => {
    const x = Math.max(0, Math.min(r.x, plotWidth - 1))
    const y = Math.max(0, Math.min(r.y, plotHeight - 1))
    const width  = Math.max(1, Math.min(r.width,  plotWidth  - x))
    const height = Math.max(1, Math.min(r.height, plotHeight - y))
    return { ...r, x, y, width, height }
  })
}

/** Scale rooms up to minimum dimensions if they're below minimum */
export function enforceMinSizes(
  rooms: SimpleRoom[],
  plotWidth: number,
  plotHeight: number
): SimpleRoom[] {
  return rooms.map(r => {
    const minSize = ROOM_MIN_SIZES[r.type]
    if (!minSize) return r
    const width  = Math.min(Math.max(r.width,  minSize.width),  plotWidth  - r.x)
    const height = Math.min(Math.max(r.height, minSize.height), plotHeight - r.y)
    return { ...r, width, height }
  })
}

// ─── BHK Inference ───────────────────────────────────────────────────────────

export function inferBHKType(
  plotSqft: number,
  requestedRooms: string[]
): BHKTemplate['bhkType'] {
  const bedroomCount = requestedRooms.filter(t =>
    t === 'master_bedroom' || t === 'bedroom'
  ).length
  if (bedroomCount <= 1 || plotSqft <= 900)  return '1BHK'
  if (bedroomCount === 2 || plotSqft <= 1600) return '2BHK'
  if (bedroomCount === 3 || plotSqft <= 2800) return '3BHK'
  if (bedroomCount >= 4 || plotSqft <= 5000)  return '4BHK'
  return 'VILLA'
}

export function getBHKTemplate(bhkType: BHKTemplate['bhkType']): BHKTemplate {
  return BHK_TEMPLATES.find(t => t.bhkType === bhkType) ?? BHK_TEMPLATES[2]
}

// ─── Few-Shot Reference Layouts ───────────────────────────────────────────────

/**
 * Reference layout for a 30×40ft North-facing 2BHK.
 * Used as a few-shot example in Claude's generation prompt.
 */
export const REFERENCE_2BHK_NORTH: SimpleRoom[] = [
  { name: 'Foyer',          type: 'foyer',          x: 11, y: 0,  width: 8,  height: 5,  floor: 0 },
  { name: 'Living Room',    type: 'living_room',    x: 0,  y: 5,  width: 18, height: 14, floor: 0 },
  { name: 'Dining Room',    type: 'dining_room',    x: 18, y: 5,  width: 12, height: 11, floor: 0 },
  { name: 'Kitchen',        type: 'kitchen',        x: 18, y: 16, width: 12, height: 11, floor: 0 },
  { name: 'Utility',        type: 'utility',        x: 18, y: 27, width: 7,  height: 7,  floor: 0 },
  { name: 'Pooja Room',     type: 'pooja_room',     x: 25, y: 0,  width: 5,  height: 5,  floor: 0 },
  { name: 'Master Bedroom', type: 'master_bedroom', x: 0,  y: 27, width: 13, height: 13, floor: 0 },
  { name: 'Master Bath',    type: 'bathroom',       x: 13, y: 27, width: 5,  height: 7,  floor: 0 },
  { name: 'Bedroom 2',      type: 'bedroom',        x: 0,  y: 19, width: 10, height: 8,  floor: 0 },
  { name: 'Common Bath',    type: 'bathroom',       x: 10, y: 19, width: 6,  height: 8,  floor: 0 },
]

/**
 * Reference layout for a 40×60ft East-facing 3BHK.
 */
export const REFERENCE_3BHK_EAST: SimpleRoom[] = [
  { name: 'Foyer',          type: 'foyer',          x: 34, y: 24, width: 6,  height: 8,  floor: 0 },
  { name: 'Living Room',    type: 'living_room',    x: 16, y: 18, width: 18, height: 16, floor: 0 },
  { name: 'Dining Room',    type: 'dining_room',    x: 0,  y: 22, width: 16, height: 12, floor: 0 },
  { name: 'Kitchen',        type: 'kitchen',        x: 0,  y: 34, width: 14, height: 12, floor: 0 },
  { name: 'Utility',        type: 'utility',        x: 14, y: 34, width: 8,  height: 7,  floor: 0 },
  { name: 'Pooja Room',     type: 'pooja_room',     x: 34, y: 0,  width: 6,  height: 6,  floor: 0 },
  { name: 'Master Bedroom', type: 'master_bedroom', x: 0,  y: 41, width: 14, height: 14, floor: 0 },
  { name: 'Master Bath',    type: 'bathroom',       x: 14, y: 41, width: 7,  height: 8,  floor: 0 },
  { name: 'Bedroom 2',      type: 'bedroom',        x: 0,  y: 0,  width: 14, height: 13, floor: 0 },
  { name: 'Bedroom 2 Bath', type: 'bathroom',       x: 14, y: 0,  width: 7,  height: 7,  floor: 0 },
  { name: 'Bedroom 3',      type: 'bedroom',        x: 21, y: 0,  width: 13, height: 13, floor: 0 },
  { name: 'Common Bath',    type: 'bathroom',       x: 0,  y: 13, width: 7,  height: 7,  floor: 0 },
  { name: 'Store Room',     type: 'store',          x: 7,  y: 13, width: 7,  height: 7,  floor: 0 },
]
