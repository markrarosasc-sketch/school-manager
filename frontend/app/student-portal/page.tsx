'use client';
import { useEffect, useState } from 'react';
import { Book, GraduationCap, Trophy } from 'lucide-react';

export default function StudentPortal() {
  const [data, setData] = useState<any>(null);
  
  // SIMULACIÓN: Obtenemos el ID del usuario actual del localStorage
  // Asegúrate de haberte logueado como Juan Pérez antes, o hardcodea su ID de usuario aquí para probar
  // const userId = "ID-DEL-USUARIO-JUAN"; 
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      
      // Llamamos al endpoint especial
      fetch(`http://localhost:3000/students/dashboard/${u.id}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }
  }, []);

  if (!data) return <div className="p-8">Cargando tus notas...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-6">
      {/* Botón de Salir (Opcional pero útil) */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Un detalle de diseño: Círculo decorativo */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <h1 className="text-3xl font-bold relative z-10">Hola, {user?.name} 👋</h1>
        <p className="text-blue-100 mt-2 relative z-10">
          Estudiante de {data.student.section.grade.name} "{data.student.section.name}"
        </p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
        Mis Calificaciones
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.courses.map((course: any) => {
          // Calcular promedio simple en el front
          let total = 0, weight = 0;
          course.assessments.forEach((ass: any) => {
            if (ass.gradeEntries[0]) {
              total += ass.gradeEntries[0].value * ass.weight;
              weight += ass.weight;
            }
          });
          const average = weight > 0 ? (total / weight).toFixed(1) : '-';
          const numAvg = parseFloat(average);

          return (
            <div key={course.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-lg text-gray-900">{course.subject.name}</h3>
                   <p className="text-sm text-gray-500">Prof. {course.teacher.user.lastName}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg font-bold text-lg ${
                  !isNaN(numAvg) && numAvg >= 11 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                }`}>
                  {average}
                </div>
              </div>

              {/* Lista de notas individuales */}
              <div className="space-y-2 mt-4">
                {course.assessments.map((ass: any) => (
                  <div key={ass.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{ass.title} ({ass.weight}%)</span>
                    <span className="font-medium text-gray-900">
                      {ass.gradeEntries[0]?.value || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ... grid de notas ... */}

      {/* Footer Informativo */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Nota Importante</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Las calificaciones mostradas en este portal son preliminares y se actualizan en tiempo real. 
              Para obtener la <strong>Libreta de Notas Oficial</strong> firmada y sellada, por favor acérquese a Secretaría o espere al cierre del periodo académico.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}