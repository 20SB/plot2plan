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
  ArrowsIn,
  IdentificationCard,
  Drop,
  Cube,
  AppWindow
} from '@phosphor-icons/react'
import { FloorPlanCanvas } from '@/components/canvas/FloorPlanCanvas'
import { VastuScorePanel } from '@/components/panels/VastuScorePanel'
import { CostEstimate } from '@/components/panels/CostEstimate'
import { AICopilot } from '@/components/panels/AICopilot'
import { RevisionHistory } from '@/components/panels/RevisionHistory'
import { exportToPdf } from '@/utils/pdfExport'
import { exportToDxf } from '@/utils/dxfExport'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

  const handleFitToViewport = useCallback(() => {
    if (!viewportRef.current || !project) return
    const canvasWidth = project.plotWidth * 8 + 32
    const canvasHeight = project.plotHeight * 8 + 32
    const viewportWidth = viewportRef.current.clientWidth - 64
    const viewportHeight = viewportRef.current.clientHeight - 64
    const scale = Math.min(viewportWidth / canvasWidth, viewportHeight / canvasHeight)
    setZoom(Math.max(0.1, Math.min(2, scale)))
  }, [project])

  useEffect(() => {
    if (!loading && project) {
      const timer = setTimeout(handleFitToViewport, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, project, handleFitToViewport])

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
        <div className="text-muted-foreground font-mono animate-pulse text-sm tracking-widest uppercase">Atmospheric Calibration...</div>
      </div>
    )
  }

  if (!project) return null

  const SidebarContent = (
    <Tabs defaultValue="vastu" className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/[0.04] bg-white/[0.01]">
        <TabsList className="w-full grid grid-cols-4 p-1 rounded-2xl bg-white/[0.03]">
          <TabsTrigger value="vastu" className="flex flex-col items-center gap-1 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white">
            <Compass weight="bold" size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Vastu</span>
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex flex-col items-center gap-1 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white">
            <Coins weight="bold" size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Cost</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col items-center gap-1 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white">
            <Robot weight="bold" size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">AI</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white">
            <Clock weight="bold" size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Log</span>
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
        <TabsContent value="ai" className="m-0 flex flex-col p-0 h-full">
          <AICopilot projectId={project.id} />
        </TabsContent>
        <TabsContent value="history" className="m-0 p-0">
          <RevisionHistory projectId={project.id} onRestore={handleRestore} />
        </TabsContent>
      </div>
    </Tabs>
  )

  const VerticalToolbar = (
    <TooltipProvider delayDuration={0}>
      <aside className="hidden lg:flex flex-col w-[72px] bg-white/[0.01] border-r border-white/[0.06] backdrop-blur-3xl shrink-0 z-40 relative group/toolbar">
        {/* Top: Branding/Back */}
        <div className="flex flex-col items-center py-6 gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/')}
                className="size-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-rose-500/10 hover:text-rose-400 group transition-all"
              >
                <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Back to Projects</TooltipContent>
          </Tooltip>

          <Separator className="bg-white/5 w-8" />

          {/* Layer Toggle Stack */}
          <div className="flex flex-col gap-2 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            {(['ARCH', 'PLMB', 'ELEC'] as LayerType[]).map(layer => {
              const Icon = layer === 'ARCH' ? AppWindow : layer === 'PLMB' ? Drop : Cube
              return (
                <Tooltip key={layer}>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setActiveLayer(layer)}
                      className={`size-10 rounded-[14px] flex flex-col items-center justify-center transition-all ${
                        activeLayer === layer
                          ? 'bg-accent text-white shadow-accent-glow ring-1 ring-white/10'
                          : 'text-foreground-subtle hover:text-foreground hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon size={18} weight={activeLayer === layer ? 'bold' : 'duotone'} />
                      <span className="text-[7px] font-bold mt-0.5 tracking-tighter">{layer}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{layer} Mode</TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          <Separator className="bg-white/5 w-8" />

          {/* Export Actions */}
          <div className="flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled={exporting} onClick={handleExportPdf}
                  className="size-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-accent/10 hover:text-accent transition-all">
                  <FilePdf size={20} weight="bold" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Export PDF</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled={exporting} onClick={handleExportDxf}
                  className="size-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-accent/10 hover:text-accent transition-all">
                  <FileCode size={20} weight="bold" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Export DXF</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Center: Title / Metadata (Rotated) */}
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
           <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-6">
              <span className="text-xl font-bold tracking-tighter text-white opacity-40 uppercase">{project.title}</span>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-mono font-bold text-foreground-subtle uppercase border border-white/5 px-2 py-0.5 rounded-full">
                    {project.plotWidth}×{project.plotHeight} {project.plotUnit}
                 </span>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    project.vastuScore >= 75 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    project.vastuScore >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                               'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    Vastu {Math.round(project.vastuScore)}%
                 </span>
              </div>
           </div>
        </div>

        {/* Bottom: Insights */}
        <div className="p-4 mt-auto border-t border-white/[0.04] bg-white/[0.01] flex flex-col items-center gap-4">
          {saving && (
             <div className="flex flex-col items-center gap-1.5 animate-pulse">
                <div className="size-1.5 rounded-full bg-accent shadow-accent-glow" />
                <span className="text-[8px] font-bold text-accent uppercase tracking-widest rotate-[-90deg] origin-center mb-4 mt-2">Saving</span>
             </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="accent" 
                size="icon" 
                onClick={() => router.push(`/project/${id}/analytics`)}
                className="size-12 rounded-[18px] shadow-accent-glow"
              >
                <Compass weight="bold" size={24} className="animate-pulse" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Quantum Insights</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )

  const MobileToolbar = (
    <div className="lg:hidden glass-surface border-b px-4 py-3 flex items-center justify-between z-30 mb-px">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="size-9 rounded-xl border border-white/5">
            <ArrowLeft size={18} />
          </Button>
          <div className="min-w-0">
             <h2 className="text-white font-bold text-sm truncate">{project.title}</h2>
             <span className="text-[10px] text-foreground-subtle font-mono">{project.plotWidth}x{project.plotHeight}</span>
          </div>
        </div>
        <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="rounded-xl h-9 px-4 gap-2 shadow-accent-glow">
                <Compass weight="bold" /> Analysis
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[90%] sm:w-[380px] bg-bg-base/95 backdrop-blur-xl border-l border-white/[0.06]">
              {SidebarContent}
            </SheetContent>
        </Sheet>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-56px)] bg-transparent animate-in overflow-hidden relative z-10 antialiased">
      {VerticalToolbar}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {MobileToolbar}
        
        <div className="flex-1 flex overflow-hidden relative">
          <div 
            ref={viewportRef}
            className="flex-1 overflow-auto bg-transparent flex items-start justify-center pattern-grid-slate-200 relative group/viewport custom-scrollbar"
          >
            {/* Zoom Controls HUD */}
            <div className="absolute top-6 left-6 z-40 flex flex-col gap-1.5 p-1 glass-surface border-white/[0.08] rounded-2xl shadow-linear animate-in slide-in-from-left-4 duration-500 opacity-0 group-hover/viewport:opacity-100 transition-opacity">
              <Button
                variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                className="size-9 rounded-xl text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
              >
                <MagnifyingGlassPlus size={18} weight="bold" />
              </Button>
              <Button
                variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
                className="size-9 rounded-xl text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
              >
                <MagnifyingGlassMinus size={18} weight="bold" />
              </Button>
              <div className="h-px bg-white/[0.08] mx-2" />
              <Button
                variant="ghost" size="icon" onClick={handleFitToViewport}
                className="size-9 rounded-xl text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
              >
                <ArrowsIn size={18} weight="bold" />
              </Button>
            </div>

            {/* Zoom Indicator */}
            <div className="absolute bottom-6 left-6 z-40 px-3 py-1.5 glass-surface border-white/[0.08] rounded-full shadow-linear animate-in slide-in-from-bottom-4 duration-500 opacity-0 group-hover/viewport:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono font-bold text-foreground-subtle tracking-widest uppercase text-center min-w-[3.5rem]">
                Scale: {Math.round(zoom * 100)}%
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

          <aside className="hidden lg:flex w-[380px] border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-md flex-col overflow-hidden flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500 shadow-linear">
            {SidebarContent}
          </aside>
        </div>
      </div>
    </div>
  )
}

function Separator({ className, w }: { className?: string, w?: string }) {
  return <div className={`h-px ${w || 'w-full'} ${className}`} />
}
