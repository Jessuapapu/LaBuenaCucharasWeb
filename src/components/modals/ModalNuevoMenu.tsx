import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

// Estructura del objeto Menu según tu JSON (se mantiene para tipado)


// Estructura auxiliar para llenar el select de platillos
interface PlatilloOption {
    nombre_platillo: string;
}

interface DetalleItem {
  nombre_platillo: string;
  cantidad: number;
  precio_unitario: number;
}

interface ModalNuevoMenuProps {
    Monto?: number;
    fecha?: string;
    onClose: () => void;
    // Se elimina onSave ya que la recarga de página actualizará el componente padre
}

export default function ModalNuevoMenu({ onClose, fecha, Monto }: ModalNuevoMenuProps) {
    // Estado del formulario
    // Inicializamos la fecha con el día de hoy
    const [fechadia, setFecha] = useState( fecha || new Date().toISOString().split("T")[0]);
    const [nombrePlatillo, setNombrePlatillo] = useState("");
    const [Precio, setprecio]= useState<number | string>(Monto !== undefined ? Monto: "") 
    const [items, setItems]= useState<DetalleItem[]>([
    { nombre_platillo: "", cantidad: 1, precio_unitario: 0 },
  ]);
    
    // Estado para datos auxiliares
    const [listaPlatillos, setListaPlatillos] = useState<PlatilloOption[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Cargar la lista de Platillos disponibles para el Select
    useEffect(() => {
        fetch("http://127.0.0.1:8001/platillos/")
            .then((res) => res.json())
            .then((data) =>{ //setListaPlatillos(data))
            setListaPlatillos(Array.isArray(data)? data: []) //Lo mismo en pedidosForm
            })
            .catch((err) => console.error("Error cargando platillos:", err));
    }, []);

    const handleAddItem = () => {
    setItems([...items, { nombre_platillo: "", cantidad: 1, precio_unitario: 0 }]);
  };

  // Eliminar una fila específica
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return; // Mantener al menos uno
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Manejar el cambio de valores de una fila específica
  const handleChangeItem = (index: number, field: keyof DetalleItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fechadia || items.some (item=> !item.nombre_platillo)) {
            alert("Por favor selecciona una fecha y un platillo.");
            return;
        }

        setLoading(true);

        // Estructura JSON exacta requerida
        const payload = {
            day: fechadia,
            nombre_platillo: items[0].nombre_platillo,
            precioplatillo: Number(items[0].precio_unitario),
            detalle: items.map((item) => ({ 
        nombre_platillo: item.nombre_platillo,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
      })), 
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

                    {/* Encabezado de la sección dinámica */}
                    <div className="flex justify-between items-center pt-2">
                        <label className="block text-sm font-medium text-gray-300">Platillos del Día</label>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded transition-colors font-semibold"
                            >
                            + Agregar Platillo
                            </button>
                    </div>

                    <div className="space-y-3 max-h-[40vh] overflow-y-auto bg-gray-950 p-3 rounded-lg border border-gray-800">
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