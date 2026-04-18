import { Lightning } from '@phosphor-icons/react/dist/ssr'
import CompareView from '@/components/compare/CompareView'

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightning className="size-5 text-accent" weight="duotone" />
          <h1 className="text-lg font-bold tracking-tight">AI Plan Comparison</h1>
        </div>
        <p className="text-sm text-foreground-muted">
          Generate the same floor plan with Claude, Gemini, and Qwen simultaneously. Compare layouts, Vastu scores, and pick the best.
        </p>
      </div>

      <CompareView />
    </div>
  )
}
