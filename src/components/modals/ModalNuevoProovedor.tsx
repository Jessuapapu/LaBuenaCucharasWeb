import { useState } from "react";


interface ModalNuevoProveedorProps {
    onClose: () => void;
    // Se elimina onSave ya que la recarga de página actualizará el componente padre
}

export default function ModalNuevoProveedor({ onClose }: ModalNuevoProveedorProps) {
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [tipo, setTipo] = useState("FIJO"); // Valor por defecto
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim() || !direccion.trim()) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        setLoading(true);

        // Payload con la estructura exacta del JSON
        const payload = {
            nombre: nombre,
            direccion: direccion,
            tipo: tipo
        };

        try {
            const response = await fetch("http://127.0.0.1:8001/proveedores/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al crear el proveedor. Estado: " + response.status);

            // Esperar el JSON para confirmar la finalización de la API
            await response.json(); 
            
            // --- RECARGAR LA PÁGINA PARA ACTUALIZAR LA TABLA ---
            window.location.reload();
            
        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar el proveedor. Revisa la consola.");
            setLoading(false); // Solo desactivar loading si falló
        } 
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Proveedor</h2>
                <p className="text-gray-400 text-sm mb-6">Registra un nuevo socio comercial.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Proveedor</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                            placeholder="Ej: Distribuidora Central"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                            placeholder="Ej: Calle 150 #418"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            required
                        />
                    </div>

                    {/* Tipo (Select) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Proveedor</label>
                        <div className="relative">
                            <select 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                <option value="FIJO">FIJO</option>
                                <option value="ESPORANEO">ESPORANEO</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 mt-2 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                                ${loading ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-500 shadow-green-900/20"}`}
                        >
                            {loading ? "Guardando..." : "Registrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}