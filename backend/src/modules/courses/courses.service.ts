import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../../prisma.service';


@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Crear curso (Lo dejamos simple por ahora, usaremos el del seed)
  create(createCourseDto: any) {
    return 'This action adds a new course';
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        subject: true,
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        },
        section: { 
          include: { 
            grade: true,
            // AQUÍ es donde realmente están los alumnos
            _count: {
              select: { students: true } 
            }
          } 
        },
      }
    });
  }

  async findOne(id: string) {
  const course = await this.prisma.course.findUnique({
    where: { id },
    include: {
      // ... (mantén todo tu include gigante aquí tal cual estaba)
      subject: true,
      section: {
         include: {
           grade: true,
           students: {
             include: { user: { select: { firstName: true, lastName: true } } },
             orderBy: { user: { lastName: 'asc' } }
           }
         }
      },
      academicYear: { include: { terms: true } }
    }
  });

  // --- AGREGA ESTO ---
  if (!course) {
    throw new NotFoundException(`El curso con ID ${id} no existe`);
  }
  // -------------------

  return course;
}


  /*update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }*/
}
