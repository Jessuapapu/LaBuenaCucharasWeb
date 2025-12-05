import { useState } from "react";



interface ModalNuevaFacturaProps {
  onClose: () => void;
  onSave: (nueva: any) => void;
}

export default function ModalNuevaFactura({ onClose, onSave }: ModalNuevaFacturaProps) {
  const [idPedido, setIdPedido] = useState<number | "">("");
  const [monto, setMonto] = useState<number | "">("");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [estado, setEstado] = useState("Generada");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id_pedido: Number(idPedido),
      monto_total: Number(monto),
      cantidad_total: Number(cantidad),
      estado_factura: estado,
      fecha_factura: new Date(fecha).toISOString().split('T')[0], // Formato YYYY-MM-DD
      cliente: { nombre_cliente: "Cliente Manual", direccion_cliente: "N/A" } // Placeholder
    };

    try {
      // Ajusta el endpoint si es diferente para crear
      const response = await fetch("http://127.0.0.1:8001/pedidos/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al crear factura");

      const data = await response.json();
      onSave(data.id_pedido ? data : payload);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la factura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full border border-gray-700 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-2xl font-bold mb-1 text-blue-400">Nueva Factura</h2>
        <p className="text-gray-400 text-sm mb-6">Registrar facturación manualmente.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">ID Pedido</label>
            <input type="number" className="input-dark w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" value={idPedido} onChange={e => setIdPedido(Number(e.target.value))} required placeholder="Ej: 104" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-300 mb-1">Monto ($)</label>
                <input type="number" className="input-dark w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" value={monto} onChange={e => setMonto(Number(e.target.value))} required />
            </div>
            <div>
                <label className="block text-sm text-gray-300 mb-1">Items</label>
                <input type="number" className="input-dark w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Fecha Emisión</label>
            <input type="date" className="input-dark w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" value={fecha} onChange={e => setFecha(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Estado</label>
            <select className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="Generada">Generada</option>
                <option value="Pagada">Pagada</option>
                <option value="Anulada">Anulada</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-700 text-white">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500">{loading ? "Guardando..." : "Crear"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}