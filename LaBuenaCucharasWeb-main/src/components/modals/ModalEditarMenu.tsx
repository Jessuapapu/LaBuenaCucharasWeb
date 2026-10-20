import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

// Interfaces
interface Menu {
    id: number; // Necesario para la URL
    Fecha: string;
    NombrePlatillo: string;
    monto: number | "";
}

interface DetalleItem {
  nombre_platillo: string;
  cantidad: number;
  precio_unitario: number;
}

interface PlatilloOption {
    nombre_platillo: string;
}

interface ModalEditarMenuProps {
    menu: Menu;
    onClose: () => void;
    // Se elimina onSave
}

export default function ModalEditarMenu({ menu, onClose }: ModalEditarMenuProps) {
    // Estado local
    const [nombrePlatillo, setNombrePlatillo] = useState(menu.NombrePlatillo);
    
    // Listas y Carga
    const [listaPlatillos, setListaPlatillos] = useState<PlatilloOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [items, setItems]= useState<DetalleItem[]>([
        { nombre_platillo: "", cantidad: 1, precio_unitario: 0 },
    ]);

    // 1. Cargar lista de platillos para el Select
    useEffect(() => {
        fetch("http://127.0.0.1:8001/platillos/")
            .then((res) => res.json())
            .then((data) => setListaPlatillos(data))
            .catch((err) => console.error("Error cargando platillos:", err));
    }, []);

    // Manejar el cambio de valores de una fila específica
  const handleChangeItem = (index: number, field: keyof DetalleItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  // Eliminar una fila específica
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return; // Mantener al menos uno
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!menu.id) {
            alert("Error: No se encontró el ID del menú para editar.");
            return;
        }

        setLoading(true);

        // Payload exacto solicitado
        const payload = {
            nombre_platillo: nombrePlatillo
        };

        try {
            const response = await fetch(`http://127.0.0.1:8001/menu/${menu.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al actualizar el menú. Estado: " + response.status);

            // Se espera la respuesta para confirmar
            await response.json();
            
            // --- FORZAR RECARGA DE PÁGINA ---
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Error al actualizar. Verifica la consola.");
            setLoading(false); // Solo desactivar loading si falló
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">Editar Menú</h2>
                <p className="text-gray-400 text-sm mb-6">Modifica el platillo asignado para esta fecha.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Fecha (Solo Lectura) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Fecha Programada</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed font-mono"
                            value={menu.Fecha}
                            readOnly
                            disabled
                        />
                    </div>

                    {/* Select Platillo (Editable) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Cambiar Platillo</label>
                        {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                
                {/* Select Platillo */}
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Platillo #{index + 1}</label>
                  <select
                    className="w-full px-3 py-1.5 rounded bg-gray-800 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    value={item.nombre_platillo}
                    onChange={(e) => handleChangeItem(index, "nombre_platillo", e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {listaPlatillos.map((p, i) => (
                      <option key={i} value={p.nombre_platillo}>
                        {p.nombre_platillo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precio del Platillo */}
                <div className="w-28">
                  <label className="block text-xs text-gray-400 mb-1">Precio (C$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 rounded bg-gray-800 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={item.precio_unitario} 
                    onChange={(e) => handleChangeItem(index, "precio_unitario", Number(e.target.value))}
                    required
                  />
                </div>

                {/* Botón quitar fila (Oculto si sólo hay un elemento) */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 rounded bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/60 transition-colors"
                    title="Remover este platillo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                                ${loading ? "bg-gray-600 cursor-wait" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}
                        >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}