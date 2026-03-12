import { useState, useEffect } from "react";

// Interfaz para la respuesta del endpoint de categorías
interface CategoriaOption {
    nombre_categoria: string;
}

// Interfaz del objeto que vamos a guardar
interface Platillo {
    nombre_platillo: string;
    nombre_categoria: string;
}

interface ModalNuevoPlatilloProps {
    onClose: () => void;
    // CORRECCIÓN: Restauramos onSave para que el padre pueda actualizar la tabla
    onSave: (nuevo: Platillo) => void; 
}

export default function ModalNuevoPlatillo({ onClose, onSave }: ModalNuevoPlatilloProps) {
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    
    const [listaCategorias, setListaCategorias] = useState<CategoriaOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("http://127.0.0.1:8001/platillos/categoria") 
            .then((res) => {
                if (!res.ok) throw new Error("Error al cargar categorías");
                return res.json();
            })
            .then((data) => {
                setListaCategorias(data);
            })
            .catch((err) => console.error("Error cargando categorías:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim() || !categoria.trim()) {
            alert("Por favor completa el nombre y selecciona una categoría.");
            return;
        }

        setLoading(true);

        const payload = {
            nombre_platillo: nombre,
            nombre_categoria: categoria
        };

        try {
            const response = await fetch("http://127.0.0.1:8001/platillos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Error al crear el platillo en el servidor.");
            }

            const data = await response.json();
            
            // CORRECCIÓN: Llamamos a onSave en lugar de reload() para que React actualice el estado
            // Si prefieres recargar la página, puedes poner window.location.reload() aquí, 
            // pero debes mantener la prop onSave en la interfaz o quitarla del padre.
            // Lo ideal en React es esto:
            onSave(data.nombre_platillo ? data : payload); 
            
            onClose();

        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar el platillo.");
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Platillo</h2>
                <p className="text-gray-400 text-sm mb-6">Ingresa los datos para registrar un nuevo platillo.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Platillo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                            placeholder="Ej: Lomo Saltado"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                        <div className="relative">
                            <select
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                            >
                            <option value="">-- Seleccionar Categoría --</option>
                            {listaCategorias.map((cat, index) => (
                                <option key={index} value={cat.nombre_categoria}>
                                    {cat.nombre_categoria}
                                </option>
                            ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                                ${loading 
                                    ? "bg-gray-600 cursor-wait" 
                                    : "bg-green-600 hover:bg-green-500 shadow-green-900/20"
                                }`}
                        >
                            {loading ? "Guardando..." : "Crear Platillo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}