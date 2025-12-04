import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) { }

  async create(createStudentDto: CreateStudentDto) {
    const { email, firstName, lastName, sectionId } = createStudentDto;

    // 1. Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 2. Hash del password por defecto (Ej: DNI o "123456")
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 3. Transacción: Crear Usuario + Estudiante
    const result = await this.prisma.$transaction(async (prisma) => {
      // A. Crear Usuario Base
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: UserRole.STUDENT,
        },
      });

      // B. Crear Perfil de Estudiante vinculado
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          sectionId: sectionId || null, // Asignar sección si viene
        },
        include: {
          user: true, // Para devolver el objeto completo
          section: { include: { grade: true } }
        }
      });

      return student;
    });

    return result;
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

  // Buscar perfil de estudiante por User ID (el que viene en el token)
  async findByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId },
      include: {
        section: { include: { grade: true } }
      }
    });
  }

  // Obtener Dashboard del Alumno
  async getStudentDashboard(userId: string) {
      // 1. Buscamos al estudiante
      const student = await this.findByUserId(userId);
      if (!student) throw new Error('Perfil de estudiante no encontrado');

      // --- CORRECCIÓN DE SEGURIDAD ---
      // Si el alumno no tiene sección asignada (es null), no buscamos cursos.
      if (!student.sectionId) {
        return { student, courses: [] };
      }
      // -------------------------------

      // 2. Buscamos sus cursos (Ahora TypeScript sabe que sectionId NO es null aquí)
      const courses = await this.prisma.course.findMany({
        where: { sectionId: student.sectionId },
        include: {
          subject: true,
          teacher: { include: { user: true } },
          assessments: {
             include: {
               gradeEntries: {
                 where: { studentId: student.id }
               }
             }
          }
        }
      });

      return { student, courses };
    }

  // Generar datos para la Libreta de Notas
  async getReportCard(studentId: string) {
    // 1. Buscar al estudiante
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        section: { include: { grade: true } }
      }
    });

    if (!student) throw new Error('Estudiante no encontrado');

    // --- CORRECCIÓN 1: VALIDACIÓN DE SECCIÓN ---
    // Si el alumno no tiene sección, no podemos buscar cursos. Lanzamos error o retornamos vacío.
    if (!student.sectionId) {
      throw new Error('El estudiante no está asignado a ninguna sección y no tiene cursos.');
    }
    // -------------------------------------------

    // 2. Traer cursos (Ahora TypeScript sabe que sectionId es un string seguro)
    const courses = await this.prisma.course.findMany({
      where: { sectionId: student.sectionId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        assessments: {
          include: {
            gradeEntries: { where: { studentId } }
          }
        }
      }
    });

    // 3. Procesar promedios
    // Al arreglar la consulta de arriba, TypeScript ahora reconocerá 'assessments', 'subject', etc.
    const processedCourses = courses.map(course => {
      let totalScore = 0;
      let totalWeight = 0;

      course.assessments.forEach(ass => {
        const grade = ass.gradeEntries[0]?.value;
        if (grade !== undefined) {
          totalScore += grade * ass.weight;
          totalWeight += ass.weight;
        }
      });

      const finalAverage = totalWeight > 0 ? (totalScore / totalWeight).toFixed(0) : '-';

      return {
        subject: course.subject.name,
        teacher: `${course.teacher.user.firstName} ${course.teacher.user.lastName}`,
        average: finalAverage,
        credits: 4 
      };
    });

    return {
      student,
      summary: processedCourses,
      generatedAt: new Date()
    };
  }
}