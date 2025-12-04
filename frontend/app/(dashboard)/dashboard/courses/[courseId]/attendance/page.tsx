'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

// Definimos los estados posibles y sus colores
const STATUS_CONFIG = {
  PRESENT: { label: 'Presente', color: 'bg-green-100 text-green-700 hover:bg-green-200', icon: Check },
  ABSENT: { label: 'Falta', color: 'bg-red-100 text-red-700 hover:bg-red-200', icon: X },
  LATE: { label: 'Tarde', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', icon: Clock },
  EXCUSED: { label: 'Justificado', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', icon: AlertCircle },
};

export default function AttendancePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  // Fecha por defecto: Hoy (formato YYYY-MM-DD para el input date)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // 1. Cargar Alumnos del Curso
  useEffect(() => {
    fetch(`http://localhost:3000/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.section?.students) {
          setStudents(data.section.students);
        }
      });
  }, [courseId]);

  // 2. Cargar Asistencia cuando cambia la fecha
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/attendance?courseId=${courseId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(records => {
        // Convertimos el array de registros en un Mapa { studentId: status } para acceso rápido
        const map: Record<string, string> = {};
        records.forEach((r: any) => map[r.studentId] = r.status);
        setAttendanceMap(map);
      })
      .finally(() => setLoading(false));
  }, [courseId, selectedDate]);

  // 3. Función para marcar (Optimistic Update)
  const handleMark = async (studentId: string, status: string) => {
    // Actualizamos visualmente inmediato (UX rápida)
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));

    try {
      await fetch('http://localhost:3000/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          studentId,
          date: selectedDate,
          status
        })
      });
    } catch (error) {
      console.error("Error guardando asistencia", error);
      alert("Error de conexión al guardar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Control de Asistencia</h1>
        </div>
        
        {/* Selector de Fecha */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <input 
            type="date" 
            className="outline-none text-sm font-medium text-gray-700"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Alumnos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase">
          <div className="col-span-4 pl-2">Alumno</div>
          <div className="col-span-8 flex justify-between px-4">Estado</div>
        </div>

        <div className="divide-y divide-gray-100">
          {students.map((student) => {
            const currentStatus = attendanceMap[student.id]; // Estado actual (undefined si no se ha tomado)

            return (
              <div key={student.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                {/* Nombre */}
                <div className="col-span-4 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                    {student.user.firstName[0]}{student.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.user.lastName}, {student.user.firstName}</p>
                    <p className="text-xs text-gray-400">Cod: {student.id.substring(0, 4)}</p>
                  </div>
                </div>

                {/* Botonera de Asistencia */}
                <div className="col-span-8 flex space-x-2">
                  {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((statusKey) => {
                    const config = STATUS_CONFIG[statusKey];
                    const isActive = currentStatus === statusKey;
                    const Icon = config.icon;

                    return (
                      <button
                        key={statusKey}
                        onClick={() => handleMark(student.id, statusKey)}
                        className={clsx(
                          "flex-1 flex items-center justify-center py-2 rounded-lg transition-all duration-200 border",
                          isActive 
                            ? `${config.color} border-transparent shadow-sm ring-1 ring-offset-1 ring-gray-200` 
                            : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                        )}
                      >
                        <Icon className={clsx("w-4 h-4", isActive ? "" : "opacity-50")} />
                        <span className="ml-2 text-xs font-medium hidden lg:inline">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}