import { IsString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Ej: "Examen Unidad 1"

  @IsNumber()
  weight: number; // Ej: 0.2 (20%)

  @IsUUID()
  courseId: string;

  @IsUUID()
  termId: string; // Ej: ID del "I Bimestre"
}
