import { Fragment } from "react";
import type { CambioDeHoraModel } from "../../../context/Interfaces/cambiosdehora";

interface LineaDeTiempoGlobalProps {
  horarios: CambioDeHoraModel[];
}

export function LineaDeTiempoGlobal({ horarios }: LineaDeTiempoGlobalProps) {
  const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  // La misma paleta que en las tarjetas
  const gradients = [
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-600",
    "from-amber-400 to-orange-600",
    "from-purple-400 to-violet-600",
    "from-rose-400 to-red-600",
    "from-indigo-400 to-indigo-600"
  ];

  return (
    <div className="w-full bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/60 shadow-xl mb-6">
      <h3 className="text-xl font-bold text-white uppercase tracking-wider">
        Panorama del Día
      </h3>
      
      {/* Margen top de 14 (mt-14) para que los tooltips no se choquen con el título */}
      <div className="relative h-10 bg-slate-950/60 rounded-xl border border-slate-800/80 shadow-inner w-full mt-14 mb-10">
        
        {/* Marcadores de hora: Más grandes y brillantes (text-slate-300) */}
        {[0, 6, 12, 18, 24].map((hora) => (
          <div key={hora} className="absolute top-full mt-3 text-sm font-black text-slate-300" style={{ left: `${(hora / 24) * 100}%`, transform: 'translateX(-50%)' }}>
            {hora}:00
          </div>
        ))}

        {horarios.filter(h => h.estado).map((horario, index) => {
          const startMins = timeToMinutes(horario.HoraInicio);
          const endMins = timeToMinutes(horario.HoraFinal);
          const startPercent = (startMins / 1440) * 100;
          const endPercent = (endMins / 1440) * 100;
          const isOvernight = startMins > endMins;
          const activeGradient = gradients[index % gradients.length];

          // Tooltip rediseñado para que nunca se corte y sea super legible
          const tooltipClass = "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-600 shadow-2xl text-white text-sm font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20";

          return (
            <Fragment key={horario.nombre}>
              {!isOvernight ? (
                <div 
                  className={`absolute top-0 bottom-0 bg-gradient-to-r ${activeGradient} opacity-90 hover:opacity-100 transition-opacity rounded-xl border border-white/20 group cursor-pointer`}
                  style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                >
                  <span className={tooltipClass}>
                    {horario.nombre} ({horario.HoraInicio} - {horario.HoraFinal})
                  </span>
                </div>
              ) : (
                <>
                  <div className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${activeGradient} opacity-90 hover:opacity-100 rounded-r-xl border-y border-r border-white/20 group cursor-pointer`} style={{ width: `${endPercent}%` }}></div>
                  
                  <div className={`absolute top-0 bottom-0 right-0 bg-gradient-to-r ${activeGradient} opacity-90 hover:opacity-100 rounded-l-xl border-y border-l border-white/20 group cursor-pointer`} style={{ width: `${100 - startPercent}%` }}>
                    <span className={tooltipClass}>
                      {horario.nombre} (Nocturno)
                    </span>
                  </div>
                </>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}