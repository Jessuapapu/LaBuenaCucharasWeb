import { X, Link as LinkIcon, Utensils } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { IngredienteModel, RelacionPayload } from "../../../context/Interfaces/ingredientes";
import { usePlatillos } from "../../../context/Hooks/hookPlatillos";

interface AsignarModalProps {
  isOpen: boolean;
  ingredientesGlobales: IngredienteModel[];
  onSubmit: (payload: RelacionPayload) => Promise<void>;
  onClose: () => void;
}

export function AsignarIngredientesModal({ isOpen, ingredientesGlobales, onSubmit, onClose }: AsignarModalProps) {
  const { platillos, loadingPlatillos } = usePlatillos();
  
  const [selectedPlatillo, setSelectedPlatillo] = useState<string>("");
  const [selectedIngredientes, setSelectedIngredientes] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleIngrediente = (id: number) => {
    setSelectedIngredientes(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatillo || selectedIngredientes.length === 0) return;
    
    onSubmit({ IdPLatillo: selectedPlatillo, ingredientes: selectedIngredientes }).then(() => {
      setSelectedPlatillo("");
      setSelectedIngredientes([]);
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
      
      <div role="dialog" aria-modal="true" aria-labelledby="ensamblar-receta-titulo" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)]">
        
        <div className="flex shrink-0 items-center justify-between border-b border-slate-300/80 bg-[#dbe8ed] p-5">
          <h2 id="ensamblar-receta-titulo" className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
            <div className="rounded-xl bg-cyan-100 p-2 text-cyan-800">
                <Utensils className="w-5 h-5" />
            </div>
            Ensamblar Receta
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar sm:p-6">
          <div className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">
              Seleccionar platillo
            </label>
            <select 
              required
              value={selectedPlatillo}
              onChange={(e) => setSelectedPlatillo(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-[#f3f7f8] p-4 text-base font-medium text-slate-800 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 sm:text-lg"
            >
                <option value="" disabled className="text-slate-500">-- Selecciona un platillo del menú --</option>
              {loadingPlatillos ? (
                 <option disabled>Cargando catálogo...</option>
              ) : (
                 platillos.map(p => (
                   <option key={p.id} value={p.id}>{p.nombre_platillo}</option>
                 ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-700">
                Ingredientes requeridos <span className="text-cyan-800">({selectedIngredientes.length})</span>
              </label>
            </div>
            
            <div className="grid max-h-60 grid-cols-1 gap-3 overflow-y-auto rounded-2xl border border-slate-300 bg-[#dce7eb] p-4 shadow-inner sm:grid-cols-2 lg:grid-cols-3">
              {ingredientesGlobales.length === 0 ? (
                <p className="col-span-full text-slate-500 text-center py-4">No hay ingredientes en el inventario.</p>
              ) : (
                ingredientesGlobales.map(ing => {
                  const isSelected = selectedIngredientes.includes(ing.id);
                  return (
                    <button
                      type="button"
                      key={ing.id}
                      onClick={() => toggleIngrediente(ing.id)}
                      className={`rounded-xl border p-3 text-left text-sm font-bold transition-all ${
                        isSelected 
                          ? 'bg-cyan-100 border-cyan-300 text-cyan-950 shadow-sm' 
                          : 'bg-[#edf3f5] border-slate-200 text-slate-700 hover:bg-white/70 hover:border-cyan-300'
                      }`}
                    >
                      {ing.Nombre}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 border-t border-slate-300 pt-5">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-300">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={!selectedPlatillo || selectedIngredientes.length === 0}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 px-4 py-3 font-bold text-white shadow-md shadow-cyan-900/15 transition-all hover:from-cyan-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LinkIcon className="w-5 h-5" />
              Vincular a Receta
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
