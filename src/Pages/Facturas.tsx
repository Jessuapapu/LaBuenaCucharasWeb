import { useEffect, useState, useMemo } from "react";
import TablaFacturas from "../components/table/TableFacturas";
import { FileText, DollarSign, CreditCard, AlertCircle } from "lucide-react";

export default function FacturasPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/pedidos/facturas")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error cargando facturas:", err))
      .finally(() => setLoading(false));
  }, []);

  // KPIs
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, pagadas: 0, pendiente: 0 };
    return {
        total: data.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0),
        pagadas: data.filter((f: any) => f.estado_factura === 'Pagada').reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0),
        pendiente: data.filter((f: any) => f.estado_factura === 'Generada').length
    };
  }, [data]);

  const formatMoney = (val: number) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
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
      </div>

      {loading ? (
        <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-blue-400 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium animate-pulse">Cargando facturas...</span>
        </div>
      ) : (
        <TablaFacturas data={data} />
      )}
    </div>
  );
}