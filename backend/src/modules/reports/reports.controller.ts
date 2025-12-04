import { Controller, Get, Param, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express'; // Importante importar de Express

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('student/:studentId/pdf')
  async downloadReport(
    @Param('studentId') studentId: string,
    @Res() res: Response // Inyectamos la respuesta de Express para manipular headers
  ) {
    const buffer = await this.reportsService.generateStudentReportPdf(studentId);

    // Configuramos headers para descarga
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Libreta_${studentId}.pdf`,
      'Content-Length': buffer.length,
    });

    // Enviamos el stream
    res.end(buffer);
  }
}
