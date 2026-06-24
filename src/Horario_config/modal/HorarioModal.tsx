import { Pencil, Plus, Save, X, Power } from "lucide-react";
import type { CambioDeHoraModelEditar } from "../../interfaces/cambiosdehora";
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
    // Overlay de cristal (sin fondo oscuro sólido)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Contenedor principal con tu paleta exacta: bg-slate-900/40 y bordes translúcidos */}
      <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header (mismo estilo que tu tabla) */}
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            {isEditing ? "Editar Rango" : "Nuevo Rango"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          
          {/* Fila 1: Nombre (y Estado solo si estamos editando) */}
          <div className="flex flex-col sm:flex-row gap-5">
              
              {/* Input Nombre: Al tener flex-1, tomará todo el ancho si el botón de Estado no está */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Nombre del Horario
                </label>
                <input 
                  type="text" required placeholder="Ej: Desayuno..."
                  className="w-full bg-slate-950/20 border border-slate-800/60 rounded-xl p-3 text-white text-lg font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-inner placeholder:text-slate-600"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              {/* Botón Toggle de Estado (CONDICIONAL: Solo aparece si isEditing es true) */}
              {isEditing && (
                <div className="flex flex-col gap-2 sm:w-1/3 animate-in slide-in-from-right-4 duration-300">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Estado
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, estado: !formData.estado})}
                    className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl font-bold transition-all border shadow-inner ${
                        formData.estado 
                        ? 'bg-green-900/50 border-green-500/30 text-green-400 hover:bg-green-800/50' 
                        : 'bg-red-900/50 border-red-500/30 text-red-400 hover:bg-red-800/50'
                    }`}
                  >
                    <Power className="w-5 h-5" />
                    {formData.estado ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              )}
          </div>

          {/* Contenedor del Rango (con bg-slate-950/20 que usas en el interior de tus tarjetas) */}
          <div className="p-5 bg-slate-950/20 rounded-xl border border-slate-800/50 shadow-inner">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">
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
                  className="w-full bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 text-center text-xl font-black text-white focus:ring-2 focus:ring-sky-500 outline-none shadow-inner"
                  value={formData.HoraInicio}
                  onChange={(e) => setFormData({...formData, HoraInicio: e.target.value})}
                />
              </div>
              <div className="text-slate-600 font-black text-2xl">-</div>
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 text-center text-xl font-black text-white focus:ring-2 focus:ring-sky-500 outline-none shadow-inner"
                  value={formData.HoraFinal}
                  onChange={(e) => setFormData({...formData, HoraFinal: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 rounded-xl font-bold transition-all border border-slate-800/50">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-500/20">
              <Save className="w-5 h-5" />
              {isEditing ? "Guardar Cambios" : "Crear Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}