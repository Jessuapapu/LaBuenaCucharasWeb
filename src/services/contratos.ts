import { mapContratos } from "../map/contratos";

const API_URL = import.meta.env.VITE_API_URL;

//obtiene los contratos
export async function getContratosByCliente(idCliente: number) {
  const res = await fetch(`${API_URL}/clientes/contratos/${idCliente}`);

  if (!res.ok) throw new Error("Error al obtener contratos");

  const data = await res.json();

  return mapContratos(data.data ?? data);
}