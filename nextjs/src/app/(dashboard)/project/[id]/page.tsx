'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, FloppyDisk, FilePdf, FileCode, Export } from '@phosphor-icons/react'
import { FloorPlanCanvas } from '@/components/canvas/FloorPlanCanvas'
import { VastuScorePanel } from '@/components/panels/VastuScorePanel'
import { CostEstimate } from '@/components/panels/CostEstimate'
import { AICopilot } from '@/components/panels/AICopilot'
import { RevisionHistory } from '@/components/panels/RevisionHistory'
import { exportToPdf } from '@/utils/pdfExport'
import { exportToDxf } from '@/utils/dxfExport'
import type { Project, Room, LayerType, CostEstimateItem } from '@/types'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerType>('ARCH')
  const [currentFloor, setCurrentFloor] = useState(1)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) { router.push('/'); return }
      setProject(await res.json())
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchProject() }, [fetchProject])

  // Debounced save — fires 800ms after last room change
  const handleRoomsChange = useCallback((rooms: Room[]) => {
    if (!project) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        const res = await fetch(`/api/projects/${id}/rooms`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rooms),
        })
        if (!res.ok) throw new Error('Save failed')
        const data = await res.json()
        setProject(prev => prev ? { ...prev, rooms: data.rooms, vastuScore: data.vastuScore } : prev)
      } catch {
        toast.error('Failed to save changes')
      } finally {
        setSaving(false)
      }
    }, 800)
  }, [id, project])

  const handleRestore = useCallback(() => {
    fetchProject()
    toast.success('Layout restored')
  }, [fetchProject])

  const handleExportPdf = useCallback(async () => {
    if (!project) return
    setExporting(true)
    try {
      // Fetch cost estimate for PDF
      const res = await fetch(`/api/projects/${id}/cost-estimate`)
      const costData = await res.json()
      await exportToPdf({
        project,
        costItems: (costData.items as CostEstimateItem[]) ?? [],
        totalCost: costData.totalCost ?? 0,
        totalArea: costData.totalArea ?? 0,
      })
      toast.success('PDF exported')
    } catch {
      toast.error('PDF export failed')
    } finally {
      setExporting(false)
    }
  }, [project, id])

  const handleExportDxf = useCallback(async () => {
    if (!project) return
    setExporting(true)
    try {
      await exportToDxf({
        projectTitle: project.title,
        plotWidth: project.plotWidth,
        plotHeight: project.plotHeight,
        plotUnit: project.plotUnit,
        rooms: project.rooms,
        plumbing: project.plumbing,
        electrical: project.electrical,
        currentFloor,
      })
      toast.success('DXF exported')
    } catch {
      toast.error('DXF export failed')
    } finally {
      setExporting(false)
    }
  }, [project, currentFloor])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-slate-400 font-mono animate-pulse text-sm tracking-widest">
          LOADING BLUEPRINT...
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}
          className="text-slate-400 hover:text-white gap-1 h-7 px-2">
          <ArrowLeft size={13} />
          <span className="text-xs font-mono">BACK</span>
        </Button>

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-mono text-sm truncate">{project.title}</h2>
          <p className="text-slate-500 text-xs">
            {project.plotWidth}×{project.plotHeight} {project.plotUnit}
            {' · '}{project.facing}
            {' · '}Score: <span className={project.vastuScore >= 75 ? 'text-green-400' : project.vastuScore >= 50 ? 'text-yellow-400' : 'text-red-400'}>{Math.round(project.vastuScore)}/100</span>
          </p>
        </div>

        {saving && (
          <span className="text-cyan-400 text-xs font-mono flex items-center gap-1">
            <FloppyDisk size={11} />SAVING...
          </span>
        )}

        {/* Layer toggle */}
        <div className="flex rounded border border-slate-700 overflow-hidden">
          {(['ARCH', 'PLMB', 'ELEC'] as LayerType[]).map(layer => (
            <button key={layer} onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                activeLayer === layer ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {layer}
            </button>
          ))}
        </div>

        {/* Floor selector */}
        {project.numFloors > 1 && (
          <div className="flex rounded border border-slate-700 overflow-hidden">
            {Array.from({ length: project.numFloors }, (_, i) => i + 1).map(floor => (
              <button key={floor} onClick={() => setCurrentFloor(floor)}
                className={`px-3 py-1 text-xs font-mono transition-colors ${
                  currentFloor === floor ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}>
                F{floor}
              </button>
            ))}
          </div>
        )}

        {/* Export buttons */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" disabled={exporting} onClick={handleExportPdf}
            className="h-7 text-xs border-slate-600 text-slate-300 hover:text-white gap-1 px-2">
            <FilePdf size={12} />PDF
          </Button>
          <Button size="sm" variant="outline" disabled={exporting} onClick={handleExportDxf}
            className="h-7 text-xs border-slate-600 text-slate-300 hover:text-white gap-1 px-2">
            <FileCode size={12} />DXF
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-start justify-center">
          <FloorPlanCanvas
            plotWidth={project.plotWidth}
            plotHeight={project.plotHeight}
            rooms={project.rooms}
            plumbing={project.plumbing}
            electrical={project.electrical}
            activeLayer={activeLayer}
            currentFloor={currentFloor}
            onRoomsChange={handleRoomsChange}
          />
        </div>

        {/* Side panels */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden flex-shrink-0">
          <Tabs defaultValue="vastu" className="flex flex-col h-full">
            <TabsList className="bg-slate-800 rounded-none border-b border-slate-700 flex-shrink-0 h-9">
              <TabsTrigger value="vastu" className="font-mono text-xs flex-1 data-[state=active]:bg-slate-700 h-7">VASTU</TabsTrigger>
              <TabsTrigger value="cost" className="font-mono text-xs flex-1 data-[state=active]:bg-slate-700 h-7">COST</TabsTrigger>
              <TabsTrigger value="ai" className="font-mono text-xs flex-1 data-[state=active]:bg-slate-700 h-7">AI</TabsTrigger>
              <TabsTrigger value="history" className="font-mono text-xs flex-1 data-[state=active]:bg-slate-700 h-7">LOG</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="vastu" className="p-4 m-0 h-full">
                <VastuScorePanel
                  rooms={project.rooms}
                  overallScore={project.vastuScore}
                />
              </TabsContent>
              <TabsContent value="cost" className="p-4 m-0">
                <CostEstimate
                  projectId={project.id}
                  onExportPdf={handleExportPdf}
                />
              </TabsContent>
              <TabsContent value="ai" className="p-4 m-0 flex flex-col" style={{ height: 'calc(100vh - 56px - 36px - 36px)' }}>
                <AICopilot projectId={project.id} />
              </TabsContent>
              <TabsContent value="history" className="p-4 m-0">
                <RevisionHistory
                  projectId={project.id}
                  onRestore={handleRestore}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
