import { Pencil, Plus, Save, X } from "lucide-react";
import type {  CambioDeHoraModelEditar } from "../../interfaces/cambiosdehora";
import { InteractiveTimeSlider } from "../comunes/InteractiveTimeSlider";

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
    // Overlay solo con cristal, sin fondo de color
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Contenedor principal con tu clase exacta de la gráfica */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden">
        
        {/* Header con tu clase exacta de la tabla */}
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isEditing ? <Pencil className="w-5 h-5 text-sky-400" /> : <Plus className="w-5 h-5 text-sky-400" />}
            {isEditing ? "Editar Rango" : "Nuevo Rango"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Input Nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Nombre del Horario
            </label>
            <input 
              type="text" required placeholder="Ej: Desayuno, Almuerzo..."
              className="w-full bg-slate-950/20 border border-slate-900/40 rounded-xl p-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-inner"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          {/* Contenedor del Rango con tu estilo interno */}
          <div className="p-5 bg-slate-950/20 rounded-xl border border-slate-900/40 shadow-inner">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Rango de Tiempo
            </label>
            
            <InteractiveTimeSlider 
              inicio={formData.HoraInicio} 
              fin={formData.HoraFinal} 
              onChange={handleSliderChange} 
            />

            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-slate-900/40 border border-slate-800/50 rounded-lg p-2 text-center font-black text-white focus:ring-2 focus:ring-sky-500 outline-none shadow-inner"
                  value={formData.HoraInicio}
                  onChange={(e) => setFormData({...formData, HoraInicio: e.target.value})}
                />
              </div>
              <div className="text-slate-500 font-black">-</div>
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-slate-900/40 border border-slate-800/50 rounded-lg p-2 text-center font-black text-white focus:ring-2 focus:ring-sky-500 outline-none shadow-inner"
                  value={formData.HoraFinal}
                  onChange={(e) => setFormData({...formData, HoraFinal: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-2">
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