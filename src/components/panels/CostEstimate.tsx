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
    <div className="p-8 text-muted-foreground text-[10px] font-bold tracking-widest animate-pulse flex items-center gap-2">
      <Coins size={16} className="animate-bounce" /> LOADING ESTIMATE...
    </div>
  )
  if (!data) return (
    <div className="p-8 text-destructive text-xs font-bold text-center">Failed to load estimate</div>
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      <div className="p-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-110">
            <Coins size={80} weight="fill" className="text-primary" />
          </div>
          <div className="relative z-10">
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">Project Total</span>
             <h2 className="text-3xl font-black text-foreground tracking-tighter">{formatCurrency(data.totalCost)}</h2>
             <div className="flex items-center gap-3 mt-3">
               <span className="text-xs font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded border border-primary/10">
                {data.totalArea} {data.items[0]?.unit}² TOTAL
              </span>
               <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                READY
              </span>
             </div>
          </div>
        </div>

        {/* Action Bar */}
        {onExportPdf && (
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Itemized Breakdown</h3>
            <Button variant="outline" size="sm" onClick={onExportPdf}
              className="rounded-xl text-[10px] font-bold h-8 px-3 gap-2 border shadow-sm hover:bg-primary hover:text-white transition-all">
              <FileText size={14} weight="bold" /> PDF REPORT
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-2xl overflow-hidden shadow-sm bg-card">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider">Room / Zone</th>
                <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">Area</th>
                <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">Estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((item, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs font-bold text-foreground truncate ">{item.roomName}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">{item.roomType.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-xs font-mono font-bold text-foreground">{item.area} <span className="text-[10px] text-muted-foreground">{item.unit}²</span></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-xs font-mono font-bold text-primary">{formatCurrency(item.subtotal)}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">₹{item.ratePerSqft}/SQFT</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-muted/20 rounded-2xl border border-dashed text-center">
          <p className="text-muted-foreground text-[10px] font-semibold leading-relaxed">
            * Estimates are based on standard structural + finishing parameters. <br/>
            Final costs may vary by up to 15% depending on material selection.
          </p>
        </div>
      </div>
    </div>
  )
}
