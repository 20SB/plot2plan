'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Brain, Lightning, Sparkle, CheckCircle, Clock, Warning, ArrowRight, Compass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import MiniFloorPlanCanvas from '@/components/canvas/MiniFloorPlanCanvas'
import type { GeneratedRoom } from '@/lib/claude'

type Provider = 'claude' | 'gemini' | 'opus'

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

const PROVIDER_META: Record<Provider, { label: string; sub: string; iconColor: string; icon: React.ReactNode }> = {
  claude: {
    label: 'Claude Sonnet 4.5',
    sub: 'Anthropic',
    iconColor: 'text-orange-400',
    icon: <Brain className="size-5" weight="fill" />,
  },
  gemini: {
    label: 'Gemini 2.5 Flash',
    sub: 'Google',
    iconColor: 'text-blue-400',
    icon: <Sparkle className="size-5" weight="fill" />,
  },
  opus: {
    label: 'Claude Opus 4.5',
    sub: 'Anthropic · Most Capable',
    iconColor: 'text-violet-400',
    icon: <Lightning className="size-5" weight="fill" />,
  },
}

const PROVIDERS: Provider[] = ['claude', 'gemini', 'opus']
const STYLES = ['Modern', 'Contemporary', 'Traditional', 'Minimalist', 'Vastu Classic', 'Luxury', 'Farmhouse', 'Colonial']
const FACINGS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']

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
    opus:   { status: 'idle', rooms: [], vastuScore: 0, timingMs: 0 },
  })

  const [saving, setSaving] = useState<Provider | null>(null)
  const [hasCompared, setHasCompared] = useState(false)

  const setResult = useCallback((provider: Provider, update: Partial<AIResultState>) => {
    setResults(prev => ({ ...prev, [provider]: { ...prev[provider], ...update } }))
  }, [])

  const updateForm = (key: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const compareAll = useCallback(async () => {
    const roomList = form.rooms.split(',').map(r => r.trim()).filter(Boolean)
    if (roomList.length === 0) { toast.error('Add at least one room type'); return }

    const pw = parseFloat(form.plotWidth)
    const ph = parseFloat(form.plotHeight)
    if (isNaN(pw) || isNaN(ph)) { toast.error('Enter valid plot dimensions'); return }

    const payload = {
      title: form.title,
      plotWidth: pw,
      plotHeight: ph,
      plotUnit: form.plotUnit,
      numFloors: parseInt(form.numFloors),
      style: form.style,
      facing: form.facing,
      rooms: roomList,
    }

    PROVIDERS.forEach(p => setResult(p, { status: 'loading', rooms: [], vastuScore: 0, timingMs: 0, error: undefined }))
    setHasCompared(true)

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
        setResult(provider, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
          rooms: [], vastuScore: 0, timingMs: 0,
        })
      }
    })

    await Promise.allSettled(calls)
  }, [form, setResult])

  const saveProject = useCallback(async (provider: Provider) => {
    const result = results[provider]
    if (result.status !== 'done') return
    setSaving(provider)
    try {
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
          rooms: form.rooms.split(',').map(r => r.trim()).filter(Boolean),
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

  const isLoading = PROVIDERS.some(p => results[p].status === 'loading')
  const doneCount = PROVIDERS.filter(p => results[p].status === 'done').length

  return (
    <div className="space-y-8">

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <SpotlightCard className="p-8">
        <div className="space-y-6">
          {/* Section heading */}
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] font-black text-foreground-muted uppercase tracking-widest whitespace-nowrap">
              Plot Configuration
            </span>
            <span className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Project Title
              </Label>
              <Input
                value={form.title}
                onChange={e => updateForm('title')(e.target.value)}
                placeholder="The Riverside Villa"
                className="h-12 rounded-xl text-base font-semibold"
              />
            </div>

            <div>
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Style
              </Label>
              <Select value={form.style} onValueChange={v => updateForm('style')(v ?? 'Modern')}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Facing
              </Label>
              <Select value={form.facing} onValueChange={v => updateForm('facing')(v ?? 'North')}>
                <SelectTrigger className="h-12 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Compass className="size-3.5 text-foreground-muted" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {FACINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Width
              </Label>
              <Input
                value={form.plotWidth}
                onChange={e => updateForm('plotWidth')(e.target.value)}
                type="number"
                className="h-12 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Height
              </Label>
              <Input
                value={form.plotHeight}
                onChange={e => updateForm('plotHeight')(e.target.value)}
                type="number"
                className="h-12 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Unit
              </Label>
              <Select value={form.plotUnit} onValueChange={v => updateForm('plotUnit')(v ?? 'ft')}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ft">Feet (ft)</SelectItem>
                  <SelectItem value="m">Metres (m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
                Floors
              </Label>
              <Select value={form.numFloors} onValueChange={v => updateForm('numFloors')(v ?? '1')}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n} Floor{n > 1 ? 's' : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3 — Rooms */}
          <div>
            <Label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest px-1 mb-2 block">
              Room Types <span className="normal-case font-medium">(comma-separated)</span>
            </Label>
            <Input
              value={form.rooms}
              onChange={e => updateForm('rooms')(e.target.value)}
              className="h-12 rounded-xl font-mono text-sm"
              placeholder="living_room, kitchen, master_bedroom, bedroom, bathroom"
            />
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={compareAll}
              disabled={isLoading}
              size="lg"
              className="rounded-xl gap-2"
            >
              <Lightning className="size-4" weight="fill" />
              {isLoading ? 'Comparing…' : 'Compare All 3 AIs'}
            </Button>
            {hasCompared && (
              <span className="text-[11px] font-black text-foreground-muted uppercase tracking-widest">
                {doneCount} / 3 results ready
              </span>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {hasCompared && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PROVIDERS.map(provider => {
            const result = results[provider]
            const meta = PROVIDER_META[provider]

            return (
              <SpotlightCard key={provider} className="p-0 overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center ${meta.iconColor}`}>
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-foreground">{meta.label}</p>
                      <p className="text-[11px] text-foreground-muted font-medium">{meta.sub}</p>
                    </div>
                  </div>
                  {result.status === 'done' && (
                    <div className="flex items-center gap-1 text-foreground-muted">
                      <Clock className="size-3" />
                      <span className="text-[11px] font-mono">{(result.timingMs / 1000).toFixed(1)}s</span>
                    </div>
                  )}
                  {result.status === 'loading' && (
                    <div className="size-4 border border-white/20 border-t-white/70 rounded-full animate-spin" />
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Idle */}
                  {result.status === 'idle' && (
                    <div className="h-44 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                      <span className="text-[11px] font-black text-foreground-muted uppercase tracking-widest">Waiting…</span>
                    </div>
                  )}

                  {/* Loading */}
                  {result.status === 'loading' && (
                    <div className="h-44 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center gap-3">
                      <div className="size-8 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
                      <span className="text-[11px] font-black text-foreground-muted uppercase tracking-widest">Generating layout…</span>
                    </div>
                  )}

                  {/* Error */}
                  {result.status === 'error' && (
                    <div className="h-44 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col items-center justify-center gap-3 px-6">
                      <Warning className="size-8 text-rose-400" weight="duotone" />
                      <p className="text-[11px] font-bold text-rose-400 text-center leading-relaxed">{result.error}</p>
                    </div>
                  )}

                  {/* Done */}
                  {result.status === 'done' && (
                    <>
                      {/* Canvas */}
                      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                        <MiniFloorPlanCanvas
                          rooms={result.rooms}
                          plotWidth={parseFloat(form.plotWidth)}
                          plotHeight={parseFloat(form.plotHeight)}
                          maxWidth={320}
                          className="w-full !rounded-none !border-0"
                        />
                      </div>

                      {/* Vastu score */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-foreground-muted uppercase tracking-widest">Vastu Score</span>
                          <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                            result.vastuScore >= 75
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : result.vastuScore >= 50
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            VASTU: {result.vastuScore}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${result.vastuScore}%`,
                              backgroundColor: result.vastuScore >= 75 ? '#10b981' : result.vastuScore >= 50 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats badges */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-foreground-subtle uppercase tracking-widest">
                          {result.rooms.length} rooms
                        </span>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-foreground-subtle uppercase tracking-widest">
                          {Math.round(result.rooms.reduce((s, r) => s + r.width * r.height, 0))} {form.plotUnit}²
                        </span>
                        {result.referenceTemplates && result.referenceTemplates.length > 0 && (
                          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-accent uppercase tracking-widest">
                            RAG ✓
                          </span>
                        )}
                      </div>

                      {/* Save CTA */}
                      <Button
                        onClick={() => saveProject(provider)}
                        disabled={saving !== null}
                        size="lg"
                        className="w-full rounded-xl gap-2"
                      >
                        {saving === provider
                          ? <div className="size-4 border border-white/30 border-t-white rounded-full animate-spin" />
                          : <CheckCircle className="size-4" weight="fill" />
                        }
                        Save as Project
                        <ArrowRight className="size-4 ml-auto" />
                      </Button>
                    </>
                  )}
                </div>
              </SpotlightCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
