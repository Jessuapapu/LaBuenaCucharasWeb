import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X, Truck } from "lucide-react";
import { useCrearProveedor } from "../../../context/Hooks/hookProveedor";

interface ModalNuevoProveedorProps {
    onClose: () => void;
}

export default function ModalNuevoProveedor({ onClose }: ModalNuevoProveedorProps) {
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [tipo, setTipo] = useState("FIJO");
    const { crear, loading, error } = useCrearProveedor();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !direccion.trim()) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        const exito = await crear({ nombre, direccion, tipo });
        if (exito) window.location.reload();
        else alert("Hubo un error al guardar el proveedor. Revisa la consola.");
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 sm:p-6 backdrop-blur-[2px] animate-in fade-in duration-200"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="nuevo-proveedor-titulo"
                className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-sky-300 bg-[#e2eff1] text-slate-800 shadow-2xl shadow-slate-950/30 sm:max-h-[calc(100dvh-3rem)]"
            >
                <header className="flex shrink-0 items-start gap-4 border-b border-sky-300 bg-gradient-to-r from-[#c5e5ec] to-[#d8ead9] px-5 py-4 sm:px-6">
                    <div className="rounded-xl bg-[#b5dfe8] p-2.5 text-sky-900">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 id="nuevo-proveedor-titulo" className="text-xl font-black tracking-tight text-slate-800">Nuevo proveedor</h2>
                        <p className="mt-1 text-sm text-slate-600">Registra un nuevo socio comercial.</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar ventana" className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-300/70 hover:text-slate-900">
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                        {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm font-medium text-rose-800">{error}</div>}

                        <div>
                            <label htmlFor="proveedor-nombre" className="mb-1.5 block text-sm font-bold text-slate-700">Nombre del proveedor <span className="text-rose-600">*</span></label>
                            <input
                                id="proveedor-nombre"
                                type="text"
                                className="w-full rounded-xl border border-sky-300 bg-[#f2f7f1] px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                                placeholder="Ej.: Distribuidora Central"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="proveedor-direccion" className="mb-1.5 block text-sm font-bold text-slate-700">Dirección <span className="text-rose-600">*</span></label>
                            <input
                                id="proveedor-direccion"
                                type="text"
                                className="w-full rounded-xl border border-sky-300 bg-[#f2f7f1] px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                                placeholder="Ej.: Calle Central, local 12"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="proveedor-tipo" className="mb-1.5 block text-sm font-bold text-slate-700">Tipo de proveedor</label>
                            <select
                                id="proveedor-tipo"
                                className="w-full cursor-pointer rounded-xl border border-emerald-300 bg-[#eef5e8] px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                <option value="FIJO">Fijo</option>
                                <option value="ESPORANEO">Esporádico</option>
                            </select>
                        </div>
                    </div>

                    <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-sky-200 bg-gradient-to-r from-[#d5eaf0] to-[#e6eedf] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <button type="button" onClick={onClose} className="rounded-xl border border-sky-300 bg-[#e4eff0] px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-[#cfe5e8]">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-900/15 transition hover:from-sky-600 hover:to-blue-600 disabled:cursor-wait disabled:opacity-60">
                            {loading ? "Guardando…" : "Registrar proveedor"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>,
        document.body
    );
}
