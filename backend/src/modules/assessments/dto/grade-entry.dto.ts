import { IsNumber, IsUUID, Min, Max } from 'class-validator';

export class GradeEntryDto {
  @IsNumber()
  @Min(0)
  @Max(20) // O 100, según tu sistema
  value: number;

  @IsUUID()
  studentId: string;
}