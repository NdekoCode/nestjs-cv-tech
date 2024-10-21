import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CvDTO {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

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
  @IsOptional()
  age: number;

  @IsNumber()
  @IsOptional()
  cin: number;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsNotEmpty()
  @IsString()
  path: string;
}
