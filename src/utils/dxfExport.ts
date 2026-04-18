'use client'

import type { Room, PlumbingItem, ElectricalItem } from '@/types'

interface DxfExportOptions {
  projectTitle: string
  plotWidth: number
  plotHeight: number
  plotUnit: string
  rooms: Room[]
  plumbing: PlumbingItem[]
  electrical: ElectricalItem[]
  currentFloor: number
}

// ACI color indices
const ACI = {
  RED: 1,
  YELLOW: 2,
  GREEN: 3,
  CYAN: 4,
  BLUE: 5,
  MAGENTA: 6,
  WHITE: 7,
}

// AIA layer definitions
const LAYERS = {
  ROOM:     { name: 'A-FLOR-ROOM',  color: ACI.WHITE,  linetype: 'CONTINUOUS' },
  LABEL:    { name: 'A-FLOR-IDEN',  color: ACI.GREEN,  linetype: 'CONTINUOUS' },
  PLUMBING: { name: 'P-SANR-FIXT',  color: ACI.BLUE,   linetype: 'DASHED' },
  ELEC:     { name: 'E-POWR-RECP',  color: ACI.RED,    linetype: 'CONTINUOUS' },
  BOUNDARY: { name: 'A-SITE-BNDRY', color: ACI.WHITE,  linetype: 'CONTINUOUS' },
  DIMS:     { name: 'A-ANNO-DIMS',  color: ACI.YELLOW, linetype: 'CONTINUOUS' },
}

// Door-arc room types
const DOOR_ROOM_TYPES = new Set(['bedroom', 'master_bedroom', 'living_room', 'entrance', 'main_entrance'])

function vastuColor(score: number): number {
  if (score >= 75) return ACI.GREEN
  if (score >= 50) return ACI.YELLOW
  return ACI.RED
}

// Suppress unused variable warning — vastuColor is exported for external use
export { vastuColor }

export async function exportToDxf(options: DxfExportOptions): Promise<void> {
  const { projectTitle, plotWidth, plotHeight, plotUnit, rooms, plumbing, electrical, currentFloor } = options

  // Dynamic import to handle CommonJS module
  const DxfWriter = (await import('dxf-writer')).default
  const dxf = new DxfWriter()

  // ── Units header (ISO/metric) ──────────────────────────────────────────────
  // $MEASUREMENT: 1 = metric, $INSUNITS: 4 = mm
  dxf.header('$MEASUREMENT', [[70, 1]])
  dxf.header('$INSUNITS',    [[70, 4]])

  // ── AIA layers ─────────────────────────────────────────────────────────────
  for (const layer of Object.values(LAYERS)) {
    dxf.addLayer(layer.name, layer.color, layer.linetype)
  }

  // ── Plot boundary ──────────────────────────────────────────────────────────
  dxf.setActiveLayer(LAYERS.BOUNDARY.name)
  dxf.drawPolyline3d([
    [0, 0, 0],
    [plotWidth, 0, 0],
    [plotWidth, plotHeight, 0],
    [0, plotHeight, 0],
    [0, 0, 0],
  ])

  // ── Title block ────────────────────────────────────────────────────────────
  dxf.setActiveLayer(LAYERS.DIMS.name)
  dxf.drawText(plotWidth / 2, -5, 2, 0, `${projectTitle.toUpperCase()} - FLOOR ${currentFloor}`, 'center')
  dxf.drawText(plotWidth / 2, -8, 1, 0, `PLOT: ${plotWidth}x${plotHeight} ${plotUnit} | VASTU BLUEPRINT GENERATOR`, 'center')

  // ── Rooms ──────────────────────────────────────────────────────────────────
  const floorRooms = rooms.filter(r => r.floor === currentFloor)

  for (const room of floorRooms) {
    // DXF Y-axis is flipped relative to canvas
    const x1 = room.x
    const y1 = plotHeight - room.y - room.height
    const x2 = room.x + room.width
    const y2 = plotHeight - room.y

    dxf.setActiveLayer(LAYERS.ROOM.name)
    dxf.drawPolyline3d([
      [x1, y1, 0],
      [x2, y1, 0],
      [x2, y2, 0],
      [x1, y2, 0],
      [x1, y1, 0],
    ])

    // Labels
    const centerX = room.x + room.width / 2
    const centerY = plotHeight - room.y - room.height / 2
    dxf.setActiveLayer(LAYERS.LABEL.name)
    dxf.drawText(centerX, centerY + 1, 1.2, 0, room.name, 'center')
    dxf.drawText(centerX, centerY - 1, 0.8, 0, `${room.type.replace(/_/g, ' ')} | Vastu: ${room.vastuScore}`, 'center')
    dxf.drawText(centerX, centerY - 2.5, 0.7, 0, `${room.width}x${room.height} ${plotUnit}`, 'center')

    // Door arc symbol for qualifying room types
    if (DOOR_ROOM_TYPES.has(room.type)) {
      const DOOR_RADIUS = 0.9 // 0.9 m standard door width
      // Place arc at south-east corner of room (bottom-right in DXF coords = x2, y1)
      // Quarter-circle arc: 0° → 90° represents door sweep from east wall opening
      dxf.setActiveLayer(LAYERS.DIMS.name)
      // Arc center at bottom-right corner; sweep from 90° to 180° (opening into room)
      dxf.drawArc(x2, y1, DOOR_RADIUS, 90, 180)
      // Door leaf line (horizontal, along south wall)
      dxf.drawLine(x2 - DOOR_RADIUS, y1, x2, y1)
    }
  }

  // ── Plumbing items ─────────────────────────────────────────────────────────
  if (plumbing.length > 0) {
    dxf.setActiveLayer(LAYERS.PLUMBING.name)
    for (const item of plumbing.filter(p => p.floor === currentFloor)) {
      const px = item.x
      const py = plotHeight - item.y
      dxf.drawLine(px - 1, py, px + 1, py)
      dxf.drawLine(px, py - 1, px, py + 1)
      if (item.label || item.type) {
        dxf.drawText(px + 1.5, py, 0.6, 0, (item.label || item.type).toUpperCase())
      }
    }
  }

  // ── Electrical items ───────────────────────────────────────────────────────
  if (electrical.length > 0) {
    dxf.setActiveLayer(LAYERS.ELEC.name)
    for (const item of electrical.filter(e => e.floor === currentFloor)) {
      const ex = item.x
      const ey = plotHeight - item.y
      dxf.drawPolyline3d([
        [ex - 0.8, ey - 0.8, 0],
        [ex + 0.8, ey - 0.8, 0],
        [ex + 0.8, ey + 0.8, 0],
        [ex - 0.8, ey + 0.8, 0],
        [ex - 0.8, ey - 0.8, 0],
      ])
      if (item.label || item.type) {
        dxf.drawText(ex + 1.2, ey, 0.6, 0, (item.label || item.type).toUpperCase())
      }
    }
  }

  // ── Generate and download ──────────────────────────────────────────────────
  const dxfString = dxf.toDxfString()
  const blob = new Blob([dxfString], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase()}-floor${currentFloor}.dxf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
