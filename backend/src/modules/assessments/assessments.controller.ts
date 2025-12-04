import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { GradeEntryDto } from './dto/grade-entry.dto';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  create(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.assessmentsService.create(createAssessmentDto);
  }

  @Get('course/:courseId')
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.assessmentsService.findAllByCourse(courseId);
  }

  @Put(':id/grades')
  updateGrade(
    @Param('id') id: string, // ID de la Evaluación
    @Body() gradeEntryDto: GradeEntryDto
  ) {
    return this.assessmentsService.updateGrade(id, gradeEntryDto);
  }
}
