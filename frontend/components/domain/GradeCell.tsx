'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface GradeCellProps {
  studentId: string;
  assessmentId: string;
  initialValue?: number; // Puede ser undefined si no tiene nota
  onSuccess?: () => void;
}

export default function GradeCell({ studentId, assessmentId, initialValue, onSuccess }: GradeCellProps) {


  const [value, setValue] = useState<string>(initialValue?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Actualizar si cambia la prop inicial (ej: recarga de tabla)
  useEffect(() => {
    setValue(initialValue?.toString() || '');
  }, [initialValue]);

  const handleSave = async () => {
    // Si no ha cambiado nada o está vacío, no hacemos nada
    if (value === (initialValue?.toString() || '') && value === '') {
      setIsEditing(false);
      return;
    }

    const numValue = parseFloat(value);
    
    // Validación básica (0 a 20)
    if (isNaN(numValue) || numValue < 0 || numValue > 20) {
      alert('La nota debe ser entre 0 y 20');
      return;
    }

    setStatus('saving');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assessments/${assessmentId}/grades`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          value: numValue
        })
      });

      if (!res.ok) throw new Error('Error al guardar');

      setStatus('success');

      if (onSuccess) onSuccess(); // <--- ¡AVISAR AL PADRE!
      // Volver a estado normal después de 1 segundo
      setTimeout(() => setStatus('idle'), 1000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  // 1. MODO EDICIÓN (Input)
  if (isEditing) {
    return (
      <input
        autoFocus
        type="number"
        min="0" max="20"
        className="w-full h-full text-center border-2 border-blue-500 outline-none bg-white p-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave} // Guardar al hacer clic afuera
        onKeyDown={handleKeyDown} // Guardar al dar Enter
      />
    );
  }

  // Determinamos el color según la nota (Lógica de negocio visual)
  const numValue = parseFloat(value);
  const isFailing = !isNaN(numValue) && numValue < 11; // Rojo si es menor a 11
  const isEmpty = value === '';

  // 2. MODO VISUALIZACIÓN (Texto Mejorado)
  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={clsx(
        "w-full h-full flex items-center justify-center cursor-pointer transition-all duration-200",
        // Tamaño y Fuente base
        "text-[15px]", 
        
        // Colores Condicionales (Aquí está la magia)
        isEmpty && "text-gray-300 font-normal hover:bg-gray-50", // Vacío (tenue)
        !isEmpty && isFailing && "text-red-600 font-extrabold bg-red-50/30 hover:bg-red-50", // Jalado (Rojo + Negrita)
        !isEmpty && !isFailing && "text-blue-700 font-bold hover:bg-blue-50", // Aprobado (Azul + Negrita)

        // Estados de carga/error (Sobrescriben lo anterior)
        status === 'saving' && "bg-blue-50 text-blue-400",
        status === 'success' && "bg-green-100 text-green-800",
        status === 'error' && "bg-red-100 text-red-800",
      )}
    >
      {status === 'saving' ? (
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      ) : (
        value || '-'
      )}
    </div>
  );
}