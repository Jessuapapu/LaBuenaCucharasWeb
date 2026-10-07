import { useState } from "react";
import { Flame, Calendar, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useHorasConcurridas } from "../../../context/Hooks/hookAnalytics";

interface RankingHorasProps {
  variant?: "page" | "modal";
}

export function RankingHoras({ variant = "page" }: RankingHorasProps) {
  // Por defecto, cargamos el último mes (Ajustado a tu contexto actual)
  const [fechaInicio, setFechaInicio] = useState("2026-05-23");
  const [fechaFinal, setFechaFinal] = useState("2026-06-23");

  const { data, loading, error } = useHorasConcurridas(fechaInicio, fechaFinal);

  // Calculamos el valor máximo para que la barra de progreso sea relativa al top 1
  const maxPromedio = data.length > 0 ? Math.max(...data.map(d => d.PromedioOrdenes)) : 1;

  // --- VARIANTE: MODAL (Sugerencia Compacta) ---
  if (variant === "modal") {
    if (loading) return <div className="animate-pulse h-10 bg-slate-800/50 rounded-xl mt-4 w-full"></div>;
    if (error || data.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-sky-900/10 border border-sky-500/20 rounded-2xl shadow-inner">
        <div className="flex items-center gap-2 mb-3 text-sky-400">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Horas más concurridas (Último mes)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.map((item) => (
            <div key={item.hora} className="px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg flex items-center gap-2 shadow-sm">
              <span className="text-sm font-black text-white">{item.hora.toString().padStart(2, '0')}:00</span>
              <span className="text-[10px] text-slate-400 font-bold border-l border-slate-700 pl-2">
                {item.PromedioOrdenes} <span className="hidden sm:inline">ord/día</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VARIANTE: PAGE (Panel Completo) ---
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/60 shadow-xl mb-6">
      
      {/* Encabezado y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800/60 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            Ranking de Horas Pico
          </h3>
          <p className="text-sm text-slate-400 mt-1">Identifica en qué momento del día hay más tráfico de órdenes.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/40 p-2 rounded-xl border border-slate-800/50 shadow-inner">
          <Calendar className="w-5 h-5 text-slate-500 ml-2" />
          <input 
            type="date" 
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
          <span className="text-slate-600 font-black">-</span>
          <input 
            type="date" 
            value={fechaFinal}
            onChange={(e) => setFechaFinal(e.target.value)}
            className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      {/* Contenido / Estado de Carga */}
      {error ? (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-900/20 p-4 rounded-xl border border-rose-500/20">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Analizando tráfico...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-medium bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
          No hay órdenes registradas en este rango de fechas.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item, index) => {
            const widthPercent = (item.PromedioOrdenes / maxPromedio) * 100;
            return (
              <div key={item.hora} className="flex items-center gap-4 bg-slate-950/20 p-3 sm:p-4 rounded-xl border border-slate-800/40 transition-colors hover:bg-slate-800/40 group">
                
                {/* Indicador de Posición */}
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 font-black text-sm group-hover:text-sky-400 group-hover:bg-sky-900/30 transition-colors">
                  #{index + 1}
                </div>
                
                {/* Hora */}
                <div className="w-16">
                  <span className="text-lg sm:text-xl font-black text-white">{item.hora.toString().padStart(2, '0')}:00</span>
                </div>

                {/* Barra de Progreso */}
                <div className="flex-1 relative h-6 bg-slate-900 rounded-md overflow-hidden shadow-inner">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-600 to-sky-400 rounded-md transition-all duration-1000 ease-out"
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                      {item.TotalOrdenes} órdenes totales en {item.DiasLaborados} días
                    </span>
                  </div>
                </div>

                {/* Promedio Final */}
                <div className="w-24 text-right">
                  <span className="block text-xl font-black text-sky-400">{item.PromedioOrdenes}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Promedio</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}