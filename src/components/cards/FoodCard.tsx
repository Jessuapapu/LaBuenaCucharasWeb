import { TrendingUp } from "lucide-react";
import ModalEditPlatillo from "../modals/ModalEditPlatillos";
import { useState } from "react";

interface Platillo {
  id_platillo?: number;
  nombre_platillo: string;
  nombre_categoria: string;
  precio: number;
  imagen_url?: string;
}

interface FoodCardProps {
  platillo: Platillo; // Pasamos el objeto completo
  onUpdate?: (updated: Platillo) => void; // Callback para avisar al padre que cambió
  ventas?: boolean;
}

export const FoodCard = ({ platillo, onUpdate, ventas }: FoodCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Desestructuramos para mantener limpio el código, pero usamos los nombres de la interfaz
  const { nombre_platillo, imagen_url, precio } = platillo;

  const handleSave = (updated: Platillo) => {
    if (onUpdate) onUpdate(updated);
    setIsEditModalOpen(false);
  };

  return (
    <div className="
      flex flex-col
      w-[300px] 
      h-[400px] 
      overflow-hidden 
      rounded-2xl 
      border border-[var(--border)] 
      bg-[var(--bg)] 
      transition-all duration-300 ease-in-out 
      hover:-translate-y-2 
      hover:shadow-[var(--shadow)]
      group
    ">
      {/* Contenedor de Imagen con altura fija */}
      <div className="h-[200px] w-full overflow-hidden relative">
        <img
          src={imagen_url}
          alt={nombre_platillo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {ventas && (
          <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1 shadow-lg z-10">
            <TrendingUp className="w-3 h-3" /> Popular
          </div>
        )}
      </div>

      {/*Descripcion de la card*/}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-white font-bold text-sm truncate uppercase tracking-tight">
            {nombre_platillo}
          </h3>
          <span className="text-blue-400 font-black text-xl">
            ${precio}
          </span>
        </div>
      </div>

      {/* 3. CUERPO RESTANTE: DESCRIPCIÓN/ESPACIADOR */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
          Categoría: {platillo.nombre_categoria || 'General'} <br />
          Platillo listo para servicio en comedor.
        </p>
      </div>

      {/* Footer de la Card */}
        <div className="p-5 pt-0 flex gap-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-blue-900/20"
          >
            Gestionar
          </button>
        </div>

      {/* Llamada al Modal de Edición */}
      {isEditModalOpen && (
        <ModalEditPlatillo
          platillo={platillo}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
    
  );
};