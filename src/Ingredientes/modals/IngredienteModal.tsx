import { Pencil, Plus, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { IngredienteModel } from "../../interfaces/ingredientes";

interface IngredienteModalProps {
  isOpen: boolean;
  ingredienteEdit: IngredienteModel | null;
  onSubmit: (nombre: string) => Promise<void>;
  onClose: () => void;
}

export function IngredienteModal({ isOpen, ingredienteEdit, onSubmit, onClose }: IngredienteModalProps) {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (ingredienteEdit) {
      setNombre(ingredienteEdit.Nombre);
    } else {
      setNombre("");
    }
  }, [ingredienteEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(nombre);
  };

  const isEditing = !!ingredienteEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Contenedor principal con tu clase exacta */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header con tu clase exacta de la tabla */}
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            {isEditing ? "Editar Ingrediente" : "Nuevo Ingrediente"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Nombre del Ingrediente
            </label>
            <input 
              type="text" required placeholder="Ej: Tomate, Harina, Pollo..."
              className="w-full bg-slate-950/20 border border-slate-800/60 rounded-xl p-4 text-white text-lg font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-inner placeholder:text-slate-600"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 rounded-xl font-bold transition-all border border-slate-800/50">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-500/20">
              <Save className="w-5 h-5" />
              {isEditing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}