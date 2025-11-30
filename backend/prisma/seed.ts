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
const section1A = await prisma.section.findFirst({ where: { name: 'A' } });

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