/**
 * Batch 1: Studio (3) + new 1BHK variants (8) = 11 templates
 * Run: npx ts-node -r dotenv/config prisma/seed-batch1.ts dotenv_config_path=.env
 */
import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const db = new PrismaClient({ adapter })

const batch1 = [
  // ── STUDIO / COMPACT ────────────────────────────────────────────────────
  {
    id: 'template-STUDIO-N-15x20-Modern',
    bhkType: '1BHK', style: 'Modern', facing: 'N',
    plotWidth: 15, plotHeight: 20, vastuScore: 65,
    tags: ['studio', 'north-facing', 'ultra-compact', 'bachelor'],
    description: 'Ultra-compact studio for 15×20ft. Combined living-sleeping with kitchenette. Ideal for bachelor accommodation.',
    rooms: [
      { name: 'Entrance',        type: 'foyer',       x: 4,  y: 0,  width: 7,  height: 3,  floor: 1 },
      { name: 'Living/Bedroom',  type: 'living_room', x: 0,  y: 3,  width: 15, height: 10, floor: 1 },
      { name: 'Kitchen',         type: 'kitchen',     x: 8,  y: 13, width: 7,  height: 7,  floor: 1 },
      { name: 'Bathroom',        type: 'bathroom',    x: 0,  y: 13, width: 8,  height: 7,  floor: 1 },
    ],
  },
  {
    id: 'template-STUDIO-E-18x24-Vastu',
    bhkType: '1BHK', style: 'Vastu Classic', facing: 'E',
    plotWidth: 18, plotHeight: 24, vastuScore: 68,
    tags: ['studio', 'east-facing', 'vastu', 'compact'],
    description: 'Vastu-compliant studio for east-facing 18×24ft. Pooja nook at NE, kitchen at SE.',
    rooms: [
      { name: 'Entrance',        type: 'foyer',       x: 13, y: 9,  width: 5,  height: 6,  floor: 1 },
      { name: 'Pooja Nook',      type: 'pooja_room',  x: 12, y: 0,  width: 6,  height: 6,  floor: 1 },
      { name: 'Living/Bedroom',  type: 'living_room', x: 0,  y: 4,  width: 12, height: 16, floor: 1 },
      { name: 'Kitchen',         type: 'kitchen',     x: 12, y: 15, width: 6,  height: 9,  floor: 1 },
      { name: 'Bathroom',        type: 'bathroom',    x: 0,  y: 20, width: 8,  height: 4,  floor: 1 },
    ],
  },
  {
    id: 'template-STUDIO-N-20x25-Minimalist',
    bhkType: '1BHK', style: 'Minimalist', facing: 'N',
    plotWidth: 20, plotHeight: 25, vastuScore: 66,
    tags: ['studio', 'north-facing', 'minimalist', 'japanese', 'open-plan'],
    description: 'Japanese-influenced minimalist studio. Open plan with sleeping alcove, kitchen bar, and hidden storage.',
    rooms: [
      { name: 'Entry',           type: 'foyer',       x: 6,  y: 0,  width: 8,  height: 3,  floor: 1 },
      { name: 'Open Living',     type: 'living_room', x: 0,  y: 3,  width: 20, height: 12, floor: 1 },
      { name: 'Kitchen Bar',     type: 'kitchen',     x: 12, y: 15, width: 8,  height: 7,  floor: 1 },
      { name: 'Bathroom',        type: 'bathroom',    x: 0,  y: 15, width: 7,  height: 10, floor: 1 },
      { name: 'Storage',         type: 'storage',     x: 7,  y: 15, width: 5,  height: 10, floor: 1 },
    ],
  },

  // ── 1BHK NEW VARIANTS ───────────────────────────────────────────────────
  {
    id: 'template-1BHK-S-20x30-Modern',
    bhkType: '1BHK', style: 'Modern', facing: 'S',
    plotWidth: 20, plotHeight: 30, vastuScore: 64,
    tags: ['south-facing', 'modern', '1bhk', 'compact'],
    description: '1BHK south-facing 20×30ft. Bedroom in NW (back of house), kitchen at SE, entrance from south.',
    rooms: [
      { name: 'Foyer',    type: 'foyer',       x: 6,  y: 24, width: 8,  height: 6,  floor: 1 },
      { name: 'Living',   type: 'living_room', x: 0,  y: 12, width: 12, height: 12, floor: 1 },
      { name: 'Kitchen',  type: 'kitchen',     x: 12, y: 16, width: 8,  height: 8,  floor: 1 },
      { name: 'Bedroom',  type: 'bedroom',     x: 0,  y: 0,  width: 12, height: 12, floor: 1 },
      { name: 'Bathroom', type: 'bathroom',    x: 12, y: 0,  width: 8,  height: 8,  floor: 1 },
      { name: 'Store',    type: 'storage',     x: 12, y: 8,  width: 8,  height: 8,  floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-W-20x30-Modern',
    bhkType: '1BHK', style: 'Modern', facing: 'W',
    plotWidth: 20, plotHeight: 30, vastuScore: 63,
    tags: ['west-facing', 'modern', '1bhk', 'compact'],
    description: '1BHK west-facing 20×30ft. Entrance left (west wall), Pooja at NE, bedroom at SW.',
    rooms: [
      { name: 'Foyer',    type: 'foyer',       x: 0,  y: 11, width: 5,  height: 8,  floor: 1 },
      { name: 'Pooja',    type: 'pooja_room',  x: 15, y: 0,  width: 5,  height: 6,  floor: 1 },
      { name: 'Living',   type: 'living_room', x: 5,  y: 8,  width: 10, height: 10, floor: 1 },
      { name: 'Kitchen',  type: 'kitchen',     x: 5,  y: 18, width: 8,  height: 8,  floor: 1 },
      { name: 'Bedroom',  type: 'bedroom',     x: 5,  y: 0,  width: 10, height: 8,  floor: 1 },
      { name: 'Bathroom', type: 'bathroom',    x: 13, y: 18, width: 7,  height: 8,  floor: 1 },
      { name: 'Store',    type: 'storage',     x: 15, y: 6,  width: 5,  height: 8,  floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-N-20x30-Traditional',
    bhkType: '1BHK', style: 'Traditional', facing: 'N',
    plotWidth: 20, plotHeight: 30, vastuScore: 69,
    tags: ['north-facing', 'traditional', '1bhk', 'pooja', 'north-indian'],
    description: 'North Indian traditional 1BHK. Front verandah-style foyer, dedicated Pooja room at NE, store at rear SW.',
    rooms: [
      { name: 'Foyer',    type: 'foyer',       x: 6,  y: 0,  width: 8,  height: 4,  floor: 1 },
      { name: 'Pooja',    type: 'pooja_room',  x: 14, y: 0,  width: 6,  height: 6,  floor: 1 },
      { name: 'Living',   type: 'living_room', x: 0,  y: 4,  width: 14, height: 10, floor: 1 },
      { name: 'Kitchen',  type: 'kitchen',     x: 12, y: 6,  width: 8,  height: 8,  floor: 1 },
      { name: 'Bedroom',  type: 'bedroom',     x: 0,  y: 14, width: 12, height: 12, floor: 1 },
      { name: 'Bathroom', type: 'bathroom',    x: 12, y: 14, width: 8,  height: 8,  floor: 1 },
      { name: 'Store',    type: 'storage',     x: 12, y: 22, width: 8,  height: 8,  floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-E-25x35-Traditional',
    bhkType: '1BHK', style: 'Traditional', facing: 'E',
    plotWidth: 25, plotHeight: 35, vastuScore: 70,
    tags: ['east-facing', 'traditional', '1bhk', 'verandah', 'south-indian'],
    description: 'South Indian traditional 1BHK with east-facing verandah on 25×35ft plot. Pooja at NE.',
    rooms: [
      { name: 'Verandah', type: 'foyer',       x: 18, y: 10, width: 7,  height: 15, floor: 1 },
      { name: 'Pooja',    type: 'pooja_room',  x: 17, y: 0,  width: 8,  height: 8,  floor: 1 },
      { name: 'Living',   type: 'living_room', x: 5,  y: 8,  width: 12, height: 14, floor: 1 },
      { name: 'Kitchen',  type: 'kitchen',     x: 5,  y: 22, width: 10, height: 10, floor: 1 },
      { name: 'Bedroom',  type: 'bedroom',     x: 0,  y: 0,  width: 12, height: 12, floor: 1 },
      { name: 'Bathroom', type: 'bathroom',    x: 0,  y: 12, width: 5,  height: 8,  floor: 1 },
      { name: 'Store',    type: 'storage',     x: 15, y: 25, width: 10, height: 10, floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-N-25x35-Contemporary',
    bhkType: '1BHK', style: 'Contemporary', facing: 'N',
    plotWidth: 25, plotHeight: 35, vastuScore: 71,
    tags: ['north-facing', 'contemporary', '1bhk', 'balcony', 'spacious'],
    description: 'Spacious contemporary 1BHK for 25×35ft north-facing plot. Open kitchen-dining, bedroom with private balcony.',
    rooms: [
      { name: 'Foyer',    type: 'foyer',       x: 8,  y: 0,  width: 9,  height: 5,  floor: 1 },
      { name: 'Living',   type: 'living_room', x: 0,  y: 5,  width: 16, height: 12, floor: 1 },
      { name: 'Kitchen',  type: 'kitchen',     x: 16, y: 5,  width: 9,  height: 12, floor: 1 },
      { name: 'Bedroom',  type: 'bedroom',     x: 0,  y: 17, width: 15, height: 14, floor: 1 },
      { name: 'Bathroom', type: 'bathroom',    x: 15, y: 17, width: 10, height: 10, floor: 1 },
      { name: 'Balcony',  type: 'courtyard',   x: 0,  y: 31, width: 15, height: 4,  floor: 1 },
      { name: 'Storage',  type: 'storage',     x: 15, y: 27, width: 10, height: 8,  floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-N-20x40-SouthIndian',
    bhkType: '1BHK', style: 'Traditional', facing: 'N',
    plotWidth: 20, plotHeight: 40, vastuScore: 73,
    tags: ['north-facing', 'south-indian', 'traditional', 'narrow-plot', 'kerala'],
    description: 'South Indian (Kerala/TN) narrow-plot 1BHK. Full-width front verandah, inner utility yard, rear wash area.',
    rooms: [
      { name: 'Verandah',  type: 'foyer',       x: 0,  y: 0,  width: 20, height: 5,  floor: 1 },
      { name: 'Pooja',     type: 'pooja_room',  x: 12, y: 5,  width: 8,  height: 6,  floor: 1 },
      { name: 'Living',    type: 'living_room', x: 0,  y: 5,  width: 12, height: 12, floor: 1 },
      { name: 'Bedroom',   type: 'bedroom',     x: 0,  y: 17, width: 12, height: 12, floor: 1 },
      { name: 'Kitchen',   type: 'kitchen',     x: 12, y: 17, width: 8,  height: 12, floor: 1 },
      { name: 'Bathroom',  type: 'bathroom',    x: 0,  y: 29, width: 8,  height: 8,  floor: 1 },
      { name: 'Utility',   type: 'utility',     x: 8,  y: 29, width: 12, height: 8,  floor: 1 },
      { name: 'Store',     type: 'storage',     x: 12, y: 11, width: 8,  height: 6,  floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-W-25x30-Vastu',
    bhkType: '1BHK', style: 'Vastu Classic', facing: 'W',
    plotWidth: 25, plotHeight: 30, vastuScore: 65,
    tags: ['west-facing', 'vastu', '1bhk'],
    description: 'West-facing 1BHK with Vastu compliance: Pooja NE, Kitchen SE, Bedroom SW, entrance from west wall.',
    rooms: [
      { name: 'Foyer',    type: 'foyer',       x: 0,  y: 11, width: 5,  height: 8,  floor: 1 },
      { name: 'Pooja',    type: 'pooja_room',  x: 18, y: 0,  width: 7,  height: 7,  floor: 1 },
      { name: 'Living',   type: 'living_room', x: 5,  y: 8,  width: 13, height: 12, floor: 1 },
      { name: 'Kitchen',  type: 'kitchen',     x: 18, y: 7,  width: 7,  height: 10, floor: 1 },
      { name: 'Bedroom',  type: 'bedroom',     x: 0,  y: 19, width: 13, height: 11, floor: 1 },
      { name: 'Bathroom', type: 'bathroom',    x: 13, y: 19, width: 7,  height: 8,  floor: 1 },
      { name: 'Store',    type: 'storage',     x: 20, y: 17, width: 5,  height: 8,  floor: 1 },
    ],
  },
  {
    id: 'template-1BHK-S-20x40-Contemporary',
    bhkType: '1BHK', style: 'Contemporary', facing: 'S',
    plotWidth: 20, plotHeight: 40, vastuScore: 63,
    tags: ['south-facing', 'contemporary', '1bhk', 'long-plot'],
    description: '1BHK on south-facing 20×40ft long plot. Bedroom + study at north end, living at south end near entrance.',
    rooms: [
      { name: 'Foyer',   type: 'foyer',       x: 7,  y: 34, width: 6,  height: 6,  floor: 1 },
      { name: 'Living',  type: 'living_room', x: 0,  y: 20, width: 12, height: 14, floor: 1 },
      { name: 'Kitchen', type: 'kitchen',     x: 12, y: 22, width: 8,  height: 12, floor: 1 },
      { name: 'Bedroom', type: 'bedroom',     x: 0,  y: 8,  width: 12, height: 12, floor: 1 },
      { name: 'Bathroom',type: 'bathroom',    x: 12, y: 8,  width: 8,  height: 8,  floor: 1 },
      { name: 'Study',   type: 'study',       x: 0,  y: 0,  width: 10, height: 8,  floor: 1 },
      { name: 'Store',   type: 'storage',     x: 10, y: 0,  width: 10, height: 8,  floor: 1 },
    ],
  },
]

async function main() {
  console.log(`Seeding batch 1: ${batch1.length} templates…`)
  for (const t of batch1) {
    await db.planTemplate.upsert({
      where: { id: t.id },
      update: { vastuScore: t.vastuScore, rooms: t.rooms, tags: t.tags, description: t.description },
      create: { ...t, plotUnit: 'ft', isPublic: true, useCount: 0 },
    })
    console.log(`  ✓ ${t.id}`)
  }
  console.log(`\nBatch 1 complete: ${batch1.length} templates`)
}

main().catch(console.error).finally(() => db.$disconnect())
