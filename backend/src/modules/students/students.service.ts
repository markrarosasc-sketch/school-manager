import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // Crear alumno (Simplificado para este paso)
  async create(createStudentDto: CreateStudentDto) {
    // Aquí iría lógica compleja de transacción para crear User + Student
    return 'Esta acción añade un nuevo estudiante (Implementaremos esto luego)';
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: { // Traemos nombre y apellido del usuario
          select: { firstName: true, lastName: true, email: true }
        },
        section: { // Traemos su sección (ej: 1ro A)
          include: { grade: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: { user: true, section: true }
    });
  }
}