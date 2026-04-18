'use client'

import { useEffect, useState } from 'react'

export function BackgroundSystem() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-bg-base">
      {/* Layer 1: Base Radial Gradient (Defined in CSS body but reinforced here) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />

      {/* Layer 2: Grid Pattern */}
      <div className="grid-pattern absolute inset-0 opacity-[0.03]" />

      {/* Layer 3: Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Blob: Top Center */}
        <div 
          className="ambient-blob bg-accent opacity-20 w-[1000px] h-[600px] -top-[300px] left-1/2 -translate-x-1/2 animate-float"
          style={{ animationDelay: '0s' }}
        />
        
        {/* Secondary Blob: Left Side */}
        <div 
          className="ambient-blob bg-indigo-500 opacity-[0.12] w-[800px] h-[800px] top-[20%] -left-[400px] animate-float"
          style={{ animationDelay: '-2s', animationDuration: '12s' }}
        />
        
        {/* Tertiary Blob: Right Side */}
        <div 
          className="ambient-blob bg-purple-500 opacity-[0.1] w-[700px] h-[700px] top-[40%] -right-[350px] animate-float"
          style={{ animationDelay: '-4s', animationDuration: '15s' }}
        />

        {/* Bottom Accent */}
        <div 
          className="ambient-blob bg-accent opacity-[0.08] w-[1200px] h-[400px] -bottom-[200px] left-1/2 -translate-x-1/2 animate-pulse-slow"
        />
      </div>

      {/* Layer 4: Noise Texture */}
      <div className="noise-overlay absolute inset-0 mix-blend-overlay" />
    </div>
  )
}
