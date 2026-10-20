import { useMemo, createContext, useContext, useState } from "react";
import {RadialBar, RadialBarChart, ResponsiveContainer, Legend, Sector, PolarAngleAxis, Tooltip } from 'recharts';
import { useVentasPlatillos } from "../../context/Hooks/hookPlatillos";
import { Loader2 } from "lucide-react";

// Paleta de degradados relacionales de Celestes a Verdes
const gradientesConfig = [
  { id: "gradCelesteVerde1", from: "#06b6d4", to: "#10b981" }, // Cyan a Esmeralda
  { id: "gradCelesteVerde2", from: "#3b82f6", to: "#10b981" }, // Azul a Esmeralda
  { id: "gradCelesteVerde3", from: "#0ea5e9", to: "#22c55e" }, // Sky a Verde
  { id: "gradCelesteVerde4", from: "#22d3ee", to: "#4ade80" }, // Cyan Claro a Verde Claro
  { id: "gradCelesteVerde5", from: "#2563eb", to: "#059669" }, // Azul Rey a Esmeralda Oscuro
  { id: "gradCelesteVerde6", from: "#0284c7", to: "#16a34a" }, // Sky Oscuro a Verde Menta
];

// Contexto extendido para capturar tanto clics fijados como pre-selecciones por hover
const InteractionContext = createContext<{
  activeLabel: string | undefined;
  setActiveLabel: (label: string | undefined) => void;
}>({
  activeLabel: undefined,
  setActiveLabel: () => {},
});

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const info = payload[0].payload;
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white p-3 px-4 rounded-xl shadow-2xl border border-slate-800 text-xs animate-in fade-in zoom-in-95 duration-200 z-50">
        <p className="font-black text-cyan-400 uppercase tracking-wide text-[13px] border-b border-slate-800/80 pb-1.5 mb-1.5">
          {info.nombre_platillo}
        </p>
        <div className="flex flex-col gap-1">
          <p className="flex justify-between items-center gap-4">
            <span className="text-slate-400 font-medium">Total Ventas:</span>
            <span className="font-mono text-emerald-400 font-black text-sm">{info.value} und.</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Renderizado de arco con animaciones de opacidad y escala controladas
const SectorPersonalizado = (props: any) => {
  const { activeLabel, setActiveLabel } = useContext(InteractionContext);
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, index, payload } = props;
  
  // Resalta si no hay nada seleccionado, o si este es el elemento seleccionado/hovered
  const isSelected = activeLabel === payload.nombre_platillo || activeLabel == null;
  const gradienteAsignado = gradientesConfig[index % gradientesConfig.length];

  return (
    <g
      className="outline-none"
      onMouseEnter={() => setActiveLabel(payload.nombre_platillo)}
      onMouseLeave={() => setActiveLabel(undefined)}
    >
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        // Efecto visual de expansión sutil al estar activo
        outerRadius={isSelected && activeLabel != null ? outerRadius + 2 : outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        className="cursor-pointer transition-all duration-300 ease-out"
        fill={`url(#${gradienteAsignado.id})`}
        opacity={isSelected ? 1 : 0.15}
      />
    </g>
  );
};

export default function GraficoRadioplatillos() {
  // Maneja el enfoque visual actual (ya sea por click o por hover)
  const [activeLabel, setActiveLabel] = useState<string | undefined>(undefined);
  const { ventas, errorVentas, loadingVentas }= useVentasPlatillos()

  const chartData = useMemo(() => {
    if (!Array.isArray(ventas)) return [];
    return ventas.map((item, index) => {
      const grad = gradientesConfig[index % gradientesConfig.length];
      return {
        name: item.dia || `Dato ${index + 1}`,
        value: Number(item.total_vendido ?? item.UnidadesVendidas ?? 0),
        nombre_platillo: item.nombre_platillo ?? item.NombrePlatillo ?? "Platillo",
        // Guardamos el gradiente para que la leyenda use el color de salida
        colorLeyenda: grad.from 
      };
    });
  }, [ventas]);

  const providerValue = useMemo(() => ({
    activeLabel,
    setActiveLabel,
  }), [activeLabel]);

  if (loadingVentas) {
    return (
      <div className="h-[230px] w-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/60 shadow-sm gap-2">
        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Consultando Métricas...</span>
      </div>
    );
  }

  // Controlador de error visual
  if (errorVentas || !ventas || ventas.length === 0) {
    return (
      <div className="h-[230px] w-full flex items-center justify-center text-slate-400 text-xs font-medium italic bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        No hay datos analíticos de ventas disponibles.
      </div>
    );
  }

  return (
    <InteractionContext.Provider value={providerValue}>
      <div className="w-full h-[230px] bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="35%"
            cy="50%"
            innerRadius="20%"
            outerRadius="100%"
            barSize={11}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            {/* INYECCIÓN DE DEGRADADOS VECTORIALES (Defs) */}
            <defs>
              {gradientesConfig.map((grad) => (
                <linearGradient key={grad.id} id={grad.id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={grad.from} />
                  <stop offset="100%" stopColor={grad.to} />
                </linearGradient>
              ))}
            </defs>

            <PolarAngleAxis
              type="number"
              domain={[0, 'dataMax']}
              tick={false}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={false} 
              wrapperStyle={{ zIndex: 100 }}
            />
            
            <RadialBar
              background={{ fill: '#f1f5f9', className: 'transition-all duration-300' }}
              dataKey="value"
              cornerRadius={8}
              shape={<SectorPersonalizado />}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />
            
            <Legend
              iconSize={8}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ paddingLeft: '15px' }}
              content={({ payload }) => (
                <ul className="text-[11px] font-bold list-none p-0 m-0 max-h-[190px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {payload?.map((entry: any, index) => {
                    const platilloNombre = entry.payload.nombre_platillo;
                    const isSelected = activeLabel === platilloNombre || activeLabel == null;
                    
                    return (
                      <li
                        key={`legend-item-${index}`}
                        className="flex items-center justify-between gap-3 cursor-pointer select-none transition-all duration-300"
                        style={{ 
                          opacity: isSelected ? 1 : 0.2,
                          transform: isSelected && activeLabel != null ? 'translateX(5px)' : 'translateX(0px)'
                        }}
                        onMouseEnter={() => setActiveLabel(platilloNombre)}
                        onMouseLeave={() => setActiveLabel(undefined)}
                        onClick={() => setActiveLabel(curr => curr === platilloNombre ? undefined : platilloNombre)}
                      >
                        <div className="flex items-center gap-2 truncate max-w-[140px]">
                          {/* Bullet dinámico que cambia de escala y usa el color del degradado celeste */}
                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-all duration-300" 
                            style={{ 
                              backgroundColor: entry.payload.colorLeyenda,
                              transform: isSelected && activeLabel != null ? 'scale(1.25)' : 'scale(1)'
                            }} 
                          />
                          <span className={`truncate tracking-tight block transition-colors duration-200 ${isSelected && activeLabel != null ? 'text-cyan-600 font-black' : 'text-slate-600 font-semibold'}`}>
                            {platilloNombre}
                          </span>
                        </div>
                        
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md border transition-all duration-300 ${
                          isSelected && activeLabel != null 
                            ? 'text-cyan-600 bg-cyan-50 border-cyan-200 shadow-sm scale-105' 
                            : 'text-slate-400 bg-slate-50 border-slate-100/70'
                        }`}>
                          {entry.payload.value} u.
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </InteractionContext.Provider>
  );
}