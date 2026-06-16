import { IngredientesMapper } from "../map/ingredientes";
import type { Ingredientes } from "../interfaces/Platillos";

const API_URL = import.meta.env.VITE_API_URL;

//const token = localStorage.getItem("access_token");
// Función auxiliar para obtener el token en tiempo real (evita problemas si el token cambia o se refresca)
//Y da pereaza escribir de nuevo lo mismo
const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  }
}

export async function obtenerIngredientes(): Promise<Ingredientes[]> {
    const response= await fetch(`${API_URL}/ingrediente/`, { method: "GET", headers: getHeaders() })
    if (!response.ok) {
            throw new Error(`Error al obtener las facturas. Estado: ${response.status}`);
        }
    
        const data = await response.json();
        return IngredientesMapper.toList(data);
}

export async function crearIngrediente(nombre: string): Promise<boolean> {
  if (!nombre || !nombre.trim()) {
    // Si viene de un input con espacios vacíos
    if (!nombre.trim()) return false;
  }

  const response = await fetch(`${API_URL}/ingrediente/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ Nombre: nombre.trim() }) // Se envía en el formato esperado por el backend
  });

  if (!response.ok) {
    console.error(`Error al crear ingrediente. Estado: ${response.status}`);
    return false;
  }

  return true;
}

export async function actualizarIngrediente(id: number, nombreNuevo: string, stock: number): Promise<boolean> {
  if (!id || !nombreNuevo.trim()) return false;

  const response = await fetch(`${API_URL}/ingrediente/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      NombreNuevo: nombreNuevo.trim(),
      stock: stock
    })
  });

  if (!response.ok) {
    console.error(`Error al actualizar ingrediente #${id}. Estado: ${response.status}`);
    return false;
  }

  return true;
}

export async function crearRelacionPlatilloIngrediente(listaIngredientesIds: number[], idPlatillo?: number, nombrePlatillo?: string): Promise<boolean> {
  
  if (!idPlatillo && !nombrePlatillo) return false;

  const response = await fetch(`${API_URL}/ingrediente/relacion`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      listaIngrediente: listaIngredientesIds,
      IdPlatillo: idPlatillo || null,
      NombrePlatillo: nombrePlatillo || null
    })
  });

  if (!response.ok) {
    console.error(`Error al asociar ingredientes al platillo. Estado: ${response.status}`);
    return false;
  }

  return true;
}