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
    <div className="space-y-4">
      {/* Score comparison boxes */}
      <div className="grid grid-cols-2 gap-3">
        {[revA, revB].map((rev, i) => (
          <div key={i} className="bg-app-input/60 border border-white/8 rounded-xl p-3">
            <p className="text-app-faint text-[10px] font-mono uppercase tracking-wider mb-1">
              {i === 0 ? 'Before' : 'After'} · v{rev.version}
            </p>
            <p className="text-app-text font-mono font-bold text-2xl">{rev.vastuScore}</p>
            <div className="text-app-faint text-[10px] mt-0.5">{rev.label || 'Auto-save'}</div>
          </div>
        ))}
      </div>

      {/* Delta indicator */}
      <div className="flex items-center justify-center gap-2">
        {scoreDelta > 0
          ? <><TrendUp size={16} className="text-app-ok" /><span className="text-app-ok font-mono text-sm">+{scoreDelta} improvement</span></>
          : scoreDelta < 0
          ? <><TrendDown size={16} className="text-app-danger" /><span className="text-app-danger font-mono text-sm">{scoreDelta} regression</span></>
          : <><Minus size={16} className="text-app-faint" /><span className="text-app-faint font-mono text-sm">No change</span></>}
      </div>

      <Separator className="bg-white/6" />

      {/* Added rooms */}
      {added.length > 0 && (
        <div>
          <div className="text-app-ok text-xs font-medium mb-2">+ Added ({added.length})</div>
          {added.map(r => (
            <div key={r.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-app-ok">{r.name}</span>
              <span className="bg-green-950/60 border border-green-800/40 text-app-ok text-[10px] font-mono rounded-lg px-1.5 py-0.5">{r.vastuScore}</span>
            </div>
          ))}
        </div>
      )}

      {/* Removed rooms */}
      {removed.length > 0 && (
        <div>
          <div className="text-app-danger text-xs font-medium mb-2">- Removed ({removed.length})</div>
          {removed.map(r => (
            <div key={r.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-app-danger">{r.name}</span>
              <span className="bg-red-950/60 border border-red-800/40 text-app-danger text-[10px] font-mono rounded-lg px-1.5 py-0.5">{r.vastuScore}</span>
            </div>
          ))}
        </div>
      )}

      {/* Common rooms with score diff */}
      {common.length > 0 && (
        <div>
          <div className="text-app-faint text-xs font-medium mb-2">Unchanged Rooms</div>
          {common.map(rb => {
            const ra = revA.rooms.find(r => r.name === rb.name)
            const diff = ra ? rb.vastuScore - ra.vastuScore : 0
            return (
              <div key={rb.id} className="flex items-center justify-between py-1 text-xs">
                <span className="text-app-faint">{rb.name}</span>
                <div className="flex items-center gap-2">
                  {ra && <span className="text-app-faint font-mono">{ra.vastuScore}</span>}
                  <span className="text-app-faint">→</span>
                  <span className="text-app-soft font-mono">{rb.vastuScore}</span>
                  {diff !== 0 && (
                    <span className={`font-mono text-[10px] ${diff > 0 ? 'text-app-ok' : 'text-app-danger'}`}>
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
