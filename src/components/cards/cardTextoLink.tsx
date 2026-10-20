import { Link } from "react-router-dom";
import type { ReactNode } from "react"; // <--- 1. IMPORTANTE: Importar ReactNode


// 2. Actualizar la interfaz aquí:
interface CardProps {
  Titulo: string | ReactNode;    // Acepta texto O componentes React (como el span con iconos)
  Contenido: string | ReactNode; // Te sugiero cambiar este también por si quieres poner negritas o iconos en la descripción
  href: string;
}

export default function CardComponentsLink({ Titulo, Contenido, href }: CardProps) {
  // Reemplaza este valor con el color exacto de tu logo si no es este azul
  const brandColor = "bg-[#03A9F4]"; 

  return (
    <Link
      to={href}
      className="group relative flex flex-col max-w-sm rounded-2xl overflow-hidden shadow-lg 
                 transition-all duration-300 ease-out
                 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01]
                 bg-white border border-gray-100"
    >
      {/* --- ZONA 1: HEADER (Color del Logo) --- */}
      <div className={`${brandColor} p-6 relative overflow-hidden`}>
        
        {/* Decoración de fondo */}
        <div className="absolute -right-6 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

        <div className="relative z-10 flex justify-between items-start">
          {/* Aquí renderizamos el Titulo, que ahora puede ser un Icono + Texto */}
          <div className="text-2xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
            {Titulo}
          </div>

          {/* Ícono de flecha decorativo */}
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-[#03A9F4] text-white">
             <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-5 h-5 transform group-hover:rotate-45 transition-transform duration-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5L19.5 4.5M19.5 4.5H8.25M19.5 4.5V15.75" />
            </svg>
          </div>
        </div>
      </div>

      {/* --- ZONA 2: CONTENIDO --- */}
      <div className="p-6 bg-slate-50 h-full group-hover:bg-white transition-colors duration-300">
        <div className="text-slate-600 font-medium leading-relaxed text-base group-hover:text-slate-800">
          {Contenido}
        </div>
        
        {/* Barra de progreso decorativa */}
        <div className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
            <div className={`h-full ${brandColor} w-0 group-hover:w-full transition-all duration-500 ease-out`} />
        </div>
      </div>
    </Link>
  );
}