import { Plus, Minus, Send, Trash2, Save, Utensils } from "lucide-react";
import type { Detalles } from "../Modals/ModalMostrarDetalles";

export interface OrdenActivaTableProps {
    detalles: Detalles[];
    ordenActivaId: number | null;
    cargandoAccion: boolean;
    alModificarCantidad: (nombre: string, delta: number) => void;
    alCrearOActualizar: () => void;
    alTerminarOrden: () => void;
    alCancelarOrden: () => void;
}

export function OrdenActivaTable({ 
    detalles, ordenActivaId, cargandoAccion, 
    alModificarCantidad, alCrearOActualizar, alTerminarOrden, alCancelarOrden 
}: OrdenActivaTableProps) {
    
    const total = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

    // --- VISTA DE MESA LIBRE (EMPTY STATE) ---
    if (detalles.length === 0 && !ordenActivaId) {
        return (
            <div className="bg-[#0A0F1D] border-2 border-dashed border-slate-700/50 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="p-4 bg-slate-800/50 rounded-full mb-4 border border-slate-700">
                    <Utensils className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-slate-300 font-black text-xl tracking-tight">La mesa está libre</p>
                <p className="text-slate-500 text-sm mt-2 font-medium max-w-xs">
                    Selecciona platillos del menú lateral para empezar a armar la cuenta de esta mesa.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#0A0F1D] rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-full ring-1 ring-white/5">
            
            {/* HEADER DEL TICKET */}
            <div className="bg-slate-900/80 p-5 md:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                        {ordenActivaId ? 'Ticket de Cocina' : 'Nueva Orden (Borrador)'}
                    </span>
                    <span className="font-black text-2xl text-white font-mono tracking-tight">
                        {ordenActivaId ? `#${ordenActivaId}` : 'Pendiente'}
                    </span>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">
                        {detalles.length} Ítems
                    </span>
                </div>
            </div>

            {/* CUERPO DE LA TABLA */}
            <div className="p-5 md:p-6 overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse min-w-[450px]">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <th className="pb-3">Platillo</th>
                            <th className="pb-3 text-center w-32">Cant.</th>
                            <th className="pb-3 text-right">Precio</th>
                            <th className="pb-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {detalles.map((item, idx) => (
                            <tr key={idx} className="text-sm hover:bg-slate-800/30 transition-colors group">
                                <td className="py-4 font-bold text-slate-300 group-hover:text-white transition-colors pr-4">
                                    {item.nombre_platillo}
                                </td>
                                <td className="py-4 text-center">
                                    <div className="flex items-center justify-center bg-slate-900 border border-slate-700 rounded-xl p-1 w-max mx-auto shadow-inner">
                                        <button 
                                            onClick={() => alModificarCantidad(item.nombre_platillo, -1)} 
                                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg font-black transition-all active:scale-95"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 font-black text-white text-base font-mono text-center">
                                            {item.cantidad}
                                        </span>
                                        <button 
                                            onClick={() => alModificarCantidad(item.nombre_platillo, 1)} 
                                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-lg font-black transition-all active:scale-95"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="py-4 text-right font-mono text-slate-500 font-medium">
                                    C${item.precio_unitario}
                                </td>
                                <td className="py-4 text-right font-black text-slate-200 font-mono text-base">
                                    C${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER DE ACCIONES */}
            <div className="bg-slate-900/80 p-5 md:p-6 border-t border-slate-800 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                
                <div className="flex justify-between items-end mb-6 bg-[#0A0F1D] p-4 rounded-2xl border border-slate-800 shadow-inner">
                    <span className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Total Acumulado</span>
                    <span className="font-black text-4xl text-emerald-400 font-mono tracking-tighter leading-none">
                        C${total.toFixed(2)}
                    </span>
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={alCrearOActualizar}
                        disabled={cargandoAccion || detalles.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:bg-blue-500 hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50"
                    >
                        <Save size={18} />
                        {cargandoAccion ? 'Procesando...' : (ordenActivaId ? 'Actualizar Cocina' : 'Enviar a Cocina')}
                    </button>

                    {/* Acciones Secundarias (Solo si la orden ya existe en BD) */}
                    {ordenActivaId && (
                        <div className="flex gap-3">
                            <button 
                                onClick={alCancelarOrden}
                                disabled={cargandoAccion}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                                title="Cancelar toda la orden"
                            >
                                <Trash2 size={16} /> Anular
                            </button>
                            <button 
                                onClick={alTerminarOrden}
                                disabled={cargandoAccion}
                                className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 active:scale-[0.98]"
                            >
                                <Send size={16} /> Mandar a Caja
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}