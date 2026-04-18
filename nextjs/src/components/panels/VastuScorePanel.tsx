'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Warning, CheckCircle, XCircle, CompassRose } from '@phosphor-icons/react'
import type { Room } from '@/types'

interface Props {
  rooms: Room[]
  overallScore: number
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 75) return <Badge className="bg-green-800 text-green-200 font-mono text-xs">{score}</Badge>
  if (score >= 50) return <Badge className="bg-yellow-800 text-yellow-200 font-mono text-xs">{score}</Badge>
  return <Badge className="bg-red-800 text-red-200 font-mono text-xs">{score}</Badge>
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="rotate-[-90deg]">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-white font-mono">{score}</div>
        <div className="text-xs text-slate-400">/ 100</div>
      </div>
    </div>
  )
}

export function VastuScorePanel({ rooms, overallScore }: Props) {
  const score = Math.round(overallScore)
  const label = score >= 75 ? 'EXCELLENT' : score >= 50 ? 'MODERATE' : 'NEEDS WORK'
  const labelColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'

  const allWarnings = rooms.flatMap(r => r.warnings.map(w => ({ room: r.name, warning: w })))

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div>
          <div className={`font-mono font-bold text-sm ${labelColor}`}>{label}</div>
          <div className="text-slate-400 text-xs mt-1">OVERALL VASTU</div>
          <div className="text-slate-400 text-xs">{rooms.length} rooms analyzed</div>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Per-room scores */}
      <div>
        <div className="text-slate-400 text-xs font-mono mb-2 flex items-center gap-1">
          <CompassRose size={12} />
          ROOM ANALYSIS
        </div>
        <div className="space-y-2">
          {rooms.map(room => (
            <div key={room.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {room.vastuScore >= 75
                    ? <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                    : room.vastuScore >= 50
                    ? <Warning size={12} className="text-yellow-400 flex-shrink-0" />
                    : <XCircle size={12} className="text-red-400 flex-shrink-0" />}
                  <span className="text-slate-300 text-xs truncate max-w-[100px]">{room.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-slate-500 text-xs font-mono">{room.direction}</span>
                  <ScoreBadge score={room.vastuScore} />
                </div>
              </div>
              <Progress
                value={room.vastuScore}
                className="h-1 bg-slate-800"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {allWarnings.length > 0 && (
        <>
          <Separator className="bg-slate-700" />
          <div>
            <div className="text-slate-400 text-xs font-mono mb-2 flex items-center gap-1">
              <Warning size={12} className="text-yellow-400" />
              VASTU WARNINGS
            </div>
            <div className="space-y-2">
              {allWarnings.map((w, i) => (
                <div key={i} className="bg-yellow-950/50 border border-yellow-800/50 rounded p-2">
                  <div className="text-yellow-300 text-xs font-mono">{w.room}</div>
                  <div className="text-yellow-400/80 text-xs mt-0.5">{w.warning}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {rooms.length === 0 && (
        <div className="text-slate-500 text-xs text-center py-8">No rooms to analyze</div>
      )}
    </div>
  )
}
