'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { 
  ArrowRight, 
  Layout, 
  Palette, 
  MousePointer2, 
  Sigma,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react'

export default function StyleGuidePage() {
  return (
    <div className="container mx-auto py-24 space-y-24 relative z-10">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-7xl font-semibold tracking-tighter text-gradient pb-2">
          Design System
        </h1>
        <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
          A premium, technical aesthetic built for precision and depth. 
          Powered by <span className="text-gradient-accent font-semibold">Plot2Plan Modern</span>.
        </p>
      </section>

      {/* Typography & Colors */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Palette className="text-accent" />
          <h2 className="text-3xl font-semibold tracking-tight">Typography & Depth</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SpotlightCard className="p-8 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Headlines</h3>
            <div className="space-y-2">
              <h1 className="text-5xl font-semibold text-gradient">Display Header</h1>
              <p className="text-foreground-muted">Deep Space typography uses vertical gradients to create a sense of soft top-down lighting.</p>
            </div>
          </SpotlightCard>
          
          <SpotlightCard className="p-8 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Accents</h3>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold text-gradient-accent">Active Glow</h1>
              <p className="text-foreground-muted">Animated accent gradients for highlighting high-value features and AI-driven interactions.</p>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Interactive Components */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <MousePointer2 className="text-accent" />
          <h2 className="text-3xl font-semibold tracking-tight">Interactive Primitives</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buttons Showcase */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Button Matrix</CardTitle>
              <CardDescription>Precision micro-interactions with expo-out easing and shine effects.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="default">Primary CTA</Button>
              <Button variant="outline">Secondary Action</Button>
              <Button variant="secondary">Tertiary Action</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="default" className="gap-2">
                Continue <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>

          {/* Icon Context */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Context</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="size-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-accent">
                <Zap size={24} />
              </div>
              <div className="size-12 rounded-xl bg-accent shadow-accent-glow flex items-center justify-center text-white">
                <Sparkles size={24} />
              </div>
              <div className="size-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-foreground-muted">
                <Layers size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Spotlight Cards */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Layout className="text-accent" />
          <h2 className="text-3xl font-semibold tracking-tight">Interactive Surfaces</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <SpotlightCard key={i} className="aspect-video flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Sigma className="size-10 text-accent opacity-50" />
              <div className="space-y-2">
                <h4 className="font-semibold">Spotlight Container {i}</h4>
                <p className="text-xs text-foreground-muted">Responsive radial glow that tracks mouse movement with zero-latency precision.</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Bento Grid Example */}
      <section className="space-y-8">
        <h2 className="text-3xl font-semibold tracking-tight">The "Bento" Philosophy</h2>
        <div className="grid grid-cols-6 auto-rows-[180px] gap-4">
          <SpotlightCard className="col-span-full md:col-span-4 row-span-2 p-8 flex flex-col justify-end bg-gradient-to-br from-accent/10 to-transparent">
            <h3 className="text-2xl font-semibold">Hero Feature</h3>
            <p className="text-foreground-muted">Occupying large space to establish hierarchy and flow.</p>
          </SpotlightCard>
          <SpotlightCard className="col-span-full md:col-span-2 row-span-1 p-6 flex items-center gap-4">
            <Zap className="text-accent" />
            <span className="font-medium">Quick Stats</span>
          </SpotlightCard>
          <SpotlightCard className="col-span-full md:col-span-2 row-span-1 p-6 flex items-center gap-4">
            <Layers className="text-accent" />
            <span className="font-medium">Recent Assets</span>
          </SpotlightCard>
        </div>
        {/* Experimental / Analytics Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="text-accent size-5" />
            <h2 className="text-2xl font-semibold tracking-tight">Advanced Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <SpotlightCard className="p-8 flex flex-col items-center justify-center gap-6 min-h-[300px]">
                <div className="size-20 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent animate-pulse shadow-accent-glow">
                   <div className="size-12 bg-accent rounded-full flex items-center justify-center text-white">
                      <SparklesIcon size={24} />
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <div className="text-xl font-semibold text-gradient">Energy Mapping</div>
                   <p className="text-xs text-foreground-muted max-w-[200px]">Interactive visualization of kinetic architectural flow.</p>
                </div>
                <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className="size-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                   ))}
                </div>
             </SpotlightCard>

             <SpotlightCard className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-[11px] font-mono text-foreground-subtle uppercase tracking-widest">Zone Status</span>
                   <span className="text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">MANIFESTED</span>
                </div>
                <div className="space-y-4">
                   {[
                     { label: 'Thermal Equilibrium', val: 94, color: 'bg-orange-500' },
                     { label: 'Kinetic Resistance', val: 12, color: 'bg-blue-400' },
                     { label: 'Zen Quotient', val: 82, color: 'bg-accent' },
                   ].map(m => (
                     <div key={m.label} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-medium">
                           <span className="text-foreground-muted">{m.label}</span>
                           <span className="font-mono">{m.val}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.val}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </SpotlightCard>
          </div>
        </section>
      </section>
    </div>
  )
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
