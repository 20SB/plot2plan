import CompareView from '@/components/compare/CompareView'

export default function ComparePage() {
  return (
    <div className="space-y-8 relative z-10 antialiased">
      <div className="space-y-1">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-gradient">
          AI Plan Comparison
        </h1>
        <p className="text-foreground-muted text-lg">
          Generate the same floor plan with Claude, Gemini &amp; Qwen simultaneously — pick the best layout.
        </p>
      </div>
      <CompareView />
    </div>
  )
}
