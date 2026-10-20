import { useState, useEffect } from "react";
import { X, User, FileText, Loader2, Briefcase, Activity, ShieldAlert } from "lucide-react";
import { useEditarContrato } from "../../../context/Hooks/hookContratos";

interface ModalEditarContratoProps {
    contrato: any; 
    onClose: () => void;
    onCompletar?: () => void;
}

export default function ModalEditarContratoProps({ contrato, onClose, onCompletar }: ModalEditarContratoProps) {
    const [nuevoEstado, setNuevoEstado] = useState("");
    const { actualizarEstado, loading, error } = useEditarContrato();

    useEffect(() => {
        if (contrato) {
            setNuevoEstado(contrato.Estado || contrato.estado || "ACTIVO");
        }
    }, [contrato]);

    if (!contrato) return null;

    const numContrato = contrato.NumeroContrato || contrato.numero_contrato;
    const cliente = contrato.NombreCliente || contrato.nombre_cliente;
    const fInicio = contrato.FechaInicio ? new Date(contrato.FechaInicio).toISOString().split('T')[0] : "---";
    const fFin = contrato.FechaVencimiento || contrato.FechaFin ? new Date(contrato.FechaVencimiento || contrato.FechaFin).toISOString().split('T')[0] : "---";
    const presupuesto = contrato.Presupuesto || contrato.presupuesto || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!numContrato) {
            alert("Error: No se encontró el número de contrato.");
            return;
        }

        const exito = await actualizarEstado(numContrato, nuevoEstado);

        if (exito) {
            if (onCompletar) onCompletar();
            else window.location.reload(); 
            onClose();
        }
    };

    const getEstadoColor = (est: string) => {
        switch (est?.toUpperCase()) {
            case 'ACTIVO': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'VENCIDO': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'ANULADO': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050810]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.3s_ease-out]">
            <div className="bg-[#0F172A] rounded-3xl text-white max-w-5xl w-full border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-auto md:max-h-[85vh] ring-1 ring-white/5">
                
                {/* --- LADO IZQUIERDO: FORMULARIO DE EDICIÓN --- */}
                <form onSubmit={handleSubmit} className="p-6 lg:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto custom-scrollbar bg-slate-900/50">
                    <div className="space-y-6 flex-1">
                        
                        <header className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    Editar Contrato
                                </h2>
                                <p className="text-slate-400 text-xs md:text-sm mt-1 uppercase tracking-widest font-bold">
                                    Modificación de estado operativo
                                </p>
                            </div>
                            <button type="button" onClick={onClose} className="md:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all">
                                <X size={20} />
                            </button>
                        </header>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-[shake_0.5s_ease-in-out]">
                                <ShieldAlert size={18} /> {error}
                            </div>
                        )}

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 mb-6">
                            <p className="text-sm text-blue-200/70 leading-relaxed font-medium">
                                Por políticas de integridad fiscal, la información estructural del contrato (fechas, presupuesto y cliente) es de <strong className="text-blue-300">solo lectura</strong>. Solo se permite modificar la etapa operativa actual.
                            </p>
                        </div>

                        {/* SELECTOR DE ESTADO */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <Activity size={18} className="text-emerald-500" /> Estado del Contrato
                            </label>
                            <div className="relative">
                                <select 
                                    value={nuevoEstado} 
                                    onChange={(e) => setNuevoEstado(e.target.value)} 
                                    className={`w-full px-5 py-4 rounded-xl bg-[#0A0F1D] border-2 outline-none font-black tracking-wider uppercase transition-all cursor-pointer appearance-none shadow-inner
                                        ${nuevoEstado === 'ACTIVO' ? 'border-emerald-500/50 text-emerald-400 focus:ring-emerald-500/30' : 
                                          nuevoEstado === 'VENCIDO' ? 'border-amber-500/50 text-amber-400 focus:ring-amber-500/30' : 
                                          'border-red-500/50 text-red-400 focus:ring-red-500/30'} focus:ring-4`}
                                >
                                    <option value="ACTIVO" className="text-emerald-500 font-bold">🟢 Activo / En Curso</option>
                                    <option value="VENCIDO" className="text-amber-500 font-bold">🟡 Vencido / Finalizado</option>
                                    <option value="ANULADO" className="text-red-500 font-bold">🔴 Anulado</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
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
                            disabled={loading || nuevoEstado === (contrato.Estado || contrato.estado)} 
                            className={`flex-[2] py-3.5 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg flex justify-center items-center gap-2 border
                                ${loading || nuevoEstado === (contrato.Estado || contrato.estado)
                                    ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" 
                                    : "bg-blue-500 border-blue-400 hover:bg-blue-400 shadow-blue-900/40 active:scale-[0.98]"}`}
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin"/> Actualizando...</> : "Guardar Cambios"}
                        </button>
                    </div>
                </form>

                {/* --- LADO DERECHO: FICHA TÉCNICA (SOLO LECTURA) --- */}
                <div className="bg-[#0A0F1D] p-6 lg:p-8 w-full md:w-[400px] flex flex-col relative overflow-hidden shrink-0 hidden sm:flex border-l border-slate-800">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} /> Ficha Técnica
                        </h3>
                        <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getEstadoColor(contrato.Estado || contrato.estado)}`}>
                            {contrato.Estado || contrato.estado || "N/A"}
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-3xl p-8 text-slate-300 shadow-inner border border-slate-800 flex-1 flex flex-col relative z-10">
                        
                        <div className="text-center mb-8 pb-8 border-b border-dashed border-slate-700">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="text-slate-400" size={28} />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Acuerdo Comercial</h4>
                            <div className="text-3xl font-black text-white font-mono tracking-tight opacity-90">
                                N° {numContrato || "----"}
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 opacity-80">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Titular del Contrato</span>
                                <div className="text-sm font-bold text-slate-300 flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <User size={16} className="text-slate-500"/>
                                    {cliente || "Desconocido"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">F. Inicio</span>
                                    <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                        {fInicio}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">F. Vencimiento</span>
                                    <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                        {fFin}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-800 opacity-80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">Presupuesto Asignado</span>
                            <div className="text-2xl font-black text-slate-400 font-mono tracking-tighter text-center bg-slate-950 py-4 rounded-2xl border border-slate-800">
                                C$ {Number(presupuesto).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}