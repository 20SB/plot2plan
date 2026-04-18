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
    <div className="glass border-b px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground transition-all gap-2 h-9 px-2 md:px-3 rounded-xl border group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline font-medium">Projects</span>
        </Button>
        <div className="min-w-0">
          <h2 className="text-foreground font-bold text-sm md:text-lg truncate tracking-tight">{project.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-muted-foreground text-[10px] md:text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              {project.plotWidth}×{project.plotHeight} {project.plotUnit}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              project.vastuScore >= 75 ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
              project.vastuScore >= 50 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                         'bg-rose-500/10 text-rose-600 border-rose-500/20'
            }`}>
              Vastu: {Math.round(project.vastuScore)}
            </span>
            {saving && (
              <span className="text-primary text-[10px] font-bold tracking-widest flex items-center gap-1 animate-pulse uppercase">
                <div className="size-1 rounded-full bg-primary" /> Saving
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="hidden md:flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border">
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportPdf}
            className="rounded-xl h-9 px-3 font-semibold hover:bg-primary hover:text-white transition-all gap-2 border shadow-sm">
            <FilePdf weight="bold" /> <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportDxf}
            className="rounded-xl h-9 px-3 font-semibold hover:bg-primary hover:text-white transition-all gap-2 border shadow-sm">
            <FileCode weight="bold" /> <span className="hidden sm:inline">DXF</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="lg:hidden rounded-xl h-9 px-3 gap-2">
                <Compass weight="bold" /> Analysis
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[90%] sm:w-[380px]">
              <aside className="h-full bg-background flex flex-col">
                {SidebarContent}
              </aside>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background animate-in overflow-hidden">
      {ToolbarContent}

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-muted/30 p-4 md:p-8 flex items-start justify-center pattern-grid-slate-200">
          <div className="bg-background rounded-2xl md:rounded-3xl shadow-premium border p-2 md:p-4 scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top transform-gpu transition-transform">
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

        <aside className="hidden lg:flex w-[380px] border-l bg-background flex-col overflow-hidden flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
          {SidebarContent}
        </aside>
      </div>
    </div>
  )
}
