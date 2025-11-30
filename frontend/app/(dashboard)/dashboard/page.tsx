'use client';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Recuperamos los datos que guardamos en el login
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.name || 'Usuario'} 👋
        </h1>
        <p className="text-gray-500">Aquí tienes un resumen de la actividad escolar.</p>
      </header>

      {/* Stats Cards (Ejemplo Visual) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Total Alumnos</h3>
            <span className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-bold">+5%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">1,234</p>
          <p className="text-sm text-gray-400 mt-1">Matriculados este año</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Profesores Activos</h3>
          <p className="text-3xl font-bold text-gray-900">48</p>
          <p className="text-sm text-gray-400 mt-1">En planta docente</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Cursos Abiertos</h3>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-400 mt-1">Primaria y Secundaria</p>
        </div>
      </div>
    </div>
  );
}