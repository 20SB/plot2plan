// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// Project types
export interface PlotDetails {
  length: number;
  width: number;
  area: number;
  facingDirection?: string;
  shape?: string;
}

export interface RoomRequirements {
  bedrooms: number;
  bathrooms: number;
  kitchen?: number;
  livingRoom?: number;
  diningRoom?: number;
  studyRoom?: number;
  poojaRoom?: number;
  balconies?: number;
  parking?: number;
  storeRoom?: number;
  others?: Record<string, number>;
}

export interface DesignPreferences {
  styles?: string[];
  vastuCompliant?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  specialRequirements?: string[];
  floorCount?: number;
  notes?: string;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  plotDetails: PlotDetails;
  roomRequirements: RoomRequirements;
  designPreferences?: DesignPreferences;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  generatedOutputs?: {
    floorPlan2D?: string;
    floorPlan3D?: string;
    elevation?: string;
    structural?: string;
    electrical?: string;
    plumbing?: string;
    interior?: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  plotDetails: PlotDetails;
  roomRequirements: RoomRequirements;
  designPreferences?: DesignPreferences;
}
