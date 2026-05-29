import { useState } from "react";
import type { cliente } from "../../interfaces/Clientes";
import { useEditarCliente } from "../Hooks/hookClientes"; // Ajusta la ruta de tu nuevo hook

interface ModalEditarClienteProps {
  cliente: cliente;
  onClose: () => void;
  onSave: (updatedCliente: cliente) => void;
}

export default function ModalEditarCliente({ cliente, onClose, onSave }: ModalEditarClienteProps) {
  const [formData, setFormData] = useState({ ...cliente });
  
  // Consumimos el hook
  const { editar, loading, error } = useEditarCliente();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Delegamos la ejecución al hook
    const exito = await editar(cliente.idCliente, formData);

    if (exito) {
      onSave(formData);
      onClose();
    } else {
      alert("Error al actualizar. Verifica la consola.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-lg w-full shadow-2xl border border-gray-700 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-1 text-blue-400">Editar Cliente</h2>
        <p className="text-gray-400 text-sm mb-6">Modifica los datos de {cliente.nombre}.</p>

        {/* Mostramos el error si el hook falla */}
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Dirección</label>
            <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Teléfono</label>
              <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Correo</label>
              <input name="correo" value={formData.correo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">Cancelar</button>
            <button type="submit" disabled={loading} className={`flex-1 py-2 rounded-lg font-bold text-white shadow-lg ${loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}