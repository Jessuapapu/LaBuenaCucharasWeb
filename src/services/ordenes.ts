import { mapOrdenes } from "../map/ordenes";
import type { CrearOrden, ApiResponseCrearOrden } from "../interfaces/Ordenes";

const API_URL = import.meta.env.VITE_API_URL;

export async function getOrdenesByCliente(idCliente: number) {
  const res = await fetch(`${API_URL}/clientes/detalles/${idCliente}`);

  if (!res.ok) throw new Error("Error al obtener ordenes");

  const data = await res.json();

  return mapOrdenes(data.data ?? data);
}

export async function crearOrden(nuevaOrden: CrearOrden): Promise<ApiResponseCrearOrden> {
    const response = await fetch(`${API_URL}/ordenes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaOrden),
    });
    const data= await response.json();
    if (!response.ok) {
        throw new Error(data.detail || "Error al registrar la orden");
    }
    return data;
}

export async function actualizarOrden(idOrden: number, payload: Partial<CrearOrden>) {
    const response =await fetch(`${API_URL}/ordenes/detalles/${idOrden}`,{
        method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Error al actualizar la orden");
        }
        return data;
}