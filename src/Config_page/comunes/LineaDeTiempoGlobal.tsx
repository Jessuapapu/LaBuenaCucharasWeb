import { Fragment } from "react";
import type { CambioDeHoraModel } from "../../interfaces/cambiosdehora";

interface LineaDeTiempoGlobalProps {
  horarios: CambioDeHoraModel[];
}

export function LineaDeTiempoGlobal({ horarios }: LineaDeTiempoGlobalProps) {
  const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  // Paleta de colores para diferenciar los turnos
  const colores = [
    "bg-sky-500", "bg-emerald-500", "bg-amber-500", 
    "bg-purple-500", "bg-rose-500", "bg-indigo-500"
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
        Panorama del Día
      </h3>
      
      <div className="relative h-6 bg-slate-100 dark:bg-slate-900 rounded-lg shadow-inner w-full">
        {/* Marcadores de hora de fondo */}
        {[0, 6, 12, 18, 24].map((hora) => (
          <div key={hora} className="absolute top-full mt-2 text-[10px] font-bold text-slate-400" style={{ left: `${(hora / 24) * 100}%`, transform: 'translateX(-50%)' }}>
            {hora}:00
          </div>
        ))}

        {/* Mapeo de todos los horarios */}
        {horarios.filter(h => h.estado).map((horario, index) => {
          const startMins = timeToMinutes(horario.HoraInicio);
          const endMins = timeToMinutes(horario.HoraFinal);
          const startPercent = (startMins / 1440) * 100;
          const endPercent = (endMins / 1440) * 100;
          const isOvernight = startMins > endMins;
          const colorClass = colores[index % colores.length];

          return (
            <Fragment key={horario.nombre}>
              {!isOvernight ? (
                <div 
                  className={`absolute top-0 bottom-0 ${colorClass} opacity-80 hover:opacity-100 transition-opacity rounded-md border-2 border-white dark:border-slate-800 group cursor-pointer`}
                  style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                  title={`${horario.nombre} (${horario.HoraInicio} - ${horario.HoraFinal})`}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {horario.nombre}
                  </span>
                </div>
              ) : (
                <>
                  <div className={`absolute top-0 bottom-0 left-0 ${colorClass} opacity-80 hover:opacity-100 rounded-r-md border-2 border-white dark:border-slate-800 group`} style={{ width: `${endPercent}%` }}></div>
                  <div className={`absolute top-0 bottom-0 right-0 ${colorClass} opacity-80 hover:opacity-100 rounded-l-md border-2 border-white dark:border-slate-800 group`} style={{ width: `${100 - startPercent}%` }}>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {horario.nombre} (Nocturno)
                    </span>
                  </div>
                </>
              )}
            </Fragment>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}