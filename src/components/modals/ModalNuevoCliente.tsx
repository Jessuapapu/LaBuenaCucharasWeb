import { useState } from "react";


interface ModalNuevoClienteProps {
    onClose: () => void;
    // Se elimina onSave ya que la recarga de página actualizará el componente padre
}

export default function ModalNuevoCliente({ onClose }: ModalNuevoClienteProps) {
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !direccion || !telefono) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        setLoading(true);

        const payload = { nombre, direccion, correo, telefono };

        try {
            const response = await fetch("http://127.0.0.1:8001/clientes/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al crear cliente. Estado: " + response.status);

            // Esperamos la respuesta para confirmar el guardado
            await response.json(); 
            
            // --- RECARGAR LA PÁGINA PARA ACTUALIZAR LA TABLA ---
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Error al guardar el cliente. Revisa la consola.");
            setLoading(false); // Solo desactivar loading si falló
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-lg w-full shadow-2xl border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Cliente</h2>
                <p className="text-gray-400 text-sm mb-6">Registra la información de contacto.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                        <input type="text" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Juan Pérez" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                        <input type="text" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Calle 123, Centro" value={direccion} onChange={e => setDireccion(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="555-0000" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Correo (Opcional)</label>
                            <input type="email" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="correo@ejemplo.com" value={correo} onChange={e => setCorreo(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">Cancelar</button>
                        <button type="submit" disabled={loading} className={`flex-1 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${loading ? "bg-gray-600" : "bg-green-600 hover:bg-green-500 shadow-green-900/20"}`}>{loading ? "Guardando..." : "Registrar"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}