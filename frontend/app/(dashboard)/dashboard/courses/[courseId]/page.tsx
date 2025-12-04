'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Save, Loader2, X, Calendar } from 'lucide-react';
import Link from 'next/link';
import GradeCell from '@/components/domain/GradeCell';
import clsx from 'clsx';

export default function CourseGradesPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<any>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAssessment, setNewAssessment] = useState({ title: '', weight: 20 });
    const [isCreating, setIsCreating] = useState(false);

    // 1. Cargar Datos Iniciales
    const loadData = async () => {
        try {
            // Cargar Curso (con alumnos) y Evaluaciones en paralelo
            const [resCourse, resAssessments] = await Promise.all([
                fetch(`http://localhost:3000/courses/${courseId}`),
                fetch(`http://localhost:3000/assessments/course/${courseId}`)
            ]);

            const courseData = await resCourse.json();
            const assessmentsData = await resAssessments.json();

            setCourse(courseData);
            setAssessments(assessmentsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) loadData();
    }, [courseId]);

    // 2. Crear Evaluación
    const handleCreateAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        // Obtenemos el primer periodo activo (Simplificación para el tutorial)
        // En un sistema real, el usuario elegiría el bimestre en un select
        const activeTermId = course?.academicYear?.terms[0]?.id;

        if (!activeTermId) {
            alert('Error: No se encontró un periodo académico activo.');
            setIsCreating(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newAssessment.title,
                    weight: Number(newAssessment.weight),
                    courseId: courseId,
                    termId: activeTermId
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setNewAssessment({ title: '', weight: 20 });
                loadData(); // Recargar la tabla
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) return <div className="p-8">Cargando registro...</div>;

    // Función para calcular promedio ponderado de un alumno
    const getStudentAverage = (studentId: string) => {
        let totalScore = 0;
        let totalWeight = 0;

        assessments.forEach(assessment => {
            const gradeEntry = assessment.gradeEntries.find((g: any) => g.studentId === studentId);

            // Solo contamos si tiene nota (si está vacío no baja el promedio, simplemente no cuenta)
            if (gradeEntry && gradeEntry.value !== undefined && gradeEntry.value !== null) {
                totalScore += (gradeEntry.value * assessment.weight);
                totalWeight += assessment.weight;
            }
        });

        if (totalWeight === 0) return '-';

        // Fórmula: Suma(Nota * Peso) / Suma(Pesos)
        // Esto normaliza el promedio aunque los pesos no sumen 100 todavía
        const average = totalScore / totalWeight;

        // Retornamos con 1 decimal (ej: 15.4)
        return average.toFixed(1);
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course?.subject?.name}</h1>
                    <p className="text-gray-500 text-sm">{course?.section?.grade?.name} "{course?.section?.name}"</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className="font-medium text-gray-700">Periodo: I Bimestre</span>

                <div className="flex gap-3"> {/* Contenedor para agrupar botones */}

                    {/* --- BOTÓN DE ASISTENCIA --- */}
                    <Link href={`/dashboard/courses/${courseId}/attendance`}>
                        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 shadow-sm text-sm font-medium transition-colors">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            Tomar Asistencia
                        </button>
                    </Link>

                    {/* --- BOTÓN NUEVA EVALUACIÓN (Ya existía) --- */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 shadow-sm text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Evaluación
                    </button>
                </div>
            </div>

            {/* --- LA MATRIZ DE NOTAS --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-64 sticky left-0 bg-gray-50 z-10 border-r">
                                Alumno
                            </th>
                            {assessments.map((assessment) => (
                                <th key={assessment.id} className="px-4 py-4 text-center min-w-[120px] border-r border-gray-100">
                                    <div className="text-xs font-bold text-gray-700 uppercase">{assessment.title}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">{assessment.weight}%</div>
                                </th>
                            ))}
                            <th className="px-4 py-4 text-center min-w-[100px] text-xs font-bold text-gray-500 uppercase bg-gray-50">
                                Promedio
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {course?.section?.students?.map((student: any) => (
                            <tr key={student.id} className="hover:bg-gray-50 group">
                                {/* Columna Fija: Nombre Alumno */}
                                <td className="px-6 py-3 border-r border-gray-200 bg-white sticky left-0 group-hover:bg-gray-50 z-10">
                                    <div className="font-medium text-gray-900 text-sm">
                                        {student.user.lastName}, {student.user.firstName}
                                    </div>
                                </td>

                                {/* Columnas Dinámicas: Notas */}
                                {assessments.map((assessment) => {
                                    // Buscamos si este alumno tiene nota en esta evaluación
                                    const gradeEntry = assessment.gradeEntries.find((g: any) => g.studentId === student.id);
                                    const gradeValue = gradeEntry ? gradeEntry.value : '-';

                                    return (
                                        <td key={assessment.id} className="p-0 border-r border-gray-100 text-center relative h-12">
                                            <GradeCell
                                                studentId={student.id}
                                                assessmentId={assessment.id}
                                                initialValue={gradeEntry ? gradeEntry.value : undefined}
                                                onSuccess={() => loadData()} // <--- ESTO HACE LA MAGIA
                                            />
                                        </td>
                                    );
                                })}

                                {/* Columna Promedio Dinámico */}
                                <td className="px-4 py-3 text-center border-l border-gray-200 bg-gray-50">
                                    {(() => {
                                        const avg = getStudentAverage(student.id);
                                        const numAvg = parseFloat(avg);
                                        const isFailing = !isNaN(numAvg) && numAvg < 11;

                                        return (
                                            <span className={clsx(
                                                "font-bold text-sm px-3 py-1 rounded-full",
                                                avg === '-' && "text-gray-400",
                                                // Estilos condicionales para el promedio
                                                !isNaN(numAvg) && isFailing && "bg-red-100 text-red-700 border border-red-200",
                                                !isNaN(numAvg) && !isFailing && "bg-blue-100 text-blue-700 border border-blue-200"
                                            )}>
                                                {avg}
                                            </span>
                                        );
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {assessments.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        Crea una evaluación para comenzar a registrar notas.
                    </div>
                )}
            </div>

            {/* --- MODAL CREAR EVALUACIÓN --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Nueva Evaluación</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCreateAssessment} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Título</label>
                                <input
                                    autoFocus
                                    required
                                    placeholder="Ej: Examen Parcial"
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newAssessment.title}
                                    onChange={e => setNewAssessment({ ...newAssessment, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Peso (%)</label>
                                <input
                                    type="number"
                                    required
                                    min="1" max="100"
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newAssessment.weight}
                                    onChange={e => setNewAssessment({ ...newAssessment, weight: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex justify-center items-center"
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
