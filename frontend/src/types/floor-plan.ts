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

export interface FloorLayout {
  rooms: Room[];
  totalArea: number;
  plotWidth: number;
  plotLength: number;
  vastuScore?: number;
}

export interface FloorPlanGenerateRequest {
  projectId: string;
  plotDimensions: {
    length: number;
    width: number;
    unit: 'feet' | 'meters';
  };
  rooms: {
    bedrooms: number;
    bathrooms: number;
    kitchen: boolean;
    livingRoom: boolean;
    diningRoom: boolean;
    balconies?: number;
    parking?: boolean;
    studyRoom?: boolean;
    prayerRoom?: boolean;
    storeRoom?: boolean;
  };
  preferences?: {
    vastuCompliant?: boolean;
    style?: 'modern' | 'traditional' | 'minimalist';
    floors?: number;
  };
}

export interface FloorPlanResponse {
  layout: Room[];
  totalArea: number;
  plotDimensions: {
    length: number;
    width: number;
    unit: 'feet' | 'meters';
  };
  vastuScore?: number;
  metadata: {
    algorithm: string;
    processingTime: number;
    generatedAt: string;
  };
}
