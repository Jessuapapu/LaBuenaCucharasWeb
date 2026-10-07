import { useState } from "react";
import { useEditarRegistro } from "../../context/Hooks/hookProveedor";
import type { Registro } from "../../context/Interfaces/Proveedor";

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

  // Consumimos el custom hook
  const { listaProveedores, editar, loading, error } = useEditarRegistro();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      Fecha: new Date(fecha).toISOString(),
      IdProveedor: Number(idProveedor),
      TotalIngresado: Number(totalIngresado),
      CostoTotal: Number(costoTotal)
    };

    // Delegamos la petición
    const exito = await editar(registro.IdRegistro, payload);

    if (exito) {
      onSave({ ...registro, ...payload });
      onClose();
    } else {
      alert("Error al actualizar. Verifica la consola.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-lg w-full border border-gray-700 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold mb-4 text-blue-400">Editar Registro #{registro.IdRegistro}</h2>

        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Fecha</label>
            <input type="date" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 outline-none" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Proveedor</label>
            <div className="relative">
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 outline-none cursor-pointer appearance-none" value={idProveedor} onChange={e => setIdProveedor(Number(e.target.value))}>
                {listaProveedores.map((p) => (
                    <option key={p.IdProveedor} value={p.IdProveedor}>{p.NombreProveedor}</option>
                ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
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
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className={`flex-1 py-2 rounded font-bold text-white shadow-lg transition-all ${loading ? "bg-gray-600 cursor-wait" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}>
                {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}