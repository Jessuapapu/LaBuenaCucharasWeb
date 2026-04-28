import { ResponsiveLine } from "@nivo/line";
import type { FormatoDatos } from "../../interfaces/graficos"; 



// Card lineal semanal
export default function CardGraficoLinealSemanal({ datos }: { datos: FormatoDatos[] }) {

  // esta estructura basica es para la grafica lineal, NO TOCAR XD
  /*
  const data = [
    {
      id: "Ventas",
      color: "hsl(210, 70%, 50%)",
      data: [
        { x: "Ene", y: 40 },
        { x: "Feb", y: 55 },
        { x: "Mar", y: 70 },
        { x: "Abr", y: 60 },
      ],
    },
  ];
  */




  const Datos = [
    {
      id: "Ventas Semanales",
      color: "hsl(210, 70%, 50%)",
      data: datos,
    },
  ];

  return (
    <div className="h-64 w-full bg-white rounded-xl p-4 shadow">
      <ResponsiveLine
        // @ts-ignore - Si se quita esto da error XD
        data={Datos}
        margin={{ top: 30, right: 30, bottom: 50, left: 50 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        curve="monotoneX"
      
        colors={['#8cd9d4']}
        lineWidth={3}
        enableArea={true} // Activa el sombreado
        areaOpacity={0.2}
        
        // 1. Definimos el degradado
        defs={[
          {
            id: "gradientA",
            type: "linearGradient",
            colors: [
              { offset: 0, color: "#10b981", opacity: 1 },   // Color sólido arriba
              { offset: 1, color: "#10b981", opacity: 0.1 }, // Casi transparente abajo
            ],
          },
        ]}

        // 2. Aplicamos el degradado al área
        fill={[
          { match: { id: "Ventas Semanales" }, id: "gradientA" },
        ]}

        // --- Resto de configuraciones ---
        axisBottom={{
          tickRotation: 0,
        }}
        pointSize={8}
        pointBorderWidth={2}
        pointLabelYOffset={-12}
        useMesh={true}
        pointColor={'#ffff'}
        pointBorderColor={{ from: "serieColor"}}

        // Tema para que combine con modo oscuro (opcional)
        theme={{
          axis: {
            domain: { line: { stroke: "#4b5563" } },
            ticks: { text: { fill: "#9ca3af" } },
          },
          grid: {
            line: { stroke: "#374151", strokeWidth: 1 }
          }
        }}
      />
    </div>
  );
}
