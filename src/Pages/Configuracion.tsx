import { Link } from "react-router-dom";
import { Settings, Clock, Users, ShieldCheck } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Encabezado */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Configuración</h1>
            <p className="text-slate-800 mt-0.5 text-2xl font-medium">Administra los parámetros generales del sistema.</p>
          </div>
        </div>

      </div>

      {/* 2. Módulos de Configuración */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col justify-between space-y-5">
        
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-700">Módulos Disponibles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Tarjeta Enlace: Horarios */}
          <Link to="/Configuracion/horarios" className="transition-transform duration-200 hover:scale-[1.01] block h-full">
            <div className="bg-slate-100 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex items-center gap-5 group transition-all hover:border-sky-500/50 hover:shadow-sky-500/10 h-full cursor-pointer">
              <div className="p-4 bg-white rounded-xl shadow-sm text-cyan-400 group-hover:text-blue-500 group-hover:shadow-md transition-all">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-500 transition-colors">
                  Gestión de Horarios
                </h3>
                <p className="block text-base text-slate-600 font-medium mt-1">
                  Configura los rangos de tiempo activos para los menú de desayuno, almuerzo y cena.
                </p>
              </div>
            </div>
          </Link>

          {/* Tarjeta Enlace: Usuarios */}
          <Link to="/Configuracion/usuarios" className="transition-transform duration-200 hover:scale-[1.01] block h-full">
            <div className="bg-slate-100 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex items-center gap-5 group transition-all hover:border-sky-500/50 hover:shadow-sky-500/10 h-full cursor-pointer">
              <div className="p-4 bg-white rounded-xl shadow-sm text-cyan-400 group-hover:text-blue-500 group-hover:shadow-md transition-all">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-500 transition-colors">
                  Gestión de Usuarios
                </h3>
                <p className="block text-base text-slate-600 font-medium mt-1">
                  Administra las credenciales, accesos y roles del personal del comedor.
                </p>
              </div>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}