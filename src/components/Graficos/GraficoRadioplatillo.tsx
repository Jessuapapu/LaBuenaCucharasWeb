import { useMemo, createContext, useContext, useState } from "react"
import { RadialBar, RadialBarChart, ResponsiveContainer, Legend,
  Sector, PolarAngleAxis, Tooltip } from 'recharts';


interface datosPlatillos {
    nombre_platillo: string;
    total_vendido: number;
    dia?: string;
}

interface datosPlatillosProps {
    data: datosPlatillos[];
}

const color = ['#a2ea25', '#68f3ad', '#25a2ea', '#f36868', '#d068f3', '#18bd72', '#ef0e62']

// Contexto para manejar el foco de selección
//Es decir, que cada que se toca se puede observar lo que contiene, esto se hace ya que el diseno 
//por si solo no capta, el createContext es como el espacio de datos sobre la grafica
const SelectedLabelContext = createContext<{
  selectedLabel: string | undefined; //guarda
  setSelectedLabel: (label: string | undefined) => void;
}>({
  selectedLabel: undefined,
  setSelectedLabel: () => {},
});


const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const info = payload[0].payload;
        return (
            <div className="bg-gray-950 text-white p-3 px-4 rounded-xl shadow-2xl border border-gray-700 text-xs animate-in fade-in zoom-in-95 duration-100">
                <p className="font-extrabold text-blue-400 uppercase tracking-wide text-[13px] border-b border-slate-800 pb-1.5 mb-1.5">
                    {info.nombre_platillo}
                </p>
                {/* Cuerpo del diálogo: Datos de venta */}
                <div className="flex flex-col gap-1">
                    <p className="flex justify-between items-center gap-4">
                        <span className="text-slate-400 font-medium">Total Ventas:</span>
                        <span className="font-mono text-emerald-400 font-black text-sm">{info.value} und.</span>
                    </p>
                    {info.name && !info.name.includes("Dato") && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Corte: {info.name}
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Componente para la forma de la barra (Sector personalizado)
const Sectorpersonalizado = (props: any) => {
  const { selectedLabel, setSelectedLabel } = useContext(SelectedLabelContext);
  const isSelected = props.payload.nombre_platillo === selectedLabel || selectedLabel == null; //foco:platillo
  const isHovered = props.active; 
  
  return (
    <Sector
      {...props}
      className="cursor-pointer outline-none"
      onClick={() => setSelectedLabel(props.payload.nombre_platillo)}
      fill={color[props.index % color.length]}
      opacity={ isHovered ? 1:  (isSelected ? 0.8 : 0.2)}
      style={{ transition: 'all 0.3s ease' }}
    />
  );
};

export default function GraficoRadioplatillos({data}: datosPlatillosProps){

  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  // Mapeamos los datos para que Recharts los entienda correctamente
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.dia || `Dato ${index + 1}`,
      value: item.total_vendido,
      fill: color[index % color.length],
      // Recharts necesita esta propiedad para el RadialBar
      nombre_platillo: item.nombre_platillo 
    }));
  }, [data]);

  const providerValue = useMemo(() => ({
    selectedLabel,
    setSelectedLabel: (newLabel: string | undefined) =>
      setSelectedLabel(curr => (curr === newLabel ? undefined : newLabel)),
  }), [selectedLabel]);

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                No hay datos de ventas disponibles.
            </div>
        );
    }
  return (
    <SelectedLabelContext.Provider value={providerValue}>
      <div className="w-full h-[200px] bg-white p-4 rounded-xl shadow-md border border-slate-100">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="32%"
            cy="50%"
            innerRadius="15%"
            outerRadius="85%"
            barSize={14}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            {/* Eje invisible para que el gráfico sepa el máximo (que calcule el giro maximo) */}
            <PolarAngleAxis
              type="number"
              domain={[0, 'dataMax']}
              angleAxisId={0}
              tick={false}
            />

            {/* EL TOOLTIP: Es lo que hace aparecer el nombre al pasar el mouse */}
              <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ zIndex: 50 }} />
            
            <RadialBar
              background={{ fill: '#f3f4f6' }}
              dataKey="value"
              cornerRadius={8}
              shape={<Sectorpersonalizado />}
            />
            
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ paddingLeft: '10px' }}
              content={({ payload }) => (
                <ul className="text-[11px] font-bold list-none p-0 m-0 max-h-[170px] overflow-y-auto custom-scrollbar">
                  {payload?.map((entry: any, index) => {
                    const isSelected = selectedLabel === entry.payload.nombre_platillo || selectedLabel == null;
                    return (
                      <li
                        key={`item-${index}`}
                        className="flex items-center gap-2.5 mb-2 cursor-pointer transition-all duration-200 select-none"
                        style={{ 
                          opacity: isSelected ? 1 : 0.25, 
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)' 
                        }}
                        onClick={() => setSelectedLabel(entry.payload.nombre_platillo === selectedLabel ? undefined : entry.payload.nombre_platillo)}
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className="text-slate-700 truncate max-w-[120px] uppercase tracking-tight block">
                          {entry.payload.nombre_platillo.toLowerCase()}
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
    </SelectedLabelContext.Provider>
  );
}

