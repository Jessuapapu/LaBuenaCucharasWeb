import TablaFacturas from "../components/table/TableFacturas";
import { FileText, DollarSign, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import { useFacturasPage } from "../components/Hooks/hookFacturas";

export default function FacturasPage() {
  // Consumimos únicamente la data estructural y de KPIs globales para la cabecera
  const { stats, loading, error, refetch } = useFacturasPage();

  // Formateador oficial de moneda legal (NIO) con precisión de centavos para auditorías fiscales
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('es-NI', { 
      style: 'currency', 
      currency: 'NIO', 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Alerta de Error de Red o Servidor */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-2xl text-red-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Ocurrió un problema al sincronizar los KPIs globales: {error}</span>
        </div>
      )}

      {/* Encabezado Principal del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Control de Facturación</h1>
            <p className="text-slate-500 mt-0.5 text-xs font-medium">Monitoreo en tiempo real de ingresos y estados de cuenta para La Buena Cuchara.</p>
          </div>
        </div>

        {/* Botón de Sincronización Manual Forzada */}
        <button 
          onClick={() => refetch()}
          disabled={loading}
          className="self-end sm:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/80 flex items-center gap-2 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          Recargar Resumen
        </button>
      </div>

      {/* Panel de Indicadores Clave de Rendimiento (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading && !stats ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </>
        ) : (
          stats && (
            <>
              {/* KPI 1: Total Facturado Histórico */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-emerald-50/30 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex justify-between items-center group hover:border-emerald-400/50 transition-all duration-300 hover:shadow-md">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Facturado</p>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {formatMoney(stats.total)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 2: Capital Líquido Cobrado */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-blue-50/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex justify-between items-center group hover:border-blue-400/50 transition-all duration-300 hover:shadow-md">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ingresos Cobrados</p>
                  <h3 className="text-xl font-black text-blue-600 tracking-tight">
                    {formatMoney(stats.pagadas)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 3: Cuentas por Cobrar Pendientes */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-amber-50/30 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex justify-between items-center group hover:border-amber-400/50 transition-all duration-300 hover:shadow-md">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Facturas Pendientes</p>
                  <h3 className="text-2xl font-black text-amber-600 tracking-tight">
                    {stats.pendiente}
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/50 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </>
          )
        )}
      </div>

      {/* Zona Autónoma de la Grid de Datos */}
      <div className="mt-2">
        {/* Desmontamos el wrapper de loading anterior. La tabla se encarga de sus estados visuales sin desaparecer */}
        <TablaFacturas />
      </div>

    </div>
  );
}