'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    <Card className="col-span-1 md:col-span-2 bg-white/[0.02] border-white/[0.06] backdrop-blur-xl overflow-hidden group">
      <CardHeader>
        <CardTitle className="text-gradient">Elemental Balance</CardTitle>
        <CardDescription className="text-foreground-muted">
          Energy distribution across the five primordial elements.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }} 
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
      </CardContent>
      <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
         <div className="size-2 rounded-full bg-accent shadow-accent-glow animate-pulse" />
      </div>
    </Card>
  )
}
