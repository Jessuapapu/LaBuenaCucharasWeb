import { useMemo, createContext, useContext, useState } from "react";
import {RadialBar, RadialBarChart, ResponsiveContainer, Legend, Sector, PolarAngleAxis, Tooltip } from 'recharts';

interface datosPlatillos {
  nombre_platillo: string;
  total_vendido: number;
  dia?: string;
}

interface datosPlatillosProps {
  data: datosPlatillos[];
}

const color = ['#a2ea25', '#68f3ad', '#25a2ea', '#f36868', '#d068f3', '#18bd72', '#ef0e62'];

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
        <p className="font-black text-blue-400 uppercase tracking-wide text-[13px] border-b border-slate-800/80 pb-1.5 mb-1.5">
          {info.nombre_platillo}
        </p>
        <div className="flex flex-col gap-1">
          <p className="flex justify-between items-center gap-4">
            <span className="text-slate-400 font-medium">Total Ventas:</span>
            <span className="font-mono text-emerald-400 font-black text-sm">{info.value} und.</span>
          </p>
          {info.name && !info.name.includes("Dato") && (
            <p className="text-[10px] text-slate-500 italic mt-0.5">
              Corte Temporal: {info.name}
            </p>
          )}
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
        fill={color[index % color.length]}
        opacity={isSelected ? 1 : 0.15}
      />
    </g>
  );
};

export default function GraficoRadioplatillos({ data }: datosPlatillosProps) {
  // Maneja el enfoque visual actual (ya sea por click o por hover)
  const [activeLabel, setActiveLabel] = useState<string | undefined>(undefined);

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => ({
      name: item.dia || `Dato ${index + 1}`,
      value: item.total_vendido,
      fill: color[index % color.length],
      nombre_platillo: item.nombre_platillo
    }));
  }, [data]);

  const providerValue = useMemo(() => ({
    activeLabel,
    setActiveLabel,
  }), [activeLabel]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[230px] w-full flex items-center justify-center text-slate-400 text-xs font-medium italic bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-pulse">
        No hay datos de ventas disponibles.
      </div>
    );
  }

  return (
    <InteractionContext.Provider value={providerValue}>
      <div className="w-full h-[230px] bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group/container">
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
              // Habilitamos animaciones nativas de Recharts al renderizar
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
                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-all duration-300" 
                            style={{ 
                              backgroundColor: entry.color,
                              transform: isSelected && activeLabel != null ? 'scale(1.25)' : 'scale(1)'
                            }} 
                          />
                          <span className={`truncate tracking-tight block transition-colors duration-200 ${isSelected && activeLabel != null ? 'text-blue-600 font-black' : 'text-slate-600 font-semibold'}`}>
                            {platilloNombre}
                          </span>
                        </div>
                        
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md border transition-all duration-300 ${
                          isSelected && activeLabel != null 
                            ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-sm scale-105' 
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