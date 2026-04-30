import { useEffect, useState } from "react";
import TablaPlatillos from "../components/table/TablePlatillos";
import GraficoPlatillosVendidos from "../components/Graficos/GraficoPlatillosVendidos"; 
import { Utensils, TrendingUp } from "lucide-react";
import { FoodCard } from "../components/cards/FoodCard";

export default function ComidasPage() {
  const [dataPlatillos, setDataPlatillos] = useState<any[]>([]);
  const [dataVentas, setDataVentas] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // Función unificada para cargar todos los datos
  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Cargar Lista de Platillos (Para la tabla)
        const resPlatillos = await fetch("http://127.0.0.1:8001/platillos/");
        const jsonPlatillos = await resPlatillos.json();
        setDataPlatillos(Array.isArray(jsonPlatillos) ? jsonPlatillos: []);
        //setDataPlatillos(jsonPlatillos);

        // 2. Cargar Estadísticas de Ventas (Para la gráfica)
        const resVentas = await fetch("http://127.0.0.1:8001/pedidos/platillos/conteo");
        const jsonVentas = await resVentas.json();
        //setDataVentas(jsonVentas);
        setDataVentas(Array.isArray(jsonVentas) ? jsonVentas: []);

    } catch (error) {
        console.error("Error cargando datos:", error);
        //cambio
        setDataPlatillos([]);
        setDataVentas([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const destacados= dataPlatillos.slice(0,4);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
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
        
        {/* Mini KPI */}
        {!loading && (
            <div className="bg-gray-800 px-8 py-4 rounded-xl border border-gray-700 text-center shadow-md">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total en Menú</span>
                <p className="text-3xl font-extrabold text-white mt-1">{dataPlatillos.length}</p>
            </div>
        )}
      </div>

        <div className="space-y-4">
        <div className="flex items-center gap-2 p-2 text-white bg-gray-500/60 rounded-2xl h-16">
          <h2 className="text-xl font-bold text-blue-500">Platillos Destacados</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
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
      {/* Se eliminó el grid de columnas para que la gráfica ocupe el 100% del ancho */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Ranking de Ventas Global
              </h3>
          </div>
             
          {/* Aumentamos la altura mínima a 400px para mejor visualización */}
          <div className="flex-1 w-full min-h-[400px] bg-gray-950/30 rounded-xl border border-gray-800/50 p-4 relative">
              {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500 text-sm">Cargando gráfica...</span>
                  </div>
              ) : (
                  <GraficoPlatillosVendidos data={dataVentas} />
              )}
          </div>
      </div>

      {/* 3. Tabla de Datos */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-1">
          <div className="p-4 border-b border-gray-800 mb-2">
              <h3 className="text-lg font-bold text-white">Inventario de Platillos</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-gray-500 text-sm animate-pulse">Sincronizando catálogo...</span>
               </div>
            </div>
          ) : (
            <TablaPlatillos data={dataPlatillos}  />
          )}
      </div>

    </div>
  );
}