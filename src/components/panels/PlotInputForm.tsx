'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BHK_TEMPLATES, type BHKTemplate } from '@/lib/floor-plan-engine'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Layout, Sparkles } from 'lucide-react'

const ROOM_OPTIONS = [
  'Living Room', 'Master Bedroom', 'Bedroom', 'Kitchen', 'Bathroom',
  'Toilet', 'Study', 'Pooja Room', 'Guest Room', 'Dining Room',
  'Store Room', 'Garage', 'Verandah', 'Staircase',
]

const STYLES = ['Modern', 'Traditional', 'Contemporary', 'Minimalist', 'Colonial', 'Vastu Classic']
const FACINGS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  plotWidth: z.coerce.number().positive('Must be positive'),
  plotHeight: z.coerce.number().positive('Must be positive'),
  plotUnit: z.enum(['ft', 'm']),
  numFloors: z.coerce.number().int().min(1).max(5),
  style: z.string(),
  facing: z.string(),
})
type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export function PlotInputForm({ open, onClose }: Props) {
  const router = useRouter()
  const [selectedBHK, setSelectedBHK] = useState<BHKTemplate['bhkType']>('2BHK')
  const [selectedRooms, setSelectedRooms] = useState<string[]>([
    'Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom',
  ])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { plotUnit: 'ft', numFloors: 1, style: 'Modern', facing: 'North' },
  })

  const toggleRoom = (room: string) => {
    setSelectedRooms(prev =>
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    )
  }

  const onSubmit = async (data: FormOutput) => {
    if (selectedRooms.length === 0) {
      toast.error('Select at least one room')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, rooms: selectedRooms, bhkType: selectedBHK }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to generate layout')
      } else {
        toast.success('Layout generated!')
        onClose()
        router.push(`/project/${json.id}`)
        router.refresh()
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl p-0 border-white/[0.08] overflow-hidden rounded-3xl"
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="size-9 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
                <Layout className="size-4 text-accent" />
              </div>
              <DialogTitle className="text-[22px] font-semibold tracking-[-0.02em] text-gradient">
                New Project
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-foreground-muted leading-relaxed pl-12">
              Configure your plot — AI generates a Vastu-compliant layout in seconds.
            </DialogDescription>
          </div>

          {/* Scrollable body */}
          <div className="px-6 py-5 space-y-5 custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>

            {/* BHK selection */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">
                Home Configuration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BHK_TEMPLATES.map((template) => (
                  <button
                    key={template.bhkType}
                    type="button"
                    onClick={() => {
                      setSelectedBHK(template.bhkType)
                      setSelectedRooms(template.rooms.map(r => r.name))
                    }}
                    className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      selectedBHK === template.bhkType
                        ? 'border-accent/40 bg-accent/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`block text-sm font-semibold tracking-tight ${selectedBHK === template.bhkType ? 'text-accent' : 'text-foreground'}`}>
                      {template.label}
                    </span>
                    <span className="block text-[10px] font-mono font-bold text-foreground-muted mt-0.5 uppercase">
                      {template.rooms.filter(r => r.type !== 'foyer' && r.type !== 'utility').length} zones
                    </span>
                    {selectedBHK === template.bhkType && (
                      <div className="absolute top-2 right-2 size-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-mono text-foreground-subtle">
                {BHK_TEMPLATES.find(t => t.bhkType === selectedBHK)?.description}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] font-mono font-bold text-foreground-subtle uppercase tracking-widest">Plot Details</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* Project title */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Project Title</Label>
              <Input
                {...register('title')}
                placeholder="The Riverside Villa"
                className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] text-base font-medium placeholder:text-foreground-subtle focus-visible:border-accent/40 focus-visible:ring-1 focus-visible:ring-accent/30"
              />
              {errors.title && <p className="text-destructive text-[11px] font-mono">{errors.title.message}</p>}
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Width</Label>
                <Input
                  {...register('plotWidth')}
                  type="number"
                  className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] font-mono font-medium focus-visible:border-accent/40 focus-visible:ring-1 focus-visible:ring-accent/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Length</Label>
                <Input
                  {...register('plotHeight')}
                  type="number"
                  className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] font-mono font-medium focus-visible:border-accent/40 focus-visible:ring-1 focus-visible:ring-accent/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Unit</Label>
                <Controller
                  name="plotUnit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ft">ft</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Floors & Facing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Floors</Label>
                <Input
                  {...register('numFloors')}
                  type="number"
                  className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] font-mono font-medium focus-visible:border-accent/40 focus-visible:ring-1 focus-visible:ring-accent/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Plot Facing</Label>
                <Controller
                  name="facing"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FACINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Architectural style */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Architectural Style</Label>
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Zones */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-mono font-bold text-foreground-muted uppercase tracking-widest">Selected Zones</Label>
                <button
                  type="button"
                  onClick={() => setSelectedRooms([])}
                  className="text-[10px] font-mono font-bold text-foreground-subtle hover:text-destructive transition-colors uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_OPTIONS.map(room => (
                  <button
                    key={room}
                    type="button"
                    onClick={() => toggleRoom(room)}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all duration-200 border ${
                      selectedRooms.includes(room)
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : 'bg-white/[0.03] text-foreground-muted border-white/[0.06] hover:border-white/[0.12] hover:text-foreground'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-mono text-foreground-subtle">{selectedRooms.length} zones selected</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3" style={{ flexShrink: 0 }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Blueprint</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
