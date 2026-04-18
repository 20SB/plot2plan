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
    <div className="p-8 text-muted-foreground text-[10px] font-bold tracking-widest animate-pulse flex items-center gap-2">
       <ClockCounterClockwise size={16} className="animate-spin-slow" /> LOADING HISTORY...
    </div>
  )

  if (comparing) {
    return (
      <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={() => setComparing(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-bold gap-2 rounded-xl">
            <ArrowCounterClockwise size={14} weight="bold" /> BACK TO LOG
          </Button>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Diff View</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <CompareView projectId={projectId} revIdA={comparing[0]} revIdB={comparing[1]} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      <div className="p-6 space-y-6">
        {/* Helper text / action box */}
        <div className="bg-muted/30 border border-dashed rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">Compare States</p>
            <p className="text-[10px] text-muted-foreground font-medium">Select 2 items to diff ({selected.length}/2)</p>
          </div>
          {selected.length === 2 && (
            <Button size="sm" 
              onClick={() => setComparing([selected[0], selected[1]])}
              className="rounded-xl text-[10px] font-black h-8 gap-2 shadow-premium animate-in zoom-in-95">
              <GitDiff size={14} weight="bold" /> COMPARE
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-4">
            {revisions.map((rev, idx) => (
              <div key={rev.id}
                onClick={() => toggleSelect(rev.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selected.includes(rev.id)
                    ? 'border-primary bg-primary/5 shadow-premium ring-1 ring-primary/20'
                    : 'bg-card hover:border-primary/20 hover:bg-muted/20 hover:shadow-sm'
                }`}>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                      selected.includes(rev.id) ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      V{revisions.length - idx}
                    </span>
                    <span className="text-sm font-bold text-foreground truncate max-w-[140px]">
                      {rev.label || 'Auto-save Point'}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={restoring === rev.id}
                    onClick={(e) => { e.stopPropagation(); handleRestore(rev.id) }}
                    className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Restore version"
                  >
                    <ArrowCounterClockwise size={16} weight="bold" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-primary/40" />
                    <span className="text-[10px] text-muted-foreground font-bold font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()} · {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[9px] font-black text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Current</span>
                  )}
                </div>
              </div>
            ))}
            
            {revisions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <ClockCounterClockwise size={48} weight="thin" className="mb-4 text-muted-foreground" />
                <p className="text-sm font-medium">No activity log found<br/>for this workspace yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
