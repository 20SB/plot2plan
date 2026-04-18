'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Warning, CheckCircle, XCircle, Info, FirstAidKit, Atom } from '@phosphor-icons/react'
import type { Room } from '@/types'

interface VastuDosha {
  type: string
  severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  description: string
  remedy: string
}

interface RichRoom extends Room {
  zone16?: string
  element?: string
  doshas?: VastuDosha[]
  isInBrahmasthana?: boolean
}

interface Props {
  rooms: RichRoom[]
  overallScore: number
}

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'bg-red-900 text-red-200 border-red-700', icon: <XCircle size={10} />, label: 'CRITICAL' },
  SEVERE: { color: 'bg-orange-900 text-orange-200 border-orange-700', icon: <Warning size={10} />, label: 'SEVERE' },
  MODERATE: { color: 'bg-yellow-900 text-yellow-200 border-yellow-700', icon: <Warning size={10} />, label: 'MODERATE' },
  MILD: { color: 'bg-blue-900 text-blue-200 border-blue-700', icon: <Info size={10} />, label: 'MILD' },
  NONE: { color: 'bg-green-900 text-green-200 border-green-700', icon: <CheckCircle size={10} />, label: 'CLEAR' },
}

const ELEMENT_CONFIG: Record<string, { emoji: string; color: string }> = {
  FIRE: { emoji: '🔥', color: 'text-orange-400' },
  WATER: { emoji: '💧', color: 'text-blue-400' },
  EARTH: { emoji: '🌍', color: 'text-yellow-600' },
  AIR: { emoji: '💨', color: 'text-slate-300' },
  SPACE: { emoji: '✨', color: 'text-purple-400' },
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" className="rotate-[-90deg]">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-white font-mono">{score}</div>
        <div className="text-[10px] text-slate-400">/ 100</div>
      </div>
    </div>
  )
}

function DoshaBadge({ severity }: { severity: VastuDosha['severity'] }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NONE
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function VastuScorePanel({ rooms, overallScore }: Props) {
  const score = Math.round(overallScore)
  const label = score >= 75 ? 'EXCELLENT' : score >= 50 ? 'MODERATE' : 'NEEDS WORK'
  const labelColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  const brahmasthanaViolators = rooms.filter(r => r.isInBrahmasthana)
  const allDoshas = rooms.flatMap(r => (r.doshas || []).map(d => ({ ...d, roomName: r.name })))
  const criticalDoshas = allDoshas.filter(d => d.severity === 'CRITICAL' || d.severity === 'SEVERE')

  return (
    <div className="space-y-4">
      {/* Brahmasthana Alert */}
      {brahmasthanaViolators.length > 0 && (
        <div className="bg-red-950 border border-red-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Atom size={14} className="text-red-400" />
            <span className="text-red-300 text-xs font-mono font-bold">BRAHMASTHANA VIOLATION</span>
          </div>
          <p className="text-red-400 text-[11px] leading-relaxed">
            {brahmasthanaViolators.map(r => r.name).join(', ')} occupy the sacred center (Brahmasthana) of the plot. This is the most critical Vastu dosha — blocks cosmic energy flow.
          </p>
          <p className="text-red-500 text-[10px] mt-1 font-mono">Remedy: Clear the central 1/9th of the plot completely</p>
        </div>
      )}

      {/* Overall score */}
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div>
          <div className={`font-mono font-bold text-sm ${labelColor}`}>{label}</div>
          <div className="text-slate-400 text-xs mt-1 font-mono">OVERALL VASTU</div>
          <div className="text-slate-400 text-xs">{rooms.length} rooms · {criticalDoshas.length} critical doshas</div>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Per-room analysis */}
      <div>
        <div className="text-slate-400 text-xs font-mono mb-2">ROOM ANALYSIS</div>
        <div className="space-y-2">
          {rooms.map(room => {
            const roomDoshas = room.doshas || []
            const maxSeverity = roomDoshas.reduce((max, d) => {
              const order = ['NONE', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL']
              return order.indexOf(d.severity) > order.indexOf(max) ? d.severity : max
            }, 'NONE' as VastuDosha['severity'])
            const element = room.element ? ELEMENT_CONFIG[room.element] : null
            const isExpanded = expandedRoom === room.id

            return (
              <div key={room.id} className="border border-slate-800 rounded">
                <button
                  onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                  className="w-full text-left p-2 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {element && <span className="text-sm flex-shrink-0">{element.emoji}</span>}
                      <span className="text-slate-300 text-xs truncate">{room.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-slate-500 text-[10px] font-mono">{room.direction}</span>
                      <DoshaBadge severity={maxSeverity as VastuDosha['severity']} />
                      <span className={`text-xs font-mono font-bold ${room.vastuScore >= 75 ? 'text-green-400' : room.vastuScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {room.vastuScore}
                      </span>
                    </div>
                  </div>
                  <Progress value={room.vastuScore} className="h-1 bg-slate-800 mt-1.5" />
                  {room.element && (
                    <div className={`text-[10px] font-mono mt-1 ${element?.color}`}>
                      {room.element} zone · {room.zone16}
                    </div>
                  )}
                </button>

                {isExpanded && roomDoshas.length > 0 && (
                  <div className="border-t border-slate-800 p-2 space-y-2">
                    {roomDoshas.map((dosha, i) => (
                      <div key={i} className={`rounded p-2 text-[11px] ${
                        dosha.severity === 'CRITICAL' ? 'bg-red-950/60 border border-red-800' :
                        dosha.severity === 'SEVERE' ? 'bg-orange-950/60 border border-orange-800' :
                        dosha.severity === 'MODERATE' ? 'bg-yellow-950/60 border border-yellow-800' :
                        'bg-blue-950/60 border border-blue-800'
                      }`}>
                        <div className="text-slate-200 leading-relaxed">{dosha.description}</div>
                        <div className="flex items-start gap-1 mt-1.5">
                          <FirstAidKit size={10} className="text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="text-green-300 text-[10px] leading-relaxed">{dosha.remedy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Simple warnings for rooms without expanded doshas */}
      {rooms.some(r => (!r.doshas || r.doshas.length === 0) && r.warnings && r.warnings.length > 0) && (
        <>
          <Separator className="bg-slate-700" />
          <div>
            <div className="text-slate-400 text-xs font-mono mb-2 flex items-center gap-1">
              <Warning size={12} className="text-yellow-400" />
              ADDITIONAL WARNINGS
            </div>
            <div className="space-y-1">
              {rooms.flatMap(r =>
                (!r.doshas || r.doshas.length === 0) ? (r.warnings || []).map((w, i) => (
                  <div key={`${r.id}-${i}`} className="text-yellow-400/80 text-[11px] bg-yellow-950/30 rounded px-2 py-1">
                    <span className="text-yellow-300 font-mono">{r.name}: </span>{w}
                  </div>
                )) : []
              )}
            </div>
          </div>
        </>
      )}

      {rooms.length === 0 && (
        <div className="text-slate-500 text-xs text-center py-8">Generate a layout to see Vastu analysis</div>
      )}
    </div>
  )
}
