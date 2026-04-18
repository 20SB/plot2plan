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
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">My Projects</h1>
          <p className="text-muted-foreground mt-2 text-base">Design and manage your Vastu-compliant floor plans</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="rounded-2xl shadow-premium hover:shadow-premium-hover transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-48 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border-2 border-dashed bg-muted/50 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-background border rounded-2xl flex items-center justify-center mb-8 shadow-premium">
            <Layout className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No projects yet</h3>
          <p className="text-muted-foreground text-base max-w-sm leading-relaxed mb-10">
            Start your architectural journey by creating your first Vastu-compliant project.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="rounded-2xl"
          >
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="group relative bg-card border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-premium-hover hover:-translate-y-1"
            >
              {/* Vastu score badge float */}
              <div className="absolute -top-3 -right-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border ${
                  (project.vastuScore ?? 0) >= 75 ? 'bg-green-500 text-white border-green-600' :
                  (project.vastuScore ?? 0) >= 50 ? 'bg-amber-500 text-white border-amber-600' :
                                                    'bg-rose-500 text-white border-rose-600'
                }`}>
                  {project.vastuScore != null ? Math.round(project.vastuScore) : '--'}
                </span>
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-xs font-mono px-2 py-0.5 bg-muted rounded text-muted-foreground uppercase">
                      {project.plotWidth}×{project.plotHeight} {project.plotUnit}
                    </span>
                     <span className="text-xs font-mono px-2 py-0.5 bg-muted rounded text-muted-foreground">
                      {project.numFloors} FLOORS
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-5 border-t">
                  <span className="text-muted-foreground text-xs font-medium">
                    {project.rooms?.length ?? 0} rooms · {project.style}
                  </span>
                  <button
                    className="text-muted-foreground hover:text-destructive transition-all p-2 rounded-xl hover:bg-destructive/10"
                    disabled={deleting === project.id}
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlotInputForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
