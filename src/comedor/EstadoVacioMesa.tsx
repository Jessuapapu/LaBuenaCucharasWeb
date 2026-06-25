import { LayoutDashboard } from 'lucide-react';

export function EstadoVacioMesas() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
      <LayoutDashboard className="text-slate-400 mb-4" size={40} />
      <h3 className="text-xl font-black text-slate-800 mb-2">Salón Vacío</h3>
      <p className="text-slate-500 text-sm font-medium text-center max-w-sm">No hay celdas de mesas mapeadas en la base de datos de este turno.</p>
    </div>
  );
}