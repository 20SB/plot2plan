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
  const labelColor = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  const brahmasthanaViolators = rooms.filter(r => r.isInBrahmasthana)
  const allDoshas = rooms.flatMap(r => (r.doshas || []).map(d => ({ ...d, roomName: r.name })))
  const criticalDoshas = allDoshas.filter(d => d.severity === 'CRITICAL' || d.severity === 'SEVERE')

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 space-y-8 scroll-smooth overflow-y-auto">
        {/* Brahmasthana Alert */}
        {brahmasthanaViolators.length > 0 ? (
          <div className="p-5 bg-destructive/5 border-2 border-destructive/20 rounded-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <Atom className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-black text-xs uppercase tracking-widest">Architectural Void</span>
            </div>
            <p className="text-foreground text-xs leading-relaxed font-semibold">
              The sacred center (Brahmasthana) is blocked by {brahmasthanaViolators.map(r => r.name).join(', ')}.
            </p>
            <div className="mt-4 bg-destructive text-white p-3 rounded-xl flex items-start gap-3 shadow-lg">
              <FirstAidKit size={16} weight="bold" className="flex-shrink-0" />
              <p className="font-bold text-[10px] uppercase leading-tight">MANDATORY REMEDY: Restore the central 1/9th zone to open space immediately.</p>
            </div>
          </div>
        ) : null}

        {/* Energy Map Visual */}
        <div className="bg-white rounded-[2rem] p-6 border shadow-premium overflow-hidden relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Vastu Energy Map</h3>
            <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          </div>
          <div className="flex items-center justify-center py-4">
             <div className="relative size-48 flex items-center justify-center">
                {/* Simulated Energy Grid */}
                <div className="absolute inset-0 border border-slate-100 rounded-full" />
                <div className="absolute inset-4 border border-slate-100 rounded-full" />
                <div className="absolute inset-8 border border-slate-50 rounded-full" />
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-20">
                  <div className="border-r border-b border-indigo-200" />
                  <div className="border-b border-indigo-200" />
                  <div className="border-r border-indigo-200" />
                  <div />
                </div>
                {/* The Radar Pulse */}
                <div className="absolute size-32 bg-primary/5 rounded-full animate-ping duration-[3s]" />
                <div className="absolute size-40 bg-indigo-500/5 rounded-full" />
                
                {/* Direction Labels */}
                <span className="absolute top-0 text-[8px] font-black text-slate-400">N</span>
                <span className="absolute right-0 text-[8px] font-black text-slate-400">E</span>
                <span className="absolute bottom-0 text-[8px] font-black text-slate-400">S</span>
                <span className="absolute left-0 text-[8px] font-black text-slate-400">W</span>

                <Compass size={48} weight="thin" className="text-primary/20 group-hover:text-primary/40 transition-colors" />
                
                {/* Active Points (Room hotspots) */}
                {rooms.slice(0, 4).map((r, i) => (
                   <div key={r.id} 
                    className={`absolute size-1.5 rounded-full shadow-sm transition-all duration-700 ${r.vastuScore >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ 
                      top: `${30 + Math.sin(i * 1.5) * 20}%`, 
                      left: `${40 + Math.cos(i * 1.5) * 25}%` 
                    }} 
                   />
                ))}
             </div>
          </div>
          <p className="text-center text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-tighter opacity-60">
            Quantum energy analysis of {rooms.length} zones
          </p>
        </div>

        {/* Overall score */}
        <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-indigo-100/50 flex items-center gap-8 animate-in fade-in duration-700">
          <ScoreRing score={score} />
          <div className="flex-1 space-y-2">
            <div className={`font-black text-3xl tracking-tighter ${labelColor}`}>{label}</div>
            <p className="text-slate-600 text-xs font-bold leading-snug">
              Architecture aligns with {score}% of celestial archetypes.
            </p>
            <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-white shadow-sm text-muted-foreground border border-slate-100 uppercase tracking-widest">
                {criticalDoshas.length} Critical Issues
              </span>
            </div>
          </div>
        </div>

        {/* Per-room analysis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Detailed Zone Audit</h3>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{rooms.length} ZONES</span>
          </div>
          
          <div className="space-y-3">
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
                <div key={room.id} className={`rounded-2xl border bg-white transition-all duration-300 ${isExpanded ? 'border-primary shadow-premium ring-1 ring-primary/10' : 'hover:border-primary/30 shadow-sm'}`}>
                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`size-12 rounded-2xl ${element?.bg || 'bg-slate-100'} flex items-center justify-center text-2xl shadow-sm border border-black/5`}>
                          {element?.emoji || '🏠'}
                        </div>
                        <div className="truncate">
                          <span className="text-base font-black text-foreground block leading-none tracking-tight">{room.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5 block">
                            {room.direction} · {room.element || 'Neutral'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                         <span className={`text-lg font-black italic tracking-tighter ${room.vastuScore >= 75 ? 'text-emerald-600' : room.vastuScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {room.vastuScore}%
                        </span>
                        <DoshaBadge severity={maxSeverity as VastuDosha['severity']} />
                      </div>
                    </div>
                    <Progress value={room.vastuScore} className="h-2 rounded-full bg-slate-100" />
                  </button>

                  {isExpanded && roomDoshas.length > 0 && (
                    <div className="px-5 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                       <div className="h-px bg-slate-100 mb-4" />
                      {roomDoshas.map((dosha, i) => (
                        <div key={i} className={`rounded-xl p-4 border shadow-sm ${
                          dosha.severity === 'CRITICAL' ? 'bg-destructive/5 border-destructive/20' :
                          dosha.severity === 'SEVERE' ? 'bg-orange-500/5 border-orange-500/20' :
                          dosha.severity === 'MODERATE' ? 'bg-amber-500/5 border-amber-500/20' :
                          'bg-blue-500/5 border-blue-500/20'
                        }`}>
                          <div className="text-foreground text-[13px] font-bold leading-snug mb-3 tracking-tight">{dosha.description}</div>
                          <div className="bg-white rounded-lg p-3 flex items-start gap-3 border shadow-sm">
                            <FirstAidKit size={16} weight="bold" className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="text-slate-600 text-xs leading-relaxed font-medium">
                              <strong className="text-emerald-700 uppercase text-[10px] tracking-widest block mb-1">AI Recommendation</strong> 
                              {dosha.remedy}
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
            <div className="size-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
               <Compass size={40} weight="thin" className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Blueprint Pending Analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
