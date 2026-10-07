import { useState, useEffect, useCallback } from "react";
import { getRankingComedor } from "../../context/Services/analytics";
import type { PlatilloRanking } from "../Map/analytics";

import { informesService} from "../../context/Services/analytics";
import type { RangoHorasData } from "../../context/Interfaces/cambiosdehora";

export function useRankingComedor(fechaInicio?: string, fechaFin?: string) {
  const [data, setData] = useState<PlatilloRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRanking = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const ranking = await getRankingComedor(fechaInicio, fechaFin, signal);
      setData(ranking);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || "Error al cargar el ranking analítico.");
      }
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    const controller = new AbortController();
    cargarRanking(controller.signal);
    return () => controller.abort();
  }, [cargarRanking]);

  return { data, loading, error, refetch: () => cargarRanking() };
}



export function useHorasConcurridas(fechaInicio: string, fechaFinal: string) {
  const [data, setData] = useState<RangoHorasData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        // Llamamos al servicio abstraído
        const result = await informesService.obtenerRankingHoras(fechaInicio, fechaFinal);
        setData(result);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el ranking de horas.');
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutamos si tenemos ambas fechas válidas
    if (fechaInicio && fechaFinal) {
      fetchDatos();
    }
  }, [fechaInicio, fechaFinal]);

  return { data, loading, error };
}