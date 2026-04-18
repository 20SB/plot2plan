import { Sparkles } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-transparent flex relative z-10 overflow-hidden">
      {/* Left panel — visible md+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-[50%] flex-col relative overflow-hidden border-r border-white/[0.06]">
        {/* Atmospheric layers for left panel (specific to auth) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(94,106,210,0.1)_0%,transparent_60%)]" />
        <div className="grid-pattern absolute inset-0 opacity-[0.03]" />

        {/* Brand — top-left */}
        <div className="relative z-10 p-12 flex items-center gap-4">
          <div className="size-10 bg-accent rounded-xl flex items-center justify-center shadow-accent-glow">
             <span className="text-white font-bold text-xl">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gradient font-bold text-lg tracking-tight uppercase">Plot2Plan</span>
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-foreground-subtle leading-none px-0.5">
              Architectural AI
            </span>
          </div>
        </div>

        {/* Center — headline + tagline */}
        <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-12 lg:px-24 max-w-2xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-8 backdrop-blur-md">
            <Sparkles size={12} className="text-accent animate-pulse" />
            <span className="text-[11px] font-bold text-accent uppercase tracking-[0.2em]">Next-Gen Vastu Engine</span>
          </div>
          <h2 className="text-7xl font-semibold text-gradient leading-[0.9] tracking-tighter pb-1">
            Design spaces that breathe.
          </h2>
          <p className="text-foreground-muted text-xl font-medium leading-relaxed mt-8 max-w-sm">
            AI-generated floor plans aligned with Vastu Shastra principles for modern living.
          </p>
        </div>

        {/* Feature bullets — bottom */}
        <div className="relative z-10 p-12 lg:px-24 space-y-5">
          {[
            'Vastu-scored layouts in seconds',
            '16-direction Mandala analysis',
            'Export to PDF & AutoCAD DXF',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-4 group">
              <div className="size-6 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center transition-colors group-hover:border-accent/40 group-hover:bg-accent/5">
                <div className="size-1.5 rounded-full bg-accent" />
              </div>
              <span className="text-foreground-muted font-medium text-sm tracking-tight transition-colors group-hover:text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-transparent relative">
        <div className="w-full max-w-md glass-surface rounded-[2rem] p-10 relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-expo-out">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none" />
          {children}
        </div>
      </div>
    </div>
  )
}
