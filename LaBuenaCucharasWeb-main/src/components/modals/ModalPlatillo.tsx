import { useState } from "react";

// 1. Actualizamos la interfaz para coincidir con la del padre
// TODO: OCUPAR LA MISMA INTERFAAZ AJKAJSKAJS
interface Platillo {
  id?: number | string; // Opcional
  nombre_platillo: string;
  nombre_categoria: string;
}

interface ModalPlatilloProps {
  platillos: Platillo[];
  onClose: () => void;
  onSave: (updatedPlatillos: Platillo[]) => void; 
}

export default function ModalPlatillo({ platillos, onClose, onSave }: ModalPlatilloProps) {
  const [localPlatillos, setLocalPlatillos] = useState<Platillo[]>([...platillos]);
  const [loading, setLoading] = useState(false);

  // Helper para manejar cambios en inputs y selects
  const handleChange = (index: number, field: keyof Platillo, value: string) => {
    const updated = [...localPlatillos];
    // @ts-ignore: TypeScript puede quejarse por asignar string a tipos específicos, ignoramos por simplicidad aquí
    updated[index][field] = value;
    setLocalPlatillos(updated);
  };

  const handleAdd = () => {
    // 2. Al agregar, inicializamos con un estado por defecto
    setLocalPlatillos([
        ...localPlatillos, 
        { nombre_platillo: "", nombre_categoria: "" }
    ]);
  };


  const handleSave = async () => {
    setLoading(true);
    
    try {
      // --- PLACEHOLDER API CALL ---
      await new Promise(resolve => setTimeout(resolve, 500)); 
      // --- END PLACEHOLDER ---

      onSave(localPlatillos);

      // 3. RECARGAR LA PÁGINA
      window.location.reload();

    } catch (error) {
      console.error("Error al guardar los platillos:", error);
      alert("Error al guardar los platillos. Revisa la consola.");
      setLoading(false); 
    } 
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="border-b border-gray-700 pb-3 mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Administrar Platillos ({localPlatillos.length})</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        {/* Lista de Platillos (Scrollable) */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {localPlatillos.map((p, i) => (
                <div key={i} className="bg-gray-800 p-3 rounded-lg flex flex-col md:flex-row md:gap-4 items-center justify-between shadow-inner">
                    
                    {/* Input Nombre */}
                    <div className="w-full md:flex-1">
                        <label className="text-xs text-gray-400 mb-1 block md:hidden">Nombre</label>
                        <input
                            type="text"
                            placeholder="Nombre del platillo"
                            className="px-3 py-2 rounded bg-gray-700 text-white w-full border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            value={p.nombre_platillo}
                            onChange={(e) => handleChange(i, "nombre_platillo", e.target.value)}
                        />
                    </div>
                    
                    {/* Input Categoría */}
                    <div className="w-full md:w-1/4">
                        <label className="text-xs text-gray-400 mb-1 block md:hidden">Categoría</label>
                        <input
                            type="text"
                            placeholder="Categoría"
                            className="px-3 py-2 rounded bg-gray-700 text-white w-full border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            value={p.nombre_categoria}
                            onChange={(e) => handleChange(i, "nombre_categoria", e.target.value)}
                        />
                    </div>

                    
                </div>
            ))}
        </div>

        {/* Footer y Acciones */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-700">
            <button
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20"
                onClick={handleAdd}
            >
                + Agregar Nuevo
            </button>
            <div className="flex gap-3">
                <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors" onClick={onClose}>
                    Cancelar
                </button>
                <button
                    className={`px-6 py-2 rounded-lg font-bold text-white transition-all 
                        ${loading ? "bg-gray-500 cursor-wait" : "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20"}`}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}