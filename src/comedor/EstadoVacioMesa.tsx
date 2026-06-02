import { LayoutDashboard } from 'lucide-react';

export function EstadoVacioMesas() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
      <LayoutDashboard className="text-slate-600 mb-4" size={32} />
      <h3 className="text-lg font-bold text-white mb-1">Salón Vacío</h3>
      <p className="text-slate-400 text-xs text-center max-w-xs">No hay celdas de mesas mapeadas en la base de datos de este turno.</p>
    </div>
  );
}