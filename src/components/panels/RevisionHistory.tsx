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
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-500 overflow-hidden relative z-10">
      <div className="p-6 space-y-8 overflow-y-auto">
        {/* Helper text / action box */}
        <div className="bg-white/[0.02] border border-white/[0.1] border-dashed rounded-2xl p-5 flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground tracking-tight">Compare State History</p>
            <p className="text-[10px] text-foreground-muted font-medium font-mono uppercase tracking-widest">Select 2 items to diff ({selected.length}/2)</p>
          </div>
          {selected.length === 2 && (
            <Button size="sm" 
              onClick={() => setComparing([selected[0], selected[1]])}
              className="rounded-xl text-[10px] font-bold h-8 gap-2 shadow-accent-glow animate-in zoom-in-95 bg-accent text-white border-none">
              <GitDiff size={14} weight="bold" /> COMPARE
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-4 pr-4">
            {revisions.map((rev, idx) => (
              <div key={rev.id}
                onClick={() => toggleSelect(rev.id)}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selected.includes(rev.id)
                    ? 'border-accent bg-accent/5 shadow-accent-glow ring-1 ring-accent/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.2] hover:bg-white/[0.05] hover:shadow-linear'
                }`}>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border transition-colors ${
                      selected.includes(rev.id) ? 'bg-accent text-white border-accent' : 'bg-white/[0.05] text-foreground-muted border-white/[0.1]'
                    }`}>
                      V{revisions.length - idx}
                    </span>
                    <span className="text-base font-semibold text-foreground truncate max-w-[140px] tracking-tight group-hover:text-accent transition-colors">
                      {rev.label || 'Auto-save Point'}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={restoring === rev.id}
                    onClick={(e) => { e.stopPropagation(); handleRestore(rev.id) }}
                    className="size-8 p-0 rounded-xl text-foreground-muted hover:text-accent hover:bg-white/[0.05] transition-all lg:opacity-0 group-hover:opacity-100"
                    title="Restore version"
                  >
                    <ArrowCounterClockwise size={18} weight="bold" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] text-foreground-muted font-medium font-mono tracking-wider">
                      {new Date(rev.createdAt).toLocaleDateString()} · {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 uppercase tracking-widest shadow-linear">Current</span>
                  )}
                </div>
              </div>
            ))}
            
            {revisions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-20 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6">
                  <ClockCounterClockwise size={40} weight="thin" className="text-foreground-muted opacity-40" />
                </div>
                <p className="text-sm font-medium text-foreground-muted tracking-tight">No activity log found<br/>for this workspace yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
