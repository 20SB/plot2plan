'use client'

import jsPDF from 'jspdf'
import type { CostEstimateItem, Project } from '@/types'

export interface PdfExportOptions {
  project: Project
  costItems: CostEstimateItem[]
  totalCost: number
  totalArea: number
}

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function vastuLabel(score: number): string {
  if (score >= 75) return 'EXCELLENT'
  if (score >= 50) return 'MODERATE'
  return 'NEEDS WORK'
}

export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const { project, costItems, totalCost, totalArea } = options

  // A3 landscape: 420mm × 297mm
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
  const PW = pdf.internal.pageSize.getWidth()
  const PH = pdf.internal.pageSize.getHeight()

  // ─── PAGE 1: Floor Plan ───────────────────────────────────────────────
  // Header
  pdf.setFillColor(15, 23, 42) // slate-950
  pdf.rect(0, 0, PW, PH, 'F')

  pdf.setFont('courier', 'bold')
  pdf.setFontSize(20)
  pdf.setTextColor(34, 211, 238) // cyan-400
  pdf.text('PLOT2PLAN', 15, 18)

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184) // slate-400
  pdf.text('VASTU BLUEPRINT GENERATOR', 15, 24)

  pdf.setFontSize(10)
  pdf.setTextColor(255, 255, 255)
  pdf.text(project.title.toUpperCase(), PW / 2, 18, { align: 'center' })

  pdf.setFontSize(7)
  pdf.setTextColor(148, 163, 184)
  pdf.text(
    `${project.plotWidth} × ${project.plotHeight} ${project.plotUnit}  ·  ${project.facing ?? 'N/A'} FACING  ·  ${project.numFloors} FLOOR(S)  ·  VASTU: ${Math.round(project.vastuScore)}/100`,
    PW / 2, 24, { align: 'center' }
  )

  pdf.setFontSize(7)
  pdf.setTextColor(100, 116, 139)
  pdf.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), PW - 15, 18, { align: 'right' })

  // Capture canvas
  const canvas = document.getElementById('floor-plan-canvas') as HTMLCanvasElement | null
  if (canvas) {
    try {
      const imgData = canvas.toDataURL('image/png')
      const canvasAspect = canvas.width / canvas.height
      const maxH = PH - 45
      const maxW = PW - 30
      let imgW = maxW
      let imgH = imgW / canvasAspect
      if (imgH > maxH) { imgH = maxH; imgW = imgH * canvasAspect }
      const imgX = (PW - imgW) / 2
      pdf.addImage(imgData, 'PNG', imgX, 30, imgW, imgH)
    } catch {
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(10)
      pdf.text('[Canvas capture unavailable]', PW / 2, PH / 2, { align: 'center' })
    }
  }

  // ─── PAGE 2: Vastu Report ────────────────────────────────────────────
  pdf.addPage()
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, PW, PH, 'F')

  pdf.setFont('courier', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(34, 211, 238)
  pdf.text('VASTU COMPLIANCE REPORT', 15, 18)

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
  pdf.text(project.title, 15, 25)

  // Overall score
  const scoreColor: [number, number, number] = project.vastuScore >= 75
    ? [34, 197, 94] : project.vastuScore >= 50
    ? [234, 179, 8] : [239, 68, 68]

  pdf.setFillColor(...scoreColor)
  pdf.roundedRect(PW - 60, 12, 45, 16, 2, 2, 'F')
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(255, 255, 255)
  pdf.text(`${Math.round(project.vastuScore)}/100`, PW - 37.5, 22, { align: 'center' })
  pdf.setFontSize(7)
  pdf.text(vastuLabel(project.vastuScore), PW - 37.5, 27, { align: 'center' })

  // Room table
  const headers = ['ROOM', 'TYPE', 'DIRECTION', 'VASTU SCORE', 'STATUS', 'WARNINGS']
  const colWidths = [55, 40, 30, 30, 30, PW - 200]
  const startX = 15
  let y = 35

  // Table header
  pdf.setFillColor(30, 41, 59) // slate-800
  pdf.rect(startX, y, PW - 30, 8, 'F')
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(7)
  pdf.setTextColor(148, 163, 184)
  let x = startX + 2
  for (let i = 0; i < headers.length; i++) {
    pdf.text(headers[i], x, y + 5.5)
    x += colWidths[i]
  }
  y += 8

  // Table rows
  pdf.setFont('courier', 'normal')
  for (const room of project.rooms) {
    if (y > PH - 20) { pdf.addPage(); pdf.setFillColor(15, 23, 42); pdf.rect(0, 0, PW, PH, 'F'); y = 15 }

    const rowColor: [number, number, number] = room.vastuScore >= 75
      ? [20, 83, 45] : room.vastuScore >= 50
      ? [78, 63, 0] : [127, 29, 29]

    pdf.setFillColor(...rowColor)
    pdf.rect(startX, y, PW - 30, 7, 'F')

    pdf.setTextColor(255, 255, 255)
    x = startX + 2
    const cells = [
      room.name,
      room.type.replace(/_/g, ' '),
      room.direction ?? '-',
      `${room.vastuScore}/100`,
      room.vastuScore >= 75 ? 'GOOD' : room.vastuScore >= 50 ? 'FAIR' : 'POOR',
      room.warnings.join('; ').slice(0, 60) || '-',
    ]
    for (let i = 0; i < cells.length; i++) {
      pdf.setFontSize(6.5)
      const text = cells[i].length > colWidths[i] / 2 ? cells[i].slice(0, Math.floor(colWidths[i] / 2)) + '…' : cells[i]
      pdf.text(text, x, y + 4.5)
      x += colWidths[i]
    }
    y += 7
  }

  // ─── PAGE 3: Cost Estimate ───────────────────────────────────────────
  pdf.addPage()
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, PW, PH, 'F')

  pdf.setFont('courier', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(34, 211, 238)
  pdf.text('BILL OF QUANTITIES', 15, 18)

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
  pdf.text(project.title, 15, 25)

  const boqHeaders = ['ROOM', 'TYPE', 'AREA', 'UNIT', 'RATE (₹/unit)', 'SUBTOTAL']
  const boqWidths = [60, 50, 25, 20, 35, 40]
  y = 35
  x = startX + 2

  pdf.setFillColor(30, 41, 59)
  pdf.rect(startX, y, PW - 30, 8, 'F')
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(7)
  pdf.setTextColor(148, 163, 184)
  for (let i = 0; i < boqHeaders.length; i++) {
    pdf.text(boqHeaders[i], x, y + 5.5)
    x += boqWidths[i]
  }
  y += 8

  pdf.setFont('courier', 'normal')
  for (const item of costItems) {
    pdf.setFillColor(21, 28, 44)
    pdf.rect(startX, y, PW - 30, 7, 'F')
    pdf.setTextColor(226, 232, 240)
    pdf.setFontSize(6.5)
    x = startX + 2
    const cells = [
      item.roomName,
      item.roomType.replace(/_/g, ' '),
      String(item.area),
      `${item.unit}²`,
      `₹${item.ratePerSqft}`,
      formatINR(item.subtotal),
    ]
    for (let i = 0; i < cells.length; i++) {
      pdf.text(cells[i], x, y + 4.5)
      x += boqWidths[i]
    }
    y += 7
  }

  // Totals
  y += 4
  pdf.setDrawColor(34, 211, 238)
  pdf.line(startX, y, PW - 15, y)
  y += 6
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
  pdf.text(`TOTAL BUILT-UP AREA: ${totalArea} ${project.plotUnit}²`, startX, y)
  pdf.setTextColor(34, 197, 94)
  pdf.setFontSize(12)
  pdf.text(`TOTAL ESTIMATED COST: ${formatINR(totalCost)}`, PW - 15, y, { align: 'right' })

  pdf.setFontSize(7)
  pdf.setTextColor(71, 85, 105)
  pdf.text('* Estimate includes structural and finishing costs. Excludes land cost, MEP, and furnishing.', startX, PH - 10)

  // Save
  const filename = `${project.title.replace(/\s+/g, '-').toLowerCase()}-blueprint.pdf`
  pdf.save(filename)
}
