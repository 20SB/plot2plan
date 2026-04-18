'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps extends React.HTMLAttributes<divElement> {
  children: React.ReactNode
  glowColor?: string
  glowOpacity?: number
  glowSize?: number
}

export function SpotlightCard({
  children,
  className,
  glowColor = '#5E6AD2',
  glowOpacity = 0.15,
  glowSize = 300,
  ...props
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setOpacity(1)
  const handleMouseLeave = () => setOpacity(0)

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-colors hover:border-white/[0.12]',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${glowSize}px circle at ${position.x}px ${position.y}px, ${glowColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}, transparent 80%)`,
        }}
      />
      
      {/* Top Edge Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />
      
      <div className="relative z-10">{children}</div>
    </div>
  )
}
