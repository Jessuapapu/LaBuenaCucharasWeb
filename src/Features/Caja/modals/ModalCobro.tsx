import { useState, useMemo, useEffect } from 'react';
import { X, DollarSign, Loader2, CreditCard, Banknote, Landmark, Plus, Trash2, CheckCircle2, Receipt } from 'lucide-react';

interface PagoParcial {
    id: string;
    metodo: string;
    monto: number;
    referencia: string;
}

interface ModalCobroProps {
    orden: any;
    onClose: () => void;
    onConfirmarPagos: (idOrden: number, pagos: PagoParcial[]) => Promise<boolean>;
}

export function ModalCobro({ orden, onClose, onConfirmarPagos }: ModalCobroProps) {
    const [pagos, setPagos] = useState<PagoParcial[]>([]);
    const [metodoForm, setMetodoForm] = useState('EFECTIVO');
    const [montoForm, setMontoForm] = useState<number | "">("");
    const [referenciaForm, setReferenciaForm] = useState('');
    const [procesando, setProcesando] = useState(false);

    const montoTotal = Number(orden?.MontoRestante || 0);
    
    const pagado = useMemo(() => pagos.reduce((acc, p) => acc + p.monto, 0), [pagos]);
    const restante = Math.max(0, montoTotal - pagado);
    const vuelto = Math.max(0, pagado - montoTotal);
    
    const cuentaSaldada = pagado >= montoTotal && montoTotal > 0;

    useEffect(() => {
        if (restante > 0) {
            setMontoForm(Number(restante.toFixed(2)));
        } else {
            setMontoForm("");
        }
    }, [restante, metodoForm]);

    useEffect(() => {
        const input = document.getElementById("input-monto-cobro");
        if (input) input.focus();
    }, []);

    if (!orden) return null;

    const agregarPago = (e: React.FormEvent) => {
        e.preventDefault();
        const montoIngresado = Number(montoForm);
        
        if (montoIngresado <= 0) {
            alert("El monto debe ser mayor a 0");
            return;
        }
        if (metodoForm !== 'EFECTIVO' && !referenciaForm.trim()) {
            alert("Debe ingresar un número de comprobante/referencia para pagos electrónicos.");
            return;
        }

        const nuevoPago: PagoParcial = {
            id: Math.random().toString(36).substring(2, 9),
            metodo: metodoForm,
            monto: montoIngresado,
            referencia: metodoForm === 'EFECTIVO' ? 'N/A' : referenciaForm.trim()
        };

        setPagos([...pagos, nuevoPago]);
        setMontoForm("");
        setReferenciaForm("");
    };

    const quitarPago = (id: string) => {
        setPagos(pagos.filter(p => p.id !== id));
    };

    const procesarCobro = async () => {
        if (!cuentaSaldada) return;
        setProcesando(true);
        
        const pagosAjustados = pagos.map(p => {
            if (p.metodo === 'EFECTIVO' && vuelto > 0) {
                return { ...p, monto: p.monto - vuelto };
            }
            return p;
        });

        const exito = await onConfirmarPagos(orden.IdOrden, pagosAjustados);
        setProcesando(false);
        if (exito) onClose();
    };

    const getIconoMetodo = (metodo: string) => {
        switch (metodo) {
            case 'EFECTIVO': return <Banknote size={18} className="text-emerald-400"/>;
            case 'TRANSFERENCIA': return <Landmark size={18} className="text-sky-400"/>;
            default: return <CreditCard size={18} className="text-purple-400"/>;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] min-h-[600px] max-h-[800px]">
                
                {/* --- LADO IZQUIERDO: FORMULARIO --- */}
                <div className="flex-[3] flex flex-col relative overflow-y-auto custom-scrollbar">
                    
                    <div className="p-6 md:p-8 border-b border-slate-800/60 bg-slate-800/30 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 shadow-inner hidden sm:block">
                                <Receipt className="text-sky-400" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Cobrar Orden #{orden.IdOrden}</h2>
                                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest block mt-1 w-max">Terminal de Cobro Múltiple</span>
                            </div>
                        </div>
                        <button onClick={onClose} disabled={procesando} className="md:hidden text-slate-400 hover:text-rose-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        
                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl p-6 shadow-inner mb-8 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Monto Original</span>
                                <span className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-md">C${montoTotal.toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Faltante por Cobrar</span>
                                <span className="text-3xl font-black text-amber-400 font-mono tracking-tighter drop-shadow-md">C${restante.toFixed(2)}</span>
                            </div>
                        </div>

                        {!cuentaSaldada ? (
                            <form onSubmit={agregarPago} className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Método de Pago</label>
                                    <select 
                                        value={metodoForm}
                                        onChange={(e) => setMetodoForm(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl bg-slate-950/20 border border-slate-700/50 text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 font-black tracking-wider shadow-inner cursor-pointer transition-all"
                                    >
                                        <option value="EFECTIVO" className="bg-slate-900">💵 EFECTIVO (Córdobas)</option>
                                        <option value="TARJETA_CREDITO" className="bg-slate-900">💳 TARJETA DE CRÉDITO</option>
                                        <option value="TARJETA_DEBITO" className="bg-slate-900">💳 TARJETA DE DÉBITO</option>
                                        <option value="TRANSFERENCIA" className="bg-slate-900">🏦 TRANSFERENCIA BANCARIA</option>
                                    </select>
                                </div>

                                {metodoForm !== 'EFECTIVO' && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            Nº Voucher / Referencia <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">Obligatorio</span>
                                        </label>
                                        <input 
                                            type="text"
                                            value={referenciaForm}
                                            onChange={(e) => setReferenciaForm(e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl bg-slate-950/20 border border-slate-700/50 text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 font-mono text-lg shadow-inner placeholder:text-slate-600 transition-all"
                                            placeholder="Ej: 009812456"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Monto a Fraccionar</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black font-mono text-2xl">C$</span>
                                        <input 
                                            id="input-monto-cobro"
                                            type="number" 
                                            step="0.01"
                                            value={montoForm}
                                            onChange={(e) => setMontoForm(e.target.value ? Number(e.target.value) : "")}
                                            className="w-full pl-16 pr-5 py-5 rounded-xl bg-slate-950/40 border border-slate-700/50 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none text-4xl font-black text-sky-400 transition-all font-mono shadow-inner placeholder:text-slate-700"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 border border-slate-700/50 active:scale-[0.98] shadow-sm mt-4">
                                    <Plus size={20} /> Añadir Fracción de Pago
                                </button>
                            </form>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Cuenta Cubierta</h3>
                                <p className="text-slate-400 font-medium text-lg max-w-sm">El saldo requerido ha sido alcanzado. Proceda a confirmar la transacción en el panel lateral.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- LADO DERECHO: RESUMEN --- */}
                <div className="flex-[2] flex flex-col bg-slate-950/40 border-l border-slate-800/60 relative shadow-inner">
                    
                    <div className="hidden md:flex justify-end p-6 shrink-0">
                        <button onClick={onClose} disabled={procesando} className="text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-slate-800/60 p-2.5 rounded-xl border border-slate-800/60 transition-colors active:scale-95">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <DollarSign size={18} className="text-sky-500" /> Desglose de Pagos
                        </h3>
                        
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 min-h-[150px]">
                            {pagos.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-3xl text-slate-500 font-bold text-sm uppercase tracking-widest bg-slate-900/20 shadow-inner">
                                    <Receipt size={32} className="mb-2 opacity-50" />
                                    Ningún pago registrado
                                </div>
                            ) : (
                                pagos.map(p => (
                                    <div key={p.id} className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-2xl flex justify-between items-center group shadow-sm hover:border-slate-600 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 font-black text-slate-200 text-sm tracking-wide">
                                                {getIconoMetodo(p.metodo)} {p.metodo.replace('_', ' ')}
                                            </div>
                                            {p.referencia !== 'N/A' && (
                                                <span className="text-[10px] text-slate-500 font-bold font-mono mt-1.5 block uppercase">REF: {p.referencia}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-black text-white text-lg tracking-tighter">C${p.monto.toFixed(2)}</span>
                                            <button onClick={() => quitarPago(p.id)} className="text-rose-500/70 hover:text-rose-400 transition-colors p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg" title="Remover fracción">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-6 border-t border-slate-800/60 mt-6 shrink-0">
                            
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Ingresado:</span>
                                <span className="text-xl font-black font-mono text-white drop-shadow-md">C${pagado.toFixed(2)}</span>
                            </div>

                            {vuelto > 0 && (
                                <div className="flex justify-between items-center mb-6 p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 shadow-inner animate-in zoom-in-95 duration-200">
                                    <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Cambio / Vuelto:</span>
                                    <span className="text-3xl font-black font-mono text-emerald-400 tracking-tighter drop-shadow-md">C${vuelto.toFixed(2)}</span>
                                </div>
                            )}

                            <button 
                                onClick={procesarCobro}
                                disabled={!cuentaSaldada || procesando}
                                className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex justify-center items-center gap-3 shadow-xl
                                    ${!cuentaSaldada || procesando 
                                        ? 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed shadow-none' 
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 active:scale-[0.98]'}`}
                            >
                                {procesando ? <Loader2 className="animate-spin" size={24}/> : <CheckCircle2 size={24}/>}
                                {procesando ? 'Procesando...' : 'Completar Factura'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}