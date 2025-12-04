import { PartialType } from '@nestjs/mapped-types';
import { MarkAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(MarkAttendanceDto) {}
