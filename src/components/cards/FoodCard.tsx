import { TrendingUp } from "lucide-react";
import ModalEditPlatillo from "../../Platillos/Modals/ModalEditPlatillos";
import { useState } from "react";
import { useImagenesPlatillo } from "../Hooks/hookImagenes";
import type { FoodCardProps, Platillo } from "../../interfaces/Platillos";

export const FoodCard = ({ platillo, onUpdate, ventas }: FoodCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Desestructuramos para mantener limpio el código, pero usamos los nombres de la interfaz
  const { nombre_platillo, nombre_categoria, id_platillo } = platillo;
  const { Urlimagen }=useImagenesPlatillo(Number(id_platillo ?? 0));

  const handleSave = (updated: Platillo) => {
    if (onUpdate) onUpdate(updated);
    setIsEditModalOpen(false);
  };

  return (
    <>
      {/* 1. CONTENEDOR VISUAL DE LA TARJETA */}
      <div className="
        flex flex-col
        w-full 
        h-full 
        overflow-hidden 
        rounded-2xl 
        border border-[var(--border)] 
        bg-white 
        transition-all duration-300 ease-in-out 
        hover:-translate-y-2 
        hover:shadow-[var(--shadow)]
        group
      ">
        {/* Contenedor de Imagen con altura fija */}
        <div className="h-[200px] w-full overflow-hidden relative">
          <img
            src={Urlimagen}
            alt={nombre_platillo}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {ventas && (
            <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1 shadow-lg z-10">
              <TrendingUp className="w-3 h-3" /> Popular
            </div>
          )}
        </div>

        {/* Descripcion de la card (Ahora unificado el flex completo) */}
        <div className="flex-1 p-5 flex flex-col justify-between bg-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                {nombre_categoria || 'General'}
              </span>
              {id_platillo && (
                <span className="text-[11px] text-slate-400 font-medium font-mono">
                  ID: #{id_platillo}
                </span>
              )}
            </div>
            
            <h3 className="text-slate-800 font-bold text-base truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">
              {nombre_platillo.toLowerCase()}
            </h3>
            
            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
              Categoría: {nombre_categoria || 'General'} <br />
              Platillo listo para servicio en comedor.
            </p>
          </div>

          {/* Footer de la Card: Metido ADENTRO del bloque contenedor flex-1 */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-center">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-blue-900/20"
            >
              Gestionar
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTROL DEL MODAL (Totalmente aislado del flujo CSS de la card) */}
      {isEditModalOpen && (
        <ModalEditPlatillo
          platillo={platillo}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};