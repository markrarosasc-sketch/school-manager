'use client';

import { useEffect, useState } from 'react';
import { Search, DollarSign, CheckCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react';

export default function TreasuryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null); // Para el loading del botón pagar

  // Cargar deudores
  const fetchDebtors = () => {
    fetch('http://localhost:3000/treasury/debtors')
      .then(res => res.json())
      .then(setStudents)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  // Función para cobrar
  const handlePay = async (paymentId: string) => {
    if (!confirm('¿Confirmar que recibió el dinero en efectivo?')) return;
    
    setProcessingId(paymentId);
    try {
      const res = await fetch(`http://localhost:3000/treasury/pay/${paymentId}`, { method: 'POST' });
      if (res.ok) {
        alert('Pago registrado con éxito 💰');
        fetchDebtors(); // Recargar la lista
      }
    } catch (error) {
      alert('Error al procesar pago');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tesorería y Caja</h1>
          <p className="text-gray-500 text-sm">Gestión de pensiones y cobros</p>
        </div>
        
        {/* KPI Rápido */}
        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-100 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          <span className="font-bold">Caja Abierta</span>
        </div>
      </div>

      {/* Buscador (Visual) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar alumno por nombre..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      {/* Lista de Deudores */}
      <div className="grid gap-6">
        {loading ? <div className="p-8 text-center">Cargando cartera...</div> : students.map((student) => (
          <div key={student.studentId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Cabecera del Alumno */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {student.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{student.fullName}</h3>
                  <p className="text-sm text-gray-500">{student.section}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Deuda Total</p>
                  <p className={`text-xl font-bold ${student.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${student.totalDebt.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalle de Recibos */}
            <div className="p-4">
              {student.payments.length === 0 ? (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Al día en sus pagos.
                </div>
              ) : (
                <div className="space-y-3">
                  {student.payments.map((pay: any) => (
                    <div key={pay.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-800">{pay.definition.title}</p>
                          <p className="text-xs text-red-500 font-medium">Vence: {new Date(pay.definition.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-900">${pay.definition.amount}</span>
                        <button 
                          onClick={() => handlePay(pay.id)}
                          disabled={processingId === pay.id}
                          className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center transition-all active:scale-95 disabled:opacity-50"
                        >
                          {processingId === pay.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CreditCard className="w-4 h-4 mr-2"/>}
                          Cobrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}