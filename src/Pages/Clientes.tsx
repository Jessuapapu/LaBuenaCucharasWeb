import { Link, Outlet, useLocation } from "react-router-dom";
import TablaClientes from "../Clientes/Modals/Tables/TableCliente";
import { Users, FileText, ArrowRight } from "lucide-react";
import { useSoloClientes } from "../components/Hooks/hookClientes";// Ajusta la ruta de tu nuevo hook

export default function ClientesPage() {
  // Consumimos el hook. Usamos el alias 'data' para mantener compatibilidad con tu JSX actual.
  const { clientes: data, loading, error } = useSoloClientes();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Directorio de Clientes</h1>
          <p className="text-slate-800 mt-1 text-xs font-medium">Gestiona la información de contacto y direcciones.</p>
        </div>
      </div>

      {/* 2. Grid de Resumen y Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Métrica de Clientes */}
        <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex items-center justify-between transition-all hover:shadow-md hover:shadow-slate-900/5">
            <div>
                <p className="text-slate-600 text-sm font-medium uppercase tracking-wider">Total Clientes</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1.5 tracking-tigth">
                    {loading ?(
                      <span className="inline-block w-8 h-7 bg-slate-100 animate-pulse rounded-lg" />
                    ) : (
                      data.length
                    )}
                </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50 shadow-inner">
                <Users className="w-8 h-8" />
            </div>
        </div>

        {/* Card 2: Acceso a Contratos */}
        <Link 
            to="/Clientes/Contratos" 
            className="group relative bg-white-80 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 flex items-center justify-between cursor-pointer"
        >
            <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    Gestión de Contratos
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-slate-500 text-xs font-medium mt-1">Administrar acuerdos, vigencias y presupuestos.</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl border border-slate-100 group-hover:border-blue-100/50 shadow-sm transition-all duration-300">
                <FileText className="w-6 h-6" />
            </div>
        </Link>
      </div>

      {/* 3. Renderizado de Contenido */}
      <Outlet />

      {/* 4. Tabla de Clientes */}
      <div className="mt-2">
        {loading ? (
            <div className="h-64 bg-white/60 rounded-2xl backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-blue-600 gap-3 shadow-inner">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Cargando directorio...</span>
            </div>
        ) : (
            isRoot && (<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 overflow-hidden"> <TablaClientes data={data} /> </div> ) 
        )}
      </div>

    </div>
  );
}