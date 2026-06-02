import { LayoutDashboard, Users, CheckCircle2, Percent } from 'lucide-react';
import type { mesa } from '../components/Hooks/hookComedor';

interface MetricasProps {
  cantidadMesas: number;
  mesas: mesa[];
}

export function GridMetricasAdmin({ cantidadMesas, mesas }: MetricasProps) {
  // En tu lógica, si una mesa tiene consumo o el socket cambia su estado, lo filtramos aquí
  const mesasOcupadas = mesas.filter(m => m.Estado === true).length;
  const mesasLibres = cantidadMesas - mesasOcupadas;
  const porcentajeOcupacion = cantidadMesas > 0 ? Math.round((mesasOcupadas / cantidadMesas) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-[fade-in_0.3s_ease-out]">
      
      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Mesas Totales</span>
          <span className="text-xl font-black text-white">{cantidadMesas}</span>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
          <Users size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">En Servicio</span>
          <span className="text-xl font-black text-white">{mesasOcupadas}</span>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Disponibles</span>
          <span className="text-xl font-black text-white">{mesasLibres}</span>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10">
          <Percent size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ocupación</span>
          <span className="text-xl font-black text-white">{porcentajeOcupacion}%</span>
        </div>
      </div>

    </div>
  );
}