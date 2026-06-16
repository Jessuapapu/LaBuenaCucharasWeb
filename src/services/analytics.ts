import { AnalyticsMapper, type PlatilloRanking } from "../map/analytics";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export async function getRankingComedor( fechaInicio?: string, fechaFin?: string, signal?: AbortSignal): Promise<PlatilloRanking[]> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("FechaInicio", fechaInicio);
  if (fechaFin) params.append("fechaFinal", fechaFin); 

  const response = await fetch(`${API_URL}/ranking/comedor?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
    signal
  });

  if (!response.ok) {
    throw new Error(`Error al obtener analíticas del comedor. Estado: ${response.status}`);
  }

  const data = await response.json();
  return AnalyticsMapper.toPlatillosRanking(data);
}