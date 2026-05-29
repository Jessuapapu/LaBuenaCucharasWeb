import { useState } from "react";
import type { Proveedor } from "../../interfaces/proveedor";
import { useEditarProveedor } from "../Hooks/hookProveedor"; 

interface ModalEditarProveedorProps {
  proveedor: Proveedor;
  onClose: () => void;
  onSave: (updated: Proveedor) => void;
}

export default function ModalEditarProveedor({ proveedor, onClose, onSave }: ModalEditarProveedorProps) {
  const [formData, setFormData] = useState<Proveedor>({ ...proveedor });
  
  // Consumimos nuestro custom hook
  const { actualizar, loading, error } = useEditarProveedor();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // El hook se encarga del try/catch y de actualizar el estado 'loading'
    const exito = await actualizar(formData);

    if (exito) {
      onSave(formData);
      onClose();
    } else {
      // Si falla, mostramos una alerta básica (puedes cambiarlo a un toast o mensaje en UI)
      alert("Error al actualizar el proveedor. Revisa la consola.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <h2 className="text-2xl font-bold mb-1 text-blue-400">Editar Proveedor</h2>
        <p className="text-gray-400 text-sm mb-6">Actualiza los datos de {proveedor.NombreProveedor}.</p>

        {/* Muestra un mensaje de error renderizado si algo falla desde el backend */}
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
            <input name="NombreProveedor" value={formData.NombreProveedor} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Dirección</label>
            <input name="Direccion" value={formData.Direccion} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipo</label>
            <div className="relative">
                <select name="Tipo" value={formData.Tipo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                    <option value="FIJO">FIJO</option>
                    <option value="ESPORANEO">ESPORANEO</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-700 text-white hover:bg-gray-600">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 disabled:bg-gray-600">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}