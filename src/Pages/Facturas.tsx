import TablaFacturas from "../components/table/TableFacturas";
import { FileText, DollarSign, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import { useFacturasPage } from "../components/Hooks/hookFacturas";

export default function FacturasPage() {
  // Consumimos toda la lógica desde el custom hook
  const { data, stats, loading, error } = useFacturasPage();

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Manejo de errores visual */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200 text-sm">
          ⚠️ Ocurrió un problema al sincronizar los datos: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Control de Facturación</h1>
            <p className="text-slate-500 mt-0.5 text-xs font-medium">Monitoreo en tiempo real de ingresos y estados de cuenta para La Buena Cuchara.</p>
          </div>
        </div>
      </div>

      {/* Header & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Renderizado condicional de KPIs: Solo se muestran si ya se cargaron los datos */}
          {loading ? (
            <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-100 animate-pulse" />
            ))}
            </>
              ) : (
          stats && (
            <>
              {/* KPI 1: Total Facturado */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-emerald-50/30 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex justify-between items-center group hover:border-emerald-400/50 transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/5">
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

              {/* KPI 2: Ingresos Cobrados */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-blue-50/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex justify-between items-center group hover:border-blue-400/50 transition-all duration-300 hover:shadow-md hover:shadow-blue-900/5">
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

              {/* KPI 3: Facturas Pendientes */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-amber-50/30 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex justify-between items-center group hover:border-amber-400/50 transition-all duration-300 hover:shadow-md hover:shadow-amber-900/5">
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

      {/* Renderizado de la Tabla o Estado de Carga */}
      <div className="mt-2">
        {loading ? (
          <div className="h-64 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center text-blue-600 gap-3 shadow-inner">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando cuentas...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 overflow-hidden p-1">
            <TablaFacturas />
          </div>
        )}
      </div>
    </div>
  );
}