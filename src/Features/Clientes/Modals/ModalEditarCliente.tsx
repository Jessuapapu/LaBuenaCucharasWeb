
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-lg w-full shadow-2xl border border-gray-700 relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-amber-400">Editar Cliente</h2>
                <p className="text-gray-400 text-sm mb-6">Modifica la información de contacto seleccionada.</p>

                {error && <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                            placeholder="Ej: Juan Pérez" 
                            value={nombre} 
                            onChange={e => setNombre(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                            placeholder="Ej: Calle 123, Centro" 
                            value={direccion} 
                            onChange={e => setdireccion(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                                placeholder="555-0000" 
                                value={telefono} 
                                onChange={e => setTelefono(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Correo (Opcional)</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                                placeholder="correo@ejemplo.com" 
                                value={correo} 
                                onChange={e => setcorreo(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors">Cancelar</button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`flex-1 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${
                                loading 
                                    ? "bg-gray-600 cursor-wait shadow-none" 
                                    : "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20 active:scale-[0.98]"
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

