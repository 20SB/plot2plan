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
  DialogHeader,
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
import { Loader2 } from 'lucide-react'

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
      <DialogContent className="bg-app-card border border-white/10 text-app-text max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <DialogHeader className="pb-2 border-b border-white/8 mb-5">
          <DialogTitle className="text-app-text font-semibold text-base tracking-tight">New Floor Plan Project</DialogTitle>
          <DialogDescription className="text-app-soft text-sm mt-1">
            Configure your plot dimensions and room requirements.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* BHK Category */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-app-soft uppercase tracking-wider">
              Home Configuration
            </label>
            <div className="flex gap-2 flex-wrap">
              {BHK_TEMPLATES.map((template) => (
                <button
                  key={template.bhkType}
                  type="button"
                  onClick={() => {
                    setSelectedBHK(template.bhkType)
                    // Auto-populate rooms from template using display names
                    const templateRooms = template.rooms.map(r => r.name)
                    setSelectedRooms(templateRooms)
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedBHK === template.bhkType
                      ? 'bg-app-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                      : 'bg-app-input border border-white/8 text-app-soft hover:border-white/16 hover:text-app-text'
                  }`}
                >
                  <span className="block font-semibold">{template.label}</span>
                  <span className="block text-[10px] opacity-70 mt-0.5">
                    {template.rooms.filter(r => r.type !== 'foyer' && r.type !== 'utility').length} rooms
                  </span>
                </button>
              ))}
            </div>
            <p className="text-app-faint text-[10px]">
              {BHK_TEMPLATES.find(t => t.bhkType === selectedBHK)?.description}
            </p>
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Project Title</Label>
            <Input
              {...register('title')}
              placeholder="Villa Sunrise"
              className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5"
            />
            {errors.title && <p className="text-app-danger text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Plot dimensions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Width</Label>
              <Input
                {...register('plotWidth')}
                type="number"
                placeholder="60"
                className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5"
              />
              {errors.plotWidth && (
                <p className="text-app-danger text-xs mt-1">{errors.plotWidth.message}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Height</Label>
              <Input
                {...register('plotHeight')}
                type="number"
                placeholder="40"
                className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5"
              />
              {errors.plotHeight && (
                <p className="text-app-danger text-xs mt-1">{errors.plotHeight.message}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Unit</Label>
              <Controller
                name="plotUnit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-app-input border-white/10 text-app-text h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-app-card border border-white/10">
                      <SelectItem value="ft" className="text-app-text">ft</SelectItem>
                      <SelectItem value="m" className="text-app-text">m</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Floors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Floors</Label>
              <Input
                {...register('numFloors')}
                type="number"
                min={1}
                max={5}
                className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Facing</Label>
              <Controller
                name="facing"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-app-input border-white/10 text-app-text h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-app-card border border-white/10">
                      {FACINGS.map(f => (
                        <SelectItem key={f} value={f} className="text-app-text">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Architectural Style</Label>
            <Controller
              name="style"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-app-input border-white/10 text-app-text h-10 rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-app-card border border-white/10">
                    {STYLES.map(s => (
                      <SelectItem key={s} value={s} className="text-app-text">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Rooms */}
          <div>
            <Label className="text-xs font-medium text-app-soft uppercase tracking-wider mb-1.5">Rooms to Include</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ROOM_OPTIONS.map(room => (
                <span
                  key={room}
                  onClick={() => toggleRoom(room)}
                  className={
                    selectedRooms.includes(room)
                      ? 'bg-app-accent/15 border border-app-accent/40 text-app-violet text-xs rounded-xl px-3 py-1.5 cursor-pointer transition-all hover:bg-app-accent/20'
                      : 'bg-app-input border border-white/8 text-app-faint text-xs rounded-xl px-3 py-1.5 cursor-pointer transition-all hover:border-white/16 hover:text-app-soft'
                  }
                >
                  {room}
                </span>
              ))}
            </div>
            <p className="text-app-faint text-xs mt-2">{selectedRooms.length} rooms selected</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-app-soft hover:text-app-text hover:bg-white/5 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-app-accent hover:bg-app-accent-dim text-white rounded-xl font-medium shadow-[0_0_16px_rgba(99,102,241,0.2)] transition-all"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating&hellip;</>
              ) : (
                'Generate with AI'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
