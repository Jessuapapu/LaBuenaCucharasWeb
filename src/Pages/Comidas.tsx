import { useEffect, useState } from "react";
import TablaPlatillos from "../components/table/TablePlatillos";

export default function ComidasPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar los platillos desde tu API
  const fetchPlatillos = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8001/platillos/");
      if (!response.ok) throw new Error("Error al cargar platillos");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    fetchPlatillos();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabecera de la Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Comidas</h1>
          <p className="text-gray-400 mt-1 text-sm">Administra el menú, categorías y precios.</p>
        </div>
        
        {/* Aquí podrías poner estadísticas rápidas si quisieras */}
        <div className="flex gap-4">
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center min-w-[100px]">
                <span className="block text-2xl font-bold text-blue-400">{data.length}</span>
                <span className="text-xs text-gray-500 uppercase font-bold">Platillos</span>
            </div>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-gray-900 rounded-xl border border-gray-800">
           <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-400 text-sm">Cargando menú...</span>
           </div>
        </div>
      ) : (
        /* Aquí usamos tu TablaPlatillos mejorada */
        <TablaPlatillos data={data} />
      )}
    </div>
  );
}