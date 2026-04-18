'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PlotInputForm } from '@/components/panels/PlotInputForm'
import { Plus, Trash2, Layout } from 'lucide-react'
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
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-app-text tracking-tight">My Projects</h1>
          <p className="text-app-soft text-sm mt-0.5">Your Vastu-compliant floor plans</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-app-accent hover:bg-app-accent-dim text-white h-9 px-4 rounded-xl font-medium text-sm shadow-[0_0_16px_rgba(99,102,241,0.2)] transition-all"
        >
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-40 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-app-card border border-white/8 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_32px_rgba(99,102,241,0.1)]">
            <Layout className="w-8 h-8 text-app-accent opacity-60" />
          </div>
          <h3 className="text-app-text font-medium text-base mb-2">No projects yet</h3>
          <p className="text-app-faint text-sm max-w-xs leading-relaxed mb-6">
            Create your first Vastu-compliant floor plan with AI-powered room placement.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-app-accent hover:bg-app-accent-dim text-white px-5 h-9 rounded-xl font-medium text-sm"
          >
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="group relative bg-app-card border border-white/8 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-white/16 hover:bg-app-hover hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
            >
              {/* Left accent bar based on score */}
              <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${
                (project.vastuScore ?? 0) >= 75 ? 'bg-app-ok' :
                (project.vastuScore ?? 0) >= 50 ? 'bg-app-warn' : 'bg-app-danger'
              }`} />

              {/* Top: title + score badge */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-app-text font-medium text-sm leading-tight group-hover:text-white transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-app-faint text-xs mt-1 font-mono">
                    {project.plotWidth}×{project.plotHeight} {project.plotUnit} · {project.numFloors}F
                  </p>
                </div>
                {/* Vastu score badge */}
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg ${
                  (project.vastuScore ?? 0) >= 75 ? 'bg-green-950/60 text-app-ok border border-green-800/40' :
                  (project.vastuScore ?? 0) >= 50 ? 'bg-amber-950/60 text-app-warn border border-amber-800/40' :
                                                    'bg-red-950/60 text-app-danger border border-red-800/40'
                }`}>
                  {project.vastuScore != null ? Math.round(project.vastuScore) : '--'}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/6">
                <span className="text-app-faint text-xs">
                  {project.rooms?.length ?? 0} rooms · {project.style}
                </span>
                <button
                  className="text-app-faint hover:text-app-danger transition-colors p-1 rounded-lg hover:bg-red-950/30"
                  disabled={deleting === project.id}
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlotInputForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
