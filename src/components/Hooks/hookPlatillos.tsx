import { useState, useEffect, useCallback, useMemo } from "react";
import { getPlatillos, getPlatillosDestacados } from "../../services/platillos"; 
import { getVentasPlatillos } from "../../services/ordenes";
import type { categoriaPlatillo } from "../../interfaces/Platillos";

const API_URL = import.meta.env.VITE_API_URL;

// Auxiliar para mantener los headers consistentes
const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export function usePlatillos(categoriaActiva: string= "TODOS") {
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [platillosDetacados, setPlatillosDetacados] = useState<any[]>([]);//es un raw/fila
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [platillosDestacados, setFormatoDestacados] = useState<any[]>([]);

  const fetchPlatillos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Paralelizamos las promesas para optimizar el tiempo de respuesta en mostrador
      const [dataPlatillos, dataDestacados] = await Promise.all([
        getPlatillos(),
        getPlatillosDestacados()
      ]);
      setPlatillos(dataPlatillos);
      setFormatoDestacados(dataDestacados);
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

  

  const platillosFiltrados = useMemo(() => {
    if (!categoriaActiva || categoriaActiva.toUpperCase() === "TODOS") return platillos;
    return platillos.filter(p => 
      p.nombre_categoria?.toString().toUpperCase() === categoriaActiva.toUpperCase()
    );
  }, [platillos, categoriaActiva]);

  // Calculamos los destacados aquí mismo
  const destacados = useMemo(()=> {
    if (!categoriaActiva || categoriaActiva.toUpperCase() === "TODOS") {
      return platillosDetacados.slice(0, 4);
    }
    return platillosDetacados
      .filter(p => p.nombre_categoria?.toString().toUpperCase() === categoriaActiva.toUpperCase())
      .slice(0, 4);
  }, [platillosDetacados, categoriaActiva]);

  return { 
    platillos: platillosFiltrados, 
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
    fetch(`${API_URL}/platillos/categoria`, {
      method: "GET",
      headers: getHeaders()
    })
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

