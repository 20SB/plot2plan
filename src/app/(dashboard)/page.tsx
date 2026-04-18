'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PlotInputForm } from '@/components/panels/PlotInputForm'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { Plus, Trash2, Layout, Sparkles } from 'lucide-react'
import type { Project } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed')
      setProjects(await res.json())
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Project deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-12 relative z-10 antialiased">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-gradient">My Projects</h1>
          <p className="text-foreground-muted text-lg">Design and manage your Vastu-compliant floor plans</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-surface h-52 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <SpotlightCard className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-white/[0.06] bg-white/[0.02] max-w-2xl mx-auto mt-12">
          <div className="size-20 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-8 shadow-linear">
            <Layout className="size-10 text-accent" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">No projects yet</h3>
          <p className="text-foreground-muted text-base max-w-sm leading-relaxed mb-10">
            Start your architectural journey by creating your first Vastu-compliant project.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="rounded-xl"
          >
            Create your first project
          </Button>
        </SpotlightCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <SpotlightCard
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="group cursor-pointer p-0 border-white/[0.08]"
            >
              <div className="p-5 h-full flex flex-col relative">
                {/* Vastu score badge float */}
                <div className="absolute top-4 right-4 z-20">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full border shadow-linear backdrop-blur-md transition-shadow group-hover:shadow-accent-glow ${
                    (project.vastuScore ?? 0) >= 75 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    (project.vastuScore ?? 0) >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    VASTU: {project.vastuScore != null ? Math.round(project.vastuScore) : '--'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="size-8 rounded-xl bg-accent shadow-accent-glow flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Sparkles size={16} />
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors line-clamp-1 pb-0.5">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-foreground-subtle uppercase tracking-widest font-bold">
                        {project.plotWidth}×{project.plotHeight}
                      </span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-foreground-subtle uppercase tracking-widest font-bold">
                        {project.numFloors}F
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.04] mt-6">
                  <div className="flex flex-col">
                    <span className="text-foreground-muted text-[11px] font-medium tracking-tight">
                      {project.rooms?.length ?? 0} modules
                    </span>
                    <span className="text-foreground-muted text-[11px] font-mono uppercase tracking-widest">
                      {project.style}
                    </span>
                  </div>
                  <button
                    className="text-foreground-subtle hover:text-rose-400 transition-all p-2.5 rounded-xl hover:bg-rose-500/10 active:scale-90"
                    disabled={deleting === project.id}
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      <PlotInputForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
