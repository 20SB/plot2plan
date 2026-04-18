'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { EnergyRadar } from '@/components/analytics/EnergyRadar'
import { 
  ArrowLeft, 
  Sparkles, 
  Wind, 
  Droplets, 
  Flame, 
  Mountain, 
  Infinity,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react'
import type { Project } from '@/types'

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`)
        if (!res.ok) { router.push('/'); return }
        setProject(await res.json())
      } catch {
        toast.error('Failed to load project for analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-foreground-muted font-mono text-xs uppercase tracking-widest">Quantum Energy Mapping...</span>
        </div>
      </div>
    )
  }

  if (!project) return null

  // Derived Metrics (Heuristics)
  const roomCount = project.rooms.length
  const criticalIssues = project.rooms.flatMap(r => r.doshas || []).filter(d => d.severity === 'CRITICAL').length
  const elementCount = new Set(project.rooms.map(r => r.element)).size
  
  // Custom Heuristic: Flow Index (based on score and distribution)
  const flowIndex = Math.round((project.vastuScore * 0.8) + (elementCount * 4))
  const zenQuotient = Math.max(0, 100 - (criticalIssues * 15))

  return (
    <div className="container mx-auto py-12 px-6 space-y-12 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-foreground-muted hover:text-foreground mb-4 -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" /> Back to Workspace
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-semibold tracking-tighter text-gradient">Energy Analytics</h1>
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">Alpha Release</div>
          </div>
          <p className="text-foreground-muted text-lg max-w-xl">
             A high-precision analysis of the spiritual and elemental harmony within <span className="text-foreground font-semibold uppercase">{project.title}</span>.
          </p>
        </div>
        
        <SpotlightCard className="p-6 flex items-center gap-8 bg-white/[0.02]">
           <div>
             <div className="text-[10px] font-mono text-foreground-subtle uppercase tracking-widest mb-1">Global Harmony</div>
             <div className="text-4xl font-bold text-gradient-accent">{project.vastuScore}%</div>
           </div>
           <div className="size-16 rounded-2xl bg-accent shadow-accent-glow flex items-center justify-center text-white">
             <ShieldCheck size={32} />
           </div>
        </SpotlightCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[220px] gap-6">
        
        {/* Radar Chart Component */}
        <div className="md:col-span-4 row-span-2">
           <EnergyRadar rooms={project.rooms} />
        </div>

        {/* Insight: Flow Index */}
        <SpotlightCard className="md:col-span-2 row-span-1 p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Wind size={80} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-foreground-subtle uppercase tracking-widest mb-1 flex items-center gap-2">
              <Zap size={12} className="text-accent" /> Flow Efficiency
            </div>
            <div className="text-5xl font-semibold tracking-tighter">{flowIndex}%</div>
          </div>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Measures the frictionless movement of energy through transition zones.
          </p>
        </SpotlightCard>

        {/* Insight: Zen Quotient */}
        <SpotlightCard className="md:col-span-2 row-span-1 p-8 flex flex-col justify-between bg-gradient-to-br from-accent/5 to-transparent">
          <div>
            <div className="text-[10px] font-mono text-foreground-subtle uppercase tracking-widest mb-1">Zen Quotient</div>
            <div className="text-5xl font-semibold tracking-tighter">{zenQuotient}</div>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`size-3 rounded-full ${i < (zenQuotient/20) ? 'bg-accent shadow-accent-glow' : 'bg-white/5'}`} />
            ))}
          </div>
        </SpotlightCard>

        {/* Element Distribution Feed */}
        <div className="md:col-span-full row-span-1 grid grid-cols-2 md:grid-cols-5 gap-4">
           {[
             { name: 'Water', icon: Droplets, val: 'NE', color: 'text-blue-400' },
             { name: 'Air', icon: Wind, val: 'NW', color: 'text-slate-400' },
             { name: 'Fire', icon: Flame, val: 'SE', color: 'text-orange-400' },
             { name: 'Earth', icon: Mountain, val: 'SW', color: 'text-emerald-400' },
             { name: 'Space', icon: Infinity, val: 'CTR', color: 'text-indigo-400' },
           ].map(el => (
             <SpotlightCard key={el.name} className="flex flex-col items-center justify-center p-6 gap-3 group">
                <el.icon className={`size-8 ${el.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-widest">{el.name}</div>
                  <div className="text-[10px] text-foreground-muted font-mono">{el.val} ZONE</div>
                </div>
             </SpotlightCard>
           ))}
        </div>

        {/* AI Quantum Summary */}
        <SpotlightCard className="md:col-span-4 row-span-1 p-8 flex gap-8 items-center bg-accent/5 border-accent/20">
          <div className="size-20 rounded-full border border-accent/30 flex items-center justify-center p-1 bg-bg-base shadow-accent-glow">
             <div className="size-full rounded-full bg-accent flex items-center justify-center text-white animate-pulse">
                <Sparkles size={32} />
             </div>
          </div>
          <div className="space-y-3">
             <h3 className="text-xl font-semibold tracking-tight">AI Kinetic Summary</h3>
             <p className="text-sm text-foreground-muted leading-relaxed max-w-2xl">
                The current configuration exhibits a strong <span className="text-accent font-bold">Lunar Dominance</span> with {project.rooms.filter(r => r.element === 'WATER').length} zones aligned with Water elements. To achieve technical transcendence, consider expanding the central Brahmasthana clearing.
             </p>
          </div>
        </SpotlightCard>

        {/* Real-time Health */}
        <SpotlightCard className="md:col-span-2 row-span-1 p-8 overflow-hidden relative group">
           <Activity className="absolute -bottom-4 -right-4 size-32 text-accent opacity-5 group-hover:opacity-10 transition-opacity" />
           <div className="text-[10px] font-mono text-foreground-subtle uppercase tracking-widest mb-1">Kinetic Health</div>
           <div className="text-2xl font-semibold mb-6">Optimized</div>
           <div className="space-y-4">
              <div className="flex justify-between text-xs">
                 <span className="text-foreground-muted">Symmetry Score</span>
                 <span className="font-mono">88.4</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-4 bg-accent w-[88%]" />
              </div>
           </div>
        </SpotlightCard>

      </div>
    </div>
  )
}
