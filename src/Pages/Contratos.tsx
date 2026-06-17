import { Briefcase, TrendingUp, ShieldCheck, FileText, Loader2 } from "lucide-react";

// Hooks
import { useContratos } from "../components/Hooks/hookContratos";

// Componentes
import TablaContratos from "../components/table/TableContratos"; // <-- Asegúrate de que la ruta coincida con tu estructura

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
        <div className="min-h-[100dvh] bg-[#090D1A] text-slate-200 p-4 md:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-[1400px] mx-auto space-y-6 flex flex-col h-full animate-[fade-in_0.4s_ease-out]">
                
                {/* ================= HEADER ================= */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
                            <Briefcase size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gestión de Contratos</h1>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Acuerdos comerciales corporativos</p>
                        </div>
                    </div>
                </header>

                {/* ================= MÉTRICAS (KPIs) ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KpiCard 
                        title="Total Contratos" 
                        value={stats?.total || 0} 
                        icon={<FileText size={24} />} 
                        colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        borderClass="border-slate-800"
                    />
                    <KpiCard 
                        title="Contratos Activos" 
                        value={stats?.activos || 0} 
                        icon={<ShieldCheck size={24} />} 
                        colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        borderClass="border-slate-800"
                    />
                    <KpiCard 
                        title="Presupuesto Total" 
                        value={formatMoney(stats?.presupuesto || 0)} 
                        icon={<TrendingUp size={24} />} 
                        colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        borderClass="border-slate-800"
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
        </div>
    );
}