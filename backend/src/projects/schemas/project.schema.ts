import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

// Sub-schemas for nested data
@Schema({ _id: false })
export class PlotDetails {
  @Prop({ required: true })
  length: number; // in feet

  @Prop({ required: true })
  width: number; // in feet

  @Prop({ required: true })
  area: number; // in sq ft

  @Prop()
  facingDirection?: string; // North, South, East, West

  @Prop()
  shape?: string; // rectangular, square, L-shaped, etc.
}

@Schema({ _id: false })
export class RoomRequirements {
  @Prop({ required: true, default: 0 })
  bedrooms: number;

  @Prop({ required: true, default: 0 })
  bathrooms: number;

  @Prop({ default: 1 })
  kitchen: number;

  @Prop({ default: 1 })
  livingRoom: number;

  @Prop({ default: 0 })
  diningRoom: number;

  @Prop({ default: 0 })
  studyRoom: number;

  @Prop({ default: 0 })
  poojaRoom: number;

  @Prop({ default: 0 })
  balconies: number;

  @Prop({ default: 0 })
  parking: number;

  @Prop({ default: 0 })
  storeRoom: number;

  @Prop({ type: Map, of: Number })
  others?: Map<string, number>; // custom rooms
}

@Schema({ _id: false })
export class DesignPreferences {
  @Prop({ type: [String], default: [] })
  styles: string[]; // modern, traditional, minimalist, etc.

  @Prop({ default: false })
  vastuCompliant: boolean;

  @Prop()
  budgetMin?: number;

  @Prop()
  budgetMax?: number;

  @Prop({ type: [String], default: [] })
  specialRequirements: string[]; // wheelchair accessible, pet-friendly, etc.

  @Prop()
  floorCount?: number; // number of floors

  @Prop()
  notes?: string;
}

@Schema({
  timestamps: true,
  collection: 'projects',
})
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: PlotDetails, required: true })
  plotDetails: PlotDetails;

  @Prop({ type: RoomRequirements, required: true })
  roomRequirements: RoomRequirements;

  @Prop({ type: DesignPreferences })
  designPreferences?: DesignPreferences;

  @Prop({ type: Object })
  floorPlan?: any; // Generated floor plan layout

  @Prop({ default: 'draft', enum: ['draft', 'processing', 'completed', 'failed'] })
  status: string;

  @Prop({ type: Object })
  generatedOutputs?: {
    floorPlan2D?: string; // S3 URL or file path
    floorPlan3D?: string;
    elevation?: string;
    structural?: string;
    electrical?: string;
    plumbing?: string;
    interior?: string;
  };

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes
ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ status: 1 });
