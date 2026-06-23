import { useState, useEffect } from "react";
import type { Menu_dario } from "../../interfaces/Platillos";

// Estructura para el select de platillos disponibles
interface PlatilloOption {
  nombre_platillo: string;
}

interface ModalNuevoMenuProps {
  MenuData?: Menu_dario | null; // Si existe, entra en modo edición
  listaPlatillos: PlatilloOption[];
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function ModalMenuDia({ MenuData, listaPlatillos, onClose, onSave }: ModalNuevoMenuProps) {
  const isEditing = !!MenuData?.id;

  // Inicialización de estados sincronizados con la interfaz real del backend
  const [fechadia, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [nombrePlatillo, setNombrePlatillo] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState<number>(0); // Mapea a 'Monto'
  const [horaMenu, sethoraMenu] = useState(""); // Mapea a 'Hora'

  const [loading, setLoading] = useState(false);

  // Carga de datos al editar un registro existente
  useEffect(() => {
    if (MenuData) {
      // Manejo seguro por si la fecha viene con formato ISO completo o string simple de fecha
      const fechaFormateada = MenuData.Fecha 
        ? new Date(MenuData.Fecha).toISOString().split("T")[0] 
        : new Date().toISOString().split("T")[0];

      setFecha(fechaFormateada);
      setNombrePlatillo(MenuData.NombrePlatillo || "");
      setPrecioUnitario(MenuData.Monto || 0);
      
      // Si la hora viene con segundos del backend (ej. "12:30:00"), recortamos a "HH:mm" para el input html
      if (MenuData.Hora) {
        sethoraMenu(MenuData.Hora.substring(0, 5));
      } else {
        sethoraMenu("");
      }
    }
  }, [MenuData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechadia || !nombrePlatillo || !horaMenu) {
      alert("Por favor completa todos los campos mandatorios (Fecha, Platillo y Hora).");
      return;
    }

    setLoading(true);

    // Payload unificado con las claves requeridas por la API de FastAPI
    const payload: Menu_dario = {
      id: MenuData?.id,
      Fecha: fechadia,
      NombrePlatillo: nombrePlatillo,
      Monto: Number(precioUnitario),
      Hora: horaMenu // Envía "HH:mm" compatible con datetime.time en SQLModel
    };

    try {
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error al procesar el menú diario:", error);
      alert("Error al guardar en el servidor. Verifica las reglas de red.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 p-6 rounded-2xl text-white max-w-md w-full shadow-2xl border border-slate-800 relative">
        
        {/* Botón de Cierre */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Encabezado */}
        <h2 className="text-xl font-black text-blue-400 tracking-tight">
          {isEditing ? "Modificar Programación" : "Asignar Platillo al Menú"}
        </h2>
        <p className="text-slate-400 text-xs mt-1 mb-5">
          Establece el precio (Monto) y la hora de disponibilidad del servicio diario.
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Fecha */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fecha del Menú</label>
            <input
              type="date"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 transition-all font-medium"
              value={fechadia}
              onChange={(e) => setFecha(e.target.value)}
              disabled={isEditing}
              required
            />
          </div>

          <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            
            {/* Nombre del Platillo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seleccionar Platillo</label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 outline-none transition-all font-medium"
                value={nombrePlatillo}
                onChange={(e) => setNombrePlatillo(e.target.value)}
                required
              >
                <option value="" disabled className="text-slate-500">Elige un platillo de la base...</option>
                {(listaPlatillos || []).map((p, i) => (
                  <option key={i} value={p.nombre_platillo} className="bg-slate-900">
                    {p.nombre_platillo}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto*/}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monto del Día (C$)</label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 outline-none transition-all font-mono font-bold disabled:opacity-50"
                value={precioUnitario || ""}
                onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                disabled={isEditing} // Bloqueado en edición según tu código original
                required
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hora de Servicio</label>
              <input
                type="time"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 outline-none transition-all font-medium"
                value={horaMenu}
                onChange={(e) => sethoraMenu(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex justify-center items-center
                ${loading ? "bg-slate-700 cursor-wait text-slate-400" : "bg-blue-600 hover:bg-blue-500 active:scale-98"}`}
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Confirmar"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}