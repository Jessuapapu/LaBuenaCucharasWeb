import { Pencil, Trash2, RefreshCw } from "lucide-react";
import type { IngredienteModel } from "../../interfaces/ingredientes";
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
    <div className="p-4 bg-slate-950/20 rounded-b-xl overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/50">
            <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider w-24">ID</th>
            <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Nombre del Ingrediente</th>
            <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right w-32">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando catálogo...</span>
                </div>
              </td>
            </tr>
          ) : datosSeguros.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-slate-500 font-medium border border-dashed border-slate-800/50 rounded-xl">
                No hay ingredientes registrados.
              </td>
            </tr>
          ) : (
            datosSeguros.map((ing) => (
              <tr key={ing.id} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors group">
                {/* El ?. previene un fallo si el id llega undefined desde python */}
                <td className="p-4 text-black font-black">#{ing.id?.toString().padStart(3, '0')}</td>
                <td className="p-4 text-lg font-bold text-black">{ing.Nombre}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(ing)} 
                      className="p-2 text-sky-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(ing.id, ing.Nombre)} 
                      className="p-2 text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
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