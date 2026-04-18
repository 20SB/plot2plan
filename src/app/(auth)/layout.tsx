export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background flex">
      {/* Left panel — visible md+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col bg-muted/30 border-r relative overflow-hidden pattern-grid-slate-200">
        {/* Brand — top-left */}
        <div className="relative z-10 p-10 flex items-center gap-4">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-premium">
             <span className="text-white font-black text-xl">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-black text-xl tracking-tighter leading-none">Plot2Plan</span>
            <span className="text-[10px] font-black tracking-widest uppercase text-primary mt-1">
              Architectural AI
            </span>
          </div>
        </div>

        {/* Center — headline + tagline */}
        <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-12 lg:px-20">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Next-Gen Vastu Engine</span>
          </div>
          <h2 className="text-6xl font-black text-foreground leading-[0.95] tracking-tighter max-w-lg">
            Design spaces that{' '}
            <span className="text-primary italic">
              breathe
            </span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mt-6 max-w-sm">
            AI-generated floor plans aligned with Vastu Shastra principles for modern living.
          </p>
        </div>

        {/* Feature bullets — bottom */}
        <div className="relative z-10 p-10 lg:px-20 space-y-4">
          {[
            'Vastu-scored layouts in seconds',
            '16-direction Mandala analysis',
            'Export to PDF & AutoCAD DXF',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-4">
              <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="size-2 rounded-full bg-primary" />
              </div>
              <span className="text-foreground font-bold text-sm tracking-tight">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Abstract shape */}
        <div className="absolute -bottom-24 -left-24 size-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right panel — form area */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-3xl opacity-30" />
        <div className="w-full max-w-md bg-background/60 backdrop-blur-xl border rounded-[2rem] shadow-premium-hover p-12 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </div>
    </div>
  )
}
