import { useState } from "react";
import { createPortal } from "react-dom";
import { useNuevoRegistroBodega } from "../../context/Hooks/hookProveedor";

interface ModalNuevoRegistroProps {
    onClose: () => void;
}

export default function ModalNuevoRegistro({ onClose }: ModalNuevoRegistroProps) {
    const [idProveedor, setIdProveedor] = useState<number | "">("");
    const [totalIngresado, setTotalIngresado] = useState<number | "">("");
    const [costoTotal, setCostoTotal] = useState<number | "">("");

    // Consumimos el hook que ya nos trae la lista y la función de guardar
    const { proveedores, registrar, loading, error } = useNuevoRegistroBodega();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!idProveedor || totalIngresado === "" || costoTotal === "") {
            alert("Por favor completa todos los campos.");
            return;
        }

        const exito = await registrar(Number(costoTotal), Number(idProveedor), Number(totalIngresado));

        if (exito) {
            window.location.reload();
        } else {
            alert("Error al guardar. Revisa la consola para más detalles.");
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
            <div role="dialog" aria-modal="true" aria-labelledby="nuevo-registro-titulo" className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)]">
                <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">✕</button>
                <div className="shrink-0 border-b border-slate-300/80 bg-[#dbe8ed] px-5 py-5 pr-14 sm:px-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Abastecimiento e inventario</p>
                    <h2 id="nuevo-registro-titulo" className="text-2xl font-extrabold tracking-tight text-slate-800">Nuevo registro de bodega</h2>
                    <p className="mt-1 text-sm text-slate-600">Ingresa el proveedor, la cantidad recibida y el costo total.</p>
                </div>

                {error && <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-100 px-4 py-3 text-sm font-medium text-rose-800 sm:mx-7">{error}</div>}

                <form onSubmit={handleSubmit} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7">
                    
                    {/* Proveedor */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Proveedor</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none cursor-pointer rounded-xl border border-slate-300 bg-[#f3f7f8] px-4 py-2.5 text-slate-800 outline-none transition-all focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
                                value={idProveedor} 
                                onChange={(e) => setIdProveedor(Number(e.target.value))} 
                                required
                            >
                                <option value="">-- Seleccionar Proveedor --</option>
                                {proveedores.map((p) => (
                                    <option key={p.IdProveedor} value={p.IdProveedor}>
                                        {p.NombreProveedor}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Cantidad (Total Ingresado) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cantidad recibida</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full rounded-xl border border-slate-300 bg-[#f3f7f8] px-4 py-2.5 text-slate-800 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
                                placeholder="0"
                                value={totalIngresado} 
                                onChange={(e) => setTotalIngresado(Number(e.target.value))} 
                                required 
                            />
                        </div>

                        {/* Costo */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Costo total (C$)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                className="w-full rounded-xl border border-slate-300 bg-[#f3f7f8] px-4 py-2.5 text-slate-800 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
                                placeholder="0.00" 
                                value={costoTotal} 
                                onChange={(e) => setCostoTotal(Number(e.target.value))} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-300 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-slate-200 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-300">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`flex-1 rounded-xl py-2.5 font-bold text-white shadow-md transition-all ${loading ? "bg-slate-500 cursor-wait" : "bg-gradient-to-r from-cyan-700 to-blue-700 shadow-cyan-900/15 hover:from-cyan-600 hover:to-blue-600"}`}
                        >
                            {loading ? "Guardando..." : "Registrar Entrada"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
