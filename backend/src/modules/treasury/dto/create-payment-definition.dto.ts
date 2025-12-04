import { IsString, IsNotEmpty, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreatePaymentDefinitionDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Ej: "Pensión Marzo"

  @IsString()
  description: string;

  @IsNumber()
  amount: number; // Ej: 500.00

  @IsDateString()
  dueDate: string; // Fecha de vencimiento

  @IsUUID()
  academicYearId: string; // Para saber a qué año corresponde
}