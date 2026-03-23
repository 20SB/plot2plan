import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...createProjectDto,
      userId,
      status: 'draft',
    });

    return project.save();
  }

  async findAll(userId: string, page = 1, limit = 10): Promise<{ projects: ProjectDocument[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.projectModel
        .find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments({ userId, isDeleted: false }),
    ]);

    return {
      projects,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, projectId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({
      _id: projectId,
      isDeleted: false,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check ownership
    if (project.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(userId: string, projectId: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDocument> {
    const project = await this.findOne(userId, projectId);

    Object.assign(project, updateProjectDto);
    return project.save();
  }

  async remove(userId: string, projectId: string): Promise<void> {
    const project = await this.findOne(userId, projectId);
    
    // Soft delete
    project.isDeleted = true;
    await project.save();
  }

  async getStats(userId: string): Promise<any> {
    const stats = await this.projectModel.aggregate([
      { $match: { userId: userId as any, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await this.projectModel.countDocuments({ userId, isDeleted: false });

    return {
      total,
      byStatus: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}
