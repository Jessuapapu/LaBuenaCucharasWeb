import { mapContratos } from "../map/contratos";
import type { NuevoContrato } from "../interfaces/Contratos";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

//obtiene los contratos
export async function getContratosByCliente(idCliente: number) {
  const res = await fetch(`${API_URL}/clientes/contratos/${idCliente}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Inyección de seguridad
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  if (!res.ok) throw new Error("Error al obtener contratos");

  const data = await res.json();

  return mapContratos(data.data ?? data);
}


export async function crearContrato(datos: NuevoContrato): Promise<void> {
  const response = await fetch(`${API_URL}/clientes/contratos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Inyección de seguridad
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("Error al crear el contrato. Estado: " + response.status);
  }

  await response.json();
}


export async function getContratos(): Promise<any[]> {
  const response = await fetch(`${API_URL}/clientes/contratos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`Error al cargar los contratos. Estado: ${response.status}`);
  }

  const rawData = await response.json();
  const dataArray = Array.isArray(rawData) ? rawData : [];

  // MAPEO DEFENSIVO: Convertimos las propiedades del backend al formato que espera la tabla
  return dataArray.map((c: any) => ({
    idContrato: c.idContrato ?? c.IdContrato ?? c.id_contrato,
    numeroContrato: c.numeroContrato ?? c.NumeroContrato ?? c.numero_contrato,
    idCliente: c.idCliente ?? c.IdCliente ?? c.id_cliente,
    fechaInicio: c.fechaInicio ?? c.FechaInicio ?? c.fecha_inicio,
    fechaVencimiento: c.fechaVencimiento ?? c.FechaVencimiento ?? c.fecha_vencimiento,
    presupuesto: c.presupuesto ?? c.Presupuesto ?? 0,
    estado: c.estado ?? c.Estado ?? "Desconocido"
  }));
}