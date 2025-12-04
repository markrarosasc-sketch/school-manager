import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePaymentDefinitionDto } from './dto/create-payment-definition.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class TreasuryService {
  constructor(private prisma: PrismaService) {}

  // 1. Crear un Concepto y Generar Deuda a TODOS los alumnos activos
  async createMonthlyPayment(dto: CreatePaymentDefinitionDto) {
    // Transacción para asegurar integridad
    return this.prisma.$transaction(async (tx) => {
      
      // A. Crear la Definición (Ej: Pensión Marzo)
      const definition = await tx.paymentDefinition.create({
        data: {
          title: dto.title,
          description: dto.description,
          amount: dto.amount,
          dueDate: new Date(dto.dueDate),
          academicYearId: dto.academicYearId,
        }
      });

      // B. Buscar todos los alumnos activos (que tengan usuario activo)
      const students = await tx.student.findMany({
        where: { user: { isActive: true } },
        select: { id: true }
      });

      if (students.length === 0) return definition;

      // C. Generar la deuda masiva (Bulk Insert)
      // Preparamos el array de datos
      const paymentsData = students.map(student => ({
        definitionId: definition.id,
        studentId: student.id,
        status: PaymentStatus.PENDING,
        amountPaid: 0
      }));

      // Insertamos todo de golpe
      await tx.payment.createMany({
        data: paymentsData
      });

      return {
        ...definition,
        generatedCount: students.length // Retornamos cuántos recibos se crearon
      };
    });
  }

  // 2. Ver Estado de Cuenta de un Alumno
  async getStudentStatement(studentId: string) {
    return this.prisma.payment.findMany({
      where: { studentId },
      include: {
        definition: true // Para ver el título y vencimiento
      },
      orderBy: { definition: { dueDate: 'asc' } }
    });
  }

  // 3. Obtener Resumen de Deudas por Alumno (Para el Cajero)
  async getDebtors() {
    const students = await this.prisma.student.findMany({
      where: { user: { isActive: true } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        section: { include: { grade: true } },
        // Traemos solo los pagos pendientes o vencidos
        Payment: { 
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          include: { definition: true }
        }
      },
      orderBy: { user: { lastName: 'asc' } }
    });

    // Transformamos la data para que sea fácil de leer en el frontend
    return students.map(student => {
      const totalDebt = student.Payment.reduce((sum, p) => sum + p.definition.amount, 0);
      return {
        studentId: student.id,
        fullName: `${student.user.lastName}, ${student.user.firstName}`,
        section: student.section ? `${student.section.grade.name} "${student.section.name}"` : 'Sin sección',
        pendingCount: student.Payment.length,
        totalDebt: totalDebt,
        payments: student.Payment // Enviamos el detalle para poder cobrar individualmente
      };
    });
  }

  // 4. Registrar Pago (Cobrar)
  async registerPayment(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        method: 'CASH', // Por defecto efectivo, luego podríamos parametrizarlo
        operationNumber: `OP-${Math.floor(Math.random() * 100000)}` // Simulado
      }
    });
  }
  
}