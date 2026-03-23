export interface Room {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  doors: Door[];
  windows: Window[];
}

export interface Door {
  x: number;
  y: number;
  width: number;
  wall: 'north' | 'south' | 'east' | 'west';
}

export interface Window {
  x: number;
  y: number;
  width: number;
  height: number;
  wall: 'north' | 'south' | 'east' | 'west';
}

export interface FloorLayout {
  rooms: Room[];
  totalArea: number;
  plotWidth: number;
  plotLength: number;
  vastuScore?: number;
}

export class LayoutGenerator {
  /**
   * Generate a simple floor plan layout
   * MVP: Uses pre-defined templates for common configurations
   */
  static generate(
    plotLength: number,
    plotWidth: number,
    bedrooms: number,
    bathrooms: number,
    hasKitchen: boolean,
    hasLivingRoom: boolean,
    hasDiningRoom: boolean,
    vastuCompliant: boolean = false,
  ): FloorLayout {
    const totalArea = plotLength * plotWidth;
    const rooms: Room[] = [];

    // MVP: Simple 2BHK template (most common case)
    if (bedrooms === 2 && bathrooms === 2) {
      return this.generate2BHK(plotLength, plotWidth, vastuCompliant);
    }

    // MVP: Simple 3BHK template
    if (bedrooms === 3 && bathrooms >= 2) {
      return this.generate3BHK(plotLength, plotWidth, vastuCompliant);
    }

    // MVP: Simple 1BHK template
    if (bedrooms === 1) {
      return this.generate1BHK(plotLength, plotWidth, vastuCompliant);
    }

    // Default: Generate basic grid layout
    return this.generateBasicGrid(
      plotLength,
      plotWidth,
      bedrooms,
      bathrooms,
      hasKitchen,
      hasLivingRoom,
      hasDiningRoom,
      vastuCompliant,
    );
  }

  /**
   * Pre-defined 2BHK template (30ft x 40ft typical)
   */
  private static generate2BHK(plotLength: number, plotWidth: number, vastuCompliant: boolean): FloorLayout {
    const rooms: Room[] = [];

    // Living Room (Front-left) - 15ft x 15ft
    rooms.push({
      id: 'living-room',
      name: 'Living Room',
      type: 'living',
      x: 0,
      y: 0,
      width: Math.min(15, plotWidth * 0.4),
      height: Math.min(15, plotLength * 0.4),
      doors: [{ x: 7, y: 0, width: 3, wall: 'north' }],
      windows: [{ x: 0, y: 5, width: 4, height: 3, wall: 'west' }],
    });

    // Kitchen (Front-right or SE for Vastu) - 10ft x 10ft
    const kitchenX = vastuCompliant ? plotWidth * 0.6 : Math.min(15, plotWidth * 0.4);
    rooms.push({
      id: 'kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      x: kitchenX,
      y: 0,
      width: Math.min(10, plotWidth * 0.3),
      height: Math.min(10, plotLength * 0.3),
      doors: [{ x: kitchenX + 3, y: 0, width: 3, wall: 'north' }],
      windows: [{ x: kitchenX, y: 3, width: 3, height: 2, wall: 'west' }],
    });

    // Master Bedroom (Back-left or SW for Vastu) - 12ft x 12ft
    const masterY = Math.min(15, plotLength * 0.4);
    rooms.push({
      id: 'bedroom-1',
      name: 'Master Bedroom',
      type: 'bedroom',
      x: 0,
      y: masterY,
      width: Math.min(12, plotWidth * 0.4),
      height: Math.min(12, plotLength * 0.35),
      doors: [{ x: 5, y: masterY, width: 3, wall: 'north' }],
      windows: [
        { x: 0, y: masterY + 5, width: 4, height: 3, wall: 'west' },
        { x: 5, y: masterY + 12, width: 4, height: 3, wall: 'south' },
      ],
    });

    // Bedroom 2 (Back-right) - 10ft x 10ft
    rooms.push({
      id: 'bedroom-2',
      name: 'Bedroom 2',
      type: 'bedroom',
      x: Math.min(15, plotWidth * 0.5),
      y: Math.min(15, plotLength * 0.4),
      width: Math.min(10, plotWidth * 0.35),
      height: Math.min(10, plotLength * 0.3),
      doors: [{ x: Math.min(15, plotWidth * 0.5) + 3, y: Math.min(15, plotLength * 0.4), width: 3, wall: 'north' }],
      windows: [{ x: Math.min(15, plotWidth * 0.5) + 10, y: Math.min(15, plotLength * 0.4) + 3, width: 4, height: 3, wall: 'east' }],
    });

    // Bathroom 1 (attached to master) - 5ft x 8ft
    rooms.push({
      id: 'bathroom-1',
      name: 'Bathroom 1',
      type: 'bathroom',
      x: Math.min(12, plotWidth * 0.4),
      y: Math.min(15, plotLength * 0.4),
      width: Math.min(5, plotWidth * 0.15),
      height: Math.min(8, plotLength * 0.25),
      doors: [{ x: Math.min(12, plotWidth * 0.4) + 1, y: Math.min(15, plotLength * 0.4), width: 2.5, wall: 'north' }],
      windows: [],
    });

    // Bathroom 2 (common) - 5ft x 6ft
    rooms.push({
      id: 'bathroom-2',
      name: 'Bathroom 2',
      type: 'bathroom',
      x: Math.min(25, plotWidth * 0.7),
      y: Math.min(15, plotLength * 0.4),
      width: Math.min(5, plotWidth * 0.15),
      height: Math.min(6, plotLength * 0.2),
      doors: [{ x: Math.min(25, plotWidth * 0.7) + 1, y: Math.min(15, plotLength * 0.4), width: 2.5, wall: 'north' }],
      windows: [],
    });

    const vastuScore = vastuCompliant ? this.calculateVastuScore(rooms) : undefined;

    return {
      rooms,
      totalArea: plotLength * plotWidth,
      plotWidth,
      plotLength,
      vastuScore,
    };
  }

  /**
   * Pre-defined 3BHK template
   */
  private static generate3BHK(plotLength: number, plotWidth: number, vastuCompliant: boolean): FloorLayout {
    // Similar structure to 2BHK but with one more bedroom
    const layout = this.generate2BHK(plotLength, plotWidth, vastuCompliant);
    
    // Add third bedroom
    layout.rooms.push({
      id: 'bedroom-3',
      name: 'Bedroom 3',
      type: 'bedroom',
      x: Math.min(25, plotWidth * 0.65),
      y: Math.min(25, plotLength * 0.65),
      width: Math.min(10, plotWidth * 0.3),
      height: Math.min(10, plotLength * 0.3),
      doors: [{ x: Math.min(25, plotWidth * 0.65) + 3, y: Math.min(25, plotLength * 0.65), width: 3, wall: 'north' }],
      windows: [{ x: Math.min(25, plotWidth * 0.65) + 10, y: Math.min(25, plotLength * 0.65) + 3, width: 4, height: 3, wall: 'east' }],
    });

    return layout;
  }

  /**
   * Pre-defined 1BHK template (small apartment)
   */
  private static generate1BHK(plotLength: number, plotWidth: number, vastuCompliant: boolean): FloorLayout {
    const rooms: Room[] = [];

    // Combined Living + Dining (Front) - 15ft x 12ft
    rooms.push({
      id: 'living-dining',
      name: 'Living & Dining',
      type: 'living',
      x: 0,
      y: 0,
      width: Math.min(15, plotWidth * 0.6),
      height: Math.min(12, plotLength * 0.4),
      doors: [{ x: 7, y: 0, width: 3, wall: 'north' }],
      windows: [{ x: 0, y: 5, width: 5, height: 3, wall: 'west' }],
    });

    // Kitchen (Right) - 8ft x 8ft
    rooms.push({
      id: 'kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      x: Math.min(15, plotWidth * 0.6),
      y: 0,
      width: Math.min(8, plotWidth * 0.3),
      height: Math.min(8, plotLength * 0.3),
      doors: [{ x: Math.min(15, plotWidth * 0.6) + 2, y: 0, width: 3, wall: 'north' }],
      windows: [{ x: Math.min(15, plotWidth * 0.6) + 8, y: 2, width: 3, height: 2, wall: 'east' }],
    });

    // Bedroom (Back) - 12ft x 10ft
    rooms.push({
      id: 'bedroom-1',
      name: 'Bedroom',
      type: 'bedroom',
      x: 0,
      y: Math.min(12, plotLength * 0.4),
      width: Math.min(12, plotWidth * 0.5),
      height: Math.min(10, plotLength * 0.4),
      doors: [{ x: 5, y: Math.min(12, plotLength * 0.4), width: 3, wall: 'north' }],
      windows: [{ x: 0, y: Math.min(12, plotLength * 0.4) + 3, width: 4, height: 3, wall: 'west' }],
    });

    // Bathroom - 6ft x 6ft
    rooms.push({
      id: 'bathroom-1',
      name: 'Bathroom',
      type: 'bathroom',
      x: Math.min(12, plotWidth * 0.5),
      y: Math.min(12, plotLength * 0.4),
      width: Math.min(6, plotWidth * 0.25),
      height: Math.min(6, plotLength * 0.25),
      doors: [{ x: Math.min(12, plotWidth * 0.5) + 1.5, y: Math.min(12, plotLength * 0.4), width: 2.5, wall: 'north' }],
      windows: [],
    });

    const vastuScore = vastuCompliant ? this.calculateVastuScore(rooms) : undefined;

    return {
      rooms,
      totalArea: plotLength * plotWidth,
      plotWidth,
      plotLength,
      vastuScore,
    };
  }

  /**
   * Basic grid layout for non-standard configurations
   */
  private static generateBasicGrid(
    plotLength: number,
    plotWidth: number,
    bedrooms: number,
    bathrooms: number,
    hasKitchen: boolean,
    hasLivingRoom: boolean,
    hasDiningRoom: boolean,
    vastuCompliant: boolean,
  ): FloorLayout {
    // Fallback: Just return 2BHK template for now
    return this.generate2BHK(plotLength, plotWidth, vastuCompliant);
  }

  /**
   * Calculate Vastu compliance score (0-100)
   * MVP: Basic checks only
   */
  private static calculateVastuScore(rooms: Room[]): number {
    let score = 50; // Start at 50%

    const kitchen = rooms.find(r => r.type === 'kitchen');
    const masterBedroom = rooms.find(r => r.id === 'bedroom-1');
    const living = rooms.find(r => r.type === 'living');

    // Kitchen in SE (ideal) - +20 points
    if (kitchen && kitchen.x > kitchen.width && kitchen.y === 0) {
      score += 20;
    }

    // Master bedroom in SW - +20 points
    if (masterBedroom && masterBedroom.x === 0 && masterBedroom.y > masterBedroom.height) {
      score += 20;
    }

    // Living room in NE/NW - +10 points
    if (living && living.x === 0 && living.y === 0) {
      score += 10;
    }

    return Math.min(100, score);
  }
}
