import { useState } from "react";
import { createPortal } from "react-dom";
import { useCrearCliente } from "../../../context/Hooks/hookClientes"; // Tu hook actualizado

interface ModalNuevoClienteProps {
    onClose: () => void;
}

export default function ModalNuevoCliente({ onClose }: ModalNuevoClienteProps) {
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    
    // El modal solo consume el hook, sin importarle cómo funciona el servicio por dentro
    const { crear, loading, error } = useCrearCliente();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !direccion || !telefono) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        const payload = { nombre, direccion, correo, telefono };

        // Llamamos a la función del hook
        const exito = await crear(payload);

        if (exito) {
            window.location.reload();
        } else {
            alert("Error al guardar el cliente. Revisa la consola.");
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
            <div role="dialog" aria-modal="true" aria-labelledby="nuevo-cliente-titulo" className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-sky-300 bg-gradient-to-br from-[#e2eef0] via-[#e7f0e8] to-[#f3e9d8] text-slate-800 shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)]">
                <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="shrink-0 border-b border-sky-200 bg-gradient-to-r from-[#cde5eb] to-[#d8eadb] px-5 py-5 pr-14 sm:px-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-900">Directorio de clientes</p>
                    <h2 id="nuevo-cliente-titulo" className="text-2xl font-extrabold tracking-tight text-slate-800">Nuevo cliente</h2>
                    <p className="mt-1 text-sm text-slate-600">Registra la información de contacto.</p>
                </div>

                {error && <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-100 px-4 py-3 text-sm font-medium text-rose-800 sm:mx-7">{error}</div>}

                <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
                        <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#edf5f2] border border-sky-300 text-slate-800 focus:ring-2 focus:ring-sky-700/20 focus:border-sky-700 outline-none placeholder-slate-500" placeholder="Ej: Juan Pérez" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Dirección</label>
                        <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#f0f5e8] border border-emerald-300 text-slate-800 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none placeholder-slate-500" placeholder="Ej: Calle 123, Centro" value={direccion} onChange={e => setDireccion(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                            <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#f6eedc] border border-amber-300 text-slate-800 focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none placeholder-slate-500" placeholder="555-0000" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo (opcional)</label>
                            <input type="email" className="w-full px-4 py-2.5 rounded-xl bg-[#f0ebf5] border border-violet-300 text-slate-800 focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 outline-none placeholder-slate-500" placeholder="correo@ejemplo.com" value={correo} onChange={e => setCorreo(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-sky-200">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-sky-300 bg-[#dce9e9] hover:bg-[#c9e1e3] text-sky-950 font-semibold">Cancelar</button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${loading ? "bg-slate-500 cursor-wait" : "bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-900/15"}`}
                        >
                            {loading ? "Guardando..." : "Registrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
