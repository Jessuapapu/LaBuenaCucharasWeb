import { useState, useMemo } from "react";
import { X, User, Search, Calendar, DollarSign, FileText, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useNuevoContrato } from "../../context/Hooks/hookContratos"; // Ajusta tu ruta
import { Briefcase } from "lucide-react";

interface ModalNuevoContratoProps {
    onClose: () => void;
}

export default function ModalNuevoContrato({ onClose }: ModalNuevoContratoProps) {
    // ESTADOS DEL FORMULARIO
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split("T")[0]);
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [presupuesto, setPresupuesto] = useState<number | "">("");
    const [numeroContrato, setNumeroContrato] = useState<number | "">("");

    // ESTADOS DEL BUSCADOR PREDICTIVO DE CLIENTES
    const [busquedaCliente, setBusquedaCliente] = useState(""); 
    const [mostrarSelector, setMostrarSelector] = useState(false);
    const [nombreClienteSeleccionado, setNombreClienteSeleccionado] = useState("");

    // HOOK DE CONTRATOS
    const { listaClientes, crear, loading, error } = useNuevoContrato();

    // FILTRADO DE CLIENTES EN TIEMPO REAL
    const clientesFiltrados = useMemo(() => {
        if (!busquedaCliente.trim()) return listaClientes;
        return listaClientes.filter(c => 
            // Soporta tanto c.nombre (como viene del backend Python) o c.NombreCliente
            ( c.NombreCliente || "").toLowerCase().includes(busquedaCliente.toLowerCase())
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
            // Recargamos o cerramos limpiamente
            window.location.reload(); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
            <div className="bg-slate-900 rounded-3xl text-white max-w-5xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-auto max-h-[90vh]">
                
                {/* LADO IZQUIERDO: FORMULARIO */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="space-y-6 flex-1">
                        
                        <header className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    Nuevo Contrato
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Registra un nuevo acuerdo comercial corporativo.</p>
                            </div>
                            <button type="button" onClick={onClose} className="md:hidden p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </header>

                        {error && (
                            <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-xl text-center font-semibold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            
                            {/* NÚMERO DE CONTRATO */}
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <FileText size={14} className="text-blue-500" /> Número de Contrato
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-mono text-lg font-bold" 
                                    value={numeroContrato} 
                                    onChange={e => setNumeroContrato(Number(e.target.value))} 
                                    required 
                                    placeholder="Ej: 1001" 
                                />
                            </div>

                            {/* SELECTOR PREDICTIVO DE CLIENTE */}
                            <div className="space-y-1 sm:col-span-2 relative">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <User size={14} className="text-blue-500" /> Cliente Asociado
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-colors text-white font-medium cursor-pointer"
                                        placeholder="Buscar cliente por nombre..."
                                        value={busquedaCliente}
                                        onChange={(e) => {
                                            setBusquedaCliente(e.target.value);
                                            setNombreClienteSeleccionado(""); // Resetea si escribe algo nuevo
                                            setMostrarSelector(true);
                                        }}
                                        onFocus={() => setMostrarSelector(true)}
                                        required
                                    />
                                    {nombreClienteSeleccionado && (
                                        <CheckCircle2 className="absolute right-3.5 top-3.5 text-emerald-500" size={18} />
                                    )}
                                </div>

                                {/* Dropdown flotante */}
                                {mostrarSelector && (
                                    <>
                                        <div className="absolute z-30 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-900 custom-scrollbar">
                                            {clientesFiltrados.length > 0 ? (
                                                clientesFiltrados.map((c, i) => {
                                                    const nombre =  c.NombreCliente || "";
                                                    return (
                                                        <div
                                                            key={i}
                                                            onClick={() => handleSeleccionCliente(nombre)}
                                                            className="px-4 py-3 text-sm text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer font-medium transition-colors"
                                                        >
                                                            {nombre}
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-slate-500 text-center italic">Ningún cliente coincide</div>
                                            )}
                                        </div>
                                        <div className="fixed inset-0 z-20" onClick={() => setMostrarSelector(false)} />
                                    </>
                                )}
                            </div>

                            {/* FECHAS */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar size={14} className="text-blue-500" /> Fecha Inicio
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-mono text-sm"
                                    style={{ colorScheme: "dark" }}
                                    value={fechaInicio} 
                                    onChange={e => setFechaInicio(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar size={14} className="text-purple-500" /> Fecha Venc.
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-purple-500 font-mono text-sm"
                                    style={{ colorScheme: "dark" }}
                                    value={fechaVencimiento} 
                                    onChange={e => setFechaVencimiento(e.target.value)} 
                                    required 
                                />
                            </div>

                            {/* PRESUPUESTO */}
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <DollarSign size={14} className="text-emerald-500" /> Presupuesto Asignado
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-slate-500 font-bold font-mono">C$</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 outline-none focus:border-emerald-500 font-mono text-lg font-black"
                                        value={presupuesto} 
                                        onChange={e => setPresupuesto(Number(e.target.value))} 
                                        required 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-6 border-t border-slate-800/60 mt-8 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm transition-colors text-white">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !nombreClienteSeleccionado} 
                            className={`flex-[2] py-3 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg flex justify-center items-center gap-2
                                ${loading || !nombreClienteSeleccionado
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none" 
                                    : "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-950/40 active:scale-[0.99]"}`}
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin"/> Guardando...</> : "Confirmar Contrato"}
                        </button>
                    </div>
                </form>

                {/* LADO DERECHO: PREVIEW DEL CONTRATO */}
                <div className="bg-slate-950 p-6 md:p-8 w-full md:w-96 flex flex-col relative overflow-hidden shrink-0 hidden sm:flex">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Vista Previa</h3>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 shadow-2xl border border-slate-800 flex-1 flex flex-col relative z-10">
                        
                        <div className="text-center mb-6 pb-6 border-b border-dashed border-slate-700">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                <Briefcase className="text-blue-500" size={24} />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acuerdo de Servicio</h4>
                            <div className="text-2xl font-black text-white font-mono">
                                {numeroContrato ? `N° ${numeroContrato}` : "N° ----"}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Titular del Contrato</span>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <User size={14} className="text-slate-400"/>
                                    {nombreClienteSeleccionado || <span className="italic text-slate-600">No seleccionado</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">F. Inicio</span>
                                    <div className="text-xs font-mono font-bold text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        {fechaInicio || "---"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">F. Vencimiento</span>
                                    <div className="text-xs font-mono font-bold text-purple-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        {fechaVencimiento || "---"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-800">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Presupuesto Asignado</span>
                            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                                C$ {presupuesto ? Number(presupuesto).toFixed(2) : "0.00"}
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 uppercase tracking-wider">
                                <Clock size={12} /> Estado: Activo (Al crear)
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}