import { useState, useEffect } from 'react';
import { X, Loader2, Edit3, Save, Utensils, Ban } from 'lucide-react';
import { apiCaja } from '../../../context/Services/caja';

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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#e5f0ed] rounded-3xl w-full max-w-2xl border border-sky-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-gradient-to-r from-[#cde7ed] to-[#dcebdc] border-b border-sky-200 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Detalles del Ticket #{orden.IdOrden}</h2>
                        <span className="text-[10px] font-bold text-sky-950 bg-[#b9dfe7] border border-sky-300 px-2 py-0.5 rounded-md uppercase tracking-widest block mt-2 w-max">Administración de Cuenta</span>
                    </div>
                    <button onClick={onClose} disabled={procesando} className="text-sky-900 hover:text-rose-800 hover:bg-rose-100 p-2 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <h3 className="text-sm font-black text-sky-950 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Utensils size={18} className="text-teal-700"/> Consumo Reportado
                    </h3>
                    
                    {cargandoDetalles ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sky-500" size={32}/></div>
                    ) : (
                        <div className="bg-[#eaf1e8] border border-sky-200 rounded-2xl overflow-hidden mb-6 shadow-inner">
                            <table className="w-full text-left">
                                <thead className="bg-gradient-to-r from-[#d3e8e9] to-[#e3eddd] border-b border-sky-200">
                                    <tr className="text-[10px] text-sky-950 uppercase tracking-widest font-black">
                                        <th className="p-4">Platillo</th>
                                        <th className="p-4 text-center">Cant.</th>
                                        <th className="p-4 text-right">Precio</th>
                                        <th className="p-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sky-100">
                                    {detalles.map((d, i) => (
                                        <tr key={i} className="text-sm odd:bg-[#edf2e7] even:bg-[#e3efed] hover:bg-[#d4e8e6] transition-colors">
                                            <td className="p-4 font-bold text-slate-900">{d.nombre_platillo}</td>
                                            <td className="p-4 text-center font-black text-sky-900">{d.cantidad}</td>
                                            <td className="p-4 text-right font-mono text-slate-700">C${d.precio_unitario}</td>
                                            <td className="p-4 text-right font-mono font-bold text-slate-900">C${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ZONA DE EDICIÓN DEL TOTAL */}
                    <div className="bg-gradient-to-r from-[#d8e9e7] to-[#eee6d4] border border-sky-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
                        <div>
                            <span className="text-xs font-bold text-sky-950/80 uppercase tracking-widest block mb-1">Monto a Cobrar</span>
                            {modoEdicion ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-xl text-sky-900 font-black">C$</span>
                                    <input 
                                        type="number" 
                                        value={nuevoTotal} 
                                        onChange={e => setNuevoTotal(e.target.value ? Number(e.target.value) : "")}
                                        className="bg-[#f0f5e9] border border-sky-300 rounded-lg px-3 py-2 text-xl font-black font-mono text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/30 w-36 shadow-inner transition-all"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <span className="text-3xl font-black text-slate-900 font-mono">C${orden.Monto.toFixed(2)}</span>
                            )}
                        </div>
                        
                        {modoEdicion ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setModoEdicion(false)} className="px-4 py-2.5 bg-[#dce9e8] hover:bg-[#c9e1e2] text-sky-950 border border-sky-200 rounded-xl text-sm font-bold transition-colors">Cancelar</button>
                                <button onClick={handleActualizarMonto} disabled={procesando} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all">
                                    {procesando ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Guardar
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setModoEdicion(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d3e7e9] hover:bg-[#c1dfe2] text-sky-950 rounded-xl text-sm font-bold border border-sky-300 transition-colors w-full sm:w-auto shadow-sm">
                                <Edit3 size={16}/> Ajustar Total
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-sky-200 bg-gradient-to-r from-[#d9e9e7] to-[#e5eddd] flex justify-between shrink-0">
                    <button 
                        onClick={handleAnular}
                        disabled={procesando}
                        className="flex items-center gap-2 px-5 py-3 bg-[#f4ded8] hover:bg-[#edc9c0] text-rose-900 font-bold rounded-xl border border-rose-300 transition-colors"
                    >
                        {procesando ? <Loader2 className="animate-spin" size={18}/> : <Ban size={18}/>} <span className="hidden sm:inline">Anular Cuenta</span>
                    </button>
                    <button onClick={onClose} className="px-8 py-3 bg-gradient-to-r from-sky-800 to-teal-800 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl border border-sky-500 transition-colors shadow-sm">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
