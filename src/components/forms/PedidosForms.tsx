import { useState, useEffect } from "react";

// Interfaces para los datos que cargamos
interface ClienteOption {
  nombre: string;
}

interface PlatilloOption {
  nombre_platillo: string;
  precio?: number; // Opcional, por si quieres autocompletar el precio
}

interface DetalleItem {
  nombre_platillo: string;
  cantidad: number;
  precio_unitario: number;
}

interface FormularioNuevoPedidoProps {
  onClose: () => void;
  onSave: () => void; // Para recargar la tabla al guardar
}

export default function FormularioNuevoPedido({ onClose, onSave }: FormularioNuevoPedidoProps) {
  // --- Estados de Datos (Listas para selects) ---
  const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
  const [listaPlatillos, setListaPlatillos] = useState<PlatilloOption[]>([]);

  // --- Estados del Formulario ---
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // Fecha de hoy por defecto
  const [items, setItems] = useState<DetalleItem[]>([
    { nombre_platillo: "", cantidad: 1, precio_unitario: 0 },
  ]);
  
  const [loading, setLoading] = useState(false);

  // 1. Cargar Clientes y Platillos al montar
  useEffect(() => {
    // Cargar Clientes
    fetch("http://127.0.0.1:8001/clientes/")
      .then((res) => res.json())
      .then((data) => setListaClientes(data))
      .catch(console.error);

    // Cargar Platillos
    fetch("http://127.0.0.1:8001/platillos/")
      .then((res) => res.json())
      .then((data) => setListaPlatillos(data))
      .catch(console.error);
  }, []);

  // 2. Manejadores de Detalles (Agregar / Quitar / Cambiar)
  const handleAddItem = () => {
    setItems([...items, { nombre_platillo: "", cantidad: 1, precio_unitario: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: keyof DetalleItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  // 3. Submit (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || items.length === 0) {
      alert("Debes seleccionar un cliente y al menos un platillo.");
      return;
    }

    setLoading(true);

    // Estructura EXACTA que pediste
    const payload = {
      nombre_cliente: cliente,
      fecha: fecha,
      detalle: items.map((item) => ({
        nombre_platillo: item.nombre_platillo,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
      })),
    };

    try {
      // Ajusta la URL si tu endpoint de crear es distinto a /pedidos/
      const response = await fetch("http://127.0.0.1:8001/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al crear el pedido");
      }

      alert("Pedido creado con éxito ✅");
      onSave(); // Refrescar tabla padre
      onClose(); // Cerrar modal
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar el pedido ❌");
    } finally {
      setLoading(false);
    }
  };

  // Calcular total visual
  const totalEstimado = items.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-800 text-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-400">Nuevo Pedido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="form-pedido" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Fila 1: Cliente y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {listaClientes.map((c, i) => (
                    <option key={i} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>

            {/* Sección Detalles */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-lg font-medium text-gray-200">Detalles del Pedido</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1 rounded transition-colors"
                >
                  + Agregar Platillo
                </button>
              </div>

              <div className="space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                    
                    {/* Platillo */}
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-gray-500 mb-1">Platillo</label>
                      <select
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        value={item.nombre_platillo}
                        onChange={(e) => handleChangeItem(index, "nombre_platillo", e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {listaPlatillos.map((p, i) => (
                          <option key={i} value={p.nombre_platillo}>{p.nombre_platillo}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        value={item.cantidad}
                        onChange={(e) => handleChangeItem(index, "cantidad", Number(e.target.value))}
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="w-32">
                      <label className="block text-xs text-gray-500 mb-1">P. Unitario ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        value={item.precio_unitario}
                        onChange={(e) => handleChangeItem(index, "precio_unitario", Number(e.target.value))}
                      />
                    </div>

                    {/* Botón Eliminar */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white px-2 py-1 rounded text-xs transition-colors h-[30px]"
                        title="Quitar fila"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-lg font-mono text-gray-300">
            Total: <span className="text-white font-bold">${totalEstimado.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-pedido"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-bold text-white transition-all 
                ${loading ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20"}`}
            >
              {loading ? "Guardando..." : "Crear Pedido"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}