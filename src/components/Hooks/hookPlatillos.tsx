import { useState, useEffect, useCallback } from "react";
import { getPlatillos } from "../../services/platillos"; 
import { getVentasPlatillos } from "../../services/ordenes";

export function usePlatillos() {
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatillos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getPlatillos();
      setPlatillos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el catálogo de platillos";
      console.error(errorMessage);
      setError(errorMessage);
      setPlatillos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatillos();
  }, [fetchPlatillos]);

  // Calculamos los destacados aquí mismo
  const destacados = platillos.slice(0, 4);

  return { 
    platillos, 
    destacados, 
    loadingPlatillos: loading, 
    errorPlatillos: error,
    refetchPlatillos: fetchPlatillos 
  };
}

export function useVentasPlatillos() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getVentasPlatillos();
      setVentas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar estadísticas de ventas";
      console.error(errorMessage);
      setError(errorMessage);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  return { 
    ventas, 
    loadingVentas: loading, 
    errorVentas: error,
    refetchVentas: fetchVentas 
  };
}


