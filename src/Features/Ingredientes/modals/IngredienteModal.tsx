import { Pencil, Plus, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { IngredienteModel } from "../../../context/Interfaces/ingredientes";

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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
      
      {/* Contenedor principal con tu clase exacta */}
      <div role="dialog" aria-modal="true" aria-labelledby="ingrediente-modal-titulo" className="w-full max-w-lg overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25">
        
        {/* Header con tu clase exacta de la tabla */}
        <div className="flex items-center justify-between border-b border-slate-300/80 bg-[#dbe8ed] p-5">
          <h2 id="ingrediente-modal-titulo" className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
                {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            {isEditing ? "Editar ingrediente" : "Nuevo ingrediente"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">
              Nombre del ingrediente
            </label>
            <input 
              type="text" required placeholder="Ej: Tomate, Harina, Pollo..."
              className="w-full rounded-xl border border-slate-300 bg-[#f3f7f8] p-4 text-lg font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 border-t border-slate-300 pt-5">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-300">
              Cancelar
            </button>
            <button type="submit" className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-3 font-bold text-white shadow-md shadow-emerald-900/15 transition-all hover:from-emerald-600 hover:to-teal-600">
              <Save className="w-5 h-5" />
              {isEditing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
