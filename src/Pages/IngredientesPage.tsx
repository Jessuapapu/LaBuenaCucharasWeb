import { useState } from "react";
import { Leaf, Plus, AlertCircle, Link as LinkIcon } from "lucide-react";
import { useIngredientes } from "../context/Hooks/useIngredientes";
import type { IngredienteModel, RelacionPayload} from "../context/Interfaces/ingredientes";


import { IngredienteModal } from "../Features/Ingredientes/modals/IngredienteModal";
import { AsignarIngredientesModal } from "../Features/Ingredientes/modals/AsignarIngredientesModal";
import { TablaIngredientes } from "../Features/Ingredientes/table/TablaIngredientes";

export default function IngredientesPage() {
  const { ingredientes, loading, error, agregar, editar, eliminar, vincular } = useIngredientes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);
  const [ingredienteEdit, setIngredienteEdit] = useState<IngredienteModel | null>(null);

  const openNew = () => {
    setIngredienteEdit(null);
    setIsModalOpen(true);
  };

  const openEdit = (ing: IngredienteModel) => {
    setIngredienteEdit(ing);
    setIsModalOpen(true);
  };

  const handleIngredienteSubmit = async (nombre: string) => {
    let exito = false;
    if (ingredienteEdit) {
      exito = await editar(ingredienteEdit.id, nombre);
    } else {
      exito = await agregar(nombre);
    }
    if (exito) setIsModalOpen(false);
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el ingrediente: ${nombre}?`)) {
      await eliminar(id);
    }
  };

  const handleAsignarSubmit = async (payload: RelacionPayload) => {
    const exito = await vincular(payload);
    if (exito) setIsAsignarOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Inventario de Ingredientes</h1>
            <p className="text-slate-800 mt-0.5 text-2xl font-medium">Administra la materia prima y arma las recetas.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
          <button 
            onClick={() => setIsAsignarOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 border border-slate-200/60 hover:bg-slate-200 hover:border-sky-500/50 text-slate-800 px-5 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            <LinkIcon className="w-5 h-5 text-blue-500" />
            <span className="hidden sm:inline">Ensamblar Receta</span>
          </button>
          
          <button 
            onClick={openNew}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Ingrediente</span>
          </button>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 rounded-t-xl mb-2">
          <h3 className="text-2xl font-bold text-slate-900">Listado de Ingredientes</h3>
        </div>

        {/* Consumo del componente separado */}
        <TablaIngredientes 
          ingredientes={ingredientes} 
          loading={loading} 
          onEdit={openEdit} 
          onDelete={handleEliminar} 
        />
      </div>

      <IngredienteModal 
        isOpen={isModalOpen}
        ingredienteEdit={ingredienteEdit}
        onSubmit={handleIngredienteSubmit}
        onClose={() => setIsModalOpen(false)}
      />

      <AsignarIngredientesModal 
        isOpen={isAsignarOpen}
        ingredientesGlobales={ingredientes}
        onSubmit={handleAsignarSubmit}
        onClose={() => setIsAsignarOpen(false)}
      />

    </div>
  );
}