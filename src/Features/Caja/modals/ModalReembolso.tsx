import { useState } from 'react';
import { X, Undo2, Loader2, AlertTriangle } from 'lucide-react';
import { apiCaja } from '../../../context/Services/caja';

export function ModalReembolso({ orden, onClose, onSuccess }: any) {
    const [monto, setMonto] = useState<number | "">("");
    const [razon, setRazon] = useState("");
    const [procesando, setProcesando] = useState(false);

    if (!orden) return null;

    const maxReembolso = orden.Monto;
    const esValido = Number(monto) > 0 && Number(monto) <= maxReembolso && razon.trim().length > 5;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!esValido) return;

        setProcesando(true);
        try {
            const res = await apiCaja.reembolsarOrden({ IdOrden: orden.IdOrden, Monto: Number(monto), Razon: razon });
            if (res.status) {
                alert("Reembolso procesado correctamente.");
                onSuccess();
                onClose();
            }
        } catch (error) {
            alert("Error al procesar el reembolso con el servidor.");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050810]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
            <div className="bg-[#0F172A] rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden ring-1 ring-white/5">
                
                <div className="bg-slate-900/80 border-b border-slate-800 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <Undo2 className="text-amber-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Emitir Reembolso</h2>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Orden #{orden.IdOrden}</span>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={procesando} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-xs text-amber-200/70 font-medium">Esta acción registrará una salida de efectivo en su corte de caja actual. Monto máximo a reembolsar: <strong className="text-amber-400 font-mono">C${maxReembolso.toFixed(2)}</strong></p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Monto a Devolver</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">C$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                max={maxReembolso}
                                value={monto}
                                onChange={(e) => setMonto(e.target.value ? Number(e.target.value) : "")}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0A0F1D] border border-slate-700 focus:border-amber-500 outline-none text-xl font-black text-amber-400 transition-all font-mono shadow-inner"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Razón del Reembolso</label>
                        <textarea 
                            value={razon}
                            onChange={(e) => setRazon(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[#0A0F1D] border border-slate-700 text-white outline-none focus:border-amber-500 transition-all shadow-inner text-sm resize-none h-24"
                            placeholder="Ej: Cliente canceló por demora en la cocina..."
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={!esValido || procesando}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-lg border
                            ${!esValido || procesando 
                                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                                : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500/50 active:scale-[0.98]'}`}
                    >
                        {procesando ? <Loader2 className="animate-spin" size={20}/> : <Undo2 size={20}/>}
                        {procesando ? 'Procesando...' : 'Confirmar Reembolso'}
                    </button>
                </form>
            </div>
        </div>
    );
}