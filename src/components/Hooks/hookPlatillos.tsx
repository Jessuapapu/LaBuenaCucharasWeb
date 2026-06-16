import { useState, useEffect, useCallback } from "react";
import { getPlatillos, getPlatillosDestacados } from "../../services/platillos"; 
import { getVentasPlatillos } from "../../services/ordenes";
import type { categoriaPlatillo } from "../../interfaces/Platillos";

export function usePlatillos() {
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [platillosDetacados, setPlatillosDetacados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatillos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getPlatillos();
      setPlatillos(data);
      const dataDestacatados = await getPlatillosDestacados();
      setPlatillosDetacados(dataDestacatados);
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
  console.log(platillos)
  console.log(platillosDetacados)
  const destacados = platillosDetacados.slice(0, 4);

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

export function usePlatillosForm() {
  const [listaCategorias, setListaCategorias] = useState<categoriaPlatillo[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState<boolean>(false);

  useEffect(() => {
    setLoadingCategorias(true);
    fetch("http://127.0.0.1:8001/platillos/categoria")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data) => setListaCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías:", err))
      .finally(() => setLoadingCategorias(false));
  }, []);

  return { listaCategorias, loadingCategorias };
}

