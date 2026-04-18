'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Brain, Lightning, Sparkle, CheckCircle, Clock, Warning, ArrowRight, HouseLine, Compass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MiniFloorPlanCanvas from '@/components/canvas/MiniFloorPlanCanvas'
import type { GeneratedRoom } from '@/lib/claude'

type Provider = 'claude' | 'gemini' | 'qwen'

interface AIResultState {
  status: 'idle' | 'loading' | 'done' | 'error'
  rooms: GeneratedRoom[]
  vastuScore: number
  timingMs: number
  error?: string
  referenceTemplates?: { id: string; description: string | null; vastuScore: number }[]
}

interface FormState {
  title: string
  plotWidth: string
  plotHeight: string
  plotUnit: 'ft' | 'm'
  numFloors: string
  style: string
  facing: string
  rooms: string
}

const PROVIDER_META: Record<Provider, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  claude: {
    label: 'Claude Sonnet',
    color: 'text-orange-400',
    bg: 'border-orange-500/20 bg-orange-500/5',
    icon: <Brain className="size-4" weight="fill" />,
  },
  gemini: {
    label: 'Gemini 2.0 Flash',
    color: 'text-blue-400',
    bg: 'border-blue-500/20 bg-blue-500/5',
    icon: <Sparkle className="size-4" weight="fill" />,
  },
  qwen: {
    label: 'Qwen Max',
    color: 'text-emerald-400',
    bg: 'border-emerald-500/20 bg-emerald-500/5',
    icon: <Lightning className="size-4" weight="fill" />,
  },
}

const PROVIDERS: Provider[] = ['claude', 'gemini', 'qwen']

const STYLES = ['Modern', 'Contemporary', 'Traditional', 'Minimalist', 'Vastu Classic', 'Luxury', 'Farmhouse', 'Colonial']
const FACINGS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']

function vastuBadge(score: number) {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  return 'text-red-400 bg-red-500/10 border-red-500/20'
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  )
}

export default function CompareView() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    title: 'My Floor Plan',
    plotWidth: '40',
    plotHeight: '60',
    plotUnit: 'ft',
    numFloors: '1',
    style: 'Modern',
    facing: 'North',
    rooms: 'living_room, dining_room, kitchen, master_bedroom, bedroom, bathroom, pooja_room',
  })

  const [results, setResults] = useState<Record<Provider, AIResultState>>({
    claude: { status: 'idle', rooms: [], vastuScore: 0, timingMs: 0 },
    gemini: { status: 'idle', rooms: [], vastuScore: 0, timingMs: 0 },
    qwen:   { status: 'idle', rooms: [], vastuScore: 0, timingMs: 0 },
  })

  const [saving, setSaving] = useState<Provider | null>(null)
  const [hasCompared, setHasCompared] = useState(false)

  const setResult = useCallback((provider: Provider, update: Partial<AIResultState>) => {
    setResults(prev => ({ ...prev, [provider]: { ...prev[provider], ...update } }))
  }, [])

  const compareAll = useCallback(async () => {
    const roomList = form.rooms.split(',').map(r => r.trim()).filter(Boolean)
    if (roomList.length === 0) { toast.error('Add at least one room type'); return }

    const payload = {
      title: form.title,
      plotWidth: parseFloat(form.plotWidth),
      plotHeight: parseFloat(form.plotHeight),
      plotUnit: form.plotUnit,
      numFloors: parseInt(form.numFloors),
      style: form.style,
      facing: form.facing,
      rooms: roomList,
    }

    if (isNaN(payload.plotWidth) || isNaN(payload.plotHeight)) {
      toast.error('Enter valid plot dimensions'); return
    }

    // Set all to loading
    PROVIDERS.forEach(p => setResult(p, { status: 'loading', rooms: [], vastuScore: 0, timingMs: 0, error: undefined }))
    setHasCompared(true)

    // Fire all 3 in parallel — each resolves independently
    const calls = PROVIDERS.map(async (provider) => {
      try {
        const res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, provider }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed')
        setResult(provider, {
          status: 'done',
          rooms: data.rooms,
          vastuScore: data.vastuScore,
          timingMs: data.timingMs,
          referenceTemplates: data.referenceTemplates,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setResult(provider, { status: 'error', error: msg, rooms: [], vastuScore: 0, timingMs: 0 })
      }
    })

    await Promise.allSettled(calls)
  }, [form, setResult])

  const saveProject = useCallback(async (provider: Provider) => {
    const result = results[provider]
    if (result.status !== 'done') return
    setSaving(provider)
    try {
      const roomList = form.rooms.split(',').map(r => r.trim()).filter(Boolean)
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${form.title} (${PROVIDER_META[provider].label})`,
          plotWidth: parseFloat(form.plotWidth),
          plotHeight: parseFloat(form.plotHeight),
          plotUnit: form.plotUnit,
          numFloors: parseInt(form.numFloors),
          style: form.style,
          facing: form.facing,
          rooms: roomList,
          preGeneratedRooms: result.rooms,
        }),
      })
      const project = await res.json()
      if (!res.ok) throw new Error(project.error ?? 'Save failed')
      toast.success('Project saved!')
      router.push(`/project/${project.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }, [form, results, router])

  const updateForm = (key: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="glass-surface rounded-2xl p-6 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-5">
          <HouseLine className="size-5 text-accent" weight="duotone" />
          <h2 className="font-semibold text-sm tracking-tight">Plot Details</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Project Title</Label>
            <Input value={form.title} onChange={e => updateForm('title')(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08] text-sm h-9" />
          </div>

          <div>
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Width</Label>
            <Input value={form.plotWidth} onChange={e => updateForm('plotWidth')(e.target.value)}
              type="number" className="bg-white/[0.03] border-white/[0.08] text-sm h-9" />
          </div>
          <div>
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Height</Label>
            <Input value={form.plotHeight} onChange={e => updateForm('plotHeight')(e.target.value)}
              type="number" className="bg-white/[0.03] border-white/[0.08] text-sm h-9" />
          </div>

          <div>
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Unit</Label>
            <Select value={form.plotUnit} onValueChange={v => updateForm('plotUnit')(v ?? '')}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-sm h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ft">ft</SelectItem><SelectItem value="m">m</SelectItem></SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Floors</Label>
            <Select value={form.numFloors} onValueChange={v => updateForm('numFloors')(v ?? '1')}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-sm h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Style</Label>
            <Select value={form.style} onValueChange={v => updateForm('style')(v ?? 'Modern')}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-sm h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Facing</Label>
            <Select value={form.facing} onValueChange={v => updateForm('facing')(v ?? 'North')}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-sm h-9">
                <div className="flex items-center gap-1.5"><Compass className="size-3 text-foreground-muted" /><SelectValue /></div>
              </SelectTrigger>
              <SelectContent>{FACINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-3">
            <Label className="text-[11px] text-foreground-muted mb-1.5 block">Room Types (comma-separated)</Label>
            <Input value={form.rooms} onChange={e => updateForm('rooms')(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08] text-sm h-9 font-mono text-xs" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            onClick={compareAll}
            disabled={PROVIDERS.some(p => results[p].status === 'loading')}
            className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 h-9 text-sm gap-2"
          >
            <Lightning className="size-4" weight="fill" />
            {PROVIDERS.some(p => results[p].status === 'loading') ? 'Comparing…' : 'Compare All 3 AIs'}
          </Button>
          {hasCompared && (
            <span className="text-[11px] text-foreground-muted">
              {PROVIDERS.filter(p => results[p].status === 'done').length}/3 results ready
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {hasCompared && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PROVIDERS.map(provider => {
            const result = results[provider]
            const meta = PROVIDER_META[provider]

            return (
              <div key={provider} className={`rounded-2xl border p-4 space-y-4 transition-all duration-300 ${meta.bg}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={meta.color}>{meta.icon}</span>
                    <span className={`font-semibold text-sm ${meta.color}`}>{meta.label}</span>
                  </div>
                  {result.status === 'done' && (
                    <span className="text-[10px] text-foreground-muted flex items-center gap-1">
                      <Clock className="size-3" />{(result.timingMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>

                {/* Canvas / States */}
                {result.status === 'idle' && (
                  <div className="h-48 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                    <span className="text-xs text-foreground-muted">Waiting…</span>
                  </div>
                )}

                {result.status === 'loading' && (
                  <div className="h-48 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center gap-3">
                    <div className="size-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    <span className="text-xs text-foreground-muted">Generating layout…</span>
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="h-48 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center gap-2 p-4">
                    <Warning className="size-6 text-red-400" weight="duotone" />
                    <span className="text-xs text-red-400 text-center">{result.error}</span>
                  </div>
                )}

                {result.status === 'done' && (
                  <div className="space-y-3">
                    <MiniFloorPlanCanvas
                      rooms={result.rooms}
                      plotWidth={parseFloat(form.plotWidth)}
                      plotHeight={parseFloat(form.plotHeight)}
                      maxWidth={280}
                      className="w-full"
                    />

                    {/* Vastu score */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-foreground-muted">Vastu Score</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vastuBadge(result.vastuScore)}`}>
                          {result.vastuScore >= 80 ? 'Excellent' : result.vastuScore >= 60 ? 'Good' : 'Fair'}
                        </span>
                      </div>
                      <ScoreMeter score={result.vastuScore} />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.06]">
                        <div className="text-[10px] text-foreground-muted mb-0.5">Rooms</div>
                        <div className="text-sm font-bold">{result.rooms.length}</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.06]">
                        <div className="text-[10px] text-foreground-muted mb-0.5">Floor Area</div>
                        <div className="text-sm font-bold">
                          {Math.round(
                            result.rooms.reduce((s, r) => s + r.width * r.height, 0)
                          )} {form.plotUnit}²
                        </div>
                      </div>
                    </div>

                    {/* Reference hint */}
                    {result.referenceTemplates && result.referenceTemplates.length > 0 && (
                      <p className="text-[10px] text-foreground-muted border-t border-white/[0.06] pt-2">
                        Used {result.referenceTemplates.length} reference template(s) · best match: {result.referenceTemplates[0].vastuScore}/100 Vastu
                      </p>
                    )}

                    {/* Save CTA */}
                    <Button
                      onClick={() => saveProject(provider)}
                      disabled={saving !== null}
                      className="w-full h-8 text-xs font-semibold gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-foreground"
                    >
                      {saving === provider ? (
                        <div className="size-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="size-3.5" weight="fill" />
                      )}
                      Save as Project
                      <ArrowRight className="size-3 ml-auto" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
