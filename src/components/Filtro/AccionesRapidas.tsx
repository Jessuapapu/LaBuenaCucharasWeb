import { motion } from "framer-motion";
import { PlusCircle, UserPlus, FilePlus, Lightbulb, Sparkles } from "lucide-react";

// Interfaces de ejemplo para las funciones de tus modales
interface AccionesRapidasProps {
  setShowModalPedido: (show: boolean) => void;
  setShowModalCliente: (show: boolean) => void;
  setShowModalContrato: (show: boolean) => void;
}

export default function AccionesRapidas({
  setShowModalPedido,
  setShowModalCliente,
  setShowModalContrato,
}: AccionesRapidasProps) {
  
  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5">
      
      {/* Encabezado del Bloque */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Acciones Rápidas</h3>
        </div>
        <p className="text-slate-500 text-xs font-medium mt-1">Operaciones frecuentes del sistema</p>
      </div>

      {/* Grid Interactivo Diferente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        
        {/* Botón: Nuevo Pedido */}
        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModalPedido(true)}
          className="group flex flex-col justify-between items-start p-4 bg-white/90 border border-slate-200 rounded-xl text-left transition-all hover:border-emerald-300 hover:shadow-sm shadow-slate-900/5"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
            <PlusCircle size={20} />
          </div>
          <div className="mt-4">
            <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
              Registrar Pedido
            </span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Venta manual</span>
          </div>
        </motion.button>

        {/* Botón: Nuevo Cliente */}
        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModalCliente(true)}
          className="group flex flex-col justify-between items-start p-4 bg-white/90 border border-slate-200 rounded-xl text-left transition-all hover:border-blue-400 hover:shadow-sm shadow-slate-900/5"
        >
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <UserPlus size={20} />
          </div>
          <div className="mt-4">
            <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Nuevo Cliente
            </span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Crear perfil</span>
          </div>
        </motion.button>

        {/* Botón: Nuevo Contrato */}
        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModalContrato(true)}
          className="group flex flex-col justify-between items-start p-4 bg-white/90 border border-slate-200 rounded-xl text-left transition-all hover:border-purple-400 hover:shadow-sm shadow-slate-900/5 sm:col-span-2"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <FilePlus size={20} />
            </div>
            <span className="text-[10px] font-bold text-purple-600/70 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 group-hover:bg-purple-100 transition-colors">
              Empresarial
            </span>
          </div>
          <div className="mt-3">
            <span className="block text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
              Generar Nuevo Contrato
            </span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Acuerdos y presupuestos vigentes</span>
          </div>
        </motion.button>

      </div>

      {/* Sección Inferior: Tip del Día Adaptado */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3.5 rounded-xl border border-blue-100/70 flex gap-3 items-start shadow-inner">
          <div className="p-1.5 bg-white text-amber-500 rounded-lg shadow-sm border border-blue-50 shrink-0">
            <Lightbulb size={16} />
          </div>
          <div>
            <p className="text-blue-700 text-xs font-bold tracking-tight">Tip del día</p>
            <p className="text-slate-600 text-[11px] font-medium mt-0.5 leading-relaxed">
              Mantén actualizado el inventario de platillos para evitar cancelaciones en el comedor.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}