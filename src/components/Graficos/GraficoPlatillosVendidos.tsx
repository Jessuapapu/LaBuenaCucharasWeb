import { ResponsiveBar } from "@nivo/bar";

interface DatosPlatillo {
  nombre_platillo: string;
  total_vendido: number;
}

interface GraficoPlatillosVendidosProps {
  data: DatosPlatillo[];
}

export default function GraficoPlatillosVendidos({ data }: GraficoPlatillosVendidosProps) {
  
  // Si no hay datos, mostramos un mensaje o placeholder
  if (!data || data.length === 0) {
    return (
        <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
            No hay datos de ventas disponibles.
        </div>
    );
  }

  // Ordenamos los datos para que se vean mejor (Mayor a menor) y tomamos los Top 15 si son muchos
  const chartData = [...data]
    .sort((a, b) => a.total_vendido - b.total_vendido) // Nivo los apila de abajo hacia arriba en horizontal
    .slice(-15); // Mostramos solo los top 15 para que no se sature

  return (
    <div className="w-full h-80">
      <ResponsiveBar
      
        data={chartData}
        keys={['total_vendido']}
        indexBy="nombre_platillo"
        margin={{ top: 0, right: 30, bottom: 40, left: 120 }} // Margen izquierdo amplio para nombres largos
        padding={0.3}
        layout="horizontal" // Barras horizontales para leer mejor los nombres
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }} // O puedes usar un color fijo como '#3b82f6'
        
        // Estilo de ejes y grid
        theme={{
            axis: { 
                ticks: { text: { fill: "#9ca3af", fontSize: 11 } }, 
                legend: { text: { fill: "#cbd5e1" } } 
            },
            grid: { line: { stroke: "#374151", strokeWidth: 1, strokeDasharray: "4 4" } },
            tooltip: { container: { background: "#1f2937", color: "#fff", borderRadius: "8px" } },
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
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          // legend: 'Platillo', // Opcional
          legendPosition: 'middle',
          legendOffset: -40
        }}
        
        // Etiquetas dentro de las barras
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 3 ] ] }}
        
        // Animación
        animate={true}
      />
    </div>
  );
}