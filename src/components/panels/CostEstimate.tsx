'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DownloadSimple, Receipt } from '@phosphor-icons/react'
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

  if (loading) return <div className="text-slate-500 text-xs font-mono animate-pulse">LOADING ESTIMATE...</div>
  if (!data) return <div className="text-slate-500 text-xs">Failed to load estimate</div>

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-xs font-mono flex items-center gap-1">
          <Receipt size={12} />
          BILL OF QUANTITIES
        </div>
        {onExportPdf && (
          <Button size="sm" variant="outline" onClick={onExportPdf}
            className="h-6 text-xs border-slate-600 text-slate-400 hover:text-white gap-1">
            <DownloadSimple size={10} />
            PDF
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-500 font-mono pb-2">ROOM</th>
              <th className="text-right text-slate-500 font-mono pb-2">AREA</th>
              <th className="text-right text-slate-500 font-mono pb-2">RATE</th>
              <th className="text-right text-slate-500 font-mono pb-2">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.items.map((item, i) => (
              <tr key={i}>
                <td className="py-1.5 pr-2">
                  <div className="text-slate-300 truncate max-w-[80px]">{item.roomName}</div>
                  <div className="text-slate-600 text-[10px] font-mono">{item.roomType.replace('_', ' ')}</div>
                </td>
                <td className="py-1.5 text-right text-slate-400 font-mono">{item.area}<span className="text-slate-600"> {item.unit}²</span></td>
                <td className="py-1.5 text-right text-slate-500 font-mono">₹{item.ratePerSqft}</td>
                <td className="py-1.5 text-right text-cyan-400 font-mono">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Separator className="bg-slate-700" />

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-mono">TOTAL AREA</span>
          <span className="text-slate-300 font-mono">{data.totalArea} {data.items[0]?.unit}²</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-xs font-mono">ESTIMATED COST</span>
          <span className="text-green-400 font-mono font-bold text-sm">{formatCurrency(data.totalCost)}</span>
        </div>
        <p className="text-slate-600 text-[10px]">* Structural + finishing costs. Excludes land, MEP, furnishing.</p>
      </div>
    </div>
  )
}
