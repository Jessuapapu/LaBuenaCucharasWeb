import type { Platillo } from "../interfaces/Platillos";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

export async function crearPlatillo(nuevoPlatillo: Platillo): Promise<Platillo> {
    const response = await fetch(`${API_URL}/platillos/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(nuevoPlatillo)
    })
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "No se creo el nuevo platillo")
    }
    return response.json();
}

export async function ActualizarPlatillo(id_Platillo: number, payload: Partial<Platillo>) {
    const response = await fetch(`${API_URL}/platillos/${id_Platillo}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
    })
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "No se creo el nuevo platillo")
    }
    return response.json();
}


export async function getPlatillos(): Promise<any[]> {
    const response = await fetch(`${API_URL}/platillos/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error("Error al obtener platillos");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function getPlatillosDestacados(): Promise<any[]> {
    const fecha: Date = new Date();
    const finalmes: number = new Date(fecha.getFullYear(),fecha.getMonth()+1,0).getDate()

    console.log(`${API_URL}/informe/ranking/comedor?FechaInicio=${fecha.getFullYear()}-${fecha.getMonth()+1}-00&fechaFinal=${fecha.getFullYear()}-${fecha.getMonth()}-${finalmes}`)
    const response = await fetch(`${API_URL}/informe/ranking/comedor?FechaInicio=${fecha.getFullYear()}-${fecha.getMonth()+1}-01&fechaFinal=${fecha.getFullYear()}-${fecha.getMonth()+1}-${finalmes}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error("Error al obtener platillos");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}