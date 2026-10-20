import { Link } from "react-router-dom";
import { Settings, Clock, Users, ShieldCheck } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Encabezado */}
      <div className="bg-gradient-to-r from-[#d2eaf0] via-[#e1eee7] to-[#f2e5d0] p-6 rounded-2xl border border-sky-200 shadow-sm shadow-sky-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sky-700 to-teal-700 rounded-xl text-white shadow-md shadow-teal-900/15">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Configuración</h1>
            <p className="text-slate-700 mt-0.5 text-lg md:text-xl font-medium">Administra los parámetros generales del sistema.</p>
          </div>
        </div>

      </div>

      {/* 2. Módulos de Configuración */}
      <div className="bg-[#e5efed] p-6 rounded-2xl border border-teal-200 shadow-sm shadow-teal-900/5 flex flex-col justify-between space-y-5">
        
        <div className="flex items-center gap-2 border-b border-teal-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-teal-800" />
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-800">Módulos Disponibles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Tarjeta Enlace: Horarios */}
          <Link to="/Configuracion/horarios" className="transition-transform duration-200 hover:scale-[1.01] block h-full">
            <div className="bg-gradient-to-br from-[#d8edf1] to-[#cee6e9] p-6 rounded-xl border border-sky-300/70 shadow-sm flex items-center gap-5 group transition-all hover:border-sky-500 hover:shadow-sky-800/10 h-full cursor-pointer">
              <div className="p-4 bg-[#b8dce4] rounded-xl shadow-sm text-sky-900 group-hover:bg-[#a6d3de] group-hover:shadow-md transition-all">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-sky-800 transition-colors">
                  Gestión de Horarios
                </h3>
                <p className="block text-base text-slate-700 font-medium mt-1">
                  Configura los rangos de tiempo activos para los menú de desayuno, almuerzo y cena.
                </p>
              </div>
            </div>
          </Link>

          {/* Tarjeta Enlace: Usuarios */}
          <Link to="/Configuracion/usuarios" className="transition-transform duration-200 hover:scale-[1.01] block h-full">
            <div className="bg-gradient-to-br from-[#e5ead5] to-[#d4e8d8] p-6 rounded-xl border border-emerald-300/70 shadow-sm flex items-center gap-5 group transition-all hover:border-emerald-500 hover:shadow-emerald-800/10 h-full cursor-pointer">
              <div className="p-4 bg-[#c4dfc9] rounded-xl shadow-sm text-emerald-900 group-hover:bg-[#b4d7bb] group-hover:shadow-md transition-all">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-800 transition-colors">
                  Gestión de Usuarios
                </h3>
                <p className="block text-base text-slate-700 font-medium mt-1">
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
