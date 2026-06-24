import { AnalyticsMapper, type PlatilloRanking } from "../map/analytics";
import type { RangoHorasData } from "../interfaces/cambiosdehora";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export async function getRankingComedor(fechaInicio?: string, fechaFin?: string, signal?: AbortSignal): Promise<PlatilloRanking[]> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("FechaInicio", fechaInicio);
  if (fechaFin) params.append("fechaFinal", fechaFin);

  const response = await fetch(`${API_URL}/informe/ranking/comedor?${params.toString()}`, {
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


export const informesService = {
  obtenerRankingHoras: async (fechaInicio: string, fechaFinal: string): Promise<RangoHorasData[]> => {
    const url = `${API_URL}/informe/ranking/comedor/horas?FechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error("Error al obtener el ranking de horas del servidor");
    }

    return response.json();
  }
};