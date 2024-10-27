import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateCvDTO {
  @IsString()
  @IsOptional()
  name: string;

  @MaxLength(100)
  @IsOptional()
  firstName: string;

  @MaxLength(100)
  @IsOptional()
  lastName: string;

  @IsEmail()
  @IsString()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(15) // l'age minimal c'est 15 ans
  @Max(60) // l'age maximal c'est 60 ans
  age: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cin: number;

  @IsString()
  @IsOptional()
  job: string;

  @IsOptional()
  @IsString()
  path: string;
}
