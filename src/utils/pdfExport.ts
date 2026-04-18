'use client'

import jsPDF from 'jspdf'
import type { CostEstimateItem, Project, Room } from '@/types'

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

const ROOM_TYPE_COLORS: Record<string, [number, number, number]> = {
  living_room:    [8, 145, 178],
  master_bedroom: [124, 58, 237],
  bedroom:        [109, 40, 217],
  kitchen:        [217, 119, 6],
  bathroom:       [3, 105, 161],
  toilet:         [2, 132, 199],
  study:          [5, 150, 105],
  pooja:          [220, 38, 38],
  guest_room:     [124, 58, 237],
  store:          [100, 116, 139],
  garage:         [71, 85, 105],
  staircase:      [146, 64, 14],
  dining:         [180, 83, 9],
  verandah:       [15, 118, 110],
  default:        [51, 65, 85],
}

function getRoomColor(type: string): [number, number, number] {
  return ROOM_TYPE_COLORS[type] ?? ROOM_TYPE_COLORS.default
}

/** Draw scale bar at bottom-left of floor plan area */
function drawScaleBar(pdf: jsPDF, x: number, y: number) {
  const BAR_WIDTH = 40  // mm total = 10m at 4mm/m scale
  const TICK_H = 3      // tick height mm
  const HALF = BAR_WIDTH / 2
  const UNIT_MM_PER_M = BAR_WIDTH / 10 // 4mm per metre

  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.3)

  // Left tick
  pdf.line(x, y - TICK_H, x, y)
  // Mid tick
  pdf.line(x + HALF, y - TICK_H / 2, x + HALF, y)
  // Right tick
  pdf.line(x + BAR_WIDTH, y - TICK_H, x + BAR_WIDTH, y)
  // Baseline
  pdf.line(x, y, x + BAR_WIDTH, y)

  // Fill alternating segments
  pdf.setFillColor(255, 255, 255)
  pdf.rect(x, y - TICK_H, HALF, TICK_H, 'F')
  pdf.setFillColor(100, 116, 139)
  pdf.rect(x + HALF, y - TICK_H, HALF, TICK_H, 'F')

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(5.5)
  pdf.setTextColor(148, 163, 184)
  pdf.text('0', x, y + 3, { align: 'center' })
  pdf.text('5m', x + HALF, y + 3, { align: 'center' })
  pdf.text('10m', x + BAR_WIDTH, y + 3, { align: 'center' })

  // Annotation
  pdf.setFontSize(5)
  pdf.setTextColor(100, 116, 139)
  pdf.text('SCALE BAR', x + UNIT_MM_PER_M, y + 7, { align: 'left' })
}

/** Draw north arrow at top-right of floor plan area */
function drawNorthArrow(pdf: jsPDF, cx: number, cy: number) {
  const R = 7  // circle radius mm
  pdf.setDrawColor(34, 211, 238)
  pdf.setLineWidth(0.4)
  pdf.circle(cx, cy, R, 'S')

  // Arrow body pointing up
  pdf.setFillColor(34, 211, 238)
  // Filled triangle (north half)
  const pts = `${cx},${cy - R + 2} ${cx - 2},${cy + 2} ${cx + 2},${cy + 2}`
  // jsPDF doesn't have polygon directly, use lines
  pdf.setFillColor(34, 211, 238)
  pdf.triangle(cx, cy - R + 2, cx - 2.5, cy + 2, cx + 2.5, cy + 2, 'F')

  // "N" label
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(7)
  pdf.setTextColor(34, 211, 238)
  pdf.text('N', cx, cy - R - 2, { align: 'center' })
}

/** Draw legend panel at bottom-right */
function drawLegend(pdf: jsPDF, x: number, y: number, rooms: Room[]) {
  const PANEL_W = 60
  const PANEL_H = 40
  const SWATCH = 4

  // Panel background
  pdf.setFillColor(15, 23, 42)
  pdf.setDrawColor(34, 211, 238)
  pdf.setLineWidth(0.3)
  pdf.rect(x, y, PANEL_W, PANEL_H, 'FD')

  pdf.setFont('courier', 'bold')
  pdf.setFontSize(5.5)
  pdf.setTextColor(34, 211, 238)
  pdf.text('LEGEND', x + 3, y + 5)

  // Unique room types present in project
  const seen = new Set<string>()
  const uniqueTypes: string[] = []
  for (const room of rooms) {
    if (!seen.has(room.type)) { seen.add(room.type); uniqueTypes.push(room.type) }
    if (uniqueTypes.length >= 7) break
  }

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(5)
  let ly = y + 9
  for (const type of uniqueTypes) {
    const [r, g, b] = getRoomColor(type)
    pdf.setFillColor(r, g, b)
    pdf.rect(x + 3, ly - SWATCH + 1, SWATCH, SWATCH, 'F')
    pdf.setTextColor(226, 232, 240)
    pdf.text(type.replace(/_/g, ' ').toUpperCase(), x + 9, ly)
    ly += 5
    if (ly > y + PANEL_H - 3) break
  }
}

/** Draw title block strip at bottom of page */
function drawTitleBlock(pdf: jsPDF, PW: number, PH: number, projectTitle: string, revision: number) {
  const STRIP_H = 20
  const y = PH - STRIP_H

  pdf.setFillColor(30, 41, 59)
  pdf.rect(0, y, PW, STRIP_H, 'F')
  pdf.setDrawColor(34, 211, 238)
  pdf.setLineWidth(0.3)
  pdf.line(0, y, PW, y)

  // Left: project name
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(255, 255, 255)
  pdf.text(projectTitle.toUpperCase(), 10, y + 8)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(6)
  pdf.setTextColor(148, 163, 184)
  pdf.text('PLOT2PLAN — VASTU BLUEPRINT GENERATOR', 10, y + 14)

  // Center: drawing title
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(34, 211, 238)
  pdf.text('FLOOR PLAN — VASTU COMPLIANT', PW / 2, y + 9, { align: 'center' })

  // Right: date + revision
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(6)
  pdf.setTextColor(148, 163, 184)
  pdf.text(`DATE: ${dateStr}`, PW - 10, y + 6, { align: 'right' })
  pdf.text(`REV: ${String(revision).padStart(2, '0')}`, PW - 10, y + 12, { align: 'right' })
}

export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const { project, costItems, totalCost, totalArea } = options

  // A3 landscape: 420mm × 297mm
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
  const PW = pdf.internal.pageSize.getWidth()
  const PH = pdf.internal.pageSize.getHeight()

  // Current revision number — use rooms count as a proxy if unavailable
  const revisionNum = 1

  // ─── PAGE 1: Floor Plan ───────────────────────────────────────────────────
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, PW, PH, 'F')

  // Header bar
  pdf.setFont('courier', 'bold')
  pdf.setFontSize(20)
  pdf.setTextColor(34, 211, 238)
  pdf.text('PLOT2PLAN', 15, 18)

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
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

  // Capture canvas image
  const TITLE_BLOCK_H = 20
  const canvas = document.getElementById('floor-plan-canvas') as HTMLCanvasElement | null
  let canvasAreaBottom = PH - TITLE_BLOCK_H - 5
  if (canvas) {
    try {
      const imgData = canvas.toDataURL('image/png')
      const canvasAspect = canvas.width / canvas.height
      const maxH = PH - 50 - TITLE_BLOCK_H
      const maxW = PW - 30
      let imgW = maxW
      let imgH = imgW / canvasAspect
      if (imgH > maxH) { imgH = maxH; imgW = imgH * canvasAspect }
      const imgX = (PW - imgW) / 2
      const imgY = 30
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgW, imgH)
      canvasAreaBottom = imgY + imgH

      // Scale bar — bottom-left of canvas image
      drawScaleBar(pdf, imgX + 5, canvasAreaBottom - 15)

      // North arrow — top-right of canvas image
      drawNorthArrow(pdf, imgX + imgW - 12, imgY + 12)

      // Legend — bottom-right of canvas image
      drawLegend(pdf, imgX + imgW - 65, canvasAreaBottom - 43, project.rooms)
    } catch {
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(10)
      pdf.text('[Canvas capture unavailable]', PW / 2, PH / 2, { align: 'center' })
    }
  }

  // Title block strip at page bottom
  drawTitleBlock(pdf, PW, PH, project.title, revisionNum)

  // ─── PAGE 2: Vastu Report ─────────────────────────────────────────────────
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

  // Overall score badge
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

  pdf.setFillColor(30, 41, 59)
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

  // Room rows
  pdf.setFont('courier', 'normal')
  for (const room of project.rooms) {
    if (y > PH - 20) {
      pdf.addPage()
      pdf.setFillColor(15, 23, 42)
      pdf.rect(0, 0, PW, PH, 'F')
      y = 15
    }

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
      room.warnings.join('; ') || '-',
    ]
    for (let i = 0; i < cells.length; i++) {
      pdf.setFontSize(6.5)
      // Truncate only the warnings column if it overflows its cell
      const maxChars = Math.floor(colWidths[i] / 1.8)
      const text = cells[i].length > maxChars ? cells[i].slice(0, maxChars) + '…' : cells[i]
      pdf.text(text, x, y + 4.5)
      x += colWidths[i]
    }
    y += 7

    // Doshas — each on its own sub-row with severity badge
    if (room.doshas && room.doshas.length > 0) {
      for (const dosha of room.doshas) {
        if (y > PH - 20) {
          pdf.addPage()
          pdf.setFillColor(15, 23, 42)
          pdf.rect(0, 0, PW, PH, 'F')
          y = 15
        }

        // Severity badge color
        const [br, bg, bb]: [number, number, number] =
          dosha.severity === 'CRITICAL' ? [153, 27, 27] :
          dosha.severity === 'SEVERE'   ? [154, 52, 18] :
          dosha.severity === 'MODERATE' ? [113, 63, 18] :
          dosha.severity === 'MILD'     ? [29, 78, 216]  :
          [30, 41, 59]

        // Indent row
        pdf.setFillColor(20, 28, 45)
        pdf.rect(startX + 4, y, PW - 38, 7, 'F')

        // Badge
        pdf.setFillColor(br, bg, bb)
        pdf.roundedRect(startX + 6, y + 1, 24, 5, 1, 1, 'F')
        pdf.setFont('courier', 'bold')
        pdf.setFontSize(5.5)
        pdf.setTextColor(255, 255, 255)
        pdf.text(dosha.severity, startX + 18, y + 4.5, { align: 'center' })

        // Description
        pdf.setFont('courier', 'normal')
        pdf.setFontSize(6)
        pdf.setTextColor(203, 213, 225)
        const maxDesc = Math.floor((PW - 38 - 36) / 1.6)
        const desc = dosha.description.length > maxDesc
          ? dosha.description.slice(0, maxDesc) + '…'
          : dosha.description
        pdf.text(desc, startX + 34, y + 4.5)

        y += 7

        // Remedy on next line
        if (y > PH - 20) {
          pdf.addPage()
          pdf.setFillColor(15, 23, 42)
          pdf.rect(0, 0, PW, PH, 'F')
          y = 15
        }
        pdf.setFillColor(15, 23, 42)
        pdf.rect(startX + 4, y, PW - 38, 6, 'F')
        pdf.setFont('courier', 'normal')
        pdf.setFontSize(5.5)
        pdf.setTextColor(100, 200, 120)
        const maxRem = Math.floor((PW - 42) / 1.6)
        const rem = (dosha.remedy || '').length > maxRem
          ? dosha.remedy.slice(0, maxRem) + '…'
          : dosha.remedy
        pdf.text(`REMEDY: ${rem}`, startX + 8, y + 4.2)
        y += 6
      }
    }
  }

  // ─── PAGE 3: Cost Estimate ────────────────────────────────────────────────
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

  // Existing note
  pdf.setFontSize(7)
  pdf.setTextColor(71, 85, 105)
  pdf.text('* Estimate includes structural and finishing costs. Excludes land cost, MEP, and furnishing.', startX, PH - 22)

  // Disclaimer
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(6.5)
  pdf.setTextColor(71, 85, 105)
  pdf.text(
    'Cost estimates based on average INR market rates (2024). Actual costs may vary by ±30%. Consult a licensed contractor for accurate quotation.',
    startX,
    PH - 16,
  )

  // Professional footer with page numbers
  pdf.setDrawColor(51, 65, 85)
  pdf.setLineWidth(0.2)
  pdf.line(startX, PH - 11, PW - 15, PH - 11)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(6)
  pdf.setTextColor(100, 116, 139)
  pdf.text('PLOT2PLAN — VASTU BLUEPRINT GENERATOR', startX, PH - 7)
  pdf.text('Page 3 of 3', PW - 15, PH - 7, { align: 'right' })

  // Save
  const filename = `${project.title.replace(/\s+/g, '-').toLowerCase()}-blueprint.pdf`
  pdf.save(filename)
}
