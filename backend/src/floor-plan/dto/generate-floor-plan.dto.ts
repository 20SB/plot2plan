import { IsNumber, IsBoolean, IsString, IsOptional, IsEnum, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PlotDimensionsDto {
  @IsNumber()
  @Min(10)
  @Max(1000)
  length: number;

  @IsNumber()
  @Min(10)
  @Max(1000)
  width: number;

  @IsEnum(['feet', 'meters'])
  unit: 'feet' | 'meters';
}

class RoomRequirementsDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  bedrooms: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  bathrooms: number;

  @IsBoolean()
  kitchen: boolean;

  @IsBoolean()
  livingRoom: boolean;

  @IsBoolean()
  diningRoom: boolean;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  balconies?: number;

  @IsBoolean()
  @IsOptional()
  parking?: boolean;

  @IsBoolean()
  @IsOptional()
  studyRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  prayerRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  storeRoom?: boolean;
}

class PreferencesDto {
  @IsBoolean()
  @IsOptional()
  vastuCompliant?: boolean;

  @IsEnum(['modern', 'traditional', 'minimalist'])
  @IsOptional()
  style?: 'modern' | 'traditional' | 'minimalist';

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  floors?: number;
}

export class GenerateFloorPlanDto {
  @ValidateNested()
  @Type(() => PlotDimensionsDto)
  plotDimensions: PlotDimensionsDto;

  @ValidateNested()
  @Type(() => RoomRequirementsDto)
  rooms: RoomRequirementsDto;

  @ValidateNested()
  @Type(() => PreferencesDto)
  @IsOptional()
  preferences?: PreferencesDto;

  @IsString()
  projectId: string;
}
