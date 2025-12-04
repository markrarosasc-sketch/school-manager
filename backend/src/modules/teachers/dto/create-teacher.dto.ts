import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  specialization?: string; // Ej: "Matemáticas", "Ciencias"
}