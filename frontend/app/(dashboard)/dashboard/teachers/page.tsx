'use client';

import { useEffect, useState } from 'react';
import { Plus, GraduationCap, Mail, BookOpen } from 'lucide-react';

interface Teacher {
  id: string;
  specialization: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('${process.env.NEXT_PUBLIC_API_URL}/teachers')
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plana Docente</h1>
          <p className="text-gray-500 text-sm">Administra a los profesores y sus asignaciones</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Contratar Profesor
        </button>
      </div>

      {/* Grid de Tarjetas (Diseño distinto a la tabla para variar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Cargando docentes...</p>
        ) : teachers.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
             No hay profesores registrados aún.
          </div>
        ) : (
          teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                  {teacher.specialization}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900">
                {teacher.user.firstName} {teacher.user.lastName}
              </h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {teacher.user.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                  Sin cursos asignados
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}