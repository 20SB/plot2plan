'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PlotInputForm } from '@/components/panels/PlotInputForm'
import { Plus, Trash, FolderOpen, Blueprint } from '@phosphor-icons/react'
import type { Project } from '@/types'

function VastuBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? 'bg-green-700 text-green-100'
      : score >= 50
      ? 'bg-yellow-700 text-yellow-100'
      : 'bg-red-700 text-red-100'
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded ${color}`}>{score}/100</span>
  )
}

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
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
          <h1 className="text-2xl font-bold text-white font-mono">MY PROJECTS</h1>
          <p className="text-slate-400 text-sm mt-1">
            {projects.length} floor plan{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-cyan-600 hover:bg-cyan-500 font-mono gap-2"
        >
          <Plus size={16} weight="bold" />
          NEW PLAN
        </Button>
      </div>

      <Separator className="bg-slate-800 mb-8" />

      {/* Project grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Blueprint size={64} className="mb-4 text-slate-700" />
          <p className="font-mono text-lg">NO PROJECTS YET</p>
          <p className="text-sm mt-2">Create your first floor plan to get started</p>
          <Button
            onClick={() => setShowForm(true)}
            className="mt-6 bg-cyan-600 hover:bg-cyan-500 font-mono gap-2"
          >
            <Plus size={16} weight="bold" />
            GENERATE FIRST PLAN
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map(project => (
            <Card
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="bg-slate-900 border-slate-700 hover:border-cyan-700 cursor-pointer transition-colors group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-sm font-mono leading-tight group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </CardTitle>
                  <button
                    onClick={e => handleDelete(project.id, e)}
                    disabled={deleting === project.id}
                    className="text-slate-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-mono">VASTU</span>
                    <VastuBadge score={Math.round(project.vastuScore)} />
                  </div>
                  <p className="text-slate-400 text-xs">
                    {project.plotWidth} × {project.plotHeight} {project.plotUnit}
                    {project.numFloors > 1 && ` · ${project.numFloors} floors`}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {project.facing} facing · {project.style}
                  </p>
                  <p className="text-slate-600 text-xs font-mono">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-slate-600 group-hover:text-cyan-500 transition-colors">
                  <FolderOpen size={12} />
                  <span className="text-xs font-mono">OPEN</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlotInputForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
