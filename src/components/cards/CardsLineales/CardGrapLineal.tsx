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
        axisBottom={{
          tickRotation: 0,
        }}
        colors={{ scheme: "category10" }}
        pointSize={8}
        pointBorderWidth={2}
        pointLabelYOffset={-12}
        useMesh={true}
      />
    </div>
  );
}
