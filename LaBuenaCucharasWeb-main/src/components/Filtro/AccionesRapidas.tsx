import { motion } from "framer-motion";
import { Users, Sparkles, FileSignature, ShoppingCart, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Interfaces de ejemplo para las funciones de tus modales
export default function AccionesRapidas() {

  // Configuración de los accesos directos para recorrerlos limpiamente
  const rutasNavegacion = [
    {
      titulo: "Módulo Clientes",
      to: "/Clientes",
      icon: <Users size={18} />,
    },
    {
      titulo: "Gestión de Contratos",
      to: "/contratos", 
      icon: <FileSignature size={18} />,
    },
    {
      titulo: "Control de Órdenes",
      to: "/ordenes",
      icon: <ShoppingCart size={18} />,
    },
    {
      titulo: "Informes y Auditoría",
      to: "/informes",
      icon: <BarChart3 size={18} />,
    }
  ];
  
  return (
    <div className="bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5">
      
      {/* Encabezado del Bloque */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-200/60">
            <Sparkles size={16} className="text-blue-500" />
          </div>
          <h3 className="text-[16px] font-bold text-slate-800 tracking-tight">Accesos Directos</h3>
        </div>
      </div>

      {/* Contenedor Vertical de Botones de Navegación */}
      <div className="flex flex-1 flex-col justify-center gap-3 py-2">
        {rutasNavegacion.map((ruta) => (
          <motion.div
            key={ruta.to}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Link
              to={ruta.to}
              className="group flex w-full items-center gap-3 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-3 py-2.5 text-slate-700 shadow-sm transition-all hover:border-cyan-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b5bc6] to-[#5db8c3] text-white shadow-sm">
                  {ruta.icon}
                </span>
                <span className="min-w-0 flex-1 text-left text-sm font-bold leading-tight text-slate-700 transition-colors group-hover:text-[#147e9d]">
                  {ruta.titulo}
                </span>
                <ArrowRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#147e9d]" />
              </Link>
          </motion.div>
        ))}
      </div>

      {/* Pie de Control Interno */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-800 font-bold tracking-wider uppercase">
        <span>Manten los datos al dia</span>
      </div>

    </div>
  );
}
