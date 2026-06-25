import { X, Link as LinkIcon, Utensils } from "lucide-react";
import { useState } from "react";
import type { IngredienteModel, RelacionPayload } from "../../interfaces/ingredientes";
import { usePlatillos } from "../../components/Hooks/hookPlatillos";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                <Utensils className="w-5 h-5" />
            </div>
            Ensamblar Receta
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Seleccionar Platillo
            </label>
            <select 
              required
              value={selectedPlatillo}
              onChange={(e) => setSelectedPlatillo(e.target.value)}
              className="w-full bg-slate-950/20 border border-slate-800/60 rounded-xl p-4 text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-inner appearance-none"
            >
              <option value="" disabled className="text-slate-600">-- Selecciona un platillo del menú --</option>
              {loadingPlatillos ? (
                 <option disabled>Cargando catálogo...</option>
              ) : (
                 platillos.map(p => (
                   <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.nombre_platillo}</option>
                 ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Ingredientes Requeridos ({selectedIngredientes.length})
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950/20 rounded-xl border border-slate-800/50 shadow-inner max-h-60 overflow-y-auto">
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
                      className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      {ing.Nombre}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 mt-auto">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 rounded-xl font-bold transition-all border border-slate-800/50">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={!selectedPlatillo || selectedIngredientes.length === 0}
              className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <LinkIcon className="w-5 h-5" />
              Vincular a Receta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}