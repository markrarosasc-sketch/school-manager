import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import puppeteer from 'puppeteer';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async generateStudentReportPdf(studentId: string): Promise<Buffer> {
        // 1. OBTENER DATOS (Reutilizamos la lógica de la libreta)
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: true,
                section: { include: { grade: true } }
            }
        });

        if (!student) throw new Error('Estudiante no encontrado');

        // Validación rápida
        if (!student.section) {
      throw new Error('El estudiante no tiene sección asignada (Datos incompletos)');
    }

        const courses = await this.prisma.course.findMany({
            where: { sectionId: student.section.id },
            include: {
                subject: true,
                teacher: { include: { user: true } },
                assessments: {
                    include: { gradeEntries: { where: { studentId } } }
                }
            }
        });

        // Calcular promedios
        const rows = courses.map(course => {
            let totalScore = 0, totalWeight = 0;
            course.assessments.forEach(ass => {
                const grade = ass.gradeEntries[0]?.value;
                if (grade !== undefined) {
                    totalScore += grade * ass.weight;
                    totalWeight += ass.weight;
                }
            });
            const avg = totalWeight > 0 ? (totalScore / totalWeight).toFixed(0) : '-';
            return { subject: course.subject.name, teacher: course.teacher.user.lastName, avg };
        });

        // 2. CONSTRUIR EL HTML (PLANTILLA)
        // Usamos Template Literals para diseñar el HTML. En producción usarías Handlebars o EJS.
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
          .sub { color: #666; margin-top: 5px; font-size: 12px; }
          
          .info-box { width: 100%; margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #888; }
          .value { font-size: 16px; font-weight: bold; }

          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; border-bottom: 2px solid #333; padding: 10px; font-size: 12px; text-transform: uppercase; }
          td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
          .score { font-weight: bold; text-align: right; }
          
          .footer { position: fixed; bottom: 50px; left: 0; right: 0; text-align: center; font-size: 10px; color: #aaa; }
          .signatures { display: flex; justify-content: space-between; margin-top: 100px; padding: 0 50px; }
          .line { border-top: 1px solid #333; width: 150px; padding-top: 5px; font-size: 10px; text-align: center; font-weight: bold;}
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Colegio San Agustín</div>
          <div class="sub">Informe Académico Oficial - 2025</div>
        </div>

        <div class="info-box">
          <div class="info-row">
            <div>
              <div class="label">Estudiante</div>
              <div class="value">${student.user.lastName}, ${student.user.firstName}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Grado / Sección</div>
              <div class="value">${student.section.grade.name} - "${student.section.name}"</div>
            </div>
          </div>
          <div class="info-row">
            <div>
              <div class="label">Código Único</div>
              <div class="value">${student.id.split('-')[0].toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Fecha de Emisión</div>
              <div class="value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Asignatura</th>
              <th>Docente</th>
              <th style="text-align: right;">Promedio</th>
              <th style="text-align: right;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => {
            const num = parseInt(row.avg);
            const color = !isNaN(num) && num < 11 ? 'color: red;' : 'color: black;';
            const status = isNaN(num) ? 'PENDIENTE' : (num >= 11 ? 'APROBADO' : 'RECUPERACIÓN');
            return `
                <tr>
                  <td>${row.subject}</td>
                  <td>Prof. ${row.teacher}</td>
                  <td class="score" style="${color}">${row.avg}</td>
                  <td style="text-align: right; font-size: 10px; font-weight: bold;">${status}</td>
                </tr>
              `;
        }).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="line">Tutor(a)</div>
          <div class="line">Dirección Académica</div>
        </div>

        <div class="footer">
          Documento generado electrónicamente. Código de validación: ${Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </body>
      </html>
    `;

        // 3. INVOCAR A PUPPETEER (HEADLESS CHROME)
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Asignamos el HTML
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generamos el PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '40px', left: '20px', right: '20px' }
        });

        await browser.close();

        // Devolvemos el archivo binario
        return Buffer.from(pdfBuffer);
    }
}
