import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { GenerateFloorPlanDto } from './dto/generate-floor-plan.dto';
import { LayoutGenerator, FloorLayout } from './generators/layout-generator';

@Injectable()
export class FloorPlanService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<ProjectDocument>,
  ) {}

  /**
   * Generate floor plan layout
   */
  async generateFloorPlan(dto: GenerateFloorPlanDto, userId: string) {
    const startTime = Date.now();

    // Validate project exists and belongs to user
    const project = await this.projectModel.findOne({
      _id: dto.projectId,
      userId,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Convert to feet if needed (algorithm works in feet)
    let plotLength = dto.plotDimensions.length;
    let plotWidth = dto.plotDimensions.width;

    if (dto.plotDimensions.unit === 'meters') {
      plotLength = plotLength * 3.28084; // Convert meters to feet
      plotWidth = plotWidth * 3.28084;
    }

    // Generate layout using rule-based algorithm
    const layout = LayoutGenerator.generate(
      plotLength,
      plotWidth,
      dto.rooms.bedrooms,
      dto.rooms.bathrooms,
      dto.rooms.kitchen,
      dto.rooms.livingRoom,
      dto.rooms.diningRoom,
      dto.preferences?.vastuCompliant || false,
    );

    const processingTime = Date.now() - startTime;

    // Prepare response
    const response = {
      layout: layout.rooms,
      totalArea: layout.totalArea,
      plotDimensions: {
        length: dto.plotDimensions.length,
        width: dto.plotDimensions.width,
        unit: dto.plotDimensions.unit,
      },
      vastuScore: layout.vastuScore,
      metadata: {
        algorithm: 'rule-based-v1',
        processingTime,
        generatedAt: new Date().toISOString(),
      },
    };

    return response;
  }

  /**
   * Save generated floor plan to project
   */
  async saveFloorPlan(projectId: string, userId: string, layout: any) {
    const project = await this.projectModel.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Update project with generated floor plan
    project.floorPlan = layout;
    await project.save();

    return {
      message: 'Floor plan saved successfully',
      project,
    };
  }

  /**
   * Get floor plan for a project
   */
  async getFloorPlan(projectId: string, userId: string) {
    const project = await this.projectModel.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.floorPlan) {
      throw new NotFoundException('Floor plan not generated yet');
    }

    return project.floorPlan;
  }
}
