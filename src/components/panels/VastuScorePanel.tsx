'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Warning, 
  CheckCircle, 
  XCircle, 
  Info, 
  FirstAidKit, 
  Atom, 
  Compass, 
  ChartPolar, 
  ShieldCheck,
  TrendUp
} from '@phosphor-icons/react'
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
  CRITICAL: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(251,113,133,0.15)]', icon: <XCircle size={12} weight="bold" />, label: 'CRITICAL' },
  SEVERE: { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: <Warning size={12} weight="bold" />, label: 'SEVERE' },
  MODERATE: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Warning size={12} weight="bold" />, label: 'MODERATE' },
  MILD: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Info size={12} weight="bold" />, label: 'MILD' },
  NONE: { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle size={12} weight="bold" />, label: 'OPTIMAL' },
}

const ELEMENT_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  FIRE: { emoji: '🔥', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  WATER: { emoji: '💧', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  EARTH: { emoji: '🌍', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  AIR: { emoji: '💨', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  SPACE: { emoji: '✨', color: 'text-accent', bg: 'bg-accent/10' },
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#fb7185'
  const glow = score >= 75 ? 'rgba(74, 222, 128, 0.3)' : score >= 50 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 113, 133, 0.3)'
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  
  return (
    <div className="relative flex items-center justify-center size-28 flex-shrink-0 group">
      <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
      <svg width="112" height="112" className="rotate-[-90deg] drop-shadow-[0_0_8px_var(--glow)]" style={{ '--glow': glow } as any}>
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
        <circle 
          cx="56" cy="56" r={r} fill="none" 
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} 
          strokeLinecap="round" 
          className="transition-all duration-1000 ease-in-out" 
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-white tracking-tighter drop-shadow-sm">{score}</div>
        <div className="text-[11px] text-foreground-subtle font-mono font-bold uppercase tracking-widest mt-0.5">Energy</div>
      </div>
    </div>
  )
}

function DoshaBadge({ severity }: { severity: VastuDosha['severity'] }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NONE
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md transition-all ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function VastuScorePanel({ rooms, overallScore }: Props) {
  const score = Math.round(overallScore)
  const label = score >= 75 ? 'EXCELLENT' : score >= 50 ? 'MODERATE' : 'CRITICAL'
  const labelColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  const brahmasthanaViolators = rooms.filter(r => r.isInBrahmasthana)
  const allDoshas = rooms.flatMap(r => (r.doshas || []).map(d => ({ ...d, roomName: r.name })))
  const criticalDoshas = allDoshas.filter(d => d.severity === 'CRITICAL' || d.severity === 'SEVERE')

  return (
    <div className="flex flex-col bg-transparent">
      <div className="p-4 space-y-4">
        {/* Brahmasthana Alert */}
        {brahmasthanaViolators.length > 0 && (
          <div className="glass-surface p-4 border-rose-500/20 bg-rose-500/[0.02] rounded-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <Atom className="w-4 h-4 text-rose-400 animate-spin-slow" />
              <span className="text-rose-400 font-bold text-[11px] uppercase tracking-widest leading-none">Disharmony</span>
            </div>
            <p className="text-foreground text-[13px] font-medium tracking-tight leading-relaxed">
              <span className="text-rose-400 font-bold uppercase text-[11px]">Brahmasthana</span> is compromised by {brahmasthanaViolators.map(r => r.name).join(', ')}.
            </p>
          </div>
        )}

        {/* Energy Map Visual */}
        <div className="glass-surface p-4 rounded-[1.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <ChartPolar size={60} weight="thin" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-foreground-subtle uppercase tracking-[0.2em] font-mono">Dynamic Analysis</h3>
            <div className="flex items-center gap-1.5">
               <div className="size-1 rounded-full bg-accent animate-pulse shadow-accent-glow" />
            </div>
          </div>
          
          <div className="flex items-center justify-center py-2">
             <div className="relative size-32 flex items-center justify-center">
                {/* HUD Elements */}
                <div className="absolute inset-0 border border-white/[0.04] rounded-full animate-spin-slow duration-[30s]" />
                <div className="absolute inset-3 border border-white/[0.06] rounded-full" />
                
                {/* Radar Line */}
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(94,106,210,0.1)_100%)] animate-[spin_4s_linear_infinite]" />
                
                <Compass size={32} weight="thin" className="text-white opacity-20 group-hover:opacity-40 transition-opacity" />
                <span className="absolute top-0 text-[11px] font-mono font-bold text-white/30">N</span>
                <span className="absolute right-0 text-[11px] font-mono font-bold text-white/30">E</span>
                <span className="absolute bottom-0 text-[11px] font-mono font-bold text-white/30">S</span>
                <span className="absolute left-0 text-[11px] font-mono font-bold text-white/30">W</span>

                {/* Data Points */}
                {rooms.slice(0, 6).map((r, i) => (
                   <div key={r.id} 
                    className={`absolute size-1.5 rounded-full border border-white/20 shadow-lg transition-all duration-1000 ${r.vastuScore >= 70 ? 'bg-green-400' : 'bg-rose-400'}`}
                    style={{ 
                      top: `${35 + Math.sin(i * 1.5) * 20}%`, 
                      left: `${45 + Math.cos(i * 1.5) * 25}%` 
                    }} 
                   />
                ))}
             </div>
          </div>
        </div>

        {/* Overall score */}
        <div className="glass-surface p-5 rounded-[1.5rem] flex items-center gap-4 relative">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0 space-y-1 relative z-10">
            <div className={`font-bold text-xl tracking-tight leading-none truncate ${labelColor}`}>{label}</div>
            <p className="text-foreground-muted text-[11px] font-medium leading-tight tracking-tight">
              Aligns with {score}% archetypes.
            </p>
            <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold bg-white/[0.03] text-foreground-subtle border border-white/5 uppercase tracking-widest">
                  <TrendUp size={12} className={score >= 50 ? 'text-green-400' : 'text-rose-400'} />
                  {criticalDoshas.length} Critical
              </span>
            </div>
          </div>
        </div>

        {/* Per-room analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold text-foreground-subtle uppercase tracking-[0.2em] font-mono">Inventory</h3>
            <span className="text-[11px] font-bold text-accent font-mono tracking-widest">{rooms.length} ZONES</span>
          </div>
          
          <div className="space-y-2">
            {rooms.map((room) => {
              const roomDoshas = room.doshas || []
              const maxSeverity = roomDoshas.length > 0 
                ? roomDoshas.reduce((max, d) => {
                    const order = ['NONE', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL']
                    return order.indexOf(d.severity) > order.indexOf(max) ? d.severity : max
                  }, 'NONE' as VastuDosha['severity'])
                : 'NONE'
              const element = room.element ? ELEMENT_CONFIG[room.element] : null
              const isExpanded = expandedRoom === room.id

              return (
                <div key={room.id} className={`glass-surface transition-all duration-500 overflow-hidden ${isExpanded ? 'ring-1 ring-accent/30 ' : 'hover:border-white/10 group'}`}>
                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-9 rounded-xl ${element?.bg || 'bg-white/[0.03]'} border border-white/[0.08] flex items-center justify-center text-xl`}>
                          {element?.emoji || '🏠'}
                        </div>
                        <div className="truncate">
                          <span className="text-[14px] font-bold text-white block leading-none tracking-tight">{room.name}</span>
                          <span className="text-[11px] text-foreground-subtle font-mono font-bold uppercase tracking-widest mt-1 block opacity-70">
                            {room.direction} · {room.element || 'Neutral'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                         <span className={`text-base font-bold tracking-tighter ${room.vastuScore >= 75 ? 'text-green-400' : room.vastuScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {room.vastuScore}%
                        </span>
                        <DoshaBadge severity={maxSeverity as VastuDosha['severity']} />
                      </div>
                    </div>
                    <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${room.vastuScore >= 75 ? 'bg-green-400' : room.vastuScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${room.vastuScore}%` }} />
                    </div>
                  </button>

                  {isExpanded && roomDoshas.length > 0 && (
                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1">
                       <Separator className="bg-white/[0.06]" />
                      {roomDoshas.map((dosha, i) => (
                        <div key={i} className={`rounded-xl p-3 border transition-all ${
                          dosha.severity === 'CRITICAL' ? 'bg-rose-500/[0.02] border-rose-500/10' :
                          'bg-white/[0.01] border-white/[0.06]'
                        }`}>
                          <div className="text-foreground text-[12px] font-semibold leading-relaxed mb-3 tracking-tight">{dosha.description}</div>
                          <div className="bg-white/[0.03] rounded-lg p-3 flex items-start gap-3 border border-white/[0.06]">
                            <FirstAidKit size={16} weight="bold" className="text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-green-400 uppercase text-[11px] font-mono font-bold tracking-[0.2em] block">Remedy</span>
                              <p className="text-foreground-muted text-[11px] leading-snug font-medium tracking-tight">{dosha.remedy}</p>
                            </div>
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] flex items-center justify-center mb-6">
               <Compass size={40} weight="thin" className="text-foreground-subtle opacity-30" />
            </div>
            <p className="text-[11px] font-mono font-bold text-foreground-subtle uppercase tracking-[0.2em]">Blueprint Pending Analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
