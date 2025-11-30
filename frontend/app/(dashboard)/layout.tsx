import Sidebar from '@/components/common/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="pl-64 transition-all duration-200">
        {/* Aquí podríamos poner un Navbar superior también */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}