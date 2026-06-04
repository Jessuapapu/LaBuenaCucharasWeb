import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useVentasPlatillos } from "../components/Hooks/hookPlatillos";
import { useOrdenes } from "../components/Hooks/hookOrdenes";
import jsPDF from "jspdf";
import html2canvas  from "html2canvas"
import { Download, Loader2, BarChart3 } from "lucide-react";
import { useState, useRef } from "react";

/*
const {cargarVentasSemanales}=useOrdenes()
*/
// Datos simulados (Mock Data) para la demostración visual
const dataVentas = [
  { id: "Ventas", color: "hsl(210, 70%, 50%)", data: [
      { x: "Lun", y: 120 }, { x: "Mar", y: 190 }, { x: "Mie", y: 150 }, { x: "Jue", y: 280 }, { x: "Vie", y: 390 }, { x: "Sab", y: 320 }, { x: "Dom", y: 250 }
  ]}
];


const dataGastos = [
  { mes: "Ene", ingresos: 4000, gastos: 2400 },
  { mes: "Feb", ingresos: 3000, gastos: 1398 },
  { mes: "Mar", ingresos: 2000, gastos: 9800 }, // Oops, perdida
  { mes: "Abr", ingresos: 2780, gastos: 3908 },
  { mes: "May", ingresos: 1890, gastos: 4800 },
  { mes: "Jun", ingresos: 2390, gastos: 3800 },
];

export default function InformesPage() {
  const [exportando, setExportando] = useState(false);
  const areaReporteRef = useRef<HTMLDivElement>(null);

  const handleExportarPDF = async () => {
    if (!areaReporteRef.current || exportando) return;

    try {
      setExportando(true);
      const elemento = areaReporteRef.current;

      // Captura el área de informes con escala para alta resolución
      const canvas = await html2canvas(elemento, {
        scale: 2, 
        useCORS: true,
        backgroundColor: "#030712", // Sincronizado con el fondo oscuro de Tailwind (bg-gray-950 o similar)
        logging: false,
        onclone: (documentoClonado) => {
          // Asegura que los contenedores SVG mantengan visibilidad durante el renderizado estático
          const svgElements = documentoClonado.querySelectorAll("svg");
          svgElements.forEach((svg) => {
            svg.setAttribute("focusable", "false");
          });
        }
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Crear PDF en formato Carta (A4 u Oficio opcional)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter"
      });

      const anchoPDF = pdf.internal.pageSize.getWidth();
      const altoPDF = (canvas.height * anchoPDF) / canvas.width;

      // Inyectar captura escalada
      pdf.addImage(imgData, "PNG", 0, 0, anchoPDF, altoPDF);
      
      const fechaHoy = new Date().toISOString().split('T')[0];
      pdf.save(`Reporte_Gerencial_${fechaHoy}.pdf`);

    } catch (error) {
      console.error("Error al compilar el reporte PDF:", error);
    } finally {
      setExportando(false);
    }
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Barra de Acciones Superior (Fuera del área de impresión) */}
      <div className="flex justify-end items-center">
        <button
          type="button"
          onClick={handleExportarPDF}
          disabled={exportando}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide border transition-all shadow-lg
            ${exportando 
              ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" 
              : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 active:scale-95"
            }`}
        >
          {exportando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Compilando Datos...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar Informe General
            </>
          )}
        </button>
      </div>
      
      {/* Header */}
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Centro de Inteligencia</h1>
            <p className="text-blue-300 text-lg">Análisis financiero y operativo en tiempo real.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      {/* Primera Fila: Gráficas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Ventas (Line) */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded"></span>
                Flujo de Ventas Semanal
            </h3>
            <div className="h-80 w-full">
                <ResponsiveLine
                    data={dataVentas}
                    margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: "auto", max: "auto", stacked: true, reverse: false }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Días', legendOffset: 36, legendPosition: 'middle' }}
                    axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Ventas ($)', legendOffset: -40, legendPosition: 'middle' }}
                    colors={{ scheme: 'nivo' }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    enableGridX={false}
                    theme={{
                        axis: { ticks: { text: { fill: "#9ca3af" } }, legend: { text: { fill: "#cbd5e1" } } },
                        grid: { line: { stroke: "#374151", strokeWidth: 1 } },
                        tooltip: { container: { background: "#1f2937", color: "#fff" } }
                    }}
                />
            </div>
        </div>

        {/* Gráfica de Categorías (Pie) */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col">
           
        </div>
      </div>

      {/* Segunda Fila: Análisis Financiero (Bar) */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded"></span>
            Ingresos vs Gastos (Semestral)
        </h3>
        <div className="h-96 w-full">
             <ResponsiveBar
                data={dataGastos}
                keys={[ 'ingresos', 'gastos' ]}
                indexBy="mes"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Mes', legendPosition: 'middle', legendOffset: 32 }}
                axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Monto ($)', legendPosition: 'middle', legendOffset: -40 }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [ { on: 'hover', style: { itemOpacity: 1 } } ],
                        itemTextColor: "#9ca3af"
                    }
                ]}
                theme={{
                    axis: { ticks: { text: { fill: "#9ca3af" } }, legend: { text: { fill: "#cbd5e1" } } },
                    tooltip: { container: { background: "#1f2937", color: "#fff" } }
                }}
            />
        </div>
      </div>

    </div>
  );
}