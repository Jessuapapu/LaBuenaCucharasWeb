import { Briefcase, TrendingUp, ShieldCheck, FileText, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Hooks
import { useContratos } from "../components/Hooks/hookContratos";

// Componentes
import TablaContratos from "../Contratos/tables/TableContratos"; // <-- Asegúrate de que la ruta coincida con tu estructura

// Componente interno para las tarjetas KPI
const KpiCard = ({ title, value, icon, colorClass, borderClass }: any) => (
    <div className={`bg-[#0F172A] border ${borderClass} p-5 rounded-2xl shadow-lg flex items-center gap-4 transition-all hover:scale-[1.02] cursor-default`}>
        <div className={`p-4 rounded-xl ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        </div>
    </div>
);

export default function ContratosPage() {
    // --- CONSUMO DEL HOOK ---
    const { contratos, stats, loading, error, refetch } = useContratos();

    // --- UTILIDADES ---
    const formatMoney = (amount: number) => 
        new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
                
                {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-lg p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-sky-600 text-white rounded-xl shadow-md shadow-blue-500/10">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Contratos</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Acuerdos comerciales corporativos</p>
          </div>
        </div>

        {/* Botón de Regreso a Clientes */}
        <Link
          to="/Clientes"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 transition-colors uppercase tracking-wider shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver a Clientes
        </Link>
      </header>

                {/* ================= MÉTRICAS (KPIs) ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <KpiCard 
                        title="Total Contratos" 
                        value={stats?.total || 0} 
                        icon={<FileText size={24} />} 
                        gradientClass="from-blue-50 via-blue-100/70 to-sky-50"
                        iconColorClass="text-blue-600"
                    />
                    <KpiCard 
                        title="Contratos Activos" 
                        value={stats?.activos || 0} 
                        icon={<ShieldCheck size={24} />} 
                        gradientClass="from-blue-50 via-blue-100/70 to-sky-50"
                        iconColorClass="text-blue-600"
                    />
                    <KpiCard 
                        title="Presupuesto Total" 
                        value={formatMoney(stats?.presupuesto || 0)} 
                        icon={<TrendingUp size={24} />} 
                        gradientClass="from-blue-50 via-blue-100/70 to-sky-50"
                        iconColorClass="text-blue-600"
                    />
                </div>

                {/* ================= CONTENEDOR DE LA TABLA ================= */}
                <div className="mt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-16 bg-[#0F172A] border border-slate-800 rounded-3xl shadow-xl">
                            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                            <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Cargando registros...</span>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-center rounded-3xl">
                            {error}
                        </div>
                    ) : (
                        /* Renderizamos el componente importado pasando la data y la función para recargar */
                        <TablaContratos 
                            data={contratos} 
                            refetch={refetch} 
                        />
                    )}
                </div>
            </div>
    );
}