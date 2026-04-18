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
    <div className="p-4 text-app-faint text-xs font-mono animate-pulse">LOADING ESTIMATE...</div>
  )
  if (!data) return (
    <div className="p-4 text-app-danger text-xs">Failed to load estimate</div>
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-0">
      {/* Panel header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/6">
        <div className="w-7 h-7 bg-app-accent/15 rounded-lg flex items-center justify-center">
          <Coins className="w-4 h-4 text-app-accent" />
        </div>
        <span className="text-app-text text-sm font-medium">Cost Estimate</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Export button */}
        {onExportPdf && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onExportPdf}
              className="text-app-faint hover:text-app-text border border-white/8 hover:border-white/16 rounded-xl text-xs h-8 px-3 gap-1.5">
              <FileText className="w-3.5 h-3.5" />Export PDF
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left text-app-faint text-[10px] font-medium uppercase tracking-wider pb-2">Room</th>
                <th className="text-right text-app-faint text-[10px] font-medium uppercase tracking-wider pb-2">Area</th>
                <th className="text-right text-app-faint text-[10px] font-medium uppercase tracking-wider pb-2">Rate</th>
                <th className="text-right text-app-faint text-[10px] font-medium uppercase tracking-wider pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-2">
                    <div className="text-app-text text-xs truncate max-w-[80px]">{item.roomName}</div>
                    <div className="text-app-faint text-[10px] font-mono">{item.roomType.replace('_', ' ')}</div>
                  </td>
                  <td className="py-1.5 text-right text-app-soft font-mono text-xs">{item.area}<span className="text-app-faint"> {item.unit}²</span></td>
                  <td className="py-1.5 text-right text-app-soft font-mono text-xs">₹{item.ratePerSqft}</td>
                  <td className="py-1.5 text-right text-app-soft font-mono text-xs">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator className="bg-white/6" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-app-faint font-mono">TOTAL AREA</span>
            <span className="text-app-soft font-mono">{data.totalArea} {data.items[0]?.unit}²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-app-faint text-xs font-mono">ESTIMATED COST</span>
            <span className="text-app-ok font-mono font-semibold text-sm">{formatCurrency(data.totalCost)}</span>
          </div>
          <p className="text-app-faint text-[10px]">* Structural + finishing costs. Excludes land, MEP, furnishing.</p>
        </div>
      </div>
    </div>
  )
}
