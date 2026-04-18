'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react'
import type { Project, Room, LayerType } from '@/types'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerType>('ARCH')
  const [currentFloor, setCurrentFloor] = useState(1)
  const [saving, setSaving] = useState(false)

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) {
        router.push('/')
        return
      }
      setProject(await res.json())
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleRoomsChange = useCallback(
    async (rooms: Room[]) => {
      if (!project) return
      setSaving(true)
      try {
        const res = await fetch(`/api/projects/${id}/rooms`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rooms),
        })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setProject(prev =>
          prev ? { ...prev, rooms: data.rooms, vastuScore: data.vastuScore } : prev
        )
      } catch {
        toast.error('Failed to save rooms')
      } finally {
        setSaving(false)
      }
    },
    [id, project]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-slate-400 font-mono animate-pulse">LOADING BLUEPRINT...</div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="text-slate-400 hover:text-white gap-1"
        >
          <ArrowLeft size={14} />
          <span className="text-xs font-mono">BACK</span>
        </Button>
        <div className="flex-1">
          <h2 className="text-white font-mono text-sm">{project.title}</h2>
          <p className="text-slate-500 text-xs">
            {project.plotWidth}×{project.plotHeight} {project.plotUnit} · {project.facing} · Score:{' '}
            {Math.round(project.vastuScore)}/100
          </p>
        </div>
        {saving && (
          <span className="text-cyan-400 text-xs font-mono flex items-center gap-1">
            <FloppyDisk size={12} />
            SAVING...
          </span>
        )}
        {/* Layer Toggle */}
        <div className="flex rounded border border-slate-700 overflow-hidden">
          {(['ARCH', 'PLMB', 'ELEC'] as LayerType[]).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                activeLayer === layer
                  ? 'bg-cyan-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
        {/* Floor Selector */}
        {project.numFloors > 1 && (
          <div className="flex rounded border border-slate-700 overflow-hidden">
            {Array.from({ length: project.numFloors }, (_, i) => i + 1).map(floor => (
              <button
                key={floor}
                onClick={() => setCurrentFloor(floor)}
                className={`px-3 py-1 text-xs font-mono transition-colors ${
                  currentFloor === floor
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                F{floor}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 flex items-start justify-center">
          {/* FloorPlanCanvas will be placed here by Track D */}
          <div
            id="floor-plan-canvas-container"
            data-project-id={project.id}
            data-plot-width={project.plotWidth}
            data-plot-height={project.plotHeight}
            data-rooms={JSON.stringify(project.rooms)}
            data-plumbing={JSON.stringify(project.plumbing)}
            data-electrical={JSON.stringify(project.electrical)}
            data-active-layer={activeLayer}
            data-current-floor={currentFloor}
            className="relative"
            style={{ width: project.plotWidth * 8, height: project.plotHeight * 8 }}
          >
            <div className="text-slate-600 text-xs font-mono absolute inset-0 flex items-center justify-center">
              CANVAS RENDERS HERE
            </div>
          </div>
        </div>

        {/* Side panels */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <Tabs defaultValue="vastu" className="flex flex-col h-full">
            <TabsList className="bg-slate-800 rounded-none border-b border-slate-700 flex-shrink-0">
              <TabsTrigger value="vastu" className="font-mono text-xs flex-1">
                VASTU
              </TabsTrigger>
              <TabsTrigger value="cost" className="font-mono text-xs flex-1">
                COST
              </TabsTrigger>
              <TabsTrigger value="ai" className="font-mono text-xs flex-1">
                AI
              </TabsTrigger>
              <TabsTrigger value="history" className="font-mono text-xs flex-1">
                LOG
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="vastu" className="p-4 m-0">
                {/* VastuScorePanel — Track E */}
                <div
                  id="vastu-score-panel"
                  data-rooms={JSON.stringify(project.rooms)}
                  data-score={project.vastuScore}
                />
              </TabsContent>
              <TabsContent value="cost" className="p-4 m-0">
                {/* CostEstimate — Track E */}
                <div id="cost-estimate-panel" data-project-id={project.id} />
              </TabsContent>
              <TabsContent value="ai" className="p-4 m-0 h-full">
                {/* AICopilot — Track E */}
                <div id="ai-copilot-panel" data-project-id={project.id} />
              </TabsContent>
              <TabsContent value="history" className="p-4 m-0">
                {/* RevisionHistory — Track E */}
                <div id="revision-history-panel" data-project-id={project.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
