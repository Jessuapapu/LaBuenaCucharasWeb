import { useState, useEffect, useCallback } from "react";
import type { CrearOrden } from "../../interfaces/Ordenes";
import { actualizarOrden, crearOrden } from "../../services/ordenes";
import { getVentasSemanales, obtenerTodasLasOrdenes, obtenerTodosLosPlatillos } from "../../services/ordenes"; 
import type { Platillo } from "../../interfaces/Platillos";

export function useOrdenes() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    
    // Nuevo estado para almacenar las ventas
    const [ordenes, setOrdenes] = useState<any[]>([]);
    const [platillos, setPlatillos] = useState<Platillo[]>([]);
    const [ventasSemanales, setVentasSemanales] = useState<any[]>([]);

    const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dataOrdenes, dataPlatillos] = await Promise.all([
        obtenerTodasLasOrdenes(),
        obtenerTodosLosPlatillos()
      ]);
      setOrdenes(dataOrdenes || []);
      setPlatillos(dataPlatillos || []);
    } catch (err: any) {
      console.error("Error al sincronizar datos:", err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga automática inicial
  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  // Guardar/Crear orden
  const guardarOrden = async (nuevaOrden: CrearOrden) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await crearOrden(nuevaOrden);
      setSuccess(true);
      fetchOrdenes(); // Auto-refrescar
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar la orden";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado o detalles de la orden
  const actualizarOrdenhook = async (id: number, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actualizarOrden(id, payload);
      fetchOrdenes(); // Auto-refrescar para actualizar la UI padre
      return res;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar la orden";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarVentasSemanales = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVentasSemanales(signal);
      setVentasSemanales(data || []);
      return data;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    ordenes,
    platillos,
    ventasSemanales,
    fetchOrdenes,
    guardarOrden,
    actualizarOrden: actualizarOrdenhook,
    cargarVentasSemanales,
    loading,
    error,
    success
  };
}