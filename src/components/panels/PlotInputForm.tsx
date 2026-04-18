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
  DialogFooter,
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
import { Loader2, Layout } from 'lucide-react'

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
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-premium-hover">
        <div className="bg-primary/5 p-10 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
               <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-premium">
                <Layout className="text-white w-6 h-6" />
               </div>
               <DialogTitle className="text-3xl">New Project</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground font-medium">
              Configure your plot dimensions and architectural choices. <br/>
              Our AI will generate a Vastu-compliant layout in seconds.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8 bg-background">
          {/* BHK Category */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Home Configuration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BHK_TEMPLATES.map((template) => (
                <button
                  key={template.bhkType}
                  type="button"
                  onClick={() => {
                    setSelectedBHK(template.bhkType)
                    const templateRooms = template.rooms.map(r => r.name)
                    setSelectedRooms(templateRooms)
                  }}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    selectedBHK === template.bhkType
                      ? 'border-primary bg-primary/5 shadow-premium'
                      : 'border-muted bg-muted/20 hover:border-primary/20 hover:bg-muted/40'
                  }`}
                >
                  <span className={`block text-sm font-black italic tracking-tighter ${selectedBHK === template.bhkType ? 'text-primary' : 'text-foreground'}`}>{template.label}</span>
                  <span className="block text-[10px] font-bold text-muted-foreground mt-1 uppercase">
                    {template.rooms.filter(r => r.type !== 'foyer' && r.type !== 'utility').length} Zones
                  </span>
                  {selectedBHK === template.bhkType && (
                    <div className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-1">
               <p className="text-muted-foreground text-[10px] font-bold italic">
                &quot;{BHK_TEMPLATES.find(t => t.bhkType === selectedBHK)?.description}&quot;
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
               <span className="h-px flex-1 bg-border" />
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Plot Intelligence</span>
               <span className="h-px flex-1 bg-border" />
            </div>

            {/* Title */}
            <div>
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Project Title</Label>
              <Input
                {...register('title')}
                placeholder="The Riverside Villa"
                className="h-12 rounded-xl text-lg font-bold"
              />
              {errors.title && <p className="text-destructive text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.title.message}</p>}
            </div>

            {/* Plot dimensions */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Width</Label>
                <Input
                  {...register('plotWidth')}
                  type="number"
                  className="h-12 rounded-xl font-mono font-bold"
                />
              </div>
              <div className="col-span-1">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Length</Label>
                <Input
                  {...register('plotHeight')}
                  type="number"
                  className="h-12 rounded-xl font-mono font-bold"
                />
              </div>
              <div className="col-span-1">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Unit</Label>
                <Controller
                  name="plotUnit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ft">FEET (FT)</SelectItem>
                        <SelectItem value="m">METERS (M)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Floors and Facing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Floors</Label>
                <Input
                  {...register('numFloors')}
                  type="number"
                  className="h-12 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Plot Facing</Label>
                <Controller
                  name="facing"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FACINGS.map(f => (
                          <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Style */}
            <div>
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 block">Architectural Aura</Label>
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => (
                        <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Rooms */}
            <div>
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-3 block">Selected Zones</Label>
              <div className="flex flex-wrap gap-2">
                {ROOM_OPTIONS.map(room => (
                  <span
                    key={room}
                    onClick={() => toggleRoom(room)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer border transition-all duration-300 shadow-sm ${
                      selectedRooms.includes(room)
                        ? 'bg-primary text-white border-primary border-2 scale-105'
                        : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {room}
                  </span>
                ))}
              </div>
              <div className="mt-4 px-1 flex items-center justify-between">
                 <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{selectedRooms.length} Zones Locked</span>
                 <Button variant="link" size="sm" type="button" onClick={() => setSelectedRooms([])} className="h-auto p-0 text-[10px] h-auto p-0 font-bold text-destructive uppercase tracking-widest">Clear All</Button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-2xl h-14 font-black"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl h-14 font-black text-lg shadow-premium group transition-all"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> ARCHITECTING...</>
              ) : (
                <span className="flex items-center gap-2">GENERATE BLUEPRINT <Layout className="size-5 transition-transform group-hover:translate-x-1" /></span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
