import { Pencil, Trash2, RefreshCw } from "lucide-react";
import type { IngredienteModel } from "../../../context/Interfaces/ingredientes";
interface TablaIngredientesProps {
  ingredientes: IngredienteModel[];
  loading: boolean;
  onEdit: (ing: IngredienteModel) => void;
  onDelete: (id: number, nombre: string) => void;
}

export function TablaIngredientes({ ingredientes, loading, onEdit, onDelete }: TablaIngredientesProps) {
  
  // Capa extra de seguridad visual: garantizamos que siempre sea un array
  const datosSeguros = Array.isArray(ingredientes) ? ingredientes : [];

  return (
    <div className="overflow-x-auto rounded-b-2xl bg-[#e8f0f3]/80 p-3 sm:p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="w-24 p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">ID</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Nombre del ingrediente</th>
            <th className="w-32 p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando catálogo...</span>
                </div>
              </td>
            </tr>
          ) : datosSeguros.length === 0 ? (
            <tr>
              <td colSpan={3} className="rounded-xl border border-dashed border-slate-300 p-8 text-center font-medium text-slate-600">
                No hay ingredientes registrados.
              </td>
            </tr>
          ) : (
            datosSeguros.map((ing) => (
              <tr key={ing.id} className="border-b border-slate-200/80 transition-colors hover:bg-emerald-50/70 group">
                {/* El ?. previene un fallo si el id llega undefined desde python */}
                <td className="p-4 font-mono text-sm font-bold text-slate-500">#{ing.id?.toString().padStart(3, '0')}</td>
                <td className="p-4 text-base font-bold text-slate-800">{ing.Nombre}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(ing)} 
                      className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-cyan-100 hover:text-cyan-900"
                      title="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(ing.id, ing.Nombre)} 
                      className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
