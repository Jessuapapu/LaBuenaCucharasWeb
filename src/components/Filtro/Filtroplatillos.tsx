
interface FiltroProps {
  categorias: string[]; 
  categoriaActiva: string;
  onSeleccionar: (categoria: string) => void;
}

export const FiltroPlatillos = ({ categorias, categoriaActiva, onSeleccionar }: FiltroProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-950/50 rounded-2xl border border-gray-800/50 w-fit">
      {categorias.map((cat) => (
        <button
          key={cat}
          onClick={() => onSeleccionar(cat)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all
            ${categoriaActiva === cat 
              ? "bg-purple-600 text-white shadow-lg scale-105" 
              : "bg-transparent text-gray-500 hover:bg-gray-800/50"
            }`}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
};