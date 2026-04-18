export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-app-bg flex">
      {/* Left panel — visible md+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col bg-app-base border-r border-white/6 relative overflow-hidden">
        {/* Ambient blueprint grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.05" />
            </pattern>
            <pattern id="line-grid" x="0" y="0" width="128" height="128" patternUnits="userSpaceOnUse">
              <path d="M 128 0 L 0 0 0 128" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
          <rect width="100%" height="100%" fill="url(#line-grid)" />
        </svg>

        {/* Brand — top-left */}
        <div className="relative z-10 p-8 flex items-center gap-3">
          <span className="text-app-violet font-bold text-xl tracking-tight">plot2plan</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase bg-app-gold/15 text-app-gold border border-app-gold/25 px-2 py-0.5 rounded-full">
            VASTU AI
          </span>
        </div>

        {/* Center — headline + tagline */}
        <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-12 lg:px-16">
          <h2 className="text-4xl font-semibold text-app-text leading-tight">
            Design spaces that{' '}
            <span className="bg-gradient-to-r from-app-accent to-app-violet bg-clip-text text-transparent">
              breathe
            </span>
          </h2>
          <p className="text-app-soft text-sm leading-relaxed mt-3 max-w-sm">
            AI-generated floor plans aligned with Vastu Shastra principles
          </p>
        </div>

        {/* Feature bullets — bottom */}
        <div className="relative z-10 p-10 lg:px-16 space-y-3">
          {[
            'Vastu-scored layouts in seconds',
            '16-direction Mandala analysis',
            'Export to PDF & AutoCAD DXF',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-app-accent flex-shrink-0" />
              <span className="text-app-soft text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-app-card/80 backdrop-blur-sm border border-white/8 rounded-2xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
