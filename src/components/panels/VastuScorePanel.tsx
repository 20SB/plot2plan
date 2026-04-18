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
  CRITICAL: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle size={14} weight="bold" />, label: 'CRITICAL' },
  SEVERE: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: <Warning size={14} weight="bold" />, label: 'SEVERE' },
  MODERATE: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Warning size={14} weight="bold" />, label: 'MODERATE' },
  MILD: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Info size={14} weight="bold" />, label: 'MILD' },
  NONE: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle size={14} weight="bold" />, label: 'CLEAR' },
}

const ELEMENT_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  FIRE: { emoji: '🔥', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  WATER: { emoji: '💧', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  EARTH: { emoji: '🌍', color: 'text-emerald-700', bg: 'bg-emerald-500/10' },
  AIR: { emoji: '💨', color: 'text-slate-500', bg: 'bg-slate-500/10' },
  SPACE: { emoji: '✨', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? 'hsl(142, 71%, 45%)' : score >= 50 ? 'hsl(48, 96%, 48%)' : 'hsl(0, 84%, 60%)'
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-28 h-28 flex-shrink-0 animate-in zoom-in-95 duration-500">
      <svg width="112" height="112" className="rotate-[-90deg]">
        <circle cx="56" cy="56" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-black text-foreground tracking-tighter">{score}</div>
        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Score</div>
      </div>
    </div>
  )
}

function DoshaBadge({ severity }: { severity: VastuDosha['severity'] }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NONE
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function VastuScorePanel({ rooms, overallScore }: Props) {
  const score = Math.round(overallScore)
  const label = score >= 75 ? 'EXCELLENT' : score >= 50 ? 'MODERATE' : 'CRITICAL'
  const labelColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  const brahmasthanaViolators = rooms.filter(r => r.isInBrahmasthana)
  const allDoshas = rooms.flatMap(r => (r.doshas || []).map(d => ({ ...d, roomName: r.name })))
  const criticalDoshas = allDoshas.filter(d => d.severity === 'CRITICAL' || d.severity === 'SEVERE')

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 space-y-8">
        {/* Brahmasthana Alert */}
        {brahmasthanaViolators.length > 0 && (
          <div className="p-4 bg-destructive/5 border-2 border-destructive/20 rounded-2xl animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-2">
              <Atom className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-bold text-sm tracking-tight uppercase">Critical Violation</span>
            </div>
            <p className="text-foreground/80 text-xs leading-relaxed">
              <strong>Brahmasthana:</strong> {brahmasthanaViolators.map(r => r.name).join(', ')} occupy the sacred center. This blocks cosmic energy flow.
            </p>
            <div className="mt-3 bg-destructive/10 p-2 rounded-xl flex items-start gap-2">
              <FirstAidKit size={14} className="text-destructive mt-0.5" />
              <p className="text-destructive font-bold text-[10px] uppercase leading-tight">Remedy: Clear the central 1/9th of the plot completely</p>
            </div>
          </div>
        )}

        {/* Overall score */}
        <div className="bg-muted/30 rounded-3xl p-6 border shadow-sm flex items-center gap-6">
          <ScoreRing score={score} />
          <div className="space-y-1">
            <div className={`font-black text-xl tracking-tighter ${labelColor}`}>{label}</div>
            <p className="text-muted-foreground text-xs font-semibold leading-tight">
              Analysis of {rooms.length} primary zones and energy patterns.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
               <span className="text-[10px] font-bold bg-background px-2 py-0.5 rounded border text-muted-foreground">
                {criticalDoshas.length} ISSUES
              </span>
            </div>
          </div>
        </div>

        {/* Per-room analysis */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Zone Analysis</h3>
            <span className="text-[10px] font-bold text-primary">{rooms.length} Active</span>
          </div>
          
          <div className="space-y-3">
            {rooms.map((room) => {
              const roomDoshas = room.doshas || []
              const maxSeverity = roomDoshas.reduce((max, d) => {
                const order = ['NONE', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL']
                return order.indexOf(d.severity) > order.indexOf(max) ? d.severity : max
              }, 'NONE' as VastuDosha['severity'])
              const element = room.element ? ELEMENT_CONFIG[room.element] : null
              const isExpanded = expandedRoom === room.id

              return (
                <div key={room.id} className={`group rounded-2xl border transition-all duration-300 ${isExpanded ? 'bg-muted/30 border-primary/20 shadow-sm' : 'hover:border-primary/20 hover:bg-muted/20'}`}>
                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-10 rounded-xl ${element?.bg || 'bg-muted'} flex items-center justify-center text-xl shadow-sm border`}>
                          {element?.emoji || '🏠'}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-foreground block leading-none">{room.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase font-bold mt-1 block">
                            {room.direction} · {room.element || 'Neutral'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className={`text-sm font-black italic tracking-tighter ${room.vastuScore >= 75 ? 'text-green-600' : room.vastuScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {room.vastuScore}%
                        </span>
                        <DoshaBadge severity={maxSeverity as VastuDosha['severity']} />
                      </div>
                    </div>
                    <Progress value={room.vastuScore} className="h-2 rounded-full" />
                  </button>

                  {isExpanded && roomDoshas.length > 0 && (
                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                       <Separator className="mb-3" />
                      {roomDoshas.map((dosha, i) => (
                        <div key={i} className={`rounded-xl p-3 border shadow-sm ${
                          dosha.severity === 'CRITICAL' ? 'bg-destructive/5 border-destructive/20' :
                          dosha.severity === 'SEVERE' ? 'bg-orange-500/5 border-orange-500/20' :
                          dosha.severity === 'MODERATE' ? 'bg-amber-500/5 border-amber-500/20' :
                          'bg-blue-500/5 border-blue-500/20'
                        }`}>
                          <div className="text-foreground text-xs font-semibold leading-relaxed mb-2">{dosha.description}</div>
                          <div className="bg-background/80 rounded-lg p-2.5 flex items-start gap-2 border shadow-sm">
                            <FirstAidKit size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-foreground/80 text-[10px] leading-relaxed italic font-medium"><strong>Remedy:</strong> {dosha.remedy}</div>
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

        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Compass size={48} weight="thin" className="mb-4 text-muted-foreground" />
            <p className="text-sm font-medium">Generate a layout to start<br/>Vastu analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
