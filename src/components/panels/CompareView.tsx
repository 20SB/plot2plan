'use client'

import { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { TrendUpIcon as TrendUp, TrendDownIcon as TrendDown, MinusIcon as Minus } from '@phosphor-icons/react'

interface RoomSnapshot {
  id: string
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  vastuScore: number
}

interface CompareData {
  revisionA: { id: string; version: number; label?: string; rooms: RoomSnapshot[]; vastuScore: number }
  revisionB: { id: string; version: number; label?: string; rooms: RoomSnapshot[]; vastuScore: number }
  scoreDelta: number
}

interface Props {
  projectId: string
  revIdA: string
  revIdB: string
}

export function CompareView({ projectId, revIdA, revIdB }: Props) {
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/revisions/compare/${revIdA}/${revIdB}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [projectId, revIdA, revIdB])

  if (loading) return <div className="text-app-faint text-xs animate-pulse font-mono">COMPARING...</div>
  if (!data) return <div className="text-app-danger text-xs">Failed to load comparison</div>

  const { revisionA: revA, revisionB: revB, scoreDelta } = data

  const roomNamesA = new Set(revA.rooms.map(r => r.name))
  const roomNamesB = new Set(revB.rooms.map(r => r.name))

  const added = revB.rooms.filter(r => !roomNamesA.has(r.name))
  const removed = revA.rooms.filter(r => !roomNamesB.has(r.name))
  const common = revB.rooms.filter(r => roomNamesA.has(r.name))

  return (
    <div className="space-y-6 relative z-10">
      {/* Score comparison boxes */}
      <div className="grid grid-cols-2 gap-4">
        {[revA, revB].map((rev, i) => (
          <div key={i} className="glass-surface p-4 border-white/[0.08] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform">
               <span className="text-4xl font-mono font-bold">{i === 0 ? 'B' : 'A'}</span>
            </div>
            <p className="text-foreground-subtle text-[11px] font-mono uppercase tracking-[0.2em] mb-2">
              {i === 0 ? 'Before' : 'After'} · v{rev.version}
            </p>
            <p className="text-foreground font-semibold text-3xl tracking-tighter">{rev.vastuScore}%</p>
            <div className="text-foreground-muted text-[11px] font-medium mt-1 uppercase tracking-wider">{rev.label || 'Auto-save'}</div>
          </div>
        ))}
      </div>

      {/* Delta indicator */}
      <div className="flex items-center justify-center p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-md">
        {scoreDelta > 0
          ? <div className="flex items-center gap-2 text-green-400 animate-in zoom-in-95"><TrendUp size={20} weight="bold" /><span className="font-semibold tracking-tight text-base">+{scoreDelta} energy improvement</span></div>
          : scoreDelta < 0
          ? <div className="flex items-center gap-2 text-rose-400 animate-in zoom-in-95"><TrendDown size={20} weight="bold" /><span className="font-semibold tracking-tight text-base">{scoreDelta} energy regression</span></div>
          : <div className="flex items-center gap-2 text-foreground-muted underline decoration-white/10 decoration-wavy"><Minus size={18} weight="bold" /><span className="font-medium tracking-tight">Kinetic equilibrium (no change)</span></div>}
      </div>

      <div className="space-y-6 pt-2">
        {/* Added rooms */}
        {added.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400 text-[11px] font-mono font-bold tracking-[0.2em] px-1 uppercase">
              <span className="size-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              Manifested ({added.length})
            </div>
            <div className="space-y-1.5">
              {added.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl group hover:border-green-400/20 transition-colors">
                  <span className="text-foreground text-sm font-medium tracking-tight group-hover:text-green-400 transition-colors">{r.name}</span>
                  <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-mono font-bold rounded-lg px-2 py-0.5 shadow-linear">{r.vastuScore}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed rooms */}
        {removed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-[11px] font-mono font-bold tracking-[0.2em] px-1 uppercase">
              <span className="size-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
              Dissipated ({removed.length})
            </div>
            <div className="space-y-1.5">
              {removed.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl group hover:border-rose-400/20 transition-colors">
                  <span className="text-foreground text-sm font-medium tracking-tight group-hover:text-rose-400 transition-colors line-through opacity-50">{r.name}</span>
                  <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono font-bold rounded-lg px-2 py-0.5 opacity-50">{r.vastuScore}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common rooms with score diff */}
        {common.length > 0 && (
          <div className="space-y-2">
            <div className="text-foreground-subtle text-[11px] font-mono font-bold tracking-[0.2em] px-1 uppercase mb-3">Zone Shifts</div>
            <div className="space-y-2">
              {common.map(rb => {
                const ra = revA.rooms.find(r => r.name === rb.name)
                const diff = ra ? rb.vastuScore - ra.vastuScore : 0
                return (
                  <div key={rb.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] group">
                    <span className="text-foreground-subtle text-sm font-medium tracking-tight group-hover:text-foreground transition-all">{rb.name}</span>
                    <div className="flex items-center gap-3">
                      {ra && <span className="text-foreground-muted font-mono text-[11px]">{ra.vastuScore}%</span>}
                      <ArrowRightIcon className="text-white/20 size-3" />
                      <span className="text-foreground font-mono font-bold text-xs">{rb.vastuScore}%</span>
                      {diff !== 0 && (
                        <div className={`flex items-center gap-0.5 font-mono text-[11px] px-1.5 py-0.5 rounded border ${
                          diff > 0 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {diff > 0 ? <PlusIcon size={8} weight="bold" /> : <MinusIcon size={8} weight="bold" />}
                          {Math.abs(diff)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ArrowRightIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function PlusIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function MinusIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M5 12h14" />
    </svg>
  )
}
