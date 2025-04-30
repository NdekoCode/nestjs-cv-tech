import { Type } from 'class-transformer';
import {
  IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min
} from 'class-validator';

export class AddCvDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  description: string;

  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(15) // l'age minimal c'est 15 ans
  @Max(60) // l'age maximal c'est 60 ans
  age: number;

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
