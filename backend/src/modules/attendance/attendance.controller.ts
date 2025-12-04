import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  getAttendance(
    @Query('courseId') courseId: string,
    @Query('date') date: string
  ) {
    return this.attendanceService.getDailyAttendance(courseId, date);
  }

  @Post()
  markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markStatus(dto);
  }
}
