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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background animate-in overflow-hidden">
      {/* Toolbar */}
      <div className="glass border-b px-6 py-3 flex items-center gap-6 flex-wrap z-10">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground transition-all gap-2 h-9 px-3 rounded-xl border group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Projects</span>
        </Button>

        <div className="flex-1 min-w-0">
          <h2 className="text-foreground font-bold text-lg truncate tracking-tight">{project.title}</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-muted-foreground text-xs font-mono bg-muted px-2 py-0.5 rounded">
              {project.plotWidth}×{project.plotHeight} {project.plotUnit} · {project.facing}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
              project.vastuScore >= 75 ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
              project.vastuScore >= 50 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                         'bg-rose-500/10 text-rose-600 border-rose-500/20'
            }`}>
              Vastu: {Math.round(project.vastuScore)}/100
            </span>
            {saving && (
              <span className="text-primary text-[10px] font-bold tracking-widest flex items-center gap-1 animate-pulse uppercase">
                <FloppyDisk size={12} weight="fill" /> Auto-Saving
              </span>
            )}
          </div>
        </div>

        {/* Layer toggle */}
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border">
          {(['ARCH', 'PLMB', 'ELEC'] as LayerType[]).map(layer => (
            <button key={layer} onClick={() => setActiveLayer(layer)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeLayer === layer
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}>
              {layer}
            </button>
          ))}
        </div>

        {/* Floor selector */}
        {project.numFloors > 1 && (
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border">
            {Array.from({ length: project.numFloors }, (_, i) => i + 1).map(floor => (
              <button key={floor} onClick={() => setCurrentFloor(floor)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentFloor === floor
                    ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}>
                F{floor}
              </button>
            ))}
          </div>
        )}

        {/* Export buttons */}
        <div className="flex items-center gap-3 ml-2">
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportPdf}
            className="rounded-xl h-10 px-4 font-semibold hover:bg-primary hover:text-white transition-all gap-2 border shadow-sm">
            <FilePdf weight="bold" /> PDF
          </Button>
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportDxf}
            className="rounded-xl h-10 px-4 font-semibold hover:bg-primary hover:text-white transition-all gap-2 border shadow-sm">
            <FileCode weight="bold" /> DXF
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8 flex items-start justify-center pattern-grid-slate-200">
          <div className="bg-background rounded-3xl shadow-premium border p-4">
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
        </div>

        {/* Side panels */}
        <aside className="w-[380px] border-l bg-background flex flex-col overflow-hidden flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
          <Tabs defaultValue="vastu" className="flex flex-col h-full">
            <div className="p-4 border-b">
              <TabsList className="w-full grid grid-cols-4 p-1 rounded-2xl">
                <TabsTrigger value="vastu" className="flex flex-col items-center gap-1 py-3 rounded-xl">
                  <Compass weight="bold" size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Vastu</span>
                </TabsTrigger>
                <TabsTrigger value="cost" className="flex flex-col items-center gap-1 py-3 rounded-xl">
                  <Coins weight="bold" size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Cost</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex flex-col items-center gap-1 py-3 rounded-xl">
                  <Robot weight="bold" size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">AI Copilot</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-3 rounded-xl">
                  <Clock weight="bold" size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Log</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <TabsContent value="vastu" className="m-0 h-full p-0">
                <VastuScorePanel
                  rooms={project.rooms}
                  overallScore={project.vastuScore}
                />
              </TabsContent>
              <TabsContent value="cost" className="m-0 p-0">
                <CostEstimate
                  projectId={project.id}
                  onExportPdf={handleExportPdf}
                />
              </TabsContent>
              <TabsContent value="ai" className="m-0 flex flex-col p-0" style={{ height: 'calc(100vh - 180px)' }}>
                <AICopilot projectId={project.id} />
              </TabsContent>
              <TabsContent value="history" className="m-0 p-0">
                <RevisionHistory
                  projectId={project.id}
                  onRestore={handleRestore}
                />
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}
