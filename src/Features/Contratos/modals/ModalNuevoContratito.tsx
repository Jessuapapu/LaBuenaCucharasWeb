import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, User, Search, Calendar, DollarSign, FileText, Loader2, CheckCircle2, Briefcase, Clock } from "lucide-react";
import { useNuevoContrato } from "../../../components/Hooks/hookContratos"; // Ajusta tu ruta

interface ModalNuevoContratoProps {
    onClose: () => void;
    onCompletar?: () => void; // Opcional: para recargar la tabla sin refrescar toda la web
}

export default function ModalNuevoContratos({ onClose, onCompletar }: ModalNuevoContratoProps) {
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split("T")[0]);
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [presupuesto, setPresupuesto] = useState<number | "">("");
    const [numeroContrato, setNumeroContrato] = useState<number | "">("");

    const [busquedaCliente, setBusquedaCliente] = useState(""); 
    const [mostrarSelector, setMostrarSelector] = useState(false);
    const [nombreClienteSeleccionado, setNombreClienteSeleccionado] = useState("");

    const { listaClientes, crear, loading, error } = useNuevoContrato();

    const clientesFiltrados = useMemo(() => {
        if (!busquedaCliente.trim()) return listaClientes;
        return listaClientes.filter(c => 
            (c.NombreCliente || "").toLowerCase().includes(busquedaCliente.toLowerCase())
        );
    }, [busquedaCliente, listaClientes]);

    const handleSeleccionCliente = (nombre: string) => {
        setBusquedaCliente(nombre);
        setNombreClienteSeleccionado(nombre);
        setMostrarSelector(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombreClienteSeleccionado || !presupuesto || !fechaVencimiento || !numeroContrato) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const payload = {
            numero_contrato: Number(numeroContrato),
            fecha_inicio: new Date(fechaInicio).toISOString(),
            nombre_cliente: nombreClienteSeleccionado, 
            presupuesto: Number(presupuesto),
            fecha_fin: new Date(fechaVencimiento).toISOString()
        };

        const exito = await crear(payload);

        if (exito) {
            if (onCompletar) onCompletar();
            else window.location.reload(); 
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-[fade-in_0.3s_ease-out] sm:p-5">
            <div role="dialog" aria-modal="true" aria-labelledby="nuevo-contrato-titulo" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25 md:flex-row sm:max-h-[calc(100dvh-2.5rem)]">
                
                {/* --- LADO IZQUIERDO: FORMULARIO --- */}
                <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto border-b border-slate-300/80 bg-[#e6eef2] p-5 custom-scrollbar sm:p-6 lg:p-8 md:border-b-0 md:border-r">
                    <div className="space-y-6 flex-1">
                        
                        <header className="flex justify-between items-start gap-3">
                            <div>
                                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Acuerdos comerciales</p>
                                <h2 id="nuevo-contrato-titulo" className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    Nuevo contrato
                                </h2>
                                <p className="text-slate-600 text-sm mt-1">
                                    Registra los datos y consulta un resumen antes de guardar.
                                </p>
                            </div>
                            <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900 border border-slate-300 active:scale-95 transition-all">
                                <X size={20} />
                            </button>
                        </header>

                        {error && (
                            <div className="p-3 bg-rose-100 border border-rose-200 text-rose-800 text-sm rounded-xl text-center font-semibold animate-[shake_0.5s_ease-in-out]">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <FileText size={16} className="text-cyan-800" /> Número de contrato
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 font-mono text-lg font-bold transition-all" 
                                    value={numeroContrato} 
                                    onChange={e => setNumeroContrato(Number(e.target.value))} 
                                    required 
                                    placeholder="Ej: 1001" 
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2 relative">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <User size={16} className="text-violet-700" /> Cliente asociado
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-[#f3f7f8] border border-slate-300 focus:border-violet-700 focus:ring-2 focus:ring-violet-700/15 outline-none text-sm transition-all text-slate-800 font-medium cursor-pointer"
                                        placeholder="Buscar cliente..."
                                        value={busquedaCliente}
                                        onChange={(e) => {
                                            setBusquedaCliente(e.target.value);
                                            setNombreClienteSeleccionado(""); 
                                            setMostrarSelector(true);
                                        }}
                                        onFocus={() => setMostrarSelector(true)}
                                        required
                                    />
                                    {nombreClienteSeleccionado && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />}
                                </div>

                                {mostrarSelector && (
                                    <>
                                        <div className="absolute z-30 w-full mt-2 bg-[#e8f0f3] border border-slate-300 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-200 custom-scrollbar">
                                            {clientesFiltrados.length > 0 ? (
                                                clientesFiltrados.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSeleccionCliente(c.NombreCliente)}
                                                        className="px-5 py-3.5 text-sm text-slate-700 hover:bg-cyan-100 hover:text-cyan-950 cursor-pointer font-medium transition-colors"
                                                    >
                                                        {c.NombreCliente}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-5 py-4 text-xs text-slate-500 text-center italic font-medium">Ningún cliente coincide</div>
                                            )}
                                        </div>
                                        <div className="fixed inset-0 z-20" onClick={() => setMostrarSelector(false)} />
                                    </>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Calendar size={16} className="text-emerald-700" /> Fecha de inicio
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 font-mono text-sm transition-all"
                                    value={fechaInicio} 
                                    onChange={e => setFechaInicio(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Calendar size={16} className="text-amber-700" /> Fecha de vencimiento
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15 font-mono text-sm transition-all"
                                    value={fechaVencimiento} 
                                    onChange={e => setFechaVencimiento(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <DollarSign size={16} className="text-emerald-700" /> Presupuesto asignado
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-bold font-mono">C$</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-emerald-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 font-mono text-xl font-black transition-all"
                                        value={presupuesto} 
                                        onChange={e => setPresupuesto(Number(e.target.value))} 
                                        required 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-5 border-t border-slate-300 mt-7 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-sm transition-colors text-slate-700 border border-slate-300 shadow-sm">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !nombreClienteSeleccionado} 
                            className={`flex-[2] py-3.5 rounded-xl font-bold text-sm text-white tracking-wide transition-all shadow-md flex justify-center items-center gap-2 border
                                ${loading || !nombreClienteSeleccionado ? "bg-slate-400 border-slate-400 text-slate-100 cursor-not-allowed" : "bg-gradient-to-r from-cyan-700 to-blue-700 border-cyan-700 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-900/15 active:scale-[0.98]"}`}
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin"/> Registrando...</> : "Confirmar Contrato"}
                        </button>
                    </div>
                </form>

                {/* --- LADO DERECHO: PREVIEW --- */}
                <div className="bg-[#dce7eb] p-6 lg:p-8 w-full md:w-[400px] flex flex-col relative overflow-y-auto shrink-0 hidden sm:flex">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#dce7eb] to-transparent pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} /> Vista Previa
                        </h3>
                        <button onClick={onClose} type="button" aria-label="Cerrar formulario" className="text-slate-600 hover:text-slate-900 transition-colors bg-[#edf3f5] hover:bg-slate-200 p-2 rounded-xl border border-slate-300">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="bg-[#e8f0f3] rounded-3xl p-6 lg:p-8 text-slate-700 shadow-sm border border-slate-300 flex-1 flex flex-col relative z-10">
                        
                        <div className="text-center mb-8 pb-8 border-b border-dashed border-slate-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl border border-sky-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Briefcase className="text-cyan-800" size={28} />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Acuerdo de servicio</h4>
                            <div className="text-3xl font-black text-slate-800 font-mono tracking-tight">
                                {numeroContrato ? `N° ${numeroContrato}` : "N° ----"}
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Titular del contrato</span>
                                <div className="text-sm font-bold text-slate-800 flex items-center gap-2.5 bg-[#f0f5f7] p-3 rounded-xl border border-slate-300">
                                    <User size={16} className="text-violet-700"/>
                                    {nombreClienteSeleccionado || <span className="italic text-slate-600 font-medium">No seleccionado</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">F. inicio</span>
                                <div className="text-xs font-mono font-bold text-slate-700 bg-[#f0f5f7] p-3 rounded-xl border border-slate-300 text-center">
                                        {fechaInicio || "---"}
                                    </div>
                                </div>
                                <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">F. vencimiento</span>
                                <div className="text-xs font-mono font-bold text-amber-900 bg-amber-100 p-3 rounded-xl border border-amber-200 text-center">
                                        {fechaVencimiento || "---"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-300">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">Presupuesto asignado</span>
                            <div className="text-3xl font-black text-emerald-900 font-mono tracking-tighter text-center bg-emerald-100 py-4 rounded-2xl border border-emerald-200">
                                C$ {presupuesto ? Number(presupuesto).toFixed(2) : "0.00"}
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-cyan-900 font-bold bg-cyan-100 px-4 py-2.5 rounded-xl border border-cyan-200 uppercase tracking-widest">
                                <Clock size={14} /> Estado: Activo (Al crear)
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
