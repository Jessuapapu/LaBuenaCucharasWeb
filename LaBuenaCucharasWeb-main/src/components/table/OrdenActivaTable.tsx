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
            <div className="bg-gradient-to-br from-[#d8edf0] to-[#e2efdf] border-2 border-dashed border-teal-300 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="p-4 bg-[#c5e4e7] rounded-full mb-4 border border-teal-300">
                    <Utensils className="w-10 h-10 text-teal-800" />
                </div>
                <p className="text-slate-900 font-black text-xl tracking-tight">La mesa está libre</p>
                <p className="text-slate-700 text-sm mt-2 font-medium max-w-xs">
                    Selecciona platillos del menú lateral para empezar a armar la cuenta de esta mesa.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#e5eff0] rounded-[2rem] shadow-lg shadow-sky-900/5 border border-sky-200 overflow-hidden flex flex-col h-full">
            
            {/* HEADER DEL TICKET */}
            <div className="bg-gradient-to-r from-[#cde7ed] to-[#d9ebde] p-5 md:p-6 border-b border-sky-200 flex justify-between items-center shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-sky-900/80 uppercase tracking-widest block mb-1">
                        {ordenActivaId ? 'Ticket de Cocina' : 'Nueva Orden (Borrador)'}
                    </span>
                    <span className="font-black text-2xl text-slate-900 font-mono tracking-tight">
                        {ordenActivaId ? `#${ordenActivaId}` : 'Pendiente'}
                    </span>
                </div>
                <div className="px-3 py-1 bg-[#b9e0e8] border border-sky-300 rounded-lg">
                    <span className="text-xs font-black text-sky-950 uppercase tracking-widest">
                        {detalles.length} Ítems
                    </span>
                </div>
            </div>

            {/* CUERPO DE LA TABLA */}
            <div className="p-5 md:p-6 overflow-x-auto custom-scrollbar flex-1 bg-[#e8f1ef]">
                <table className="w-full text-left border-collapse min-w-[450px]">
                    <thead>
                        <tr className="border-b border-sky-200 text-sky-900 text-[10px] font-black uppercase tracking-widest">
                            <th className="pb-3">Platillo</th>
                            <th className="pb-3 text-center w-32">Cant.</th>
                            <th className="pb-3 text-right">Precio</th>
                            <th className="pb-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-200/80">
                        {detalles.map((item, idx) => (
                            <tr key={idx} className="text-sm odd:bg-[#e9f2ed] even:bg-[#e3eff0] hover:bg-[#d3e8e8] transition-colors group">
                                <td className="py-4 font-bold text-slate-800 group-hover:text-teal-950 transition-colors pr-4">
                                    {item.nombre_platillo}
                                </td>
                                <td className="py-4 text-center">
                                    <div className="flex items-center justify-center bg-[#d8e9e7] border border-teal-200 rounded-xl p-1 w-max mx-auto shadow-inner">
                                        <button 
                                            onClick={() => alModificarCantidad(item.nombre_platillo, -1)} 
                                            className="w-7 h-7 flex items-center justify-center text-rose-700 hover:text-white hover:bg-rose-500 rounded-lg font-black transition-all active:scale-95"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 font-black text-slate-900 text-base font-mono text-center">
                                            {item.cantidad}
                                        </span>
                                        <button 
                                            onClick={() => alModificarCantidad(item.nombre_platillo, 1)} 
                                            className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:text-white hover:bg-emerald-600 rounded-lg font-black transition-all active:scale-95"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="py-4 text-right font-mono text-slate-600 font-medium">
                                    C${item.precio_unitario}
                                </td>
                                <td className="py-4 text-right font-black text-slate-900 font-mono text-base">
                                    C${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER DE ACCIONES */}
            <div className="bg-gradient-to-r from-[#d9ebed] to-[#e5efdf] p-5 md:p-6 border-t border-sky-200 shrink-0">
                
                <div className="flex justify-between items-end mb-6 bg-[#d4e9df] p-4 rounded-2xl border border-emerald-300 shadow-inner">
                    <span className="font-black text-emerald-950/80 uppercase tracking-widest text-[10px]">Total Acumulado</span>
                    <span className="font-black text-4xl text-emerald-800 font-mono tracking-tighter leading-none">
                        C${total.toFixed(2)}
                    </span>
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={alCrearOActualizar}
                        disabled={cargandoAccion || detalles.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-700 to-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-md shadow-sky-900/15 hover:from-sky-600 hover:to-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-sky-500"
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
                                className="flex-1 flex items-center justify-center gap-2 bg-[#f5ded8] border border-rose-300 text-rose-800 hover:bg-rose-600 hover:text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                                title="Cancelar toda la orden"
                            >
                                <Trash2 size={16} /> Anular
                            </button>
                            <button 
                                onClick={alTerminarOrden}
                                disabled={cargandoAccion}
                                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 border border-emerald-500 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/15 disabled:opacity-50 active:scale-[0.98]"
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
