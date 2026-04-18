export interface Room {
  id: string
  projectId: string
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  floor: number
  direction?: string
  vastuScore: number
  warnings: string[]
}

export interface PlumbingItem {
  id: string
  projectId: string
  type: string
  x: number
  y: number
  floor: number
  label?: string
}

export interface ElectricalItem {
  id: string
  projectId: string
  type: string
  x: number
  y: number
  floor: number
  label?: string
}

export interface Project {
  id: string
  userId: string
  title: string
  plotWidth: number
  plotHeight: number
  plotUnit: string
  numFloors: number
  style?: string
  facing?: string
  vastuScore: number
  rooms: Room[]
  plumbing: PlumbingItem[]
  electrical: ElectricalItem[]
  createdAt: string
  updatedAt: string
}

export interface Revision {
  id: string
  projectId: string
  version: number
  label?: string
  roomsSnapshot: Room[]
  createdAt: string
}

export interface CostEstimateItem {
  roomName: string
  roomType: string
  area: number
  unit: string
  ratePerSqft: number
  subtotal: number
}

export interface CostEstimate {
  items: CostEstimateItem[]
  totalArea: number
  totalCost: number
  currency: string
}

export interface PlotInput {
  title: string
  plotWidth: number
  plotHeight: number
  plotUnit: 'ft' | 'm'
  numFloors: number
  style: string
  facing: string
  rooms: string[]
}

export interface VastuWarning {
  roomId: string
  roomName: string
  message: string
  severity: 'error' | 'warning'
}

export type LayerType = 'ARCH' | 'PLMB' | 'ELEC'
