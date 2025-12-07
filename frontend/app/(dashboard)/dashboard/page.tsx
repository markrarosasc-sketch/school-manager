'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cargar Usuario
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    // 2. Cargar Estadísticas Reales
    fetch('${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Componente de Tarjeta para no repetir código
  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {loading ? '...' : value}
      </p>
      <p className="text-sm text-gray-400 mt-1">{subtext}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header de Bienvenida */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hola, {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Aquí tienes el resumen de operaciones del colegio.
          </p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-sm text-gray-400">Fecha</p>
           <p className="font-medium text-gray-700">
             {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <StatCard 
          title="Alumnos" 
          value={stats?.totalStudents || 0} 
          subtext="Matriculados activos"
          icon={Users}
          colorClass="bg-blue-500 text-blue-600"
        />

        <StatCard 
          title="Profesores" 
          value={stats?.totalTeachers || 0} 
          subtext="Plana docente"
          icon={GraduationCap}
          colorClass="bg-purple-500 text-purple-600"
        />

        <StatCard 
          title="Ingresos (Mes)" 
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`} 
          subtext="Recaudación Tesorería"
          icon={DollarSign}
          colorClass="bg-green-500 text-green-600"
        />

        <StatCard 
          title="Morosidad" 
          value={stats?.overdueInvoices || 0} 
          subtext="Pagos vencidos"
          icon={AlertCircle}
          colorClass="bg-red-500 text-red-600"
        />
      </div>

      {/* Sección Secundaria (Visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acceso Rápido / Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
             <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                   <p className="text-sm font-bold text-blue-900">Sistema Operativo</p>
                   <p className="text-xs text-blue-700">Todos los servicios (API, DB, Auth) están funcionando correctamente.</p>
                </div>
             </div>
          </div>
        </div>
        
        {/* Banner Informativo */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white flex flex-col justify-between">
           <div>
              <h3 className="font-bold text-xl mb-2">Panel Premium</h3>
              <p className="text-blue-100 text-sm">Recuerda generar los reportes mensuales antes del día 30.</p>
           </div>
           <button className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Ver Reportes
           </button>
        </div>
      </div>
    </div>
  );
}