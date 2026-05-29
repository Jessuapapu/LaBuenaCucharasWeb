import { useState, useEffect, useCallback } from 'react';
import { comedorService } from '../../services/comedor';
import type { Mesa } from '../../interfaces/Comedor';

export function useComedor() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComedor = useCallback(async () => {
    try {
      const mesasTransformadas = await comedorService.obtenerMesas();
      setMesas(mesasTransformadas);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el comedor");
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarMesa = async () => {
    try {
      await comedorService.crearMesa();
      await fetchComedor();
    } catch (err) {
      alert("Error al intentar añadir una mesa");
    }
  };

  useEffect(() => {
    fetchComedor();
    
    // Polling opcional: actualiza cada 10 segundos
    const interval = setInterval(fetchComedor, 10000);
    return () => clearInterval(interval);
  }, [fetchComedor]);

  return { mesas, loading, error, refresh: fetchComedor, agregarMesa };
}