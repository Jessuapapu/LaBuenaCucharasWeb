import { LayoutDashboard, Users, CheckCircle2, Percent } from 'lucide-react';
import type { mesa } from '../../../context/Hooks/hookComedor';

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
      
      <div className="bg-gradient-to-br from-[#d1e9ef]/60 to-[#c5e3e9]/60 border border-sky-300/70 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-[#b2dce7]/70 text-sky-900 rounded-xl border border-sky-300">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-sky-900/80 uppercase tracking-wider block">Mesas Totales</span>
          <span className="text-xl font-black text-slate-900">{cantidadMesas}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#f4e6c9]/60 to-[#f0dcaf]/60 border border-amber-300/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-[#f2d89f]/70 text-amber-950 rounded-xl border border-amber-300">
          <Users size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-amber-950/80 uppercase tracking-wider block">En Servicio</span>
          <span className="text-xl font-black text-slate-900">{mesasOcupadas}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#d8ebd8]/60 to-[#c8e3ca]/60 border border-emerald-300/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-[#bfe0c2]/70 text-emerald-950 rounded-xl border border-emerald-300">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-emerald-950/80 uppercase tracking-wider block">Disponibles</span>
          <span className="text-xl font-black text-slate-900">{mesasLibres}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#e7ddf1]/60 to-[#d9cbea]/60 border border-violet-300/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-[#d0bce7]/70 text-violet-950 rounded-xl border border-violet-300">
          <Percent size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-violet-950/80 uppercase tracking-wider block">Ocupación</span>
          <span className="text-xl font-black text-slate-900">{porcentajeOcupacion}%</span>
        </div>
      </div>

    </div>
  );
}
