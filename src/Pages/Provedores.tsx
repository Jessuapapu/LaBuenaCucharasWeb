import { Link } from "react-router-dom";
import TablaProveedores from "../components/table/TablaProvedor";
import { Truck, ArrowLeft } from "lucide-react"; 
import { useProveedores } from "../components/Hooks/hookProveedor";

export default function ProveedoresPage() {
  // Solo llamamos a tu nuevo hook y extraemos lo que necesitamos
  const { data, loading } = useProveedores();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Título, Icono y Botón de Retorno */}
        <div className="flex items-center gap-4 w-full">
            {/* Botón para regresar a Inventario */}
            <Link 
                to="/Inventario" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-blue-500 hover:shadow-md shadow-blue-900/20 group"
                title="Volver a Inventario"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <div className="p-3 bg-blue-900/20 rounded-xl text-blue-400">
                <Truck className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Proveedores</h1>
                <p className="text-gray-400 mt-1 text-sm">Gestión de socios comerciales y suministros.</p>
            </div>
        </div>

        {/* Mini KPI */}
        {!loading && (
            <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">Total</span>
                    <p className="text-2xl font-bold text-white">{data.length}</p>
                </div>
                <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">Fijos</span>
                    <p className="text-2xl font-bold text-blue-400">
                        {/* Agregué .toUpperCase() por seguridad en caso de que la API lo devuelva como 'Fijo' o 'fijo' */}
                        {data.filter((p: any) => p.Tipo?.toUpperCase() === 'FIJO' || p.tipo?.toUpperCase() === 'FIJO').length}
                    </p>
                </div>
            </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-blue-400 gap-3">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-sm font-medium animate-pulse">Cargando directorio...</span>
        </div>
      ) : (
        <TablaProveedores data={data} />
      )}
    </div>
  );
}