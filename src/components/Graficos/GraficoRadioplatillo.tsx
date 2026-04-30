import { useMemo, createContext, useContext, useState } from "react"
import { RadialBar, RadialBarChart, ResponsiveContainer, Legend,
  Sector, PolarAngleAxis, } from 'recharts';


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

// Componente para la forma de la barra (Sector personalizado)
const Sectorpersonalizado = (props: any) => {
  const { selectedLabel, setSelectedLabel } = useContext(SelectedLabelContext);
  const isSelected = props.payload.nombre_platillo === selectedLabel || selectedLabel == null; //foco:platillo

  return (
    <Sector
      {...props}
      className="cursor-pointer outline-none"
      onClick={() => setSelectedLabel(props.payload.nombre_platillo)}
      fill={color[props.index % color.length]}
      opacity={isSelected ? 1 : 0.2}
      style={{ transition: 'opacity 0.3s ease' }}
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
      <div className="w-full h-[200px] bg-white p-4 rounded-xl shadow-md">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="30%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            barSize={30}
            data={chartData}
            startAngle={90}
            endAngle={-280}
          >
            {/* Eje invisible para que el gráfico sepa el máximo (que calcule el giro maximo) */}
            <PolarAngleAxis
              type="number"
              domain={[0, 'dataMax']}
              angleAxisId={0}
              tick={false}
            />
            
            <RadialBar
              background={{ fill: '#f3f4f6' }}
              dataKey="value"
              cornerRadius={10}
              shape={<Sectorpersonalizado />}
            />
            
            <Legend
              iconSize={12}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ paddingLeft: '20px' }}
              content={({ payload }) => (
                <ul className="text-[12px] font-medium list-none p-0">
                  {payload?.map((entry: any, index) => {
                    const isSelected = selectedLabel === entry.payload.nombre_platillo || selectedLabel == null;
                    return (
                      <li
                        key={`item-${index}`}
                        className="flex items-center gap-2 mb-2 cursor-pointer transition-opacity duration-300"
                        style={{ opacity: isSelected ? 1 : 0.3, color: entry.color }}
                        onClick={() => setSelectedLabel(entry.payload.nombre_platillo === selectedLabel ? undefined : entry.payload.nombre_platillo)}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.value}
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

