import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    // Ejecutamos todas las consultas en paralelo
    const [studentsCount, teachersCount, coursesCount, treasuryData] = await Promise.all([
      // 1. Contar Alumnos Activos
      this.prisma.student.count({ where: { user: { isActive: true } } }),
      
      // 2. Contar Profesores
      this.prisma.teacher.count(),
      
      // 3. Contar Cursos Abiertos
      this.prisma.course.count(),

      // 4. Calcular Ingresos del Mes (Sumar pagos PAID)
      this.prisma.payment.aggregate({
        _sum: { amountPaid: true },
        where: { status: 'PAID' }
      })
    ]);

    // 5. Calcular Morosidad (Pagos pendientes vencidos)
    const overdueCount = await this.prisma.payment.count({
      where: { status: 'OVERDUE' }
    });

    return {
      totalStudents: studentsCount,
      totalTeachers: teachersCount,
      totalCourses: coursesCount,
      totalRevenue: treasuryData._sum.amountPaid || 0,
      overdueInvoices: overdueCount
    };
  }
}
