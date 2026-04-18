'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClockCounterClockwise, ArrowCounterClockwise, GitDiff } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Revision } from '@/types'
import { CompareView } from './CompareView'

interface Props {
  projectId: string
  onRestore?: () => void
}

export function RevisionHistory({ projectId, onRestore }: Props) {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [comparing, setComparing] = useState<[string, string] | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/projects/${projectId}/revisions`)
      .then(r => r.json())
      .then(setRevisions)
      .finally(() => setLoading(false))
  }, [projectId])

  const handleRestore = async (revId: string) => {
    if (!confirm('Restore this revision? Current state will be lost.')) return
    setRestoring(revId)
    try {
      const res = await fetch(`/api/projects/${projectId}/revisions/${revId}/restore`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Layout restored')
      onRestore?.()
    } catch {
      toast.error('Restore failed')
    } finally {
      setRestoring(null)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  if (loading) return (
    <div className="p-4 text-app-faint text-xs font-mono animate-pulse">LOADING HISTORY...</div>
  )

  if (comparing) {
    return (
      <div>
        <div className="p-4 border-b border-white/6">
          <Button size="sm" variant="ghost" onClick={() => setComparing(null)}
            className="text-app-faint hover:text-app-text text-xs gap-1">
            <ArrowCounterClockwise size={12} />Back
          </Button>
        </div>
        <div className="p-4">
          <CompareView projectId={projectId} revIdA={comparing[0]} revIdB={comparing[1]} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Panel header */}
      <div className="flex items-center justify-between p-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-app-accent/15 rounded-lg flex items-center justify-center">
            <ClockCounterClockwise className="w-4 h-4 text-app-accent" />
          </div>
          <span className="text-app-text text-sm font-medium">Revision History</span>
        </div>
        {selected.length === 2 && (
          <Button size="sm" variant="outline"
            onClick={() => setComparing([selected[0], selected[1]])}
            className="border border-white/10 text-app-violet hover:border-app-accent/40 rounded-xl text-xs h-8 gap-1 px-3">
            <GitDiff size={12} />
            Compare
          </Button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {selected.length > 0 && (
          <p className="text-app-faint text-[10px]">Select 2 revisions to compare ({selected.length}/2 selected)</p>
        )}
        <ScrollArea className="h-96">
          <div className="space-y-2 pr-2">
            {revisions.map(rev => (
              <div key={rev.id}
                onClick={() => toggleSelect(rev.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selected.includes(rev.id)
                    ? 'border-app-accent/40 bg-app-accent/8'
                    : 'border-white/8 bg-app-input/40 hover:border-white/14'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-app-card border border-white/10 text-app-faint font-mono text-[10px] rounded-lg px-1.5 py-0.5">
                      v{rev.version}
                    </span>
                    <span className="text-app-text text-xs">{rev.label || 'Auto-save'}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={restoring === rev.id}
                    onClick={(e) => { e.stopPropagation(); handleRestore(rev.id) }}
                    className="h-6 px-2 text-app-faint hover:text-app-violet"
                  >
                    <ArrowCounterClockwise size={12} />
                  </Button>
                </div>
                <div className="text-app-faint text-[10px] font-mono mt-1">
                  {new Date(rev.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {revisions.length === 0 && (
              <div className="text-app-faint text-xs text-center py-8">No revisions yet</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
