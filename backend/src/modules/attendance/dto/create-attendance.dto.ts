import { IsDateString, IsEnum, IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @IsUUID()
  courseId: string;

  @IsUUID()
  studentId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}
