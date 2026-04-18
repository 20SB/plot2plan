'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  if (loading) return <div className="text-slate-500 text-xs font-mono animate-pulse">LOADING HISTORY...</div>

  if (comparing) {
    return (
      <div>
        <Button size="sm" variant="ghost" onClick={() => setComparing(null)}
          className="text-slate-400 hover:text-white text-xs mb-3">← Back</Button>
        <CompareView projectId={projectId} revIdA={comparing[0]} revIdB={comparing[1]} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-xs font-mono flex items-center gap-1">
          <ClockCounterClockwise size={12} />
          REVISION LOG ({revisions.length})
        </div>
        {selected.length === 2 && (
          <Button size="sm" variant="outline"
            onClick={() => setComparing([selected[0], selected[1]])}
            className="h-6 text-xs border-slate-600 text-cyan-400 gap-1">
            <GitDiff size={10} />
            COMPARE
          </Button>
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-slate-500 text-[10px]">Select 2 revisions to compare ({selected.length}/2 selected)</p>
      )}
      <ScrollArea className="h-96">
        <div className="space-y-2 pr-2">
          {revisions.map(rev => (
            <div key={rev.id}
              onClick={() => toggleSelect(rev.id)}
              className={`p-2.5 rounded border cursor-pointer transition-colors ${
                selected.includes(rev.id)
                  ? 'border-cyan-600 bg-cyan-950/40'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-700 text-slate-300 font-mono text-[10px]">v{rev.version}</Badge>
                  <span className="text-slate-300 text-xs">{rev.label || 'Auto-save'}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={restoring === rev.id}
                  onClick={(e) => { e.stopPropagation(); handleRestore(rev.id) }}
                  className="h-6 px-2 text-slate-500 hover:text-cyan-400"
                >
                  <ArrowCounterClockwise size={12} />
                </Button>
              </div>
              <div className="text-slate-600 text-[10px] font-mono mt-1">
                {new Date(rev.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {revisions.length === 0 && (
            <div className="text-slate-500 text-xs text-center py-8">No revisions yet</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
