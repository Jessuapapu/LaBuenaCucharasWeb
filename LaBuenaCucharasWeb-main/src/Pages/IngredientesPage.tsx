import { useState } from "react";
import { Leaf, Plus, AlertCircle, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
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
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-100/90 p-4 text-rose-800">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Encabezado */}
      <header className="flex flex-col justify-between gap-5 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md lg:flex-row lg:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 text-white shadow-lg shadow-emerald-900/15">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Materia prima y recetas</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Ingredientes</h1>
            <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">Administra la materia prima y arma las recetas del menú.</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Link to="/Inventario" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-[#edf3f5] px-4 py-3 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-200 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Volver a inventario
          </Link>
          <button 
            onClick={() => setIsAsignarOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-100 px-5 py-3 font-bold text-cyan-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-700/30"
          >
            <LinkIcon className="h-5 w-5 text-cyan-800" />
            <span>Ensamblar receta</span>
          </button>
          
          <button 
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 font-bold text-white shadow-md shadow-emerald-900/15 transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-700/35"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo ingrediente</span>
          </button>
        </div>
      </header>

      {/* Contenedor de la Tabla */}
      <section className="overflow-hidden rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-5">
        <div className="mb-2 rounded-t-2xl border-b border-slate-300/80 bg-[#dbe7ec] p-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Catálogo de bodega</p>
          <h2 className="text-xl font-extrabold text-slate-800 sm:text-2xl">Listado de ingredientes</h2>
        </div>

        {/* Consumo del componente separado */}
        <TablaIngredientes 
          ingredientes={ingredientes} 
          loading={loading} 
          onEdit={openEdit} 
          onDelete={handleEliminar} 
        />
      </section>

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
