import { useState, useEffect, useCallback } from "react";
import { getRankingComedor } from "../../services/analytics";
import type { PlatilloRanking } from "../../map/analytics";

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