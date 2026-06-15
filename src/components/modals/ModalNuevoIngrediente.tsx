import { useState } from "react";
import { useCrearIngredientes } from "../Hooks/hookIngredientes";

interface ModalIngrediente{
    onClose: ()=> void
}

export default function ModalNuevoIngrediente({ onClose }: ModalIngrediente){
    const [Nombre, setNombre]= useState<string>("")

    const { crearIngrediente, loading, error }= useCrearIngredientes()

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Nombre.trim()) {
      alert("Por favor introduce un nombre válido para el ingrediente.");
      return;
    }

    const exito = await crearIngrediente(Nombre);
    if (exito) {
      window.location.reload();
    } else {
      alert("Hubo un error al guardar el ingrediente. Revisa la consola.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
        
        {/* Botón de cierre superior */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Encabezado */}
        <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Ingrediente</h2>
        <p className="text-gray-400 text-sm mb-6">Añade un nuevo ingrediente para los platillos del comedor.</p>

        {/* Mostrar el mensaje de error si hay fallo*/}
        {error && (
          <div className="mb-4 text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-sm font-medium animate-in shake duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre del Ingrediente */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Ingrediente</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 capitalize transition-all"
              placeholder="Ej: Tomate, Queso Chontaleño, Cebolla..."
              value={Nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
              disabled={loading}
              required
            />
            <p className="text-slate-500 text-[11px] mt-1 italic">
              * Por defecto, el ingrediente iniciará con un inventario de 0 unidades.
            </p>
          </div>

          {/* Botonera de acciones de Formulario */}
          <div className="flex gap-3 pt-4 mt-2 border-t border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                ${loading ? "bg-gray-600 cursor-wait opacity-75" : "bg-green-600 hover:bg-green-500 shadow-green-900/20"}`}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}