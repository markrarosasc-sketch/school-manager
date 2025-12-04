'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Clock, MoreVertical, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Course {
    id: string;
    subject: { name: string; code: string; };
    section: {
        name: string;
        grade: { name: string; };
        _count: { students: number }; // <--- El conteo ahora vive aquí
    };
    teacher: { user: { firstName: string; lastName: string; }; };
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('${process.env.NEXT_PUBLIC_API_URL}/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
                    <p className="text-gray-500 text-sm">Gestión académica del periodo actual</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    + Nuevo Curso
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Cargando cursos...</p>
                ) : courses.map((course) => (
                    // Course Card
                    <div key={course.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">

                        {/* Header con Color Random (Simulado con CSS) */}
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 relative">
                            <div className="absolute top-4 right-4 text-white/80 cursor-pointer hover:text-white">
                                <MoreVertical className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-bold text-xl mt-4 truncate">{course.subject.name}</h3>
                            <p className="text-blue-100 text-sm">{course.section.grade.name} - "{course.section.name}"</p>
                        </div>

                        {/* Body */}
                        <div className="p-5">

                            {/* Profesor */}
                            <div className="flex items-center mb-4">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Docente</p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {course.teacher.user.firstName} {course.teacher.user.lastName}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-gray-600">
                                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                                    {/* ANTES: course._count?.students */}
                                    {/* AHORA: course.section._count.students */}
                                    <span className="text-sm font-medium">
                                        {course.section._count.students} Alumnos
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="text-sm font-medium">4h / sem</span>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-6">
                                <Link href={`/dashboard/courses/${course.id}`}>
                                <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200">
                                    Ver Calificaciones
                                </button>
                                </Link>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}