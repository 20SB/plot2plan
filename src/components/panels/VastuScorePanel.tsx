'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Warning, CheckCircle, XCircle, Info, FirstAidKit, Atom, Compass } from '@phosphor-icons/react'
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
  CRITICAL: { color: 'bg-red-950/60 text-app-danger border border-red-800/40', icon: <XCircle size={10} />, label: 'CRITICAL' },
  SEVERE: { color: 'bg-orange-950/60 text-orange-300 border border-orange-800/40', icon: <Warning size={10} />, label: 'SEVERE' },
  MODERATE: { color: 'bg-amber-950/60 text-app-warn border border-amber-800/40', icon: <Warning size={10} />, label: 'MODERATE' },
  MILD: { color: 'bg-blue-950/60 text-blue-300 border border-blue-800/40', icon: <Info size={10} />, label: 'MILD' },
  NONE: { color: 'bg-green-950/60 text-app-ok border border-green-800/40', icon: <CheckCircle size={10} />, label: 'CLEAR' },
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
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1A2036" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-app-text font-mono">{score}</div>
        <div className="text-[10px] text-app-faint font-mono">/ 100</div>
      </div>
    </div>
  )
}

function DoshaBadge({ severity }: { severity: VastuDosha['severity'] }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NONE
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function VastuScorePanel({ rooms, overallScore }: Props) {
  const score = Math.round(overallScore)
  const label = score >= 75 ? 'EXCELLENT' : score >= 50 ? 'MODERATE' : 'NEEDS WORK'
  const labelColor = score >= 75 ? 'text-app-ok' : score >= 50 ? 'text-app-warn' : 'text-app-danger'
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  const brahmasthanaViolators = rooms.filter(r => r.isInBrahmasthana)
  const allDoshas = rooms.flatMap(r => (r.doshas || []).map(d => ({ ...d, roomName: r.name })))
  const criticalDoshas = allDoshas.filter(d => d.severity === 'CRITICAL' || d.severity === 'SEVERE')

  return (
    <div className="space-y-0">
      {/* Panel header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/6">
        <div className="w-7 h-7 bg-app-accent/15 rounded-lg flex items-center justify-center">
          <Compass className="w-4 h-4 text-app-accent" />
        </div>
        <span className="text-app-text text-sm font-medium">Vastu Analysis</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Brahmasthana Alert */}
        {brahmasthanaViolators.length > 0 && (
          <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Atom className="w-3.5 h-3.5 text-app-danger" />
              <span className="text-app-danger text-xs font-medium">Brahmasthana Violation</span>
            </div>
            <p className="text-red-400/80 text-[11px] leading-relaxed">
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
            <div className="text-app-faint text-xs mt-1 font-mono">OVERALL VASTU</div>
            <div className="text-app-faint text-xs">{rooms.length} rooms · {criticalDoshas.length} critical doshas</div>
          </div>
        </div>

        <Separator className="bg-white/6" />

        {/* Per-room analysis */}
        <div>
          <div className="text-app-faint text-xs font-mono mb-2">ROOM ANALYSIS</div>
          <div className="bg-app-input/50 border border-white/6 rounded-xl overflow-hidden">
            {rooms.map((room, idx) => {
              const roomDoshas = room.doshas || []
              const maxSeverity = roomDoshas.reduce((max, d) => {
                const order = ['NONE', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL']
                return order.indexOf(d.severity) > order.indexOf(max) ? d.severity : max
              }, 'NONE' as VastuDosha['severity'])
              const element = room.element ? ELEMENT_CONFIG[room.element] : null
              const isExpanded = expandedRoom === room.id

              return (
                <div key={room.id} className={idx > 0 ? 'border-t border-white/6' : ''}>
                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="w-full text-left p-2 hover:bg-app-hover/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {element && <span className="text-sm flex-shrink-0">{element.emoji}</span>}
                        <span className="text-app-text text-xs truncate">{room.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-app-faint text-[10px] font-mono">{room.direction}</span>
                        <DoshaBadge severity={maxSeverity as VastuDosha['severity']} />
                        <span className={`text-xs font-mono font-bold ${room.vastuScore >= 75 ? 'text-app-ok' : room.vastuScore >= 50 ? 'text-app-warn' : 'text-app-danger'}`}>
                          {room.vastuScore}
                        </span>
                      </div>
                    </div>
                    <Progress value={room.vastuScore} className="h-1 bg-app-input mt-1.5" />
                    {room.element && (
                      <div className={`text-[10px] font-mono mt-1 ${element?.color}`}>
                        {room.element} zone · {room.zone16}
                      </div>
                    )}
                  </button>

                  {isExpanded && roomDoshas.length > 0 && (
                    <div className="border-t border-white/6 p-2 space-y-2">
                      {roomDoshas.map((dosha, i) => (
                        <div key={i} className={`rounded-lg p-2 text-[11px] ${
                          dosha.severity === 'CRITICAL' ? 'bg-red-950/60 border border-red-800/40' :
                          dosha.severity === 'SEVERE' ? 'bg-orange-950/60 border border-orange-800/40' :
                          dosha.severity === 'MODERATE' ? 'bg-amber-950/60 border border-amber-800/40' :
                          'bg-blue-950/60 border border-blue-800/40'
                        }`}>
                          <div className="text-app-text leading-relaxed">{dosha.description}</div>
                          <div className="flex items-start gap-1 mt-1.5">
                            <FirstAidKit size={10} className="text-app-ok flex-shrink-0 mt-0.5" />
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
            <Separator className="bg-white/6" />
            <div>
              <div className="text-app-faint text-xs font-mono mb-2 flex items-center gap-1">
                <Warning size={12} className="text-app-warn" />
                ADDITIONAL WARNINGS
              </div>
              <div className="space-y-1">
                {rooms.flatMap(r =>
                  (!r.doshas || r.doshas.length === 0) ? (r.warnings || []).map((w, i) => (
                    <div key={`${r.id}-${i}`} className="text-app-warn/80 text-[11px] bg-amber-950/30 rounded-lg px-2 py-1">
                      <span className="text-app-warn font-mono">{r.name}: </span>{w}
                    </div>
                  )) : []
                )}
              </div>
            </div>
          </>
        )}

        {rooms.length === 0 && (
          <div className="text-app-faint text-xs text-center py-8">Generate a layout to see Vastu analysis</div>
        )}
      </div>
    </div>
  )
}
