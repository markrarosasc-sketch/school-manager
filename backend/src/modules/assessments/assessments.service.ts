import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { GradeEntryDto } from './dto/grade-entry.dto';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  // 1. Crear una nueva columna (Examen/Tarea)
  async create(dto: CreateAssessmentDto) {
    return this.prisma.assessment.create({
      data: {
        title: dto.title,
        weight: dto.weight,
        courseId: dto.courseId,
        termId: dto.termId
      }
    });
  }

  // 2. Obtener todas las evaluaciones de un curso con sus notas
  async findAllByCourse(courseId: string) {
    return this.prisma.assessment.findMany({
      where: { courseId },
      include: {
        gradeEntries: true // Traemos las notas ya puestas
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  // 3. Poner o Actualizar una nota (Upsert)
  async updateGrade(assessmentId: string, dto: GradeEntryDto) {
    return this.prisma.gradeEntry.upsert({
      where: {
        studentId_assessmentId: { // Clave compuesta definida en el Schema
          studentId: dto.studentId,
          assessmentId: assessmentId
        }
      },
      update: { value: dto.value },
      create: {
        studentId: dto.studentId,
        assessmentId: assessmentId,
        value: dto.value
      }
    });
  }
}
