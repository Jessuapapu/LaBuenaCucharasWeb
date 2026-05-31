import TablaPlatillos from "../components/table/TablePlatillos";
import GraficoPlatillosVendidos from "../components/Graficos/GraficoPlatillosVendidos"; 
import { Utensils, TrendingUp } from "lucide-react";
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
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
             <div className="p-3 bg-orange-900/20 rounded-xl text-orange-400 border border-orange-900/30">
                <Utensils className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Comidas</h1>
                <p className="text-gray-400 mt-1 text-sm">Administra el catálogo, categorías y popularidad.</p>
            </div>
        </div>
        
        {/* Mini KPI - Atado a la carga de platillos */}
        {!loadingPlatillos && (
            <div className="bg-gray-800 px-8 py-4 rounded-xl border border-gray-700 text-center shadow-md">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total en Menú</span>
                <p className="text-3xl font-extrabold text-white mt-1">{platillos.length}</p>
            </div>
        )}
      </div>

      {/* 1.5 Destacados */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-2 text-white rounded-2xl h-16">
          <h2 className="text-xl font-bold text-blue-500">Platillos Destacados</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Evaluamos solo loadingPlatillos */}
          {loadingPlatillos ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-900 animate-pulse rounded-2xl border border-gray-800" />
            ))
          ) : (
            destacados.map((item) => (
              <FoodCard 
                key={item.id}
                platillo={item}
                ventas={true}
              />
            ))
          )}
        </div>
      </div> 

      {/* 2. Sección de Análisis (Gráfica Completa) */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Ranking de Ventas Global
              </h3>
          </div>
              
          <div className="flex-1 w-full min-h-[400px] bg-gray-950/30 rounded-xl border border-gray-800/50 p-4 relative">
              {/* Evaluamos solo loadingVentas */}
              {loadingVentas ? (
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500 text-sm">Cargando gráfica...</span>
                  </div>
              ) : (
                  <GraficoPlatillosVendidos data={ventas} />
              )}
          </div>
      </div>

      {/* 3. Tabla de Datos */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-1">
          <div className="p-4 border-b border-gray-800 mb-2">
              <h3 className="text-lg font-bold text-white">Inventario de Platillos</h3>
          </div>
          
          {/* Evaluamos solo loadingPlatillos */}
          {loadingPlatillos ? (
            <div className="flex justify-center items-center h-64">
               <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-gray-500 text-sm animate-pulse">Sincronizando catálogo...</span>
               </div>
            </div>
          ) : (
            <TablaPlatillos data={platillos}/>
          )}
      </div>

    </div>
  );
}