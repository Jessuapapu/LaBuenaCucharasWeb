import { TrendingUp, Settings2 } from "lucide-react";

interface FoodCardProps {
  titulo: string;
  icon_img: string;
  precio: number | string;
  ventas?: boolean;
}

export const FoodCard = ({ titulo, icon_img, precio, ventas }: FoodCardProps) => {
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
          src={icon_img}
          alt={titulo}
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
          {titulo}
        </h3>

        

        <p className="
          text-[var(--text)] 
          text-sm 
          leading-[145%] 
          line-clamp-3
        ">
        </p>

        {/* Precio obtenido de los datos - Empujado al final */}
        <div className="mt-auto">
          <span className="
            text-[var(--accent)] 
            text-2xl 
            font-bold 
            tracking-tight
          ">
            ${precio}
          </span>
          
          {/* Botón de Acción Estilo Gestión */}
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-colors">
                <Settings2 className="w-5 h-5" />
            </button>
            </div>
        </div>

      {/* Footer de la Card (Acciones rápidas) */}
      <div className="p-5 pt-0 flex gap-2">
        <button className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-orange-900/20">
          Gestionar
        </button>
      </div>
    </div>
  );
};