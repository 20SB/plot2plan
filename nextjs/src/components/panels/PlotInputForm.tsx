'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { Badge } from '@/components/ui/badge'

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
        body: JSON.stringify({ ...data, rooms: selectedRooms }),
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
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono">NEW FLOOR PLAN</DialogTitle>
          <DialogDescription className="text-slate-400">
            AI will generate a Vastu-compliant layout
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Title */}
          <div>
            <Label className="text-slate-300 text-xs font-mono">PROJECT TITLE</Label>
            <Input
              {...register('title')}
              placeholder="Villa Sunrise"
              className="bg-slate-800 border-slate-600 text-white mt-1"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Plot dimensions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-slate-300 text-xs font-mono">WIDTH</Label>
              <Input
                {...register('plotWidth')}
                type="number"
                placeholder="60"
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
              {errors.plotWidth && (
                <p className="text-red-400 text-xs mt-1">{errors.plotWidth.message}</p>
              )}
            </div>
            <div>
              <Label className="text-slate-300 text-xs font-mono">HEIGHT</Label>
              <Input
                {...register('plotHeight')}
                type="number"
                placeholder="40"
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
              {errors.plotHeight && (
                <p className="text-red-400 text-xs mt-1">{errors.plotHeight.message}</p>
              )}
            </div>
            <div>
              <Label className="text-slate-300 text-xs font-mono">UNIT</Label>
              <Controller
                name="plotUnit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="ft" className="text-white">ft</SelectItem>
                      <SelectItem value="m" className="text-white">m</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Floors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs font-mono">FLOORS</Label>
              <Input
                {...register('numFloors')}
                type="number"
                min={1}
                max={5}
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs font-mono">FACING</Label>
              <Controller
                name="facing"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {FACINGS.map(f => (
                        <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <Label className="text-slate-300 text-xs font-mono">ARCHITECTURAL STYLE</Label>
            <Controller
              name="style"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {STYLES.map(s => (
                      <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Rooms */}
          <div>
            <Label className="text-slate-300 text-xs font-mono">ROOMS TO INCLUDE</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ROOM_OPTIONS.map(room => (
                <Badge
                  key={room}
                  onClick={() => toggleRoom(room)}
                  className={`cursor-pointer font-mono text-xs transition-colors ${
                    selectedRooms.includes(room)
                      ? 'bg-cyan-700 hover:bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                  variant="outline"
                >
                  {room}
                </Badge>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">{selectedRooms.length} rooms selected</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono tracking-wider"
            >
              {loading ? 'GENERATING...' : 'GENERATE LAYOUT'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
