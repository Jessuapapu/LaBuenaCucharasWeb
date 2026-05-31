// Si ya tienes API_URL definido arriba, úsalo.
const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");


import type { PayloadFactura } from "../interfaces/Factura";


export async function crearFactura(payload: PayloadFactura): Promise<any> {
    const response = await fetch(`${API_URL}/factura/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error("Error al emitir la factura. Verifica los datos.");
    }

    return await response.json();
}


export async function getFacturas(): Promise<any[]> {
    const response = await fetch(`${API_URL}/facturas`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error(`Error al obtener las facturas. Estado: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}