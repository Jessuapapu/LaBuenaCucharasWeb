import { useState, useMemo } from "react";
import { X, User, Search, Calendar, DollarSign, FileText, Loader2, CheckCircle2, Briefcase, Clock } from "lucide-react";
import { useNuevoContrato } from "../Hooks/hookContratos"; // Ajusta tu ruta

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

    return (
        <div className="fixed inset-0 bg-[#050810]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.3s_ease-out]">
            <div className="bg-[#0F172A] rounded-3xl text-white max-w-5xl w-full border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-auto md:max-h-[85vh] ring-1 ring-white/5">
                
                {/* --- LADO IZQUIERDO: FORMULARIO --- */}
                <form onSubmit={handleSubmit} className="p-6 lg:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto custom-scrollbar bg-slate-900/50">
                    <div className="space-y-6 flex-1">
                        
                        <header className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    Nuevo Contrato
                                </h2>
                                <p className="text-slate-400 text-xs md:text-sm mt-1 uppercase tracking-widest font-bold">
                                    Registro de acuerdo comercial corporativo
                                </p>
                            </div>
                            <button type="button" onClick={onClose} className="md:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all">
                                <X size={20} />
                            </button>
                        </header>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center font-bold animate-[shake_0.5s_ease-in-out]">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <FileText size={16} className="text-blue-500" /> Número de Contrato
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#0A0F1D] border border-slate-700 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 font-mono text-lg font-bold transition-all" 
                                    value={numeroContrato} 
                                    onChange={e => setNumeroContrato(Number(e.target.value))} 
                                    required 
                                    placeholder="Ej: 1001" 
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2 relative">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <User size={16} className="text-purple-500" /> Cliente Asociado
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-[#0A0F1D] border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none text-sm transition-all text-white font-medium cursor-pointer shadow-inner"
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
                                        <div className="absolute z-30 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-52 overflow-y-auto divide-y divide-slate-800 custom-scrollbar ring-1 ring-white/5">
                                            {clientesFiltrados.length > 0 ? (
                                                clientesFiltrados.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSeleccionCliente(c.NombreCliente)}
                                                        className="px-5 py-3.5 text-sm text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer font-medium transition-colors"
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Calendar size={16} className="text-emerald-500" /> Fecha Inicio
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#0A0F1D] border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 font-mono text-sm transition-all"
                                    style={{ colorScheme: "dark" }}
                                    value={fechaInicio} 
                                    onChange={e => setFechaInicio(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Calendar size={16} className="text-amber-500" /> Fecha Venc.
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#0A0F1D] border border-slate-700 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-mono text-sm transition-all"
                                    style={{ colorScheme: "dark" }}
                                    value={fechaVencimiento} 
                                    onChange={e => setFechaVencimiento(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <DollarSign size={16} className="text-emerald-500" /> Presupuesto Asignado
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">C$</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0A0F1D] border border-slate-700 text-emerald-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 font-mono text-xl font-black transition-all shadow-inner"
                                        value={presupuesto} 
                                        onChange={e => setPresupuesto(Number(e.target.value))} 
                                        required 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-800 mt-8 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm transition-colors text-white border border-slate-700 shadow-sm">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !nombreClienteSeleccionado} 
                            className={`flex-[2] py-3.5 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg flex justify-center items-center gap-2 border
                                ${loading || !nombreClienteSeleccionado ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" : "bg-emerald-500 border-emerald-400 hover:bg-emerald-400 shadow-emerald-900/40 active:scale-[0.98]"}`}
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin"/> Registrando...</> : "Confirmar Contrato"}
                        </button>
                    </div>
                </form>

                {/* --- LADO DERECHO: PREVIEW --- */}
                <div className="bg-[#0A0F1D] p-6 lg:p-8 w-full md:w-[400px] flex flex-col relative overflow-hidden shrink-0 hidden sm:flex">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} /> Vista Previa
                        </h3>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 p-2 rounded-xl border border-slate-700">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="bg-slate-900 rounded-3xl p-8 text-slate-300 shadow-2xl border border-slate-800 flex-1 flex flex-col relative z-10 ring-1 ring-white/5">
                        
                        <div className="text-center mb-8 pb-8 border-b border-dashed border-slate-700">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <Briefcase className="text-blue-400" size={28} />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Acuerdo de Servicio</h4>
                            <div className="text-3xl font-black text-white font-mono tracking-tight">
                                {numeroContrato ? `N° ${numeroContrato}` : "N° ----"}
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Titular del Contrato</span>
                                <div className="text-sm font-bold text-white flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <User size={16} className="text-purple-400"/>
                                    {nombreClienteSeleccionado || <span className="italic text-slate-600 font-medium">No seleccionado</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">F. Inicio</span>
                                    <div className="text-xs font-mono font-bold text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                        {fechaInicio || "---"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">F. Vencimiento</span>
                                    <div className="text-xs font-mono font-bold text-amber-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
                                        {fechaVencimiento || "---"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-800">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">Presupuesto Asignado</span>
                            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tighter text-center bg-emerald-500/10 py-4 rounded-2xl border border-emerald-500/20">
                                C$ {presupuesto ? Number(presupuesto).toFixed(2) : "0.00"}
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/20 uppercase tracking-widest">
                                <Clock size={14} /> Estado: Activo (Al crear)
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}