import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // <--- Importar
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './modules/students/students.module';

@Module({
  imports: [AuthModule, StudentsModule],
  controllers: [],
  providers: [PrismaService], // <--- Agregar aquí
})
export class AppModule {}