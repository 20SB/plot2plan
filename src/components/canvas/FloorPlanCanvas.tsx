'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import type { Room, PlumbingItem, ElectricalItem, LayerType } from '@/types'

const SCALE = 8
const HANDLE_SIZE = 10

interface Props {
  plotWidth: number
  plotHeight: number
  rooms: Room[]
  plumbing: PlumbingItem[]
  electrical: ElectricalItem[]
  activeLayer: LayerType
  currentFloor: number
  onRoomsChange?: (rooms: Room[]) => void
}

function vastuColor(score: number): string {
  if (score >= 75) return '#22c55e'   // green-500
  if (score >= 50) return '#eab308'   // yellow-500
  return '#ef4444'                    // red-500
}

const ROOM_TYPE_COLORS: Record<string, string> = {
  living_room: '#0891b2',      // cyan-600
  master_bedroom: '#7c3aed',   // violet-600
  bedroom: '#6d28d9',          // violet-700
  kitchen: '#d97706',          // amber-600
  bathroom: '#0369a1',         // sky-700
  toilet: '#0284c7',           // sky-600
  study: '#059669',            // emerald-600
  pooja: '#dc2626',            // red-600
  guest_room: '#7c3aed',       // violet-600
  store: '#64748b',            // slate-500
  garage: '#475569',           // slate-600
  staircase: '#92400e',        // amber-800
  dining: '#b45309',           // amber-700
  verandah: '#0f766e',         // teal-700
  default: '#334155',          // slate-700
}

function drawGrid(ctx: CanvasRenderingContext2D, plotWidth: number, plotHeight: number) {
  const W = plotWidth * SCALE
  const H = plotHeight * SCALE

  // Background
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, W, H)

  // Minor grid lines (1 unit)
  ctx.strokeStyle = 'rgba(51,65,85,0.4)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= W; x += SCALE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += SCALE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Major grid lines (10 units)
  ctx.strokeStyle = 'rgba(34,211,238,0.15)'
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += SCALE * 10) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += SCALE * 10) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Plot border
  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, W - 2, H - 2)

  // Compass rose (top-right)
  const cx = W - 24, cy = 24
  ctx.fillStyle = '#22d3ee'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('N', cx, cy - 12)
  ctx.fillStyle = 'rgba(34,211,238,0.5)'
  ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.closePath(); ctx.fill()
}

function drawRoom(ctx: CanvasRenderingContext2D, room: Room, isSelected: boolean) {
  const x = room.x * SCALE
  const y = room.y * SCALE
  const w = room.width * SCALE
  const h = room.height * SCALE

  // Room fill
  const typeColor = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.default
  ctx.fillStyle = typeColor + '33'  // 20% opacity
  ctx.fillRect(x, y, w, h)

  // Vastu border
  const borderColor = vastuColor(room.vastuScore)
  ctx.strokeStyle = isSelected ? '#fff' : borderColor
  ctx.lineWidth = isSelected ? 2 : 1.5
  ctx.strokeRect(x, y, w, h)

  // Room label
  ctx.fillStyle = '#e2e8f0'
  ctx.font = `${Math.max(8, Math.min(12, w / room.name.length * 1.2))}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const labelY = y + h / 2 - 6
  ctx.fillText(room.name, x + w / 2, labelY)

  // Score label
  ctx.fillStyle = borderColor
  ctx.font = '8px monospace'
  ctx.fillText(`${room.vastuScore}`, x + w / 2, labelY + 14)

  // Dimension label
  ctx.fillStyle = 'rgba(148,163,184,0.6)'
  ctx.font = '7px monospace'
  ctx.fillText(`${room.width}×${room.height}`, x + w / 2, y + h - 6)

  // Corner handles if selected
  if (isSelected) {
    const corners = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    ctx.fillStyle = '#22d3ee'
    for (const [hx, hy] of corners) {
      ctx.fillRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
    }
  }
}

function drawPlumbing(ctx: CanvasRenderingContext2D, items: PlumbingItem[]) {
  const ICONS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void> = {
    pipe: (c, x, y) => { c.setLineDash([4, 2]); c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x + 8, y); c.stroke(); c.setLineDash([]) },
    tank: (c, x, y) => { c.strokeRect(x - 8, y - 6, 16, 12) },
    tap: (c, x, y) => { c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.stroke() },
    drain: (c, x, y) => { c.beginPath(); c.moveTo(x - 5, y - 5); c.lineTo(x + 5, y + 5); c.moveTo(x + 5, y - 5); c.lineTo(x - 5, y + 5); c.stroke() },
    shower: (c, x, y) => { for (let a = 0; a < 6; a++) { c.beginPath(); const rad = (a * 60 * Math.PI) / 180; c.moveTo(x, y); c.lineTo(x + Math.cos(rad) * 7, y + Math.sin(rad) * 7); c.stroke() } },
  }

  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.fillStyle = '#38bdf8'

  for (const item of items) {
    const x = item.x * SCALE
    const y = item.y * SCALE
    const draw = ICONS[item.type]
    if (draw) draw(ctx, x, y)

    // Label
    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(item.type.slice(0, 3).toUpperCase(), x, y + 14)
  }
}

function drawElectrical(ctx: CanvasRenderingContext2D, items: ElectricalItem[]) {
  const ICONS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void> = {
    socket: (c, x, y) => { c.strokeRect(x - 5, y - 5, 10, 10); c.fillRect(x - 1, y - 4, 2, 3); c.fillRect(x - 1, y + 1, 2, 3) },
    switch: (c, x, y) => { c.strokeRect(x - 6, y - 4, 12, 8); c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x + 3, y); c.stroke() },
    light: (c, x, y) => { c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fill() },
    fan: (c, x, y) => { for (let a = 0; a < 4; a++) { c.beginPath(); const rad = (a * 90 * Math.PI) / 180; c.ellipse(x + Math.cos(rad) * 5, y + Math.sin(rad) * 5, 4, 2, rad, 0, Math.PI * 2); c.stroke() } },
    ac: (c, x, y) => { c.strokeRect(x - 10, y - 4, 20, 8); for (let i = -6; i <= 6; i += 3) { c.beginPath(); c.moveTo(x + i, y - 2); c.lineTo(x + i, y + 2); c.stroke() } },
  }

  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  ctx.fillStyle = '#fbbf24'

  for (const item of items) {
    const x = item.x * SCALE
    const y = item.y * SCALE
    const draw = ICONS[item.type]
    if (draw) draw(ctx, x, y)

    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(item.type.slice(0, 2).toUpperCase(), x, y + 14)
  }
}

export function FloorPlanCanvas({
  plotWidth, plotHeight, rooms, plumbing, electrical,
  activeLayer, currentFloor, onRoomsChange
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { localRooms, syncRooms, selectedRoomId, onMouseDown, onMouseMove, onMouseUp } = useCanvas(rooms, onRoomsChange)

  // Sync when external rooms prop changes
  useEffect(() => { syncRooms(rooms) }, [rooms, syncRooms])

  const visibleRooms = localRooms.filter(r => r.floor === currentFloor)
  const visiblePlumbing = plumbing.filter(p => p.floor === currentFloor)
  const visibleElectrical = electrical.filter(e => e.floor === currentFloor)

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx, plotWidth, plotHeight)

    // Draw rooms (always, but dimmed when on PLMB/ELEC layer)
    ctx.globalAlpha = activeLayer === 'ARCH' ? 1.0 : 0.3
    for (const room of visibleRooms) {
      drawRoom(ctx, room, room.id === selectedRoomId)
    }
    ctx.globalAlpha = 1.0

    if (activeLayer === 'PLMB') {
      drawPlumbing(ctx, visiblePlumbing)
    }

    if (activeLayer === 'ELEC') {
      drawElectrical(ctx, visibleElectrical)
    }
  }, [localRooms, selectedRoomId, activeLayer, currentFloor, plotWidth, plotHeight, visibleRooms, visiblePlumbing, visibleElectrical])

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    onMouseDown(e.nativeEvent, canvasRef.current, visibleRooms)
  }, [onMouseDown, visibleRooms])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    onMouseMove(e.nativeEvent, canvasRef.current, plotWidth, plotHeight)
  }, [onMouseMove, plotWidth, plotHeight])

  const handleMouseUp = useCallback(() => {
    onMouseUp()
  }, [onMouseUp])

  return (
    <canvas
      ref={canvasRef}
      id="floor-plan-canvas"
      width={plotWidth * SCALE}
      height={plotHeight * SCALE}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="cursor-crosshair shadow-2xl"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
