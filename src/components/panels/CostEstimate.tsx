'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileText, Coins } from '@phosphor-icons/react'
import type { CostEstimate as CostEstimateType } from '@/types'

interface Props {
  projectId: string
  onExportPdf?: () => void
}

export function CostEstimate({ projectId, onExportPdf }: Props) {
  const [data, setData] = useState<CostEstimateType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/cost-estimate`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return (
    <div className="p-8 text-muted-foreground text-[11px] font-bold tracking-widest animate-pulse flex items-center gap-2">
      <Coins size={16} className="animate-bounce" /> LOADING ESTIMATE...
    </div>
  )
  if (!data) return (
    <div className="p-8 text-destructive text-xs font-bold text-center">Failed to load estimate</div>
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex flex-col bg-transparent animate-in fade-in duration-500 relative z-10">
      <div className="p-4 space-y-5">
        {/* Summary Card */}
        <div className="glass-surface p-5 relative overflow-hidden group border-white/[0.08] shadow-linear rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-transform group-hover:scale-110 pointer-events-none">
            <Coins size={80} weight="fill" className="text-white" />
          </div>
          <div className="relative z-10">
             <span className="text-[11px] font-mono font-medium text-foreground-subtle uppercase tracking-[0.2em] mb-1.5 block">Project Estimate</span>
             <h2 className="text-3xl font-bold text-gradient tracking-tighter pb-0.5">{formatCurrency(data.totalCost)}</h2>
             <div className="flex items-center gap-2 mt-3">
               <span className="text-[11px] font-mono font-bold text-foreground-subtle bg-white/[0.05] border border-white/[0.06] px-1.5 py-0.5 rounded">
                {data.totalArea} {data.items[0]?.unit}²
              </span>
               <span className="text-[11px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                STABLE
              </span>
             </div>
          </div>
        </div>

        {/* Action Bar */}
        {onExportPdf && (
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-mono font-bold text-foreground-subtle uppercase tracking-widest">Breakdown</h3>
            <Button variant="ghost" size="sm" onClick={onExportPdf}
              className="rounded-lg text-[11px] font-bold h-7 px-2.5 gap-2 border border-white/[0.08] bg-white/[0.02] hover:bg-accent hover:text-white transition-all">
              <FileText size={12} weight="bold" /> PDF
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="glass-surface p-0 rounded-xl overflow-hidden border-white/[0.06]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-4 py-3 text-[11px] font-mono font-bold text-foreground-subtle uppercase tracking-wider">Zone</th>
                <th className="px-4 py-3 text-[11px] font-mono font-bold text-foreground-subtle uppercase tracking-wider text-right">Area</th>
                <th className="px-4 py-3 text-[11px] font-mono font-bold text-foreground-subtle uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data.items.map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-foreground truncate group-hover:text-accent transition-colors">{item.roomName}</div>
                    <div className="text-[11px] font-mono font-bold text-foreground-muted uppercase mt-0.5 tracking-wider">{item.roomType.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-[13px] font-mono font-bold text-foreground tracking-tight">{item.area} <span className="text-[11px] text-foreground-subtle">{item.unit}²</span></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-[13px] font-mono font-bold text-accent">{formatCurrency(item.subtotal)}</div>
                    <div className="text-[11px] font-mono font-bold text-foreground-muted uppercase mt-0.5 tracking-wider">₹{item.ratePerSqft}/sqft</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-accent/[0.02] rounded-xl border border-white/[0.04] text-center">
          <p className="text-foreground-subtle text-[11px] font-bold leading-snug uppercase tracking-widest opacity-40">
            * Material-adjusted estimates. Variance ±15% applied.
          </p>
        </div>
      </div>
    </div>
  )
}
