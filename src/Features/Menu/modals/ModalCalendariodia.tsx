import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Menu_dario } from "../../../context/Interfaces/Platillos";

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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
      <div role="dialog" aria-modal="true" aria-labelledby="asignar-platillo-titulo" className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)]">
        
        {/* Botón de Cierre */}
        <button 
          type="button" 
          onClick={onClose} 
          aria-label="Cerrar formulario"
          className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Encabezado */}
        <div className="shrink-0 border-b border-slate-300/80 bg-[#dbe8ed] px-5 py-5 pr-14 sm:px-7">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Planificación diaria</p>
          <h2 id="asignar-platillo-titulo" className="text-xl font-extrabold tracking-tight text-slate-800">
            {isEditing ? "Modificar programación" : "Asignar platillo al menú"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Define el precio y el horario de disponibilidad.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7">
          
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha del menú</label>
            <input
              type="date"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 outline-none disabled:opacity-50 transition-all font-medium"
              value={fechadia}
              onChange={(e) => setFecha(e.target.value)}
              disabled={isEditing}
              required
            />
          </div>

          <div className="space-y-3.5 bg-[#dce7eb] p-4 rounded-2xl border border-slate-300">
            
            {/* Nombre del Platillo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Seleccionar platillo</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm focus:border-cyan-700 outline-none transition-all font-medium"
                value={nombrePlatillo}
                onChange={(e) => setNombrePlatillo(e.target.value)}
                required
              >
                <option value="" disabled className="text-slate-500">Elige un platillo disponible...</option>
                {(listaPlatillos || []).map((p, i) => (
                  <option key={i} value={p.nombre_platillo}>
                    {p.nombre_platillo}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto*/}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Monto del día (C$)</label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm focus:border-cyan-700 outline-none transition-all font-mono font-bold disabled:opacity-50"
                value={precioUnitario || ""}
                onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                disabled={isEditing} // Bloqueado en edición según tu código original
                required
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hora de servicio</label>
              <input
                type="time"
                className="w-full px-3 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 text-sm focus:border-cyan-700 outline-none transition-all font-medium"
                value={horaMenu}
                onChange={(e) => sethoraMenu(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all shadow-md flex justify-center items-center
                ${loading ? "bg-slate-500 cursor-wait" : "bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-900/15 active:scale-98"}`}
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Confirmar"}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
