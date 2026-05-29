import { pedidosMapper } from "../map/pedidos";
import type { OrdenVisualizar } from "../interfaces/Ordenes";

const API_URL = import.meta.env.VITE_API_URL;

export const pedidosService = {
  //Obtiene los pedidos activos de un cliente específico pasados por Query Params
  async getPedidosByCliente(idCliente: number, signal?: AbortSignal): Promise<OrdenVisualizar[]> {
    try {
      const response = await fetch(`${API_URL}/ordenes/?id_cliente=${idCliente}`, { signal });
      
      if (!response.ok) {
        throw new Error(`Error en el servidor de pedidos: ${response.status}`);
      }

      const json = await response.json();
      const nose= json.data || [];
      
      // Pasamos los datos crudos por el mapper antes de entregarlos al Hook
      return pedidosMapper.fromJsonList(nose);
    } catch (error) {
      console.error("Error en pedidosService.getPedidosByCliente:", error);
      throw error;
    }
  }
};