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
            case 'EFECTIVO': return <Banknote size={18} className="text-emerald-800"/>;
            case 'TRANSFERENCIA': return <Landmark size={18} className="text-sky-800"/>;
            default: return <CreditCard size={18} className="text-violet-800"/>;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-[#e5f0ed] border border-sky-200 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] min-h-[600px] max-h-[800px]">
                
                {/* --- LADO IZQUIERDO: FORMULARIO --- */}
                <div className="flex-[3] flex flex-col relative overflow-y-auto custom-scrollbar">
                    
                    <div className="p-6 md:p-8 border-b border-sky-200 bg-gradient-to-r from-[#cde7ed] to-[#dcebdc] flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#b9dfe7] rounded-xl border border-sky-300 shadow-inner hidden sm:block">
                                <Receipt className="text-sky-900" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Cobrar Orden #{orden.IdOrden}</h2>
                                <span className="text-[10px] bg-[#b9dfe7] text-sky-950 border border-sky-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest block mt-1 w-max">Terminal de Cobro Múltiple</span>
                            </div>
                        </div>
                        <button onClick={onClose} disabled={procesando} className="md:hidden text-sky-900 hover:text-rose-800 bg-[#d4e8e9] p-2.5 rounded-xl border border-sky-200 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        
                        <div className="bg-gradient-to-r from-[#d5e9e7] to-[#eee6cf] border border-sky-200 rounded-3xl p-6 shadow-inner mb-8 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold text-sky-950/80 uppercase tracking-widest block mb-2">Monto Original</span>
                                <span className="text-3xl font-black text-slate-900 font-mono tracking-tighter">C${montoTotal.toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block mb-2">Faltante por Cobrar</span>
                                <span className="text-3xl font-black text-amber-800 font-mono tracking-tighter">C${restante.toFixed(2)}</span>
                            </div>
                        </div>

                        {!cuentaSaldada ? (
                            <form onSubmit={agregarPago} className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-sky-950/80 uppercase tracking-widest ml-1">Método de Pago</label>
                                    <select 
                                        value={metodoForm}
                                        onChange={(e) => setMetodoForm(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl bg-[#f0f5e9] border border-sky-300 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 font-black tracking-wider shadow-inner cursor-pointer transition-all"
                                    >
                                        <option value="EFECTIVO" className="bg-[#f0f5e9]">💵 EFECTIVO (Córdobas)</option>
                                        <option value="TARJETA_CREDITO" className="bg-[#f0f5e9]">💳 TARJETA DE CRÉDITO</option>
                                        <option value="TARJETA_DEBITO" className="bg-[#f0f5e9]">💳 TARJETA DE DÉBITO</option>
                                        <option value="TRANSFERENCIA" className="bg-[#f0f5e9]">🏦 TRANSFERENCIA BANCARIA</option>
                                    </select>
                                </div>

                                {metodoForm !== 'EFECTIVO' && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <label className="text-sm font-bold text-sky-950/80 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            Nº Voucher / Referencia <span className="text-[10px] text-rose-800 bg-[#f7e0da] border border-rose-200 px-2 py-0.5 rounded-md">Obligatorio</span>
                                        </label>
                                        <input 
                                            type="text"
                                            value={referenciaForm}
                                            onChange={(e) => setReferenciaForm(e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl bg-[#f0f5e9] border border-sky-300 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 font-mono text-lg shadow-inner placeholder:text-slate-500 transition-all"
                                            placeholder="Ej: 009812456"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-sky-950/80 uppercase tracking-widest ml-1">Monto a Fraccionar</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-900 font-black font-mono text-2xl">C$</span>
                                        <input 
                                            id="input-monto-cobro"
                                            type="number" 
                                            step="0.01"
                                            value={montoForm}
                                            onChange={(e) => setMontoForm(e.target.value ? Number(e.target.value) : "")}
                                            className="w-full pl-16 pr-5 py-5 rounded-xl bg-[#f0f5e9] border border-sky-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 outline-none text-4xl font-black text-sky-900 transition-all font-mono shadow-inner placeholder:text-slate-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-700 to-teal-700 hover:from-sky-600 hover:to-teal-600 text-white font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 border border-sky-500 active:scale-[0.98] shadow-sm mt-4">
                                    <Plus size={20} /> Añadir Fracción de Pago
                                </button>
                            </form>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                                <div className="w-24 h-24 bg-[#cde8d2] rounded-full flex items-center justify-center mb-6 border border-emerald-300">
                                    <CheckCircle2 size={48} className="text-emerald-800" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Cuenta Cubierta</h3>
                                <p className="text-slate-700 font-medium text-lg max-w-sm">El saldo requerido ha sido alcanzado. Proceda a confirmar la transacción en el panel lateral.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- LADO DERECHO: RESUMEN --- */}
                <div className="flex-[2] flex flex-col bg-gradient-to-b from-[#e0ece8] to-[#e9eddf] border-l border-sky-200 relative shadow-inner">
                    
                    <div className="hidden md:flex justify-end p-6 shrink-0">
                        <button onClick={onClose} disabled={procesando} className="text-sky-900 hover:text-rose-800 bg-[#d4e8e9] hover:bg-rose-100 p-2.5 rounded-xl border border-sky-200 transition-colors active:scale-95">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <h3 className="text-sm font-black text-sky-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <DollarSign size={18} className="text-sky-800" /> Desglose de Pagos
                        </h3>
                        
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 min-h-[150px]">
                            {pagos.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-sky-300 rounded-3xl text-sky-900/70 font-bold text-sm uppercase tracking-widest bg-[#d9e9e8] shadow-inner">
                                    <Receipt size={32} className="mb-2 opacity-50" />
                                    Ningún pago registrado
                                </div>
                            ) : (
                                pagos.map(p => (
                                    <div key={p.id} className="bg-gradient-to-r from-[#e7eedf] to-[#dcebea] border border-sky-200 p-5 rounded-2xl flex justify-between items-center group shadow-sm hover:border-emerald-300 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 font-black text-slate-900 text-sm tracking-wide">
                                                {getIconoMetodo(p.metodo)} {p.metodo.replace('_', ' ')}
                                            </div>
                                            {p.referencia !== 'N/A' && (
                                                <span className="text-[10px] text-sky-900/70 font-bold font-mono mt-1.5 block uppercase">REF: {p.referencia}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-black text-slate-900 text-lg tracking-tighter">C${p.monto.toFixed(2)}</span>
                                            <button onClick={() => quitarPago(p.id)} className="text-rose-800 hover:text-white transition-colors p-2 bg-[#f3dfda] hover:bg-rose-600 rounded-lg" title="Remover fracción">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-6 border-t border-sky-200 mt-6 shrink-0">
                            
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-sm font-bold text-sky-950/80 uppercase tracking-widest">Total Ingresado:</span>
                                <span className="text-xl font-black font-mono text-slate-900">C${pagado.toFixed(2)}</span>
                            </div>

                            {vuelto > 0 && (
                                <div className="flex justify-between items-center mb-6 p-5 bg-[#d1e9d6] rounded-2xl border border-emerald-300 shadow-inner animate-in zoom-in-95 duration-200">
                                    <span className="text-sm font-black text-emerald-900 uppercase tracking-widest">Cambio / Vuelto:</span>
                                    <span className="text-3xl font-black font-mono text-emerald-800 tracking-tighter">C${vuelto.toFixed(2)}</span>
                                </div>
                            )}

                            <button 
                                onClick={procesarCobro}
                                disabled={!cuentaSaldada || procesando}
                                className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex justify-center items-center gap-3 shadow-xl
                                    ${!cuentaSaldada || procesando 
                                        ? 'bg-[#d5e1df] text-slate-500 border border-slate-300 cursor-not-allowed shadow-none' 
                                        : 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-900/15 active:scale-[0.98]'}`}
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
