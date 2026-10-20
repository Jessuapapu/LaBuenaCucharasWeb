import { Pencil, Plus, Save, X, Power } from "lucide-react";
import type { CambioDeHoraModelEditar } from "../../../context/Interfaces/cambiosdehora";
import { InteractiveTimeSlider } from "../comunes/InteractiveTimeSlider";
import { RankingHoras } from "../comunes/RankingHorarios";

interface HorarioModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: CambioDeHoraModelEditar;
  setFormData: React.Dispatch<React.SetStateAction<CambioDeHoraModelEditar>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function HorarioModal({ isOpen, isEditing, formData, setFormData, onSubmit, onClose }: HorarioModalProps) {
  
  if (!isOpen) return null;

  const handleSliderChange = (inicio: string, fin: string) => {
    setFormData(prev => ({ ...prev, HoraInicio: inicio, HoraFinal: fin }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="w-full max-w-lg bg-[#e5f0ed] rounded-2xl border border-sky-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header (mismo estilo que tu tabla) */}
        <div className="p-5 border-b border-sky-200 bg-gradient-to-r from-[#cde7ed] to-[#dcebdc] flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-[#b9dfe7] rounded-lg text-sky-900">
                {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            {isEditing ? "Editar Rango" : "Nuevo Rango"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-sky-900 hover:text-rose-800 hover:bg-rose-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          
          {/* Fila 1: Nombre (y Estado solo si estamos editando) */}
          <div className="flex flex-col sm:flex-row gap-5">
              
              {/* Input Nombre: Al tener flex-1, tomará todo el ancho si el botón de Estado no está */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-sky-950/80 uppercase tracking-wider">
                  Nombre del Horario
                </label>
                <input 
                  type="text" required placeholder="Ej: Desayuno..."
                  className="w-full bg-[#f0f5e9] border border-sky-300 rounded-xl p-3 text-slate-900 text-lg font-medium focus:ring-2 focus:ring-sky-500/30 outline-none transition-all shadow-inner placeholder:text-slate-500"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              {/* Botón Toggle de Estado (CONDICIONAL: Solo aparece si isEditing es true) */}
              {isEditing && (
                <div className="flex flex-col gap-2 sm:w-1/3 animate-in slide-in-from-right-4 duration-300">
                  <label className="text-sm font-bold text-sky-950/80 uppercase tracking-wider">
                    Estado
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, estado: !formData.estado})}
                    className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl font-bold transition-all border shadow-inner ${
                        formData.estado 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-200' 
                        : 'bg-rose-100 border-rose-300 text-rose-900 hover:bg-rose-200'
                    }`}
                  >
                    <Power className="w-5 h-5" />
                    {formData.estado ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              )}
          </div>

          {/* Contenedor del Rango (con bg-slate-950/20 que usas en el interior de tus tarjetas) */}
          <div className="p-5 bg-[#eaf1e8] rounded-xl border border-emerald-200 shadow-inner">
            <label className="block text-sm font-bold text-teal-950 uppercase tracking-wider mb-8">
              Rango de Tiempo
            </label>
            
            <div className="mt-4">
                <InteractiveTimeSlider 
                  inicio={formData.HoraInicio} 
                  fin={formData.HoraFinal} 
                  onChange={handleSliderChange} 
                />
            </div>

            {/* Inyección del Ranking de Horas como sugerencia compacta */}
            <RankingHoras variant="modal" />

            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-[#f0f5e9] border border-sky-300 rounded-xl p-3 text-center text-xl font-black text-slate-900 focus:ring-2 focus:ring-sky-500/30 outline-none shadow-inner"
                  value={formData.HoraInicio}
                  onChange={(e) => setFormData({...formData, HoraInicio: e.target.value})}
                />
              </div>
              <div className="text-teal-800 font-black text-2xl">-</div>
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-[#f0f5e9] border border-sky-300 rounded-xl p-3 text-center text-xl font-black text-slate-900 focus:ring-2 focus:ring-sky-500/30 outline-none shadow-inner"
                  value={formData.HoraFinal}
                  onChange={(e) => setFormData({...formData, HoraFinal: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4 pt-2 border-t border-sky-200">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-[#dce9e8] hover:bg-[#c9e1e2] text-sky-950 rounded-xl font-bold transition-all border border-sky-200">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-700 to-teal-700 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-900/10">
              <Save className="w-5 h-5" />
              {isEditing ? "Guardar Cambios" : "Crear Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
