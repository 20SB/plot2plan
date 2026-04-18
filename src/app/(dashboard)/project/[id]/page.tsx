'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  FloppyDisk, 
  FilePdf, 
  FileCode, 
  Compass, 
  Robot, 
  Clock, 
  Coins,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsIn
} from '@phosphor-icons/react'
import { FloorPlanCanvas } from '@/components/canvas/FloorPlanCanvas'
import { VastuScorePanel } from '@/components/panels/VastuScorePanel'
import { CostEstimate } from '@/components/panels/CostEstimate'
import { AICopilot } from '@/components/panels/AICopilot'
import { RevisionHistory } from '@/components/panels/RevisionHistory'
import { exportToPdf } from '@/utils/pdfExport'
import { exportToDxf } from '@/utils/dxfExport'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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
  const [zoom, setZoom] = useState(1)
  
  // Refs
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  // Zoom & Fit Logic
  const handleFitToViewport = useCallback(() => {
    if (!viewportRef.current || !project) return
    
    // Canvas dimensions based on SCALE=8 in FloorPlanCanvas
    const canvasWidth = project.plotWidth * 8 + 32 // +32 for padding
    const canvasHeight = project.plotHeight * 8 + 32
    
    const viewportWidth = viewportRef.current.clientWidth - 64 // -64 for padding
    const viewportHeight = viewportRef.current.clientHeight - 64
    
    const scale = Math.min(viewportWidth / canvasWidth, viewportHeight / canvasHeight)
    setZoom(Math.max(0.1, Math.min(2, scale)))
  }, [project])

  // Initial Fit
  useEffect(() => {
    if (!loading && project) {
      // Small delay to ensure container is rendered
      const timer = setTimeout(handleFitToViewport, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, project, handleFitToViewport])

  // Handle Resize
  useEffect(() => {
    window.addEventListener('resize', handleFitToViewport)
    return () => window.removeEventListener('resize', handleFitToViewport)
  }, [handleFitToViewport])

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

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

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
      <div className="flex items-center justify-center h-[calc(100vh-56px)] bg-background">
        <div className="text-muted-foreground font-mono animate-pulse text-sm tracking-widest">
          LOADING BLUEPRINT...
        </div>
      </div>
    )
  }

  if (!project) return null

  const SidebarContent = (
    <Tabs defaultValue="vastu" className="flex flex-col h-full">
      <div className="p-4 border-b">
        <TabsList className="w-full grid grid-cols-4 p-1 rounded-2xl">
          <TabsTrigger value="vastu" className="flex flex-col items-center gap-1 py-3 rounded-xl focus:bg-background">
            <Compass weight="bold" size={18} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Vastu</span>
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex flex-col items-center gap-1 py-3 rounded-xl focus:bg-background">
            <Coins weight="bold" size={18} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Cost</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col items-center gap-1 py-3 rounded-xl focus:bg-background">
            <Robot weight="bold" size={18} />
            <span className="text-[10px] uppercase font-bold tracking-wider">AI Copilot</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-3 rounded-xl focus:bg-background">
            <Clock weight="bold" size={18} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Log</span>
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <TabsContent value="vastu" className="m-0 h-full p-0">
          <VastuScorePanel rooms={project.rooms} overallScore={project.vastuScore} />
        </TabsContent>
        <TabsContent value="cost" className="m-0 p-0">
          <CostEstimate projectId={project.id} onExportPdf={handleExportPdf} />
        </TabsContent>
        <TabsContent value="ai" className="m-0 flex flex-col p-0">
          <AICopilot projectId={project.id} />
        </TabsContent>
        <TabsContent value="history" className="m-0 p-0">
          <RevisionHistory projectId={project.id} onRestore={handleRestore} />
        </TabsContent>
      </div>
    </Tabs>
  )

  const ToolbarContent = (
    <div className="glass-surface border-b px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap z-30 mb-px rounded-none border-x-0 border-t-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}
          className="text-foreground-muted hover:text-foreground transition-all gap-2 h-9 px-2 md:px-3 rounded-xl border border-white/[0.06] group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline font-medium">Projects</span>
        </Button>
        <div className="min-w-0">
          <h2 className="text-gradient font-semibold text-sm md:text-lg truncate tracking-tight">{project.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-foreground-muted text-[10px] md:text-xs font-mono bg-white/[0.05] border border-white/[0.06] px-1.5 py-0.5 rounded">
              {project.plotWidth}×{project.plotHeight} {project.plotUnit}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              project.vastuScore >= 75 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              project.vastuScore >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                         'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              Vastu: {Math.round(project.vastuScore)}
            </span>
            {saving && (
              <span className="text-accent text-[10px] font-bold tracking-widest flex items-center gap-1 animate-pulse uppercase">
                <div className="size-1 rounded-full bg-accent" /> Saving
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.06]">
          {(['ARCH', 'PLMB', 'ELEC'] as LayerType[]).map(layer => (
            <button key={layer} onClick={() => setActiveLayer(layer)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeLayer === layer
                  ? 'bg-white/[0.08] text-white shadow-linear ring-1 ring-white/10'
                  : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
              }`}>
              {layer}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportPdf}
            className="rounded-xl h-9 px-3 font-semibold transition-all gap-2 border border-white/10">
            <FilePdf weight="bold" /> <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportDxf}
            className="rounded-xl h-9 px-3 font-semibold transition-all gap-2 border border-white/10">
            <FileCode weight="bold" /> <span className="hidden sm:inline">DXF</span>
          </Button>

          <Button 
            variant="accent" 
            size="sm" 
            onClick={() => router.push(`/project/${id}/analytics`)}
            className="rounded-xl h-9 px-4 gap-2 shadow-accent-glow"
          >
            <Compass weight="bold" size={16} className="animate-pulse" />
            <span className="font-semibold">Insights</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="lg:hidden rounded-xl h-9 px-3 gap-2">
                <Compass weight="bold" /> Analysis
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[90%] sm:w-[380px] bg-bg-base/95 backdrop-blur-xl border-l border-white/[0.06]">
              <aside className="h-full flex flex-col">
                {SidebarContent}
              </aside>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-transparent animate-in overflow-hidden relative z-10">
      {ToolbarContent}

      <div className="flex flex-1 overflow-hidden relative">
        <div 
          ref={viewportRef}
          className="flex-1 overflow-auto bg-transparent flex items-start justify-center pattern-grid-slate-200 relative group/viewport"
        >
          {/* Zoom Controls HUD */}
          <div className="absolute top-6 left-6 z-40 flex flex-col gap-1.5 p-1 glass-surface border-white/[0.08] rounded-2xl shadow-linear animate-in slide-in-from-left-4 duration-500 opacity-0 group-hover/viewport:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              className="size-9 rounded-xl text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
            >
              <MagnifyingGlassPlus size={18} weight="bold" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
              className="size-9 rounded-xl text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
            >
              <MagnifyingGlassMinus size={18} weight="bold" />
            </Button>
            <div className="h-px bg-white/[0.08] mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFitToViewport}
              className="size-9 rounded-xl text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
            >
              <ArrowsIn size={18} weight="bold" />
            </Button>
          </div>

          {/* Zoom Indicator */}
          <div className="absolute bottom-6 left-6 z-40 px-3 py-1.5 glass-surface border-white/[0.08] rounded-full shadow-linear animate-in slide-in-from-bottom-4 duration-500 opacity-0 group-hover/viewport:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono font-bold text-foreground-subtle tracking-widest uppercase text-center min-w-[3.5rem]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className="p-8 md:p-16 min-h-full flex items-center justify-center">
            <div 
              ref={canvasWrapperRef}
              className="glass-surface rounded-2xl md:rounded-3xl shadow-linear p-2 md:p-4 transform-gpu transition-all duration-300 hover:border-white/10 hover:shadow-linear-hover group/canvas relative origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
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
        </div>

        <aside className="hidden lg:flex w-[380px] border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-md flex-col overflow-hidden flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
          {SidebarContent}
        </aside>
      </div>
    </div>
  )
}
