'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

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

  if (loading) return <div className="text-slate-500 text-xs animate-pulse font-mono">COMPARING...</div>
  if (!data) return <div className="text-red-400 text-xs">Failed to load comparison</div>

  const { revisionA: revA, revisionB: revB, scoreDelta } = data

  const roomNamesA = new Set(revA.rooms.map(r => r.name))
  const roomNamesB = new Set(revB.rooms.map(r => r.name))

  const added = revB.rooms.filter(r => !roomNamesA.has(r.name))
  const removed = revA.rooms.filter(r => !roomNamesB.has(r.name))
  const common = revB.rooms.filter(r => roomNamesA.has(r.name))

  return (
    <div className="space-y-4">
      {/* Score delta */}
      <div className="grid grid-cols-2 gap-3">
        {[revA, revB].map((rev, i) => (
          <div key={i} className="bg-slate-800 rounded p-2.5 text-center">
            <div className="text-slate-500 text-[10px] font-mono">v{rev.version} · {rev.label || 'Auto-save'}</div>
            <div className="text-white font-mono font-bold text-xl mt-1">{rev.vastuScore}</div>
            <div className="text-slate-500 text-[10px]">VASTU SCORE</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        {scoreDelta > 0
          ? <><TrendUp size={16} className="text-green-400" /><span className="text-green-400 font-mono text-sm">+{scoreDelta} improvement</span></>
          : scoreDelta < 0
          ? <><TrendDown size={16} className="text-red-400" /><span className="text-red-400 font-mono text-sm">{scoreDelta} regression</span></>
          : <><Minus size={16} className="text-slate-400" /><span className="text-slate-400 font-mono text-sm">No change</span></>}
      </div>

      <Separator className="bg-slate-700" />

      {/* Added rooms */}
      {added.length > 0 && (
        <div>
          <div className="text-green-400 text-xs font-mono mb-2">+ ADDED ({added.length})</div>
          {added.map(r => (
            <div key={r.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-green-300">{r.name}</span>
              <Badge className="bg-green-900 text-green-300 font-mono text-[10px]">{r.vastuScore}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Removed rooms */}
      {removed.length > 0 && (
        <div>
          <div className="text-red-400 text-xs font-mono mb-2">− REMOVED ({removed.length})</div>
          {removed.map(r => (
            <div key={r.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-red-300">{r.name}</span>
              <Badge className="bg-red-900 text-red-300 font-mono text-[10px]">{r.vastuScore}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Common rooms with score diff */}
      {common.length > 0 && (
        <div>
          <div className="text-slate-400 text-xs font-mono mb-2">~ UNCHANGED ROOMS</div>
          {common.map(rb => {
            const ra = revA.rooms.find(r => r.name === rb.name)
            const diff = ra ? rb.vastuScore - ra.vastuScore : 0
            return (
              <div key={rb.id} className="flex items-center justify-between py-1 text-xs">
                <span className="text-slate-300">{rb.name}</span>
                <div className="flex items-center gap-2">
                  {ra && <span className="text-slate-600 font-mono">{ra.vastuScore}</span>}
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-300 font-mono">{rb.vastuScore}</span>
                  {diff !== 0 && (
                    <span className={`font-mono text-[10px] ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
