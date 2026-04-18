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
  onUndo?: () => void
}

function vastuColor(score: number): string {
  if (score >= 75) return '#10b981'   // emerald-500
  if (score >= 50) return '#f59e0b'   // amber-500
  return '#ef4444'                    // red-500
}

const ROOM_TYPE_COLORS: Record<string, string> = {
  living_room: '#0ea5e9',      // sky-500
  master_bedroom: '#8b5cf6',   // violet-500
  bedroom: '#7c3aed',          // violet-600
  kitchen: '#f97316',          // orange-500
  bathroom: '#38bdf8',         // sky-400
  toilet: '#60a5fa',           // blue-400
  study: '#10b981',            // emerald-500
  pooja: '#f43f5e',            // rose-500
  guest_room: '#a78bfa',       // violet-400
  store: '#64748b',            // slate-500
  garage: '#475569',           // slate-600
  staircase: '#d97706',        // amber-600
  dining: '#fb923c',           // orange-400
  verandah: '#14b8a6',         // teal-500
  default: '#94a3b8',          // slate-400
}

function drawGrid(ctx: CanvasRenderingContext2D, plotWidth: number, plotHeight: number) {
  const W = plotWidth * SCALE
  const H = plotHeight * SCALE

  // Background - Clean Light Studio
  ctx.fillStyle = '#f8fafc' // slate-50
  ctx.fillRect(0, 0, W, H)

  // Subtle Outer border
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, W, H)

  // Minor grid lines (1 unit) - Very faint light grey
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= W; x += SCALE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += SCALE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Major grid lines (10 units) - Clean architectural lines
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)'
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += SCALE * 10) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += SCALE * 10) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Plot border - Solid Professional Blue
  ctx.strokeStyle = '#0ea5e9'
  ctx.lineWidth = 2
  ctx.strokeRect(2, 2, W - 4, H - 4)

  // Compass rose (top-right) - Minimalist
  const cx = W - 30, cy = 30
  ctx.fillStyle = '#0ea5e9'
  ctx.font = 'bold 12px "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('N', cx, cy - 14)
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)'
  ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx - 5, cy - 2); ctx.lineTo(cx, cy - 10); ctx.lineTo(cx + 5, cy - 2); ctx.fill()
}

function drawRoom(ctx: CanvasRenderingContext2D, room: Room, isSelected: boolean) {
  const x = room.x * SCALE
  const y = room.y * SCALE
  const w = room.width * SCALE
  const h = room.height * SCALE

  // Room fill - Soft translucent colors
  const typeColor = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.default
  ctx.fillStyle = typeColor + '18'  // ~9% opacity for light mode
  ctx.fillRect(x, y, w, h)

  // Vastu border
  const borderColor = vastuColor(room.vastuScore)
  ctx.strokeStyle = isSelected ? '#000000' : borderColor
  ctx.lineWidth = isSelected ? 3 : 1.5
  ctx.strokeRect(x, y, w, h)

  // Room label - High contrast text
  ctx.fillStyle = '#1e293b'
  ctx.font = `bold ${Math.max(9, Math.min(13, w / room.name.length * 1.1))}px "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const labelY = y + h / 2 - 8
  ctx.fillText(room.name.toUpperCase(), x + w / 2, labelY)

  // Score badge
  ctx.fillStyle = borderColor
  ctx.font = '900 9px "Inter", sans-serif'
  ctx.fillText(`VAS: ${room.vastuScore}%`, x + w / 2, labelY + 16)

  // Dimension label
  ctx.fillStyle = '#64748b'
  ctx.font = 'bold 8px monospace'
  ctx.fillText(`${room.width}' × ${room.height}'`, x + w / 2, y + h - 10)

  // Modern corner handles if selected
  if (isSelected) {
    const corners = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    ctx.fillStyle = '#0ea5e9'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    for (const [hx, hy] of corners) {
      ctx.beginPath()
      ctx.arc(hx, hy, HANDLE_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }
}

function drawPlumbing(ctx: CanvasRenderingContext2D, items: PlumbingItem[]) {
  const ICONS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void> = {
    pipe: (c, x, y) => { c.setLineDash([4, 2]); c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x + 10, y); c.stroke(); c.setLineDash([]) },
    tank: (c, x, y) => { c.strokeRect(x - 10, y - 8, 20, 16); c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.stroke() },
    tap: (c, x, y) => { c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8, y + 4); c.stroke() },
    drain: (c, x, y) => { c.strokeRect(x - 6, y - 6, 12, 12); c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x+4, y+4); c.moveTo(x+4, y-4); c.lineTo(x-4, y+4); c.stroke() },
    shower: (c, x, y) => { c.beginPath(); c.arc(x, y, 8, Math.PI, 0); c.stroke(); for(let i=-6;i<=6;i+=3){ c.beginPath(); c.moveTo(x+i, y); c.lineTo(x+i, y+6); c.stroke() } },
  }

  ctx.strokeStyle = '#0ea5e9'
  ctx.lineWidth = 1.5
  ctx.fillStyle = '#0ea5e9'

  for (const item of items) {
    const x = item.x * SCALE
    const y = item.y * SCALE
    const draw = ICONS[item.type]
    if (draw) draw(ctx, x, y)

    // Modern label for mechanical parts
    ctx.font = 'bold 8px "Inter", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(item.type.toUpperCase(), x, y + 20)
  }
}

function drawElectrical(ctx: CanvasRenderingContext2D, items: ElectricalItem[]) {
  const ICONS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void> = {
    socket: (c, x, y) => { c.strokeRect(x - 6, y - 6, 12, 12); c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fill() },
    switch: (c, x, y) => { c.strokeRect(x - 8, y - 5, 16, 10); c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x, y + 5); c.stroke() },
    light: (c, x, y) => { c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.stroke(); ctx.beginPath(); ctx.moveTo(x-4,y-4); ctx.lineTo(x+4,y+4); ctx.moveTo(x+4,y-4); ctx.lineTo(x-4,y+4); ctx.stroke(); },
    fan: (c, x, y) => { c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill(); for (let a = 0; a < 3; a++) { c.beginPath(); const rad = (a * 120 * Math.PI) / 180; c.moveTo(x, y); c.lineTo(x + Math.cos(rad) * 10, y + Math.sin(rad) * 10); c.stroke() } },
    ac: (c, x, y) => { c.strokeRect(x - 12, y - 6, 24, 12); c.font='bold 7px sans-serif'; c.fillText('AC', x, y+3); },
  }

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 1.5
  ctx.fillStyle = '#f59e0b'

  for (const item of items) {
    const x = item.x * SCALE
    const y = item.y * SCALE
    const draw = ICONS[item.type]
    if (draw) draw(ctx, x, y)

    ctx.font = 'bold 8px "Inter", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(item.type.toUpperCase(), x, y + 20)
  }
}

export function FloorPlanCanvas({
  plotWidth, plotHeight, rooms, plumbing, electrical,
  activeLayer, currentFloor, onRoomsChange, onUndo
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { localRooms, syncRooms, selectedRoomId, onMouseDown, onMouseMove, onMouseUp } = useCanvas(rooms, onRoomsChange, onUndo, plotWidth, plotHeight)

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
