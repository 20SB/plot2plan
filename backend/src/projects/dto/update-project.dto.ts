import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsEnum(['draft', 'processing', 'completed', 'failed'])
  status?: string;
}
