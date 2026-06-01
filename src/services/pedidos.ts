import { pedidosMapper } from "../map/pedidos";
import type { OrdenVisualizar } from "../interfaces/Ordenes";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");
// Función auxiliar para obtener el token en tiempo real (evita problemas si el token cambia o se refresca)
//Y da pereaza escribir de nuevo lo mismo
const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const pedidosService = {
  //Obtiene los pedidos activos de un cliente específico pasados por Query Params
  async getPedidosByCliente(idCliente: number, signal?: AbortSignal): Promise<OrdenVisualizar[]> {
    try {
      const response = await fetch(`${API_URL}/pedidos/?id_cliente=${idCliente}`, {
        signal,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Inyección de seguridad
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor de pedidos: ${response.status}`);
      }

      const json = await response.json();
      const rawPedidos = Array.isArray(json)? json: (json.data || []);

      // Pasamos los datos crudos por el mapper antes de entregarlos al Hook
      return pedidosMapper.fromJsonList(rawPedidos);
    } catch (error) {
      console.error("Error en pedidosService.getPedidosByCliente:", error);
      throw error;
    }
  },

  async crearPedido(pedidoPayload: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/pedidos/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(pedidoPayload)
      });

      if (!response.ok) {
        throw new Error(`Error al crear el pedido: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error en pedidosService.crearPedido:", error);
      return false;
    }
  },

  async actualizarPedido(idPedido: number, pedidoPayload: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/pedidos/${idPedido}/`, {
        method: "PUT", // Puedes cambiar a PATCH si tu backend maneja actualizaciones parciales
        headers: getHeaders(),
        body: JSON.stringify(pedidoPayload)
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el pedido: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error en pedidosService.actualizarPedido para ID ${idPedido}:`, error);
      return false;
    }
  }
};
