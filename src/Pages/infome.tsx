import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useVentasPlatillos } from "../components/Hooks/hookPlatillos";
import { useOrdenes } from "../components/Hooks/hookOrdenes";
import { useRankingComedor } from "../components/Hooks/hookAnalytics";
import jsPDF from "jspdf";
import html2canvas  from "html2canvas"
import { Download, Loader2, BarChart3, Calendar, AlertCircle, TrendingUp, DollarSign, UtensilsCrossed } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";

/*
const {cargarVentasSemanales}=useOrdenes()
*/
// Datos simulados (Mock Data) para la demostración visual
/*const dataVentas = [
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
*/
//Paletas de colores
const coloresLineas = ["#38bdf8", "#6366f1"];
const coloresBarras = ["#0284c7", "#4f46e5"];
const coloresRanking = ["#10b981"];

export default function InformesPage() {
  const [exportando, setExportando] = useState(false);
  const areaReporteRef = useRef<HTMLDivElement>(null);

  const { ventas, loadingVentas, errorVentas }= useVentasPlatillos()
  const { ventasSemanales, cargarVentasSemanales, loading: loadingOrdenes }= useOrdenes()
  const { data: rankingComedor, loading: loadingRanking } = useRankingComedor();

  useEffect(() => {
    const controller = new AbortController();
    cargarVentasSemanales(controller.signal);

    return () => {
      controller.abort(); // Evita fugas de memoria si el usuario sale de la página rápido
    };
  }, [cargarVentasSemanales]);

  // Estado global de carga unificado
  const estaCargando = loadingVentas || loadingOrdenes || loadingRanking;

  const fechaInforme = useMemo(() => {
    return new Intl.DateTimeFormat('es-NI', { dateStyle: 'long' }).format(new Date());
  }, []);

  //Formatear las ventas semanales para Nivo Line
  //sacado del hook de ordenes
  const dataVentasLinea = useMemo(() => {
    if (!ventasSemanales || ventasSemanales.length === 0) return [];
    return ventasSemanales;
  }, [ventasSemanales]);

  //Agrupación analítica de los platillos más vendidos para la gráfica de barras, es una prueba, si funciona, me corto los ovarios
  const dataTopPlatillos = useMemo(() => {
    if (!ventas || ventas.length === 0) return [];
    
    // Mapeamos los datos directamente de la API ordenados por cantidad o ingresos totales
    return ventas
      .map((item: any) => ({
        platillo: item.nombre || item.platillo || "Desconocido",
        Ingresos: Number(item.total_ingresos) || Number(item.subtotal) || 0,
        Cantidad: Number(item.cantidad_vendida) || Number(item.cantidad) || 0
      }))
      .slice(0, 7); // Limitamos a los mejores 7 para mantener la gráfica legible
  }, [ventas]);

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

  const nivoTheme = {
    axis: {
      ticks: { text: { fill: "#94a3b8", fontSize: 10, fontFamily: "sans-serif" } },
      legend: { text: { fill: "#f1f5f9", fontSize: 11, fontWeight: 600 } }
    },
    grid: { line: { stroke: "#1e293b", strokeWidth: 1 } },
    legends: { text: { fill: "#cbd5e1", fontSize: 11 } },
    tooltip: {
      container: {
        background: "#0f172a",
        color: "#f8fafc",
        fontSize: 12,
        borderRadius: "8px",
        border: "1px solid #334155"
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-6">
      {/* Barra de Acciones Superior (Fuera del área de impresión) */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/10 p-3 rounded-xl border border-slate-800/30 gap-3">
        <span className="text-xs text-slate-400 font-medium pl-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-sky-400" /> Datos operativos actualizados al {fechaInforme}
        </span>
        <button
          type="button"
          onClick={handleExportarPDF}
          disabled={exportando || estaCargando}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase border transition-all shadow-md
            ${exportando || estaCargando
              ? "bg-slate-800/50 border-slate-700/60 text-slate-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-sky-600 border-blue-500/50 text-white hover:from-blue-500 hover:to-sky-500 active:scale-95 shadow-blue-500/10"
            }`}
        >
          {exportando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Compilando Reporte Real...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar Balance de Ventas
            </>
          )}
        </button>
      </div>
      

      <div ref={areaReporteRef} className="space-y-6 bg-[#070a13] p-6 rounded-3xl">
        {/* Header */}
        <div className="bg-slate-900/30 backdrop-blur-md p-8 rounded-2xl border border-slate-800/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest mb-1">
              <BarChart3 className="w-4 h-4" /> Servidor Local e Integración de Órdenes
            </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Centro de Inteligencia</h1>
              <p className="text-slate-400 text-sm mt-0.5">Análisis financiero y operativo en tiempo real.</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Divisa de Ajuste</span>
            <span className="text-sm font-black text-white tracking-wide">Córdoba Nicaragüense (NIO)</span>
         </div>
        </div>

          {estaCargando ? (
          <div className="h-96 flex flex-col items-center justify-center text-sky-500 gap-3 bg-slate-900/10 rounded-2xl border border-slate-800/40">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando flujos de caja y comandas...</span>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-lg">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-sky-400" /> Ingresos por Ciclo Semanal Diario
                </h3>
                <p className="text-xs text-slate-400">Total de caja liquidado por los meseros según los pedidos del día.</p>
              </div>
              
              <div className="h-80 w-full bg-slate-950/20 rounded-xl border border-slate-900/40 p-2">
              {dataVentasLinea.length > 0 ? (
                  <ResponsiveLine
                      data={dataVentasLinea}
                      margin={{ top: 25, right: 35, bottom: 45, left: 60 }}
                      xScale={{ type: "point" }}
                      yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Eje Temporal', legendOffset: 36, legendPosition: 'middle' }}
                      axisLeft={{ tickSize: 5, tickPadding: 6, tickRotation: 0, legend: 'Facturación (NIO)', legendOffset: -50, legendPosition: 'middle' }}
                      colors={coloresLineas}
                      pointSize={8}
                      pointColor="#070a13"
                      pointBorderWidth={3}
                      pointBorderColor={{ from: 'serieColor' }}
                      enableGridY={true}
                      enableGridX={false}
                      curve="monotoneX"
                      enableArea={true}
                      areaOpacity={0.06}
                      useMesh={true}
                      theme={nivoTheme}
                  />
                    ) : (
                      <div className="h-full flex items-center justify-center gap-2 text-slate-500 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-500" /> No hay datos de cierres semanales registrados en el hook.
                      </div>
                )}
            </div>
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-lg">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-indigo-400" /> Top de Ventas por Producto
                </h3>
                <p className="text-xs text-slate-400">Recaudación real bruta estructurada según la demanda del menú.</p>
              </div>
          <div className="h-96 w-full bg-slate-950/20 rounded-xl border border-slate-900/40 p-2">
             {dataTopPlatillos.length > 0 ? (
                  <ResponsiveBar
                    data={dataTopPlatillos}
                    keys={['Ingresos']}
                    indexBy="platillo"
                    margin={{ top: 30, right: 30, bottom: 60, left: 65 }}
                    padding={0.4}
                    valueScale={{ type: 'linear' }}
                    colors={coloresBarras}
                    borderRadius={4}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{ 
                      tickSize: 5, 
                      tickPadding: 5, 
                      tickRotation: -15, // Ligera rotación por si el nombre del platillo es largo
                      legend: 'Platillos / Productos', 
                      legendPosition: 'middle', 
                      legendOffset: 45 
                    }}
                    axisLeft={{ tickSize: 5, tickPadding: 6, tickRotation: 0, legend: 'Total Recaudado (NIO)', legendPosition: 'middle', legendOffset: -55 }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    enableLabel={false}
                    theme={nivoTheme}
                  />
                  ) : (
                  <div className="h-full flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Sin registros de volumen de platillos vendidos en el sistema.
                  </div>
                )}
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-400" /> Ranking Específico del Comedor
                  </h3>
                  <p className="text-xs text-slate-400">Unidades reales despachadas en sala obtenidas de los Stored Procedures.</p>
                </div>
                <div className="h-80 w-full bg-slate-950/20 rounded-xl border border-slate-900/40 p-2">
                  {rankingComedor.length > 0 ? (
                    <ResponsiveBar
                      data={rankingComedor}
                      keys={['unidadesVendidas']} // Vinculado a la interfaz limpia del Mapper
                      indexBy="nombrePlatillo" // Vinculado al contrato sanitizado del Frontend
                      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                      padding={0.4}
                      valueScale={{ type: 'linear' }}
                      colors={coloresRanking}
                      borderRadius={4}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{ 
                        tickSize: 5, 
                        tickPadding: 5, 
                        tickRotation: -15,
                        legend: 'Menú Comedor', 
                        legendPosition: 'middle', 
                        legendOffset: 40 
                      }}
                      axisLeft={{ tickSize: 5, tickPadding: 6, tickRotation: 0, legend: 'Unidades', legendPosition: 'middle', legendOffset: -50 }}
                      enableLabel={false}
                      theme={nivoTheme}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center gap-2 text-slate-500 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> No hay datos del ranking del comedor para el periodo actual.
                    </div>
                  )}
                  </div>
                  </div>
          </div>
      </div>
    )}
      </div>      
    </div>
  );
}
