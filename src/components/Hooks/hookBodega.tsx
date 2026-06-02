// src/hooks/useBodega.ts
import { useState, useEffect, useCallback } from "react";
import { obtenerRegistrosBodega, obtenerInsumosBodega, obtenerIngredientesBodega } from "../../services/bodega";
import type { ItemInventario } from "../../interfaces/Bodega";
//Ingredientes es opcional
export function useBodega() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Solo hacemos fetch al historial
    obtenerRegistrosBodega()
      .then((jsonBodega) => {
        setData(jsonBodega);
      })
      .catch((err) => console.error("Error cargando historial:", err))
      .finally(() => setLoading(false));
      
  }, []);

  return { data, loading };
}

export function useinsumoseIngredientes(idRegistro?:number){
  const [loading, setloading]= useState(true)
  const [error, setError] = useState<string | null>(null);

  const [inventarioGeneral, setInventarioGeneral] = useState<ItemInventario[]>([]);
  const [ingredientes, setIngredientes] = useState<ItemInventario[]>([]);
  const [insumos, setInsumos] = useState<ItemInventario[]>([]);
  const [detalleItem, setDetalleItem] = useState<any | null>(null);

  const evaluarEstadoAlerta = useCallback((item: ItemInventario): { 
    necesitaReponer: boolean; 
    colorClase: string; 
    textoEstado: string; 
  } => {
    if (item.tipo === "INSUMO") {
      const estado = (item.stock_minimo) || "Alta";
      if (estado === "Baja") {
        return { necesitaReponer: true, colorClase: "text-red-400 bg-red-500/10 border-red-500/20", textoEstado: "Stock Crítico (Bajo)" };
      }
      if (estado === "Media") {
        return { necesitaReponer: false, colorClase: "text-amber-400 bg-amber-500/10 border-amber-500/20", textoEstado: "Stock Moderado" };
      }
      return { necesitaReponer: false, colorClase: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", textoEstado: "Stock Óptimo" };
    }
    // Lógica contable para INGREDIENTES de cocina
    const stockMinNum = Number(item.stock_minimo || 0);
    const esCritico = item.cantidad_actual <= stockMinNum;
    
    return {
      necesitaReponer: esCritico,
      colorClase: esCritico 
        ? "text-red-400 bg-red-500/10 border-red-500/20" 
        : "text-slate-400 bg-slate-900 border-slate-800",
      textoEstado: esCritico ? "Por debajo del mínimo contable" : "Disponible"
    };
  }, []);

  const cargarInventarioGeneral = useCallback(async () => {
    setloading(true);
    setError(null);
    try {
      const data = await obtenerRegistrosBodega();
      setInventarioGeneral(data);
    } catch (err: any) {
      setError(err.message || "Error al recopilar el inventario general de bodega.");
    } finally {
      setloading(false);
    }
  }, []);
  const cargarIngredientes = useCallback(async () => {
    setloading(true);
    setError(null);
    try {
      const data = await obtenerIngredientesBodega();
      setIngredientes(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener el catálogo de ingredientes.");
    } finally {
      setloading(false);
    }
  }, []);

  const cargarInsumos = useCallback(async () => {
    setloading(true);
    setError(null);
    try {
      const data = await obtenerInsumosBodega();
      setInsumos(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener el catálogo de insumos.");
    } finally {
      setloading(false);
    }
  }, []);

  useEffect(() => {
    cargarInventarioGeneral();
  }, [cargarInventarioGeneral]);

  return{
    loading,
    error,
    evaluarEstadoAlerta,
    inventarioGeneral,
    ingredientes,
    insumos,
    cargarIngredientes,
    cargarInsumos,
    cargarInventarioGeneral
  }
}
