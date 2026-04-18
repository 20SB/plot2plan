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

// dxf-writer color indices (ACI)
const DXF_COLORS = {
  white: 7,
  cyan: 4,
  yellow: 2,
  red: 1,
  green: 3,
  blue: 5,
  magenta: 6,
}

function vastuColor(score: number): number {
  if (score >= 75) return DXF_COLORS.green
  if (score >= 50) return DXF_COLORS.yellow
  return DXF_COLORS.red
}

// Suppress unused variable warning — vastuColor is exported for external use
export { vastuColor }

export async function exportToDxf(options: DxfExportOptions): Promise<void> {
  const { projectTitle, plotWidth, plotHeight, plotUnit, rooms, plumbing, electrical, currentFloor } = options

  // Dynamic import to handle CommonJS module
  const DxfWriter = (await import('dxf-writer')).default
  const dxf = new DxfWriter()

  // Define layers
  dxf.addLayer('ARCHITECTURE', DXF_COLORS.white, 'CONTINUOUS')
  dxf.addLayer('ROOM_LABELS', DXF_COLORS.cyan, 'CONTINUOUS')
  dxf.addLayer('PLUMBING', DXF_COLORS.blue, 'DASHED')
  dxf.addLayer('ELECTRICAL', DXF_COLORS.yellow, 'CONTINUOUS')
  dxf.addLayer('PLOT_BOUNDARY', DXF_COLORS.cyan, 'CONTINUOUS')

  // Plot boundary
  dxf.setActiveLayer('PLOT_BOUNDARY')
  dxf.drawPolyline3d([
    [0, 0, 0],
    [plotWidth, 0, 0],
    [plotWidth, plotHeight, 0],
    [0, plotHeight, 0],
    [0, 0, 0],
  ])

  // Title block
  dxf.setActiveLayer('ROOM_LABELS')
  dxf.drawText(plotWidth / 2, -5, 2, 0, `${projectTitle.toUpperCase()} - FLOOR ${currentFloor}`)
  dxf.drawText(plotWidth / 2, -8, 1, 0, `PLOT: ${plotWidth}x${plotHeight} ${plotUnit} | VASTU BLUEPRINT GENERATOR`)

  // Rooms (architecture layer)
  const floorRooms = rooms.filter(r => r.floor === currentFloor)

  for (const room of floorRooms) {
    dxf.setActiveLayer('ARCHITECTURE')

    // Room polyline (closed rectangle)
    const x1 = room.x, y1 = plotHeight - room.y - room.height // flip Y axis for DXF
    const x2 = room.x + room.width
    const y2 = plotHeight - room.y

    dxf.drawPolyline3d([
      [x1, y1, 0],
      [x2, y1, 0],
      [x2, y2, 0],
      [x1, y2, 0],
      [x1, y1, 0],
    ])

    // Room label
    dxf.setActiveLayer('ROOM_LABELS')
    const centerX = room.x + room.width / 2
    const centerY = plotHeight - room.y - room.height / 2
    dxf.drawText(centerX, centerY + 1, 1.2, 0, room.name)
    dxf.drawText(centerX, centerY - 1, 0.8, 0, `${room.type.replace(/_/g, ' ')} | Vastu: ${room.vastuScore}`)
    dxf.drawText(centerX, centerY - 2.5, 0.7, 0, `${room.width}x${room.height} ${plotUnit}`)
  }

  // Plumbing items
  if (plumbing.length > 0) {
    dxf.setActiveLayer('PLUMBING')
    for (const item of plumbing.filter(p => p.floor === currentFloor)) {
      const px = item.x
      const py = plotHeight - item.y
      // Draw a small cross for each plumbing item
      dxf.drawLine(px - 1, py, px + 1, py)
      dxf.drawLine(px, py - 1, px, py + 1)
      if (item.label || item.type) {
        dxf.drawText(px + 1.5, py, 0.6, 0, (item.label || item.type).toUpperCase())
      }
    }
  }

  // Electrical items
  if (electrical.length > 0) {
    dxf.setActiveLayer('ELECTRICAL')
    for (const item of electrical.filter(e => e.floor === currentFloor)) {
      const ex = item.x
      const ey = plotHeight - item.y
      // Small square symbol
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

  // Generate DXF string and trigger download
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
