import { LayoutDashboard } from 'lucide-react';

export function EstadoVacioMesas() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-sky-300 rounded-2xl bg-gradient-to-br from-[#dceef0]/55 to-[#e7efda]/55">
      <LayoutDashboard className="text-teal-700 mb-4" size={40} />
      <h3 className="text-xl font-black text-slate-800 mb-2">Salón Vacío</h3>
      <p className="text-slate-700 text-sm font-medium text-center max-w-sm">No hay mesas registradas para este turno.</p>
    </div>
  );
}
