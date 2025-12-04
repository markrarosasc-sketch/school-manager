import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // <--- Importar
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TreasuryModule } from './modules/treasury/treasury.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [AuthModule, StudentsModule, TeachersModule, CoursesModule, AssessmentsModule, AttendanceModule, ReportsModule, TreasuryModule, DashboardModule],
  controllers: [],
  providers: [PrismaService], // <--- Agregar aquí
})
export class AppModule {}