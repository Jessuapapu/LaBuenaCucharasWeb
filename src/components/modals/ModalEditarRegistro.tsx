import { useState, useEffect } from "react";

interface Registro {
  IdRegistro: number;
  Fecha: string;
  TotalIngresado: number;
  IdProveedor: number;
  CostoTotal: string | number; // Puede venir como string del JSON
}

interface ProveedorOption {
  IdProveedor: number;
  NombreProveedor: string;
}

interface ModalEditarRegistroProps {
  registro: Registro;
  onClose: () => void;
  onSave: (updated: Registro) => void;
}

export default function ModalEditarRegistro({ registro, onClose, onSave }: ModalEditarRegistroProps) {
  // Formatear fecha para el input
  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split('T')[0];
  };

  const [fecha, setFecha] = useState(formatDate(registro.Fecha));
  const [idProveedor, setIdProveedor] = useState(registro.IdProveedor);
  const [totalIngresado, setTotalIngresado] = useState(registro.TotalIngresado);
  const [costoTotal, setCostoTotal] = useState(Number(registro.CostoTotal));

  const [listaProveedores, setListaProveedores] = useState<ProveedorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/proveedores/")
      .then((res) => res.json())
      .then((data) => setListaProveedores(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      Fecha: new Date(fecha).toISOString(),
      IdProveedor: Number(idProveedor),
      TotalIngresado: Number(totalIngresado),
      CostoTotal: Number(costoTotal)
    };

    try {
      const response = await fetch(`http://127.0.0.1:8001/registros/${registro.IdRegistro}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      onSave({ ...registro, ...payload });
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
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-lg w-full border border-gray-700 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold mb-4 text-blue-400">Editar Registro #{registro.IdRegistro}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Fecha</label>
            <input type="date" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 outline-none" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Proveedor</label>
            <select className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 outline-none cursor-pointer" value={idProveedor} onChange={e => setIdProveedor(Number(e.target.value))}>
              {listaProveedores.map((p, i) => (<option key={i} value={p.IdProveedor}>{p.NombreProveedor}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-300 mb-1">Cant. Ingresada</label>
                <input type="number" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 outline-none" value={totalIngresado} onChange={e => setTotalIngresado(Number(e.target.value))} />
            </div>
            <div>
                <label className="block text-sm text-gray-300 mb-1">Costo Total ($)</label>
                <input type="number" step="0.01" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 outline-none" value={costoTotal} onChange={e => setCostoTotal(Number(e.target.value))} />
            </div>
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