import TablaPlatillos from "../Platillos/tables/TablePlatillos";
import GraficoPlatillosVendidos from "../components/Graficos/GraficoPlatillosVendidos";
import { Utensils, TrendingUp, Layers, Sparkles, RefreshCw } from "lucide-react";
import { FoodCard } from "../components/cards/FoodCard";


import { usePlatillos, useVentasPlatillos } from "../components/Hooks/hookPlatillos";


export default function ComidasPage() {
  // Consumimos los estados independientes
  const { platillos, destacados, loadingPlatillos, errorPlatillos } = usePlatillos();
  const { ventas, loadingVentas, errorVentas } = useVentasPlatillos();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Opcional: Mostrar mensaje si alguna petición falla */}
      {(errorPlatillos || errorVentas) && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200">
          ⚠️ Hubo problemas al sincronizar algunos datos con el servidor.
        </div>
      )}

      {/* 1. Encabezado */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white-400 shadow-lg shadow-blue-500/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gestión de Comidas</h1>
            <p className="text-slate-500 mt-0.5 text-2xl font-medium">Administra el catálogo, categorías y popularidad.</p>
          </div>
        </div>

        {/* Mini KPI - Atado a la carga de platillos */}
        {!loadingPlatillos && (
          <div className="bg-white backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex items-center gap-4 self-start md:self-auto group transition-all hover:border-sky-500/30">
            <div className="p-2 text-orange-400 rounded-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-base text-slate-500 uppercase font-bold tracking-wider">Total en Menú</span>
              <p className="text-2xl font-black text-slate-700 tracking-tight mt-0.5">{platillos.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* 1.5 Destacados */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col justify-between space-y-3">
        
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-500">Platillos Destacados</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Evaluamos solo loadingPlatillos */}
          {loadingPlatillos ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-900/30 animate-pulse rounded-2xl border border-slate-800/60 shadow-inner" />
            ))
          ) : (
            destacados.map((item) => (
              <div key={item.id} className="transition-transform duration-200 hover:scale-[1.01]">
                <FoodCard
                  key={item.id}
                  platillo={item}
                  ventas={true}
                />
              </div>
            ))
          )}
        </div>
      </div>


      {/* 3. Tabla de Datos */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40">
          <h3 className="text-2xl font-bold text-white">Inventario de Platillos</h3>
        </div>

        {/* Evaluamos solo loadingPlatillos */}
        <div className="p-2 bg-slate-950/20">
          {loadingPlatillos ? (
            <div className="h-64 flex flex-col items-center justify-center text-sky-500 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando catálogo...</span>
            </div>
          ) : (
            <TablaPlatillos data={platillos} />
          )}
        </div>
      </div>


      {/* 2. Sección de Análisis (Gráfica Completa) */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            Ranking de Ventas Global
          </h3>
          <p className="text-base text-sky-900">Distribución total de platillos mas vendidos este mes</p>
        </div>

        <div className="w-full min-h-[400px] bg-slate-950/20 rounded-xl border border-slate-900/40 p-4 relative flex items-center justify-center">
          {/* Evaluamos solo loadingVentas */}
          {loadingVentas ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-sky-500" />
              <span className="text-gray-500 text-sm">Cargando gráfica...</span>
            </div>
          ) : (
            <GraficoPlatillosVendidos data={ventas} />
          )}
        </div>
      </div>


    </div>
  );
}