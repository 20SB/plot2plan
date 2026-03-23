import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FloorPlanService } from './floor-plan.service';
import { GenerateFloorPlanDto } from './dto/generate-floor-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('floor-plan')
@UseGuards(JwtAuthGuard)
export class FloorPlanController {
  constructor(private readonly floorPlanService: FloorPlanService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateFloorPlanDto, @Request() req) {
    return this.floorPlanService.generateFloorPlan(dto, req.user.sub);
  }

  @Post(':projectId/save')
  async save(
    @Param('projectId') projectId: string,
    @Body() layout: any,
    @Request() req,
  ) {
    return this.floorPlanService.saveFloorPlan(projectId, req.user.sub, layout);
  }

  @Get(':projectId')
  async get(@Param('projectId') projectId: string, @Request() req) {
    return this.floorPlanService.getFloorPlan(projectId, req.user.sub);
  }
}
