'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, User, X, Loader2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


// Tipos
interface Student {
  id: string;
  user: { firstName: string; lastName: string; email: string; };
  section?: { name: string; grade: { name: string; }; };
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado del Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });

  // Cargar datos iniciales
  const fetchStudents = async () => {
    try {
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  // Manejar creación de alumno
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al crear');

      // Éxito: Cerrar modal, limpiar form y recargar tabla
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '' });
      fetchStudents();
      alert('Alumno creado correctamente');
    } catch (error) {
      alert('Error: No se pudo crear el alumno (quizás el email ya existe)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          <p className="text-gray-500 text-sm">Gestiona la matrícula</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Alumno
        </button>
      </div>

      {/* Tabla (Código resumido para no repetir todo, es igual al anterior) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr className="p-4"><td>Cargando...</td></tr> : students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{student.user.firstName} {student.user.lastName}</div>
                  <div className="text-sm text-gray-500">{student.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activo</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/reports/student/${student.id}/pdf`}
                    target="_blank" // Abre en pestaña nueva e inicia descarga
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium transition-colors"
                    title="Descargar PDF Oficial"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF Oficial
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL PROFESIONAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Registrar Nuevo Alumno</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Institucional</label>
                <input
                  type="email" required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar Alumno
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}