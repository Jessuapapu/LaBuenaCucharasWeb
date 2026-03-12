import { useState, useEffect } from "react";

// Estructura del objeto Menu según tu JSON (se mantiene para tipado)


// Estructura auxiliar para llenar el select de platillos
interface PlatilloOption {
    nombre_platillo: string;
}

interface ModalNuevoMenuProps {
    onClose: () => void;
    // Se elimina onSave ya que la recarga de página actualizará el componente padre
}

export default function ModalNuevoMenu({ onClose }: ModalNuevoMenuProps) {
    // Estado del formulario
    // Inicializamos la fecha con el día de hoy
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [nombrePlatillo, setNombrePlatillo] = useState("");
    
    // Estado para datos auxiliares
    const [listaPlatillos, setListaPlatillos] = useState<PlatilloOption[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Cargar la lista de Platillos disponibles para el Select
    useEffect(() => {
        fetch("http://127.0.0.1:8001/platillos/")
            .then((res) => res.json())
            .then((data) => setListaPlatillos(data))
            .catch((err) => console.error("Error cargando platillos:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fecha || !nombrePlatillo) {
            alert("Por favor selecciona una fecha y un platillo.");
            return;
        }

        setLoading(true);

        // Estructura JSON exacta requerida
        const payload = {
            day: fecha,
            nombre_platillo: nombrePlatillo
        };

        try {
            const response = await fetch("http://127.0.0.1:8001/menu/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al crear el menú. Estado: " + response.status);

            // Esperamos la respuesta para confirmar el guardado
            await response.json(); 
            
            // --- RECARGAR LA PÁGINA PARA ACTUALIZAR LA TABLA ---
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Error al guardar. Verifica la conexión.");
            setLoading(false); // Desactivar loading solo si falla
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
                
                {/* Botón Cerrar */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">Asignar Menú</h2>
                <p className="text-gray-400 text-sm mb-6">Programa un platillo para una fecha específica.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Input Fecha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                        />
                    </div>

                    {/* Select Platillo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Platillo</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                value={nombrePlatillo}
                                onChange={(e) => setNombrePlatillo(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccionar Platillo --</option>
                                {listaPlatillos.map((p, i) => (
                                    <option key={i} value={p.nombre_platillo}>
                                        {p.nombre_platillo}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                                ${loading ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-500 shadow-green-900/20"}`}
                        >
                            {loading ? "Guardando..." : "Asignar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}