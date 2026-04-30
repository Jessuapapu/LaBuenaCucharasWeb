import { TrendingUp, Settings2 } from "lucide-react";
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
      <div className="h-[200px] w-full overflow-hidden">
        <img
          src={imagen_url}
          alt={nombre_platillo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {ventas && (
            <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1 shadow-lg">
              <TrendingUp className="w-3 h-3" /> Popular
            </div>
          )}
      </div>

      {/* Cuerpo de la Card */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <h3 className="
          text-[var(--text-h)] 
          font-[var(--heading)] 
          text-lg 
          font-bold 
          tracking-[-0.24px]
          line-clamp-1
        ">
          {nombre_platillo}
        </h3>

        

        <p className="
          text-[var(--text)] 
          text-sm 
          leading-[145%] 
          line-clamp-3
        ">
        </p>

        {/* Precio obtenido de los datos - Empujado al final */}
        <div className="mt-auto flex justify-between items-end">
          <div className="flex flex-col">
                <span className="text-[var(--text)] text-xs opacity-60 uppercase font-bold tracking-wider">Precio</span>
                <span className="
                  text-[var(--accent)] 
                  text-2xl 
                  font-bold 
                  tracking-tight
                ">
                  ${precio}
                </span>
            </div>
          
          {/* Botón de Acción Estilo Gestión */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all active:scale-90"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            </div>
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