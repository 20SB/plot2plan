'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, FloppyDisk, FilePdf, FileCode, Compass, Robot, Clock, Coins } from '@phosphor-icons/react'
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
  const isMountedRef = useRef(true)
  useEffect(() => { return () => { isMountedRef.current = false } }, [])

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

  // Cleanup save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  // Debounced save — fires 800ms after last room change
  const handleRoomsChange = useCallback((rooms: Room[]) => {
    if (!project) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      if (isMountedRef.current) setSaving(true)
      try {
        const res = await fetch(`/api/projects/${id}/rooms`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rooms),
        })
        if (!res.ok) throw new Error('Save failed')
        const data = await res.json()
        if (isMountedRef.current) {
          setProject(prev => prev ? { ...prev, rooms: data.rooms, vastuScore: data.vastuScore } : prev)
          setSaving(false)
        }
      } catch {
        toast.error('Failed to save changes')
        if (isMountedRef.current) setSaving(false)
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
      <div className="flex items-center justify-center h-[calc(100vh-56px)] bg-app-bg">
        <div className="text-app-faint font-mono animate-pulse text-sm tracking-widest">
          LOADING BLUEPRINT...
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-app-bg">
      {/* Toolbar */}
      <div className="bg-app-base border-b border-white/6 px-4 py-2 flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}
          className="text-app-faint hover:text-app-text transition-colors gap-1.5 text-sm h-7 px-2">
          <ArrowLeft size={13} />
          <span className="text-xs">Back</span>
        </Button>

        <div className="flex-1 min-w-0">
          <h2 className="text-app-text font-medium text-sm truncate">{project.title}</h2>
          <p className="text-app-faint text-xs font-mono">
            {project.plotWidth}×{project.plotHeight} {project.plotUnit}
            {' · '}{project.facing}
            {' · '}Score: <span className={project.vastuScore >= 75 ? 'text-app-ok' : project.vastuScore >= 50 ? 'text-app-warn' : 'text-app-danger'}>{Math.round(project.vastuScore)}/100</span>
          </p>
        </div>

        {saving && (
          <span className="text-app-violet text-xs font-mono flex items-center gap-1">
            <FloppyDisk size={11} />SAVING...
          </span>
        )}

        {/* Layer toggle */}
        <div className="flex bg-app-input rounded-xl p-0.5 gap-0.5">
          {(['ARCH', 'PLMB', 'ELEC'] as LayerType[]).map(layer => (
            <button key={layer} onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLayer === layer
                  ? 'bg-app-card text-app-text shadow-sm'
                  : 'text-app-faint hover:text-app-soft'
              }`}>
              {layer}
            </button>
          ))}
        </div>

        {/* Floor selector */}
        {project.numFloors > 1 && (
          <div className="flex bg-app-input rounded-xl p-0.5 gap-0.5">
            {Array.from({ length: project.numFloors }, (_, i) => i + 1).map(floor => (
              <button key={floor} onClick={() => setCurrentFloor(floor)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentFloor === floor
                    ? 'bg-app-card text-app-text shadow-sm'
                    : 'text-app-faint hover:text-app-soft'
                }`}>
                F{floor}
              </button>
            ))}
          </div>
        )}

        {/* Export buttons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={exporting} onClick={handleExportPdf}
            className="text-app-faint hover:text-app-text border border-white/8 hover:border-white/16 rounded-xl h-8 px-3 text-xs transition-all gap-1.5">
            <FilePdf className="w-3.5 h-3.5" />PDF
          </Button>
          <Button variant="ghost" size="sm" disabled={exporting} onClick={handleExportDxf}
            className="text-app-faint hover:text-app-text border border-white/8 hover:border-white/16 rounded-xl h-8 px-3 text-xs transition-all gap-1.5">
            <FileCode className="w-3.5 h-3.5" />DXF
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-app-bg p-6 flex items-start justify-center">
          <FloorPlanCanvas
            plotWidth={project.plotWidth}
            plotHeight={project.plotHeight}
            rooms={project.rooms}
            plumbing={project.plumbing}
            electrical={project.electrical}
            activeLayer={activeLayer}
            currentFloor={currentFloor}
            onRoomsChange={handleRoomsChange}
            onUndo={handleRestore}
          />
        </div>

        {/* Side panels */}
        <div className="w-80 border-l border-white/6 bg-app-base flex flex-col overflow-hidden flex-shrink-0">
          <Tabs defaultValue="vastu" className="flex flex-col h-full">
            <div className="p-2 border-b border-white/6 flex-shrink-0">
              <TabsList className="w-full grid grid-cols-4 bg-app-input rounded-xl p-0.5 h-auto">
                <TabsTrigger value="vastu" className="flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-medium data-[state=active]:bg-app-card data-[state=active]:text-app-text data-[state=active]:shadow-sm text-app-faint transition-all">
                  <Compass className="w-3.5 h-3.5" />Vastu
                </TabsTrigger>
                <TabsTrigger value="cost" className="flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-medium data-[state=active]:bg-app-card data-[state=active]:text-app-text data-[state=active]:shadow-sm text-app-faint transition-all">
                  <Coins className="w-3.5 h-3.5" />Cost
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-medium data-[state=active]:bg-app-card data-[state=active]:text-app-text data-[state=active]:shadow-sm text-app-faint transition-all">
                  <Robot className="w-3.5 h-3.5" />AI
                </TabsTrigger>
                <TabsTrigger value="history" className="flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-medium data-[state=active]:bg-app-card data-[state=active]:text-app-text data-[state=active]:shadow-sm text-app-faint transition-all">
                  <Clock className="w-3.5 h-3.5" />History
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="vastu" className="m-0 h-full">
                <VastuScorePanel
                  rooms={project.rooms}
                  overallScore={project.vastuScore}
                />
              </TabsContent>
              <TabsContent value="cost" className="m-0">
                <CostEstimate
                  projectId={project.id}
                  onExportPdf={handleExportPdf}
                />
              </TabsContent>
              <TabsContent value="ai" className="m-0 flex flex-col" style={{ height: 'calc(100vh - 56px - 36px - 36px)' }}>
                <AICopilot projectId={project.id} />
              </TabsContent>
              <TabsContent value="history" className="m-0">
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
