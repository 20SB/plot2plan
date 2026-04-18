'use client'

import { useRef, useEffect } from 'react'
import type { GeneratedRoom } from '@/lib/claude'

const ROOM_COLORS: Record<string, string> = {
  living_room:    '#0ea5e9',
  master_bedroom: '#8b5cf6',
  bedroom:        '#7c3aed',
  kitchen:        '#f97316',
  bathroom:       '#38bdf8',
  toilet:         '#60a5fa',
  study:          '#10b981',
  pooja_room:     '#f43f5e',
  guest_room:     '#a78bfa',
  store:          '#64748b',
  garage:         '#475569',
  staircase:      '#d97706',
  dining_room:    '#fb923c',
  courtyard:      '#14b8a6',
  utility:        '#6366f1',
  foyer:          '#84cc16',
  default:        '#94a3b8',
}

interface Props {
  rooms: GeneratedRoom[]
  plotWidth: number
  plotHeight: number
  /** Container width in px — canvas scales to fit */
  maxWidth?: number
  className?: string
}

export default function MiniFloorPlanCanvas({
  rooms, plotWidth, plotHeight, maxWidth = 320, className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = maxWidth / plotWidth
    const W = Math.round(plotWidth * scale)
    const H = Math.round(plotHeight * scale)
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    // Grid lines (every 10 plot units)
    ctx.strokeStyle = 'rgba(203,213,225,0.5)'
    ctx.lineWidth = 0.5
    const step = 10 * scale
    for (let x = 0; x <= W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y <= H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // Plot border
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, W - 2, H - 2)

    // Rooms
    const floor0Rooms = rooms.filter(r => (r.floor ?? 0) === 0 || r.floor === 1)
    for (const room of floor0Rooms) {
      const rx = room.x * scale
      const ry = room.y * scale
      const rw = room.width * scale
      const rh = room.height * scale

      const color = ROOM_COLORS[room.type] ?? ROOM_COLORS.default
      ctx.fillStyle = color + '22'
      ctx.fillRect(rx, ry, rw, rh)

      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.strokeRect(rx, ry, rw, rh)

      // Label — only if room is large enough
      if (rw > 30 && rh > 18) {
        const shortName = room.name.replace(/\s+Room$/i, '').replace(/Master\s/i, 'M.')
        const fontSize = Math.max(7, Math.min(11, rw / shortName.length * 1.4))
        ctx.font = `600 ${fontSize}px "Inter",system-ui,sans-serif`
        ctx.fillStyle = '#1e293b'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(shortName.toUpperCase(), rx + rw / 2, ry + rh / 2)
      }
    }

    // Compass N marker
    ctx.fillStyle = '#0ea5e9'
    ctx.font = 'bold 10px "Inter",sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('N↑', W - 14, 4)
  }, [rooms, plotWidth, plotHeight, maxWidth])

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-lg border border-white/10 ${className}`}
      style={{ width: maxWidth, height: 'auto', display: 'block' }}
    />
  )
}
