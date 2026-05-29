import type { Mesa, MesaBackend } from "../interfaces/Comedor";


const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

export const comedorService = {
  obtenerMesas: async (): Promise<Mesa[]> => {
    const response = await fetch(`${API_URL}/comedor/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Inyección de seguridad
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    }
    );

    if (!response.ok) throw new Error("Error al conectar con el servidor");

    const data = await response.json();

    // Transformamos eliminando el 'any' gracias a MesaBackend
    return data.Mesas.map((m: MesaBackend): Mesa => {
      const activa = m.Ordenes.find((o) => o.Activo === true);
      return {
        id: m.Id,
        estado: activa ? 'ocupada' : 'disponible',
        ordenActiva: activa || undefined
      };
    });
  },

  crearMesa: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/comedor/mesa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Inyección de seguridad
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error("Error al intentar añadir una mesa");
    }
  }
};