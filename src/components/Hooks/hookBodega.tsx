// src/hooks/useBodega.ts
import { useState, useEffect } from "react";
import { obtenerRegistrosBodega } from "../../services/bodega";

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