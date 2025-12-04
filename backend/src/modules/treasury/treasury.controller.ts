import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { CreatePaymentDefinitionDto } from './dto/create-payment-definition.dto';

@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  // Endpoint para que el Admin genere las pensiones
  @Post('generate-monthly')
  createDefinition(@Body() dto: CreatePaymentDefinitionDto) {
    return this.treasuryService.createMonthlyPayment(dto);
  }

  // Endpoint para ver deudas de un alumno específico
  @Get('student/:studentId')
  getStatement(@Param('studentId') studentId: string) {
    return this.treasuryService.getStudentStatement(studentId);
  }

  // ... imports
  @Get('debtors')
  getDebtors() {
    return this.treasuryService.getDebtors();
  }

  @Post('pay/:paymentId')
  registerPayment(@Param('paymentId') paymentId: string) {
    return this.treasuryService.registerPayment(paymentId);
  }
  
}