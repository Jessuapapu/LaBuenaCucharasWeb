import { mapContratos } from "../map/contratos";
import type { NuevoContrato } from "../interfaces/Contratos";
const API_URL = import.meta.env.VITE_API_URL;

//obtiene los contratos
export async function getContratosByCliente(idCliente: number) {
  const res = await fetch(`${API_URL}/clientes/contratos/${idCliente}`);

  if (!res.ok) throw new Error("Error al obtener contratos");

  const data = await res.json();

  return mapContratos(data.data ?? data);
}


export async function crearContrato(datos: NuevoContrato): Promise<void> {
  const response = await fetch(`${API_URL}/clientes/contratos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("Error al crear el contrato. Estado: " + response.status);
  }

  await response.json();
}