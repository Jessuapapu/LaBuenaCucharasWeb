import TablaFacturas from "../components/table/TableFacturas";
import { FileText, DollarSign, CreditCard, AlertCircle } from "lucide-react";
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

      {/* Header & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card Title */}
          <div className="md:col-span-3 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg flex items-center gap-4">
             <div className="p-3 bg-blue-900/20 rounded-xl text-blue-400">
                <FileText className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Control de Facturación</h1>
                <p className="text-gray-400 mt-1 text-sm">Monitoreo de ingresos y estados de cuenta.</p>
             </div>
          </div>

          {/* Renderizado condicional de KPIs: Solo se muestran si ya se cargaron los datos */}
          {!loading && (
            <>
              {/* KPI 1 */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow flex justify-between items-center group hover:border-green-500/30 transition-colors">
                 <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Facturado</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{formatMoney(stats.total)}</h3>
                 </div>
                 <div className="p-3 bg-green-900/20 text-green-400 rounded-lg"><DollarSign className="w-6 h-6"/></div>
              </div>

              {/* KPI 2 */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                 <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Ingresos Cobrados</p>
                    <h3 className="text-2xl font-bold text-blue-100 mt-1">{formatMoney(stats.pagadas)}</h3>
                 </div>
                 <div className="p-3 bg-blue-900/20 text-blue-400 rounded-lg"><CreditCard className="w-6 h-6"/></div>
              </div>

              {/* KPI 3 */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow flex justify-between items-center group hover:border-yellow-500/30 transition-colors">
                 <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Facturas Pendientes</p>
                    <h3 className="text-2xl font-bold text-yellow-100 mt-1">{stats.pendiente}</h3>
                 </div>
                 <div className="p-3 bg-yellow-900/20 text-yellow-400 rounded-lg"><AlertCircle className="w-6 h-6"/></div>
              </div>
            </>
          )}
      </div>

      {/* Renderizado de la Tabla o Estado de Carga */}
      {loading ? (
        <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-blue-400 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium animate-pulse">Cargando facturas...</span>
        </div>
      ) : (
        <TablaFacturas />
      )}
    </div>
  );
}