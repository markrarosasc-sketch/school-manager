import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear Año Académico
  /*const year2025 = await prisma.academicYear.upsert({
    where: { id: 'year-2025' }, // Usamos un ID fijo para no duplicar si corres el seed 2 veces
    update: {},
    create: {
      id: 'year-2025',
      name: '2025',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-20'),
      isCurrent: true,
      terms: {
        create: [
          { name: 'I Bimestre', startDate: new Date('2025-03-01'), endDate: new Date('2025-05-10') },
          { name: 'II Bimestre', startDate: new Date('2025-05-11'), endDate: new Date('2025-07-25') },
        ]
      }
    },
  });
  console.log('📅 Año académico creado.');

  // 2. Crear Grados y Secciones Base
  const grade1 = await prisma.grade.create({
    data: {
      name: '1ro Secundaria',
      level: 'SECUNDARIA',
      sections: {
        create: [
          { name: 'A' },
          { name: 'B' }
        ]
      }
    }
  });
  console.log('🏫 Grados creados.');

  // 3. Crear Usuario Super Admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log('👮 Admin creado: admin@school.com / 123456');*/

  // ... código anterior del admin ...

// 4. Crear Alumnos de Prueba
/*const section1A = await prisma.section.findFirst({ where: { name: 'A' } });

if (section1A) {
  // Alumno 1
  await prisma.user.upsert({
    where: { email: 'juan.perez@school.com' },
    update: {},
    create: {
      email: 'juan.perez@school.com',
      password: await bcrypt.hash('123456', 10),
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.STUDENT,
      studentProfile: {
        create: {
          sectionId: section1A.id
        }
      }
    }
  });

  // Alumno 2
  await prisma.user.upsert({
    where: { email: 'maria.gomez@school.com' },
    update: {},
    create: {
      email: 'maria.gomez@school.com',
      password: await bcrypt.hash('123456', 10),
      firstName: 'María',
      lastName: 'Gómez',
      role: UserRole.STUDENT,
      studentProfile: {
        create: {
          sectionId: section1A.id
        }
      }
    }
  });
  console.log('👨‍🎓 Alumnos de prueba creados.');
}*/

// 5. Crear Profesor de Prueba
    /*await prisma.user.upsert({
        where: { email: 'profe.jirafales@school.com' },
        update: {},
        create: {
          email: 'profe.jirafales@school.com',
          password: await bcrypt.hash('123456', 10),
          firstName: 'Inocencio',
          lastName: 'Jirafales',
          role: UserRole.TEACHER,
          teacherProfile: {
            create: {
              specialization: 'Matemáticas y Pedagogía'
            }
          }
        }
    });
    console.log('👨‍🏫 Profesor creado.');*/

    // ... código anterior ...

    // 6. Crear Materias (Subjects)
    /*const mathSubject = await prisma.subject.create({
      data: { name: 'Matemáticas', code: 'MAT-101' }
    });
    const historySubject = await prisma.subject.create({
      data: { name: 'Historia Universal', code: 'HIS-202' }
    });
    console.log('📚 Materias creadas.');

    // 7. Crear un CURSO REAL (La unión de todo)
    // Buscamos los IDs necesarios que creamos arriba
    const teacher = await prisma.user.findUnique({ where: { email: 'profe.jirafales@school.com' }, include: { teacherProfile: true } });
    const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const section = await prisma.section.findFirst({ where: { name: 'A' } });

    if (teacher?.teacherProfile && year && section) {
      await prisma.course.create({
        data: {
          subjectId: mathSubject.id,
          teacherId: teacher.teacherProfile.id,
          sectionId: section.id,
          academicYearId: year.id
        }
      });
      console.log('🎓 Curso creado: Matemáticas 1ro A - 2025');
    }*/

    // ... código anterior ...

  // 8. Generar Pensión de Marzo (Tesorería)
  // Necesitamos el año académico
  const yearForPayment = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  
  if (yearForPayment) {
    const pensionDef = await prisma.paymentDefinition.create({
      data: {
        title: 'Pensión Marzo 2025',
        description: 'Cuota mensual regular',
        amount: 500.00,
        dueDate: new Date('2025-03-31'),
        academicYearId: yearForPayment.id
      }
    });

    // Asignar a todos los estudiantes que creamos antes
    const allStudents = await prisma.student.findMany();
    
    for (const st of allStudents) {
      await prisma.payment.create({
        data: {
          definitionId: pensionDef.id,
          studentId: st.id,
          status: 'PENDING'
        }
      });
    }
    console.log('💰 Pensiones de Marzo generadas.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });