import { mapOrdenes } from "../map/ordenes";
import type { CrearOrden, ActualizarOrden } from "../interfaces/Ordenes";

const API_URL = import.meta.env.VITE_API_URL;

export async function getOrdenesByCliente(idCliente: number) {
  const res = await fetch(`${API_URL}/clientes/${idCliente}`);

  if (!res.ok) throw new Error("Error al obtener ordenes");

  const data = await res.json();

  return mapOrdenes(data.data ?? data);
}

export async function crearOrden(nuevaOrden: CrearOrden) {

    const response = await fetch(`${API_URL}/ordenes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaOrden),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.detail || "Error al registrar la orden"
        );
    }
    return response.json();
}

export async function actualizarOrden(idOrden: number, payload: any) {
    const response =await fetch(`${API_URL}/ordenes/${idOrden}`,{
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