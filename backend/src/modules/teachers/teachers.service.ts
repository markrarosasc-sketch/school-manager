import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const { email, firstName, lastName, specialization } = createTeacherDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email ya registrado');

    const hashedPassword = await bcrypt.hash('docente123', 10); // Pass default

    // Transacción: Usuario + Perfil Profesor
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: UserRole.TEACHER, // <--- ROL DE PROFESOR
        },
      });

      return prisma.teacher.create({
        data: {
          userId: user.id,
          specialization: specialization || 'General',
        },
        include: { user: true }
      });
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        coursesTaught: true, // Ver qué cursos dicta (cuando tengamos cursos)
      }
    });
  }

  async findOne(id: string) { /* ... */ }
}