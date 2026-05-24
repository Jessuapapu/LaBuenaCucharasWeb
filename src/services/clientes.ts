import { mapClientes } from "../map/clientes";

const API_URL = import.meta.env.VITE_API_URL;

//obtiene todos los clientes
export async function getClientes() {
  const res = await fetch(`${API_URL}/clientes`);

  if (!res.ok) throw new Error("Error al obtener clientes");

  const data = await res.json();

  return mapClientes(data);
}

export async function getClienteById(id: number) {

    const response = await fetch(`${API_URL}/clientes/${id}`);

    if (!response.ok) {
        throw new Error("Error al obtener cliente");
    }

    return response.json();
}