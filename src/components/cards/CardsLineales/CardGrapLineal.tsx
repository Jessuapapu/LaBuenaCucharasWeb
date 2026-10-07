import { BarChart } from '@mui/x-charts/BarChart';
import type { FormatoDatos } from "../../Interfaces/graficos"; 

// Card de barras semanal usando MUI X Charts
export default function CardGraficoBarrasSemanal({ datos }: { datos: FormatoDatos[] }) {

  // Separamos las etiquetas (X) y los valores (Y)
  const xLabels = datos.map((d) => d.x);
  const yValues = datos.map((d) => Number(d.y));

  return (
    <div className="h-64 w-full bg-white rounded-xl p-4 shadow">
      <BarChart
        xAxis={[
          {
            data: xLabels,
            scaleType: 'band', // <-- CRUCIAL para gráficos de barras en MUI X
            tickLabelStyle: { fill: '#9ca3af' }, // Color del texto del eje X
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: { fill: '#9ca3af' }, // Color del texto del eje Y
          },
        ]}
        series={[
          {
            id: 'ventasSem',
            label: 'Ventas Semanales',
            data: yValues,
            color: '#10b981', // Color verde de las barras
          },
        ]}
        // Configuración de márgenes para que los textos no se corten
        margin={{ top: 30, right: 30, bottom: 50, left: 50 }}
        // Mantenemos la grilla horizontal
        grid={{ horizontal: true }}
        // Estilos personalizados para el tema oscuro/gris de los ejes
        sx={{
          // Color de las líneas de los ejes
          '.MuiChartsAxis-line': { stroke: '#4b5563' },
          '.MuiChartsAxis-tick': { stroke: '#4b5563' },
          // Color de la grilla de fondo
          '.MuiChartsGrid-line': { stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' }, // Añadí strokeDasharray para que la grilla sea punteada (opcional)
          // Bordes redondeados en las barras (opcional, da un toque más moderno)
          '.MuiBarElement-root': {
            rx: 4, // Radio horizontal de los bordes
            ry: 4, // Radio vertical de los bordes
          },
        }}
      />
    </div>
  );
}