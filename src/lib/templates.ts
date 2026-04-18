import { db } from './db'
import type { GenerateLayoutInput } from './claude'

const BHK_ORDER = ['1BHK', '2BHK', '3BHK', '4BHK', 'VILLA']

function normalizeFacing(f: string): string {
  const map: Record<string, string> = {
    north: 'N', south: 'S', east: 'E', west: 'W',
    'north-east': 'NE', northeast: 'NE', ne: 'NE',
    'north-west': 'NW', northwest: 'NW', nw: 'NW',
    'south-east': 'SE', southeast: 'SE', se: 'SE',
    'south-west': 'SW', southwest: 'SW', sw: 'SW',
  }
  return map[f.toLowerCase()] ?? f.toUpperCase()
}

function inferBHK(rooms: string[]): string {
  const bedrooms = rooms.filter(r =>
    r.toLowerCase().includes('bedroom') || r.toLowerCase().includes('bhk')
  ).length
  if (bedrooms <= 1) return '1BHK'
  if (bedrooms === 2) return '2BHK'
  if (bedrooms === 3) return '3BHK'
  if (bedrooms === 4) return '4BHK'
  return 'VILLA'
}

export interface TemplateMatch {
  id: string
  description: string | null
  vastuScore: number
  rooms: unknown
  plotWidth: number
  plotHeight: number
  facing: string
  bhkType: string
  style: string
}

export async function findMatchingTemplates(
  input: GenerateLayoutInput,
  limit = 2
): Promise<TemplateMatch[]> {
  const facingCode = normalizeFacing(input.facing)
  const bhkType = inferBHK(input.rooms)

  const templates = await db.planTemplate.findMany({ where: { isPublic: true } })

  const scored = templates.map(t => {
    let score = 0

    // BHK match (most important)
    if (t.bhkType === bhkType) {
      score += 40
    } else {
      const diff = Math.abs(BHK_ORDER.indexOf(t.bhkType) - BHK_ORDER.indexOf(bhkType))
      if (diff === 1) score += 15
    }

    // Facing match
    if (t.facing === facingCode) score += 30

    // Plot size similarity
    const wRatio = Math.abs(t.plotWidth - input.plotWidth) / input.plotWidth
    const hRatio = Math.abs(t.plotHeight - input.plotHeight) / input.plotHeight
    if (wRatio < 0.25 && hRatio < 0.25) score += 20
    else if (wRatio < 0.5 && hRatio < 0.5) score += 10

    // Style match
    if (t.style.toLowerCase() === input.style.toLowerCase()) score += 10

    // Vastu quality bonus
    if (t.vastuScore >= 85) score += 5
    else if (t.vastuScore >= 75) score += 2

    return { template: t, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({
      id: s.template.id,
      description: s.template.description,
      vastuScore: s.template.vastuScore,
      rooms: s.template.rooms,
      plotWidth: s.template.plotWidth,
      plotHeight: s.template.plotHeight,
      facing: s.template.facing,
      bhkType: s.template.bhkType,
      style: s.template.style,
    }))
}
