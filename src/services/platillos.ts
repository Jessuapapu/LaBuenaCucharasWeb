import type { Platillo } from "../interfaces/Platillos";

const API_URL = import.meta.env.VITE_API_URL;

export async function crearPlatillo(nuevoPlatillo: Platillo): Promise<Platillo> {
    const response= await fetch(`${API_URL}/platillos/`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },body: JSON.stringify(nuevoPlatillo)
    })
    if(!response.ok){
        const error= await response.json().catch(()=> ({}));
        throw new Error(error.detail|| "No se creo el nuevo platillo")
    }
    return response.json();
}

export async function ActualizarPlatillo(id_Platillo: number, payload: Partial<Platillo>) {
    const response= await fetch(`${API_URL}/platillos/${id_Platillo}`,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },body: JSON.stringify(payload)
    })
    if(!response.ok){
        const error= await response.json().catch(()=> ({}));
        throw new Error(error.detail|| "No se creo el nuevo platillo")
    }
    return response.json();
}