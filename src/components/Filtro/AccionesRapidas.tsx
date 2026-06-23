import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles, FileSignature, ShoppingCart, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Interfaces de ejemplo para las funciones de tus modales
export default function AccionesRapidas() {

  const [alHover, setalHover]=useState<string | null>(null)
  // Configuración de los accesos directos para recorrerlos limpiamente
  const rutasNavegacion = [
    {
      titulo: "Módulo Clientes",
      to: "/Clientes",
      icon: <Users size={18} />,
      colorBg: "bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-blue-100",
      hoverBorder: "hover:border-blue-400"
    },
    {
      titulo: "Gestión de Contratos",
      to: "/contratos", 
      icon: <FileSignature size={18} />,
      colorBg: "bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-blue-100",
      hoverBorder: "hover:border-blue-400"
    },
    {
      titulo: "Control de Órdenes",
      to: "/ordenes",
      icon: <ShoppingCart size={18} />,
      colorBg: "bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-blue-100",
      hoverBorder: "hover:border-blue-400"
    },
    {
      titulo: "Informes y Auditoría",
      to: "/informes",
      icon: <BarChart3 size={18} />,
      colorBg: "bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-blue-100",
      hoverBorder: "hover:border-blue-400"
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
      <div className="flex flex-col gap-6 flex-1 justify-center items-center py-2">
        {rutasNavegacion.map((ruta) => (
          <div
            key={ruta.to}
            className="relative flex items-center justify-center"
            onMouseEnter={()=> setalHover(ruta.to)}
            onMouseLeave={()=> setalHover(null)}
          >
            {/* Mensaje flotante */}
            <AnimatePresence>
              {alHover === ruta.to && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute bottom-full mb-2.5 z-30 pointer-events-none flex flex-col items-center"
                >
                  {/* Caja de texto del Tooltip */}
                  <div className="bg-white/70 text-cyan-500 text-[11px] font-black tracking-wide py-1.5 px-3 rounded-lg shadow-xl shadow-slate-950/20 whitespace-nowrap uppercase">
                    {ruta.titulo}
                  </div>
                  {/* Pequeño triángulo de guía */}
                  <div className="w-2 h-2 bg-white/70 rotate-45 -mt-1 shadow-sm" />
                </motion.div>
              )}
            </AnimatePresence>

          <motion.div
            key={ruta.to}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="shrink-0"
          >
            <Link
              to={ruta.to}
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${ruta.colorBg} text-white flex items-center justify-center shadow-md border border-white/20 transition-all duration-200 hover:brightness-105`}
            >
                {ruta.icon}
              </Link>
            </motion.div>

            {/* El texto */}
            {/*<div className="flex flex-col truncate">
              <Link 
                to={ruta.to} 
                className="text-xs font-bold text-slate-600 hover:text-blue-600 group-hover:text-slate-900 transition-colors tracking-tight truncate cursor-pointer"
              >
                {ruta.titulo}
              </Link>
            </div>*/}
          </div>
        ))}
      </div>

      {/* Pie de Control Interno */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-800 font-bold tracking-wider uppercase">
        <span>Manten los datos al dia</span>
      </div>

    </div>
  );
}