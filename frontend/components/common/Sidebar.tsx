'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut 
} from 'lucide-react';
import clsx from 'clsx'; // Asegúrate de tenerlo instalado: npm i clsx

const menuItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Alumnos', icon: Users },
  { href: '/dashboard/teachers', label: 'Profesores', icon: GraduationCap },
  { href: '/dashboard/courses', label: 'Cursos', icon: BookOpen },
  { href: '/dashboard/schedule', label: 'Horario', icon: Calendar },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <GraduationCap className="h-8 w-8 text-blue-600 mr-2" />
        <span className="font-bold text-xl text-gray-800">SchoolApp</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className={clsx('h-5 w-5 mr-3', isActive ? 'text-blue-600' : 'text-gray-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}