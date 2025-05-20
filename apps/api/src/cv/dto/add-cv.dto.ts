import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddCvDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cin: number;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsOptional()
  @IsString()
  path: string;
}
