import { useState, useEffect } from 'react';
import { X, Loader2, Edit3, Save, Utensils, Ban } from 'lucide-react';
import { apiCaja } from '../../services/caja';

export function ModalAdministrarCaja({ orden, onClose, onSuccess }: any) {
    const [detalles, setDetalles] = useState<any[]>([]);
    const [cargandoDetalles, setCargandoDetalles] = useState(true);
    const [nuevoTotal, setNuevoTotal] = useState<number | "">(orden?.Monto || "");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (orden) {
            apiCaja.obtenerDetalles(orden.IdOrden)
                .then(data => setDetalles(data))
                .catch(err => console.error(err))
                .finally(() => setCargandoDetalles(false));
        }
    }, [orden]);

    if (!orden) return null;

    const handleActualizarMonto = async () => {
        if (!nuevoTotal || Number(nuevoTotal) <= 0) return alert("El monto debe ser mayor a 0");
        setProcesando(true);
        try {
            await apiCaja.actualizarMonto({ IdOrden: orden.IdOrden, Monto: Number(nuevoTotal) });
            alert("Monto actualizado correctamente en el sistema.");
            onSuccess();
            onClose();
        } catch (e) {
            alert("Error al actualizar el monto.");
        } finally {
            setProcesando(false);
        }
    };

    const handleAnular = async () => {
        if (!confirm("¿Está SEGURO de anular esta cuenta? Esta acción no se puede deshacer y la orden será eliminada del registro de caja.")) return;
        setProcesando(true);
        try {
            await apiCaja.anularOrden(orden.IdOrden);
            alert("Orden Anulada.");
            onSuccess();
            onClose();
        } catch (e) {
            alert("Error al anular la orden.");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050810]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
            <div className="bg-[#0F172A] rounded-3xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col max-h-[90vh]">
                
                <div className="bg-slate-900/80 border-b border-slate-800 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Detalles del Ticket #{orden.IdOrden}</h2>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mt-1">Administración de Cuenta</span>
                    </div>
                    <button onClick={onClose} disabled={procesando} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Utensils size={18}/> Consumo Reportado
                    </h3>
                    
                    {cargandoDetalles ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
                    ) : (
                        <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl overflow-hidden mb-6">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 border-b border-slate-800">
                                    <tr className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                        <th className="p-4">Platillo</th>
                                        <th className="p-4 text-center">Cant.</th>
                                        <th className="p-4 text-right">Precio</th>
                                        <th className="p-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {detalles.map((d, i) => (
                                        <tr key={i} className="text-sm">
                                            <td className="p-4 font-bold text-slate-300">{d.nombre_platillo}</td>
                                            <td className="p-4 text-center text-slate-400">{d.cantidad}</td>
                                            <td className="p-4 text-right font-mono text-slate-500">C${d.precio_unitario}</td>
                                            <td className="p-4 text-right font-mono font-bold text-slate-300">C${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ZONA DE EDICIÓN DEL TOTAL */}
                    <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Monto a Cobrar</span>
                            {modoEdicion ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-xl text-blue-400">C$</span>
                                    <input 
                                        type="number" 
                                        value={nuevoTotal} 
                                        onChange={e => setNuevoTotal(e.target.value ? Number(e.target.value) : "")}
                                        className="bg-[#0A0F1D] border border-blue-500/50 rounded-lg px-3 py-1 text-xl font-black font-mono text-white outline-none w-32"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <span className="text-3xl font-black text-white font-mono">C${orden.Monto.toFixed(2)}</span>
                            )}
                        </div>
                        
                        {modoEdicion ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setModoEdicion(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold">Cancelar</button>
                                <button onClick={handleActualizarMonto} disabled={procesando} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg">
                                    <Save size={16}/> Guardar
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setModoEdicion(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-sm font-bold border border-slate-700 transition-colors w-full sm:w-auto justify-center">
                                <Edit3 size={16}/> Ajustar Total
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between shrink-0">
                    <button 
                        onClick={handleAnular}
                        disabled={procesando}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/30 transition-colors"
                    >
                        {procesando ? <Loader2 className="animate-spin" size={18}/> : <Ban size={18}/>} Anular Cuenta
                    </button>
                    <button onClick={onClose} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-600 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}