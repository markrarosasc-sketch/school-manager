'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Printer, ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function ReportCardPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${params.studentId}/report-card`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [params.studentId]);

  if (!data) return <div className="p-12 text-center">Generando reporte...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      
      {/* Botonera (Se oculta al imprimir) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/dashboard/students" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 shadow-md"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* HOJA DE PAPEL (A4 Simulado) */}
      <div className="max-w-4xl mx-auto bg-white p-12 shadow-2xl rounded-xl min-h-[1123px] print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Encabezado Oficial */}
        <div className="text-center border-b-2 border-gray-800 pb-8 mb-8">
          <div className="flex justify-center mb-4">
             <GraduationCap className="w-16 h-16 text-gray-800" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">Colegio San Agustín</h1>
          <p className="text-gray-600 mt-2">Informe de Progreso Académico - Año 2025</p>
        </div>

        {/* Datos del Alumno */}
        <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 print:bg-transparent print:border-none print:p-0">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Alumno</p>
            <p className="text-xl font-bold text-gray-900">
              {data.student.user.lastName}, {data.student.user.firstName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Grado y Sección</p>
            <p className="text-xl font-bold text-gray-900">
              {data.student.section.grade.name} - "{data.student.section.name}"
            </p>
          </div>
        </div>

        {/* Tabla de Notas Finales */}
        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-3 font-bold uppercase text-sm">Asignatura</th>
              <th className="text-left py-3 font-bold uppercase text-sm">Docente</th>
              <th className="text-right py-3 font-bold uppercase text-sm">Promedio Bimestral</th>
              <th className="text-right py-3 font-bold uppercase text-sm">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.summary.map((row: any, index: number) => {
              const score = parseInt(row.average);
              const isFailing = !isNaN(score) && score < 11;

              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4 font-medium text-gray-800">{row.subject}</td>
                  <td className="py-4 text-gray-600 text-sm">{row.teacher}</td>
                  <td className="py-4 text-right font-bold text-lg">
                    {row.average}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                      isFailing 
                        ? 'text-red-700 border-red-700 bg-red-50 print:text-black print:border-black' 
                        : 'text-blue-700 border-blue-700 bg-blue-50 print:text-black print:border-black'
                    }`}>
                      {isNaN(score) ? 'PENDIENTE' : (score >= 11 ? 'APROBADO' : 'EN RIESGO')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Firmas */}
        <div className="grid grid-cols-3 gap-8 mt-24 pt-12">
          <div className="text-center border-t border-gray-400 pt-4">
            <p className="text-sm font-bold">Tutor(a)</p>
          </div>
          <div className="text-center border-t border-gray-400 pt-4">
            <p className="text-sm font-bold">Director Académico</p>
          </div>
          <div className="text-center border-t border-gray-400 pt-4">
            <p className="text-sm font-bold">Padre de Familia</p>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400">
           Documento generado digitalmente el {new Date(data.generatedAt).toLocaleDateString()}
        </div>

      </div>
    </div>
  );
}