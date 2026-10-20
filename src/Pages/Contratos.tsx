import { Briefcase, TrendingUp, ShieldCheck, FileText, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useContratos } from "../components/Hooks/hookContratos";
import TablaContratos from "../Features/Contratos/tables/TableContratos";

const KpiCard = ({ title, value, icon, tone }: { title: string; value: string | number; icon: ReactNode; tone: "cyan" | "emerald" | "amber" }) => {
    const tones = {
        cyan: "bg-cyan-100 text-cyan-900 border-cyan-200",
        emerald: "bg-emerald-100 text-emerald-900 border-emerald-200",
        amber: "bg-amber-100 text-amber-900 border-amber-200",
    };

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-sm shadow-slate-900/5 transition-transform hover:-translate-y-0.5">
            <div className={`rounded-xl border p-3 ${tones[tone]}`}>{icon}</div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-600">{title}</p>
                <h3 className="text-2xl font-black tracking-tight text-slate-800">{value}</h3>
            </div>
        </div>
    );
};

export default function ContratosPage() {
    const { contratos, stats, loading, error, refetch } = useContratos();
    const formatMoney = (amount: number) => new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO", maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="relative space-y-6 pb-8 animate-in fade-in duration-500">
            <header className="flex flex-col justify-between gap-4 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-3.5 text-white shadow-lg shadow-cyan-900/15"><Briefcase size={24} /></div>
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Acuerdos comerciales</p>
                        <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">Gestión de contratos</h1>
                        <p className="mt-1 text-sm text-slate-600">Controla vigencias, estados y presupuestos.</p>
                    </div>
                </div>
                <Link to="/Clientes" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-[#edf3f5] px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-200 hover:text-slate-900">
                    <ArrowLeft size={16} /> Volver a clientes
                </Link>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <KpiCard title="Total contratos" value={stats?.total || 0} icon={<FileText size={22} />} tone="cyan" />
                <KpiCard title="Contratos activos" value={stats?.activos || 0} icon={<ShieldCheck size={22} />} tone="emerald" />
                <KpiCard title="Presupuesto total" value={formatMoney(stats?.presupuesto || 0)} icon={<TrendingUp size={22} />} tone="amber" />
            </div>

            <section className="rounded-3xl border border-sky-200/80 bg-[#e3edf2]/85 p-3 shadow-lg shadow-slate-900/5 sm:p-5">
                {loading ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-sky-200 bg-[#dce8ed]">
                        <Loader2 className="mb-4 animate-spin text-cyan-800" size={36} />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Cargando registros...</span>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-100 p-8 text-center font-bold text-rose-800">{error}</div>
                ) : <TablaContratos data={contratos} refetch={refetch} />}
            </section>
        </div>
    );
}
