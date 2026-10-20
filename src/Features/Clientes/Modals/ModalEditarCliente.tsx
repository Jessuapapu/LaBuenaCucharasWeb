
import { useState, useEffect } from "react";
import { X, User,FileText, Loader2, Briefcase, Activity, ShieldAlert } from "lucide-react";
import { useEditarCliente } from "../../../context/Hooks/hookClientes";

interface ModalEditarContratoProps {
    cliente: any; // Usamos any o tu interfaz extendida para soportar las llaves del SP
    onClose: () => void;
    onSuccess?: () => void; // Para recargar la tabla sin refrescar toda la página
}

export default function ModalEditarContrato({ cliente, onClose, onSuccess }: ModalEditarContratoProps) {
    const [nuevoEstado, setNuevoEstado] = useState("");
    const { loading, error, editar } = useEditarCliente();
    //Para formulario
    const [nombre, setNombre]= useState("");
    const [correo, setcorreo]= useState("");
    const [direccion, setdireccion]= useState("");
    const [telefono, setTelefono]= useState("");

    // Sincronizar el estado inicial cuando se abre el modal
    useEffect(() => {
        if (cliente) {
            setNombre(cliente.Nombre || cliente.nombre || "");
            setdireccion(cliente.Direccion || cliente.direccion || "");
            setcorreo(cliente.Correo || cliente.correo || "");
            setTelefono(cliente.Telefono || cliente.telefono || "");
        }
    }, [cliente]);

    if (!cliente) return null;

    // Normalización del ID único (ya sea que venga como id_cliente o IdCliente)
    const idCliente = cliente.IdCliente || cliente.id_cliente;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!idCliente) {
            alert("Error: No se encontró el identificador del cliente.");
            return;
        }

        if (!nombre || !direccion || !telefono) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        const payload = {
          IdCliente: idCliente,
          NombreCliente: nombre,
          dirreccion: direccion,
          correo: correo,
          telefono: telefono

        };

        // Ejecutamos la actualización pasando el ID y los nuevos datos
        const exito = await editar(idCliente, payload);

        if (exito) {
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.reload();
            }
            onClose();
        } else {
            alert("Error al actualizar el cliente. Revisa la consola.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-[#e2eef0] via-[#e7f0e8] to-[#f3e9d8] p-6 rounded-2xl text-slate-800 max-w-lg w-full shadow-2xl border border-sky-300 relative">
                <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="absolute top-4 right-4 text-sky-900 hover:text-rose-800 hover:bg-rose-100 rounded-lg p-1 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-900">Directorio de clientes</p>
                <h2 className="text-2xl font-bold mb-1 text-slate-900">Editar cliente</h2>
                <p className="text-slate-700 text-sm mb-6">Modifica la información de contacto seleccionada.</p>

                {error && <div className="mb-4 p-2.5 bg-rose-100 border border-rose-300 text-rose-900 text-sm rounded-lg text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-sky-950/80 mb-1">Nombre completo</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-[#edf5f2] border border-sky-300 text-slate-900 focus:ring-2 focus:ring-sky-700/20 outline-none transition-all" 
                            placeholder="Ej: Juan Pérez" 
                            value={nombre} 
                            onChange={e => setNombre(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-emerald-950/80 mb-1">Dirección</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-[#f0f5e8] border border-emerald-300 text-slate-900 focus:ring-2 focus:ring-emerald-700/20 outline-none transition-all" 
                            placeholder="Ej: Calle 123, Centro" 
                            value={direccion} 
                            onChange={e => setdireccion(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-amber-950/80 mb-1">Teléfono</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg bg-[#f6eedc] border border-amber-300 text-slate-900 focus:ring-2 focus:ring-amber-700/20 outline-none transition-all" 
                                placeholder="555-0000" 
                                value={telefono} 
                                onChange={e => setTelefono(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-violet-950/80 mb-1">Correo (opcional)</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2 rounded-lg bg-[#f0ebf5] border border-violet-300 text-slate-900 focus:ring-2 focus:ring-violet-700/20 outline-none transition-all" 
                                placeholder="correo@ejemplo.com" 
                                value={correo} 
                                onChange={e => setcorreo(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2 border-t border-sky-200">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-[#dce9e9] hover:bg-[#c9e1e3] text-sky-950 font-medium transition-colors border border-sky-300">Cancelar</button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`flex-1 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${
                                loading 
                                    ? "bg-slate-500 cursor-wait shadow-none" 
                                    : "bg-gradient-to-r from-sky-700 via-teal-700 to-emerald-700 hover:from-sky-600 hover:via-teal-600 hover:to-emerald-600 shadow-teal-900/15 active:scale-[0.98]"
                            }`}
                        >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

