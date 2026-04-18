'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import type { Room } from '@/types'

const ELEMENTS = ['FIRE', 'WATER', 'EARTH', 'AIR', 'SPACE']

interface Props {
  rooms: Room[]
}

export function EnergyRadar({ rooms }: Props) {
  // Aggregate room scores by element
  const data = ELEMENTS.map(el => {
    const elementRooms = rooms.filter(r => r.element === el)
    const avgScore = elementRooms.length > 0
      ? elementRooms.reduce((sum, r) => sum + r.vastuScore, 0) / elementRooms.length
      : 0
    
    return {
      subject: el,
      A: avgScore || 20, // baseline for visualization if zero
      fullMark: 100,
    }
  })

  return (
    <SpotlightCard className="col-span-1 md:col-span-2 h-full flex flex-col items-center justify-center p-0 border-white/[0.08] overflow-hidden group">
      <div className="w-full p-5 border-b border-white/[0.04] bg-white/[0.01]">
        <h3 className="text-[10px] font-mono font-bold text-foreground-subtle uppercase tracking-[0.2em]">Elemental Balance</h3>
      </div>
      
      <div className="flex-1 w-full h-[320px] pt-4 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }} 
            />
            <Radar
              name="Vastu"
              dataKey="A"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.15}
              className="animate-in fade-in zoom-in-95 duration-1000"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute top-5 right-5 z-20">
         <div className="size-1.5 rounded-full bg-accent shadow-accent-glow animate-pulse" />
      </div>
    </SpotlightCard>
  )
}
