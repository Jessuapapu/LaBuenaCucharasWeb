
interface FiltroProps {
  categorias: string[]; 
  categoriaActiva: string;
  onSeleccionar: (categoria: string) => void;
}

export const FiltroPlatillos = ({ categorias, categoriaActiva, onSeleccionar }: FiltroProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 w-fit">
      {categorias.map((cat) => (
        <button
          key={cat}
          onClick={() => onSeleccionar(cat)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider
            ${categoriaActiva === cat 
              ? "bg-sky-600 text-white shadow-lg scale-105 font-extrabold" 
              : "bg-transparent text-slate-600 hover:text-sky-600 hover:bg-slate-100/80"
            }`}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
};