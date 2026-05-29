import { mapClientes } from "../map/clientes";
import type { cliente, NuevoCliente } from "../interfaces/Clientes";


const API_URL = import.meta.env.VITE_API_URL;


// Obtiene todos los clientes
export async function getClientes() {
  const res = await fetch(`${API_URL}/clientes`);

  if (!res.ok) throw new Error("Error al obtener clientes");

  const data = await res.json();
  return mapClientes(data);
}

// Obtiene por id
export async function getClienteById(id: number) {
  const response = await fetch(`${API_URL}/clientes/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener cliente");
  }

  return response.json();
}

// Actualiza un cliente
export async function actualizarCliente(idCliente: number | string | undefined, datosCliente: cliente): Promise<void> {
  const url = idCliente
    ? `${API_URL}/clientes/${idCliente}`
    : `${API_URL}/clientes/`; 

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosCliente),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar cliente");
  }
}

// Crea un cliente nuevo
export async function crearCliente(datos: NuevoCliente): Promise<void> {
  const response = await fetch(`${API_URL}/clientes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("Error al crear cliente. Estado: " + response.status);
  }

  await response.json(); 
}



