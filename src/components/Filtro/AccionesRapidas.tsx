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
      colorBg: "bg-blue-50 text-blue-600 border-blue-100",
      hoverBorder: "hover:border-blue-400"
    },
    {
      titulo: "Gestión de Contratos",
      to: "/contratos", 
      icon: <FileSignature size={18} />,
      colorBg: "bg-blue-50 text-blue-600 border-blue-100",
      hoverBorder: "hover:border-blue-400"
    },
    {
      titulo: "Control de Órdenes",
      to: "/ordenes",
      icon: <ShoppingCart size={18} />,
      colorBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      hoverBorder: "hover:border-emerald-400"
    },
    {
      titulo: "Informes y Auditoría",
      to: "/informes",
      icon: <BarChart3 size={18} />,
      colorBg: "bg-blue-50 text-blue-600 border-blue-100",
      hoverBorder: "hover:border-blue-400"
    }
  ];
  
  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5">
      
      {/* Encabezado del Bloque */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/60">
            <Sparkles size={16} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Accesos Directos</h3>
        </div>
      </div>

      {/* Contenedor Vertical de Botones de Navegación */}
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {rutasNavegacion.map((ruta) => (
          <motion.div
            key={ruta.to}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.99 }}
            className="w-full"
          >
            <Link
              to={ruta.to}
              className={`group flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl text-left transition-all ${ruta.hoverBorder} hover:shadow-sm shadow-slate-900/5 active:scale-[0.99]`}
            >
              <div className="flex items-center gap-3.5">
                {/* Contenedor del Icono */}
                <div className={`p-2.5 rounded-xl border ${ruta.colorBg} transition-transform duration-300 group-hover:scale-105`}>
                  {ruta.icon}
                </div>
                {/* Textos descriptivos */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {ruta.titulo}
                  </span>
                </div>
              </div>

              {/* Flecha indicadora de acción de salida rápida */}
              <ArrowRight 
                size={14} 
                className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" 
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pie de Control Interno */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wider uppercase">
        <span>La Buena Cuchara</span>
        <span>Mostrador</span>
      </div>

    </div>
  );
}