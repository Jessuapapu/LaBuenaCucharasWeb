import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
//const coloresLineas = ["#38bdf8", "#6366f1"];
//const coloresBarras = ["#0284c7", "#4f46e5"];
//const coloresRanking = ["#10b981"];

export default function InformesPage() {
  const [exportando, setExportando] = useState(false);
  const areaReporteRef = useRef<HTMLDivElement>(null);

  const { ventas, loadingVentas, errorVentas }= useVentasPlatillos()
  const { ventasSemanales, cargarVentasSemanales, loading: loadingOrdenes }= useOrdenes()
  const { data: rankingComedor= [], loading: loadingRanking } = useRankingComedor();

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

  //Formatear las ventas semanales
  //sacado del hook de ordenes
  // Recharts necesita un array plano de objetos con claves x e y o similares.
  const dataVentasArea = useMemo(() => {
    if (!ventasSemanales || ventasSemanales.length === 0) return [];
    // Asumiendo que viene estructurado por el hook. Si viene en formato Nivo [ { data: [...] } ], extraemos el array interior:
    if (ventasSemanales[0]?.data) {
      return ventasSemanales[0].data.map((item: any) => ({
        name: item.x, 
        ventas: Number(item.y) || 0
      }));
    }
    return ventasSemanales.map((item: any) => ({
      name: item.name || item.x || 'Día',
      ventas: Number(item.ventas) || Number(item.y) || 0
    }));
  }, [ventasSemanales]);

  //Mapeo para BarChart de Top Ventas por Producto
  const dataTopPlatillosBar = useMemo(() => {
    if (!ventas || ventas.length === 0) return [];
    return ventas
      .map((item: any) => ({
        name: item.nombre || item.platillo || "Desconocido",
        Ingresos: Number(item.total_ingresos) || Number(item.subtotal) || 0,
        Cantidad: Number(item.cantidad_vendida) || Number(item.cantidad) || 0
      }))
      .slice(0, 7);
  }, [ventas]);

  // Mapeo para BarChart de Ranking del Comedor
  const dataRankingBar = useMemo(() => {
    if (!rankingComedor || rankingComedor.length === 0) return [];
    return rankingComedor.map((item: any) => ({
      name: item.nombrePlatillo || "Desconocido",
      Unidades: Number(item.unidadesVendidas) || 0
    })).slice(0, 7);
  }, [rankingComedor]);

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

  {/*const nivoTheme = {
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
  };*/}

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-6">
      {/* Barra de Acciones Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white-800 backdrop-blur-md p-3 rounded-xl border border-slate-200/60 gap-3">
        <span className="text-xs text-slate-800 font-bold pl-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-500" /> Datos operativos actualizados al {fechaInforme}
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
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
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

      {/* Área del Reporte */}
      <div ref={areaReporteRef} className="space-y-6 p-6 rounded-3xl">
        {/* Header */}
        <div className="bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-[11px] uppercase tracking-widest mb-1">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Servidor Local e Integración de Órdenes
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Centro de Inteligencia</h1>
            <p className="text-slate-700 text-[10px] mt-0.5">Análisis financiero y operativo en tiempo real para La Buena Cuchara.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5">
            <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider">Divisa de Ajuste</span>
            <span className="text-[9px] font-bold text-white leading-normal italic tracking-wide">Córdoba Nicaragüense (NIO)</span>
          </div>
        </div>

        {estaCargando ? (
          <div className="h-96 flex flex-col items-center justify-center text-sky-500 gap-3 bg-slate-900/10 rounded-2xl border border-slate-800/40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest animate-pulse">Sincronizando flujos de caja y comandas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            
            {/* Gráfica 1: Área para Ventas Totales */}
            <div className="bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-lg">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Ingresos por Ciclo Semanal Diario
                </h3>
                <p className="text-xs text-slate-800">Total de caja liquidado por los meseros según los pedidos del día.</p>
              </div>
              
              <div className="h-80 w-full bg-slate-950/40 rounded-xl border border-slate-800/60 p-2">
                {dataVentasArea.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataVentasArea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f8fafc' }} />
                      <Area type="monotone" dataKey="ventas" stroke="#45caff" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center gap-2 text-slate-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-500" /> No hay datos de cierres semanales registrados.
                  </div>
                )}
              </div>
            </div>

            {/* Fila de Gráficas de Barras */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gráfica 2: BarChart - Top Ventas por Producto */}
              <div className="bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-blue-500" /> Top de Ventas por Producto
                  </h3>
                  <p className="text-[10px] text-slate-400">Recaudación real bruta estructurada según la demanda del menú.</p>
                </div>
                <div className="h-80 w-full bg-slate-600/20 backdrop-blur-md rounded-xl border border-slate-900/40 p-2">
                  {dataTopPlatillosBar.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataTopPlatillosBar} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 10 }} tick={{ transform: 'translate(0, 2)' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f8fafc' }} />
                        <Legend wrapperStyle={{ padding: 10, fontSize: 11 }} />
                        <Bar dataKey="Ingresos" fill="#1dc5d1" radius={[6, 6, 0, 0]} activeBar={{ fill: '#38bdf8' }} />
                        <Bar dataKey="Cantidad" fill="#4f46e5" radius={[6, 6, 0, 0]} activeBar={{ fill: '#818cf8' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center gap-2 text-slate-800 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-500" /> Sin registros de volumen de platillos vendidos.
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfica 3: BarChart - Ranking del Comedor */}
              <div className="bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <UtensilsCrossed className="w-4 h-4 text-cyan-400/60" /> Ranking Específico del Comedor
                  </h3>
                  <p className="text-xs text-slate-800">Unidades reales despachadas en sala obtenidas de los Stored Procedures.</p>
                </div>
                <div className="h-80 w-full bg-slate-950/20 rounded-xl border border-slate-900/40 p-2">
                  {dataRankingBar.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataRankingBar} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f8fafc' }} />
                        <Bar dataKey="Unidades" fill="#5ddfb4" radius={[6, 6, 0, 0]} activeBar={{ fill: '#34d399' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center gap-2 text-slate-800 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-500" /> No hay datos del ranking del comedor.
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
