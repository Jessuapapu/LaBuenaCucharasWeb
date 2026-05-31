import { Link, Outlet, useLocation } from "react-router-dom";
import TablaClientes from "../components/table/TableCliente";
import { Users, FileText, ArrowRight } from "lucide-react";
import { useClientes } from "../components/Hooks/hookClientes";// Ajusta la ruta de tu nuevo hook

export default function ClientesPage() {
  // Consumimos el hook. Usamos el alias 'data' para mantener compatibilidad con tu JSX actual.
  const { clientes: data, loading, error } = useClientes();
  const location = useLocation();

  const isRoot = location.pathname === "/Clientes" || location.pathname === "/Clientes/";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Manejo de errores visual (opcional pero recomendado) */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 1. Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Directorio de Clientes</h1>
          <p className="text-gray-400 mt-1 text-sm">Gestiona la información de contacto y direcciones.</p>
        </div>
      </div>

      {/* 2. Grid de Resumen y Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Métrica de Clientes */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase">Total Clientes</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                    {loading ? "..." : data.length}
                </h3>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                <Users className="w-8 h-8" />
            </div>
        </div>

        {/* Card 2: Acceso a Contratos */}
        <Link 
            to="/Clientes/Contratos" 
            className="group relative bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 flex items-center justify-between cursor-pointer"
        >
            <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    Gestión de Contratos
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-gray-400 text-sm mt-1">Administrar acuerdos, vigencias y presupuestos.</p>
            </div>
            <div className="p-3 bg-gray-700/50 group-hover:bg-blue-900/30 rounded-lg text-gray-400 group-hover:text-blue-400 transition-colors">
                <FileText className="w-8 h-8" />
            </div>
        </Link>
      </div>

      {/* 3. Renderizado de Contenido */}
      <Outlet />

      {/* 4. Tabla de Clientes */}
      <div className="mt-6">
        {loading ? (
            <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-blue-400 gap-2">
                <span className="animate-pulse">Cargando directorio...</span>
            </div>
        ) : (
            isRoot && <TablaClientes data={data} />
        )}
      </div>

    </div>
  );
}