import { useState, useEffect, useCallback } from "react";
import { pedidosService } from "../Services/pedidos";
import type { OrdenVisualizar } from "../Interfaces/Ordenes";

export const usePedidos = (idCliente: number | null) => {
  const [pedidos, setPedidos] = useState<OrdenVisualizar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = useCallback(async (signal?: AbortSignal) => {
    if (!idCliente) {
      setPedidos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await pedidosService.getPedidosByCliente(idCliente, signal);
      setPedidos(data);
    } catch (err: any) {
      // Evitamos actualizar el estado si la petición fue cancelada a propósito por el AbortController
      if (err.name !== "AbortError") {
        setError(err.message || "Error al obtener los pedidos del cliente.");
      }
    } finally {
      setLoading(false);
    }
  }, [idCliente]);

  useEffect(() => {
    const controller = new AbortController();
    
    if (idCliente) {
      cargarPedidos(controller.signal);
    } else {
      setPedidos([]);
    }

    // Limpieza automática si el componente cambia de idCliente o se desmonta
    return () => {
      controller.abort();
    };
  }, [idCliente, cargarPedidos]);

  return {
    pedidos,
    loading,
    error,
    refrescarPedidos: () => cargarPedidos() // Permite recargar manualmente tras crear/modificar un pedido
  };
};