import { Link, Outlet, useLocation } from "react-router-dom";
import TablaClientes from "../Features/Clientes/Tables/TableCliente";
import { Users, FileText, ArrowRight, UserCheck2 } from "lucide-react";
import { useSoloClientes } from "../context/Hooks/hookClientes";// Ajusta la ruta de tu nuevo hook

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
      <div className="flex flex items-center gap-4 bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white-400 shadow-lg shadow-blue-500/20">
          <UserCheck2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Directorio de Clientes</h1>
          <p className="text-slate-500 mt-1 text-lg font-medium">Gestiona la información de contacto y direcciones.</p>
        
        </div>
        
      </div>

      {/* 2. Grid de Resumen y Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Métrica de Clientes */}
        <div className="bg-gradient-to-br from-blue-400 via-blue-200 to-blue-600/60 p-6 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-900/10 flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/15">
            <div>
                <p className="text-slate-600 text-lg font-medium uppercase tracking-wider">Total Clientes</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1.5 tracking-tigth">
                    {loading ?(
                      <span className="inline-block w-12 h-9 bg-white/20 animate-pulse rounded-lg" />
                    ) : (
                      data.length
                    )}
                </h3>
            </div>
            <div className="p-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Users className="w-8 h-8" />
            </div>
        </div>

        {/* Card 2: Acceso a Contratos */}
        <Link 
            to="/Clientes/Contratos" 
            className="group relative bg-gradient-to-br from-blue-400 via-blue-200 to-blue-600/60 p-6 rounded-2xl border border-slate-800 shadow-lg shadow-slate-950/10 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-950/20"
        >
            <div>
                <h3 className="text-3xl font-bold text-black group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    Gestión de Contratos
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-slate-500 text-ld font-medium mt-1">Administrar acuerdos, vigencias y presupuestos.</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-sky-500 group-hover:text-white rounded-xl border border-slate-700/60 group-hover:border-sky-400 shadow-sm transition-all duration-300 shrink-0 group-hover:scale-105">
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