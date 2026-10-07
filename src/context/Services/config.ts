import type { CambioDeHoraModel, CambioDeHoraModelEditar } from "../Interfaces/cambiosdehora"; 

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

export const horariosService = {
  obtenerTodos: async (): Promise<CambioDeHoraModel[]> => {
    const res = await fetch(`${API_URL}/menu/horarios/`);
    if (!res.ok) throw new Error("Error al obtener los horarios");
    return res.json();
  },

  crear: async (payload: CambioDeHoraModel): Promise<void> => {
    const res = await fetch(`${API_URL}/menu/horarios/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Inyección de seguridad
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al crear el horario");
  },

  editar: async (payload: CambioDeHoraModelEditar): Promise<void> => {
    const res = await fetch(`${API_URL}/menu/horarios/si`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Inyección de seguridad
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al editar el horario");
  },

  eliminar: async (nombre: string): Promise<void> => {
    const res = await fetch(`${API_URL}/menu/horarios/${nombre}`, { 
      method: "DELETE" 
    });
    if (!res.ok) throw new Error("Error al eliminar el horario");
  }
};