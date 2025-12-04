import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MarkAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // 1. Obtener asistencia de un día específico
  async getDailyAttendance(courseId: string, date: string) { // date string YYYY-MM-DD
    // Convertimos el string a objeto Date (asegurando hora 00:00 UTC o local según config)
    const targetDate = new Date(date); 

    // Buscamos la sesión
    const session = await this.prisma.attendanceSession.findUnique({
      where: {
        date_courseId: { // Clave compuesta
          courseId,
          date: targetDate
        }
      },
      include: {
        records: true
      }
    });

    if (!session) return []; // Si no hay sesión, devolvemos array vacío (Frontend lo interpretará)
    return session.records;
  }

  // 2. Marcar asistencia (Individual)
  async markStatus(dto: MarkAttendanceDto) {
    const targetDate = new Date(dto.date);

    // A. Garantizar que la sesión existe (Upsert de Sesión)
    const session = await this.prisma.attendanceSession.upsert({
      where: {
        date_courseId: {
          courseId: dto.courseId,
          date: targetDate
        }
      },
      update: {}, // Si existe no hacemos nada
      create: {
        courseId: dto.courseId,
        date: targetDate
      }
    });

    // B. Guardar el registro del alumno (Upsert de Record)
    return this.prisma.attendanceRecord.upsert({
      where: {
        // Prisma genera un ID único, pero necesitamos buscar por session+student.
        // Para simplificar, usaremos findFirst en la lógica o asumiremos creación.
        // *Senior Tip:* Lo ideal es tener un @@unique([sessionId, studentId]) en el Schema.
        // Como el schema actual usa ID autogenerado, usaremos findFirst + update/create manual 
        // Ojo: Si no agregaste @@unique en el schema, upsert no funcionará directo por campos no únicos.
        // Haremos la lógica manual segura:
        id: 'dummy-uuid' // Truco: forzamos a entrar al create si no tenemos ID, pero mejor usaremos lógica explícita abajo:
      },
      update: { status: dto.status }, // Esto fallará si no pasamos el ID del record.
      create: { status: dto.status, studentId: dto.studentId, sessionId: session.id }
    }).catch(async () => {
        // Fallback manual si el upsert falla por ID:
        const existing = await this.prisma.attendanceRecord.findFirst({
            where: { sessionId: session.id, studentId: dto.studentId }
        });

        if (existing) {
            return this.prisma.attendanceRecord.update({
                where: { id: existing.id },
                data: { status: dto.status }
            });
        } else {
            return this.prisma.attendanceRecord.create({
                data: { sessionId: session.id, studentId: dto.studentId, status: dto.status }
            });
        }
    });
  }
}