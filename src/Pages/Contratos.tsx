import { useState } from "react";
import { Briefcase, Plus, TrendingUp, ShieldCheck, Clock, FileText, Edit, Loader2, Search } from "lucide-react";

// Hooks
import { useContratos } from "../components/Hooks/hookContratos";

import ModalNuevoContratos from "../components/modals/ModalNuevoContratito";
import ModalEditarContratoProps from "../components/modals/ModalEditarContratito";


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
    // --- ESTADOS PARA LOS MODALES ---
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [contratoAEditar, setContratoAEditar] = useState<any | null>(null);

    // --- ESTADOS DE FILTRO ---
    const [busqueda, setBusqueda] = useState("");

    // --- CONSUMO DEL HOOK ---
    const { contratos, stats, loading, error, refetch } = useContratos();

    // --- LÓGICA DE FILTRADO LOCAL ---
    const contratosFiltrados = contratos.filter((c: any) => 
        (c.NombreCliente || c.nombre_cliente || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        String(c.NumeroContrato || c.numero_contrato || "").includes(busqueda)
    );

    // --- UTILIDADES ---
    const formatMoney = (amount: number) => 
        new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

    const getEstadoStyles = (est: string) => {
        switch (est?.toUpperCase()) {
            case 'ACTIVO': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'VENCIDO': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'ANULADO': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

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
                    
                    <button 
                        onClick={() => setModalNuevoAbierto(true)} 
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50"
                    >
                        <Plus size={18} /> Nuevo Contrato
                    </button>
                </header>

                {/* ================= MÉTRICAS (KPIs) ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KpiCard 
                        title="Total Contratos" 
                        value={stats.total} 
                        icon={<FileText size={24} />} 
                        colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        borderClass="border-slate-800"
                    />
                    <KpiCard 
                        title="Contratos Activos" 
                        value={stats.activos} 
                        icon={<ShieldCheck size={24} />} 
                        colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        borderClass="border-slate-800"
                    />
                    <KpiCard 
                        title="Presupuesto Total" 
                        value={formatMoney(stats.presupuesto)} 
                        icon={<TrendingUp size={24} />} 
                        colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        borderClass="border-slate-800"
                    />
                </div>

                {/* ================= TABLA DE CONTRATOS ================= */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col mt-4">
                    
                    {/* BARRA DE HERRAMIENTAS (Toolbar) */}
                    <div className="bg-slate-900/80 border-b border-slate-800 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <Clock size={16} className="text-blue-500"/> Historial de Acuerdos
                        </h3>
                        
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar cliente o N°..." 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* CONTENIDO DE LA TABLA */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-xs uppercase tracking-widest text-slate-400 border-b border-slate-800">
                                    <th className="p-4 font-black">N° Contrato</th>
                                    <th className="p-4 font-black">Cliente</th>
                                    <th className="p-4 font-black">Fechas (Inicio - Fin)</th>
                                    <th className="p-4 font-black">Presupuesto</th>
                                    <th className="p-4 font-black">Estado</th>
                                    <th className="p-4 font-black text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={28}/>
                                            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Cargando registros...</span>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-red-400 font-bold">{error}</td>
                                    </tr>
                                ) : contratosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500 italic">No se encontraron contratos registrados.</td>
                                    </tr>
                                ) : (
                                    contratosFiltrados.map((c: any, index: number) => (
                                        <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-4 font-mono font-black text-white">
                                                {c.NumeroContrato || c.numero_contrato}
                                            </td>
                                            <td className="p-4 font-bold text-slate-300">
                                                {c.NombreCliente || c.nombre_cliente}
                                            </td>
                                            <td className="p-4 font-mono text-xs text-slate-400">
                                                <span className="text-slate-300">{c.FechaInicio ? new Date(c.FechaInicio).toLocaleDateString() : '---'}</span>
                                                <span className="mx-2 text-slate-600">/</span>
                                                <span className="text-slate-300">{c.FechaVencimiento ? new Date(c.FechaVencimiento).toLocaleDateString() : '---'}</span>
                                            </td>
                                            <td className="p-4 font-mono font-black text-emerald-400">
                                                C$ {Number(c.Presupuesto || c.presupuesto || 0).toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getEstadoStyles(c.Estado || c.estado)}`}>
                                                    {c.Estado || c.estado || 'DESCONOCIDO'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => setContratoAEditar(c)}
                                                    className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 inline-flex items-center justify-center"
                                                    title="Editar Estado"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ================= RENDERIZADO DE MODALES ================= */}
            
            {/* Modal para CREAR */}
            {modalNuevoAbierto && (
                <ModalNuevoContratos 
                    onClose={() => setModalNuevoAbierto(false)} 
                    onCompletar={() => {
                        refetch(); // Recarga la tabla silenciosamente
                        setModalNuevoAbierto(false);
                    }}
                />
            )}

            {/* Modal para EDITAR */}
            {contratoAEditar && (
                <ModalEditarContratoProps 
                    contrato={contratoAEditar}
                    onClose={() => setContratoAEditar(null)}
                    onCompletar={() => {
                        refetch(); // Recarga la tabla silenciosamente
                        setContratoAEditar(null);
                    }}
                />
            )}

        </div>
    );
}