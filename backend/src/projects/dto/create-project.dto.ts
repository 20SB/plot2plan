import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlotDetailsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  length: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  width: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  area: number;

  @IsOptional()
  @IsString()
  @IsEnum(['North', 'South', 'East', 'West', 'NorthEast', 'NorthWest', 'SouthEast', 'SouthWest'])
  facingDirection?: string;

  @IsOptional()
  @IsString()
  shape?: string;
}

export class RoomRequirementsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kitchen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  livingRoom?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  diningRoom?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  studyRoom?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poojaRoom?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balconies?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  parking?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  storeRoom?: number;

  @IsOptional()
  @IsObject()
  others?: Record<string, number>;
}

export class DesignPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styles?: string[];

  @IsOptional()
  @IsBoolean()
  vastuCompliant?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialRequirements?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  floorCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlotDetailsDto)
  plotDetails: PlotDetailsDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RoomRequirementsDto)
  roomRequirements: RoomRequirementsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DesignPreferencesDto)
  designPreferences?: DesignPreferencesDto;
}
