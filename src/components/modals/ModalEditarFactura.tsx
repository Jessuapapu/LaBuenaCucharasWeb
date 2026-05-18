import { useState } from "react";

interface Cliente {
  nombre_cliente: string;
  direccion_cliente: string;
}

interface Factura {
  id_pedido: number;
  monto_total: number;
  cantidad_total: number;
  estado_factura: string;
  fecha_factura: string;
  cliente: Cliente;
}

interface ModalEditarFacturaProps {
  factura: Factura;
  onClose: () => void;
  onSave: (updated: Factura) => void;
}

export default function ModalEditarFactura({ factura, onClose, onSave }: ModalEditarFacturaProps) {
  const [estado, setEstado] = useState(factura.estado_factura);
  const [monto, setMonto] = useState(factura.monto_total);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...factura,
      estado_factura: estado,
      monto_total: Number(monto)
    };

    try {
      // Asumimos endpoint /pedidos/facturas/{id_pedido} para actualizar
      const response = await fetch(`http://127.0.0.1:8001/pedidos/facturas/${factura.id_pedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado_factura: payload.estado_factura,
          monto_total: payload.monto_total
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar");
      
      onSave(payload);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full border border-gray-700 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold mb-4 text-blue-400">Editar Factura #{factura.id_pedido}</h2>

        <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
            <p className="text-sm text-gray-400">Cliente</p>
            <p className="font-bold text-white">{factura.cliente.nombre_cliente}</p>
            <p className="text-xs text-gray-500">{factura.cliente.direccion_cliente}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Estado Actual</label>
            <select className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500 cursor-pointer" value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="Generada">Generada</option>
                <option value="Pagada">Pagada</option>
                <option value="Anulada">Anulada</option>
            </select>
          </div>

          <div>
             <label className="block text-sm text-gray-300 mb-1">Monto Total ($)</label>
             <input type="number" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" value={monto} onChange={e => setMonto(Number(e.target.value))} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-700 text-white">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500">{loading ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}