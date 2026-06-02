
import { Plus, Minus } from "lucide-react";
import type { Detalles } from "../modals/ModalMostrarDetalles";

export interface OrdenActivaTableProps {
    detalles: Detalles[];
    ordenActivaId: number | null;
    cargandoAccion: boolean;
    alModificarCantidad: (nombre: string, delta: number) => void;
    alCrearOActualizar: () => void;
    alTerminarOrden: () => void;
    alCancelarOrden: () => void; // NUEVO
}

export function OrdenActivaTable({ 
    detalles, ordenActivaId, cargandoAccion, 
    alModificarCantidad, alCrearOActualizar, alTerminarOrden, alCancelarOrden 
}: OrdenActivaTableProps) {
    
    const total = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

    if (detalles.length === 0 && !ordenActivaId) {
        return (
            <div className="bg-white/50 border-2 border-dashed border-slate-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                <p className="text-slate-500 font-semibold text-lg">La mesa está libre</p>
                <p className="text-slate-400 text-sm mt-1">Selecciona platillos del menú para abrir una orden.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {ordenActivaId ? 'Ticket Actual' : 'Nueva Orden (Borrador)'}
                    </span>
                    <span className="font-black text-2xl text-slate-800">
                        {ordenActivaId ? `#${ordenActivaId}` : '---'}
                    </span>
                </div>
            </div>

            <div className="p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Platillo</th>
                            <th className="pb-3 font-semibold text-center w-32">Cant.</th>
                            <th className="pb-3 font-semibold text-right">Precio</th>
                            <th className="pb-3 font-semibold text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {detalles.map((item, idx) => (
                            <tr key={idx} className="text-sm hover:bg-slate-50 transition-colors">
                                <td className="py-3 font-bold text-slate-700">{item.nombre_platillo}</td>
                                <td className="py-3 text-center">
                                    <div className="flex items-center justify-center bg-slate-100 rounded-lg p-1 w-max mx-auto">
                                        <button onClick={() => alModificarCantidad(item.nombre_platillo, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white rounded-md font-black transition-all"><Minus size={14} /></button>
                                        <span className="w-8 font-bold text-slate-800 text-base">{item.cantidad}</span>
                                        <button onClick={() => alModificarCantidad(item.nombre_platillo, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-white rounded-md font-black transition-all"><Plus size={14} /></button>
                                    </div>
                                </td>
                                <td className="py-3 text-right text-slate-500">C${item.precio_unitario}</td>
                                <td className="py-3 text-right font-black text-slate-800 text-base">C${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Total Parcial:</span>
                    <span className="font-black text-3xl text-blue-600">C${total.toFixed(2)}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={alCrearOActualizar}
                        disabled={cargandoAccion || detalles.length === 0}
                        className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cargandoAccion ? 'Procesando...' : (ordenActivaId ? 'Guardar Cambios' : 'Enviar Nueva Orden')}
                    </button>

                    {/* Acciones Secundarias (Solo si la orden ya existe en BD) */}
                    {ordenActivaId && (
                        <div className="flex gap-3">
                            <button 
                                onClick={alCancelarOrden}
                                disabled={cargandoAccion}
                                className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-500 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Anular
                            </button>
                            <button 
                                onClick={alTerminarOrden}
                                disabled={cargandoAccion}
                                className="flex-[2] bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-black py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                            >
                                Cobrar Ticket
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}