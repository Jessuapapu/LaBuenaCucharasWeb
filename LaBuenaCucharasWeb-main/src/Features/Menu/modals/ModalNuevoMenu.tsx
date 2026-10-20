import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
//import { Trash2 } from "lucide-react";
import type { Menu_dario } from "../../../context/Interfaces/Platillos";

// Estructura auxiliar para llenar el select de platillos
interface PlatilloOption {
    nombre_platillo: string;
}

interface ModalNuevoMenuProps {
    MenuData?: Menu_dario | null; //si existe, se edita
    listaPlatillos: PlatilloOption[];
    onSave: (data: any) => void;
    onClose: () => void;
}

export default function ModalNuevoMenu({ MenuData, listaPlatillos, onClose, onSave }: ModalNuevoMenuProps) {
    const isEditing = !!MenuData?.id;
    // Estado del formulario
    // Inicializamos la fecha con el día de hoy
    const [fechadia, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [nombrePlatillo, setNombrePlatillo] = useState("")
    const [precioUnitario, setPrecioUnitario] = useState<number>(0)// se queda asi me da paja cambiar nombre deestados
    const [horaMenu, sethoraMenu] = useState("")

    // Estado para datos auxiliares
    const [loading, setLoading] = useState(false);

    // Cargar la lista de Platillos disponibles para el Select
    //useEffect(() => {
    //  fetch(`${API_URL}/platillos/`)
    //    .then((res) => res.json())
    //  .then((data) => setListaPlatillos(Array.isArray(data) ? data : []))
    //.catch((err) => console.error("Error cargando platillos:", err));
    //}, []);
    useEffect(() => {
        if (MenuData) {
            setFecha(MenuData.Fecha || new Date().toISOString().split("T")[0]);
            setNombrePlatillo(MenuData.NombrePlatillo || "");
            setPrecioUnitario(MenuData.Monto);
        }
    }, [MenuData]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fechadia || !nombrePlatillo) {
            alert("Por favor selecciona una fecha y un platillo.");
            return;
        }

        setLoading(true);

        // Estructura JSON
        const payload: Menu_dario = {
            id: MenuData?.id,
            Fecha: fechadia,
            NombrePlatillo: nombrePlatillo,
            Monto: Number(precioUnitario),
            Hora: horaMenu
        };

        try {
            // Ahora el hook se encarga del resto
            await onSave(payload);
            // refrescar desde el padre
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar. Verifica la conexión.");
            setLoading(false); // Desactivar loading solo si falla
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
            <div role="dialog" aria-modal="true" className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)]">

                <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="shrink-0 border-b border-slate-300/80 bg-[#dbe8ed] px-5 py-5 pr-14 sm:px-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Planificación diaria</p>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{isEditing ? "Editar menú" : "Asignar menú"}</h2>
                    <p className="mt-1 text-sm text-slate-600">Programa un platillo para una fecha específica.</p>
                </div>

                <form onSubmit={handleSubmit} className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-700/30 focus:border-cyan-700 outline-none disabled:opacity-50"
                            value={fechadia}
                            onChange={(e) => setFecha(e.target.value)}
                            disabled={isEditing}
                            required
                        />
                    </div>

                    <div className="space-y-4 bg-[#dce7eb] p-4 rounded-2xl border border-slate-300">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Platillo</label>
                            <select
                                className="w-full px-3 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm outline-none focus:border-cyan-700"
                                value={nombrePlatillo}
                                onChange={(e) => setNombrePlatillo(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {(listaPlatillos || []).map((p, i) => (
                                    <option key={i} value={p.nombre_platillo}>
                                        {p.nombre_platillo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* INPUT DEL PRECIO CORREGIDO */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Precio (C$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm disabled:opacity-50"
                                value={precioUnitario} // <-- Corregido: Antes era horaMenu
                                onChange={(e) => setPrecioUnitario(Number(e.target.value))} // <-- Corregido
                                disabled={isEditing}
                                required
                            />
                        </div>

                        {/* INPUT DE LA HORA CORREGIDO */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Hora del menú</label>
                            <input
                                type="time"
                                id="hora_menu"
                                className="w-full px-3 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm disabled:opacity-50"
                                value={horaMenu} // <-- Corregido: Antes era precioUnitario
                                onChange={(e) => sethoraMenu(e.target.value)} // <-- Corregido: El input time devuelve un string "HH:mm"~
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all shadow-md flex justify-center items-center
                                ${loading ? "bg-slate-500 cursor-wait" : "bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-900/15"}`}
                        >
                            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Asignar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
