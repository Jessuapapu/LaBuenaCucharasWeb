import { useState, useEffect, useCallback } from 'react';

export interface Orden {
  IdOrden: number;
  HoraEntrada: string;
  HoraSalida: string | null;
  Activo: boolean;
}

export interface Mesa {
  id: number;
  estado: 'disponible' | 'ocupada';
  ordenActiva?: Orden;
}

export function useComedor() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComedor = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/comedor/");
      if (!response.ok) throw new Error("Error al conectar con el servidor");
      
      const data = await response.json();
      
      // Transformamos la estructura del backend a una más simple para el UI
      const mesasTransformadas: Mesa[] = data.Mesas.map((m: any) => {
        const activa = m.Ordenes.find((o: any) => o.Activo === true);
        return {
          id: m.Id,
          estado: activa ? 'ocupada' : 'disponible',
          ordenActiva: activa || undefined
        };
      });

      setMesas(mesasTransformadas);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el comedor");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para añadir una mesa nueva en el backend
  const agregarMesa = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/comedor/mesa", {
        method: "POST",
      });
      if (response.ok) {
        await fetchComedor(); // Refrescamos la lista
      }
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