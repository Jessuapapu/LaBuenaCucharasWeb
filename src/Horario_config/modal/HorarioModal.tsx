import { Pencil, Plus, Save, X, Power } from "lucide-react";
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
    // Overlay con blur y un ligerísimo oscurecimiento para que el modal resalte más
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/30 animate-in fade-in duration-200">
      
      {/* Contenedor principal: Más redondeado (3xl) y con cristal definido */}
      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/60 bg-slate-800/30 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                {isEditing ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            {isEditing ? "Editar Rango" : "Nuevo Rango"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-6 sm:space-y-8">
          
          {/* Fila 1: Nombre y Estado */}
          <div className="flex flex-col sm:flex-row gap-5">
              {/* Input Nombre */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Nombre del Horario
                </label>
                <input 
                  type="text" required placeholder="Ej: Desayuno..."
                  className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 sm:p-4 text-white text-lg font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-inner placeholder:text-slate-600"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              {/* Botón Toggle de Estado */}
              <div className="flex flex-col gap-2 sm:w-1/3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Estado
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, estado: !formData.estado})}
                  className={`flex items-center justify-center gap-2 w-full p-3 sm:p-4 rounded-xl font-bold transition-all border shadow-inner ${
                      formData.estado 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  {formData.estado ? 'Activo' : 'Inactivo'}
                </button>
              </div>
          </div>

          {/* Contenedor del Rango */}
          <div className="p-5 sm:p-6 bg-slate-950/30 rounded-2xl border border-slate-800/50 shadow-inner">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">
              Rango de Tiempo
            </label>
            
            {/* Margen arriba para que la etiqueta flotante del slider no choque con el texto */}
            <div className="mt-4">
                <InteractiveTimeSlider 
                  inicio={formData.HoraInicio} 
                  fin={formData.HoraFinal} 
                  onChange={handleSliderChange} 
                />
            </div>

            {/* Inputs de Reloj (Extra grandes) */}
            <div className="flex items-center gap-3 sm:gap-6 mt-6">
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center text-xl sm:text-2xl font-black text-white focus:ring-2 focus:ring-sky-500 outline-none shadow-inner"
                  value={formData.HoraInicio}
                  onChange={(e) => setFormData({...formData, HoraInicio: e.target.value})}
                />
              </div>
              <div className="text-slate-600 font-black text-2xl">-</div>
              <div className="flex-1">
                <input 
                  type="time" required
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center text-xl sm:text-2xl font-black text-white focus:ring-2 focus:ring-sky-500 outline-none shadow-inner"
                  value={formData.HoraFinal}
                  onChange={(e) => setFormData({...formData, HoraFinal: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-4 bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 rounded-xl font-bold transition-all border border-slate-700/50">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] flex items-center justify-center gap-2 py-4 px-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <Save className="w-6 h-6" />
              {isEditing ? "Guardar Cambios" : "Crear Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}