import { ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";

interface DatosPlatillo {
  nombre_platillo: string;
  total_vendido: number;
  [key: string]: string | number;
}

interface GraficoPlatillosVendidosProps {
  data: DatosPlatillo[];
}

export default function GraficoPlatillosVendidos({ data }: GraficoPlatillosVendidosProps) {
  
  if (!data || data.length === 0) {
    return (
        <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
            No hay datos de ventas disponibles.
        </div>
    );
  }

  const xData = Array.isArray(data) ? data : [];

  const chartData = useMemo(() => {
    return [...xData]
      .sort((a, b) => a.total_vendido - b.total_vendido)
      .slice(-10);
  }, [xData]);
    

  return (
    <div className="w-full h-100">
      <ResponsiveBar
        data={chartData}
        keys={['total_vendido']}
        indexBy="nombre_platillo"
        
        // 1. Margen izquierdo ampliado a 160 para dar más espacio a los nombres
        margin={{ top: 0, right: 30, bottom: 50, left: 160 }} 
        padding={0.3}
        layout="horizontal"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        defs={[
          {
            id: 'skyToGreen',
            type: 'linearGradient',
            colors: [
              { offset: 0, color: '#0ea5e9' },
              { offset: 100, color: '#22c55e' }
            ]
          }
        ]}
        fill={[
          {
            match: { id: 'total_vendido' },
            id: 'skyToGreen'
          }
        ]}
        
        theme={{
            axis: { 
                // Tamaño y color del texto en el eje Y (los nombres de los platillos)
                ticks: { text: { fill: "#bfcde7", fontSize: 16 } }, 
                legend: { text: { fill: "#bfcde7", fontSize: 20 } } 
            },
            grid: { line: { stroke: "#374151", strokeWidth: 1, strokeDasharray: "4 4" } },
            tooltip: { container: { background: "#1f2937", color: "#fff", borderRadius: "8px" } },
            
            // 2. Aquí agrandamos el número de ventas dentro de las barras
            labels: { 
                text: { 
                    fontSize: 16, // Aumenta este valor si lo quieres más grande
                    fontWeight: "bold", 
                    fill: "#1f2937" 
                } 
            },
            text: { fill: "#fff" }
        }}
        
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Cantidad Vendida',
          legendPosition: 'middle',
          legendOffset: 42
        }}
        
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          legendOffset: -45,
          // 3. Truncador de texto: Evita que nombres excesivamente largos rompan el diseño
          format: (value) => {
            const text = String(value);
            return text.length > 22 ? `${text.substring(0, 22)}...` : text;
          }
        }}
        
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 3 ] ] }}
        
        animate={true}
      />
    </div>
  );
}