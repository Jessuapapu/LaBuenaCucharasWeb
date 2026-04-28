import { Link } from 'react-router-dom';
import React from 'react';

interface AnimatedKpiCardProps {
  titulo: string;
  value: string | number;
  icon: React.ReactNode;
  to: string;
  // Colores de contraste
 colorPrincipal: string; // Ej: "#3b82f6" (Azul)
  colorSecundario: string; // Ej: "#10b981" (Esmeralda)
}

export default function AnimatedKpiCard({ 
  titulo, value, icon, to, colorPrincipal, colorSecundario 
}: AnimatedKpiCardProps) {
  
  // Creamos un objeto de estilos con variables CSS
  const dynamicStyles = {
    '--color-primary': colorPrincipal,
    '--color-secondary': colorSecundario,
  } as React.CSSProperties;

  return (
    <Link to={to} className="block group" style={dynamicStyles}>
      <div className="relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 group-hover:scale-[1.02]">
        

        {/* Fondo con Degradado y Movimiento al Hover */}
        <div 
          className="relative flex justify-between items-center p-6 rounded-2xl h-full transition-all duration-700 ease-in-out border border-white/10"
          style={{
            // El degradado siempre está presente
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-primary) 100%)`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 0%',
          }}
          // Cambia las posiciones de los colores, es decir el efecto de degradado. Esto es opcional
          onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = '100% 0%'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = '0% 0%'}
        >
          
          <div className="relative z-10">
            {/* Texto en blanco/gris claro para resaltar sobre el fondo de color */}
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {titulo}
            </span>
            <h3 className="text-3xl font-bold text-white mt-1 tabular-nums drop-shadow-md">
              {value}
            </h3>
            
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              VER DETALLES <span className="text-sm">→</span>
            </div>
          </div>

          {/* Contenedor de Icono con Glassmorphism */}
          <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 transition-all duration-500 group-hover:rotate-[12deg] group-hover:bg-white/20">
            {icon}
          </div>

          {/* Brillo dinámico de fondo */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </Link>
  );
}