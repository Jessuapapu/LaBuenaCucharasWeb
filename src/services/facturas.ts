
const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

import type { PayloadFactura, RespuestaFacturasPaginada } from "../interfaces/Factura";


export async function crearFactura(payload: PayloadFactura): Promise<any> {
    const response = await fetch(`${API_URL}/facturas/`, {
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
    const response = await fetch(`${API_URL}/facturas/`, {
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
export async function getFacturasPag(
    pagina: number = 1, 
    rows: number = 10, 
    filtros: Record<string, any> = {},
    signal?: AbortSignal
): Promise<RespuestaFacturasPaginada> {
    
    // 1. Construimos los Query Params base de la paginación
    const params = new URLSearchParams({
        pagina: pagina.toString(),
        rows: rows.toString(),
    });

    // 2. Inyectamos de forma dinámica los filtros activos (id_cliente, montos, fechas, etc.) si existen
    Object.keys(filtros).forEach(key => {
        const valor = filtros[key];
        if (valor !== null && valor !== undefined && valor !== "") {
            params.append(key, valor.toString());
        }
    });

    // 3. Realizamos la petición enviando los params en la URL (?pagina=1&rows=10...)
    const response = await fetch(`${API_URL}/facturas/?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        signal // Permite cancelar peticiones colgadas con el AbortController del Hook
    });

    if (!response.ok) {
        throw new Error(`Error al obtener las facturas. Estado: ${response.status}`);
    }

    const json = await response.json();
    
    // 4. Retornamos la estructura asegurando que cumpla con la interfaz
    return {
        data: json.data || [],
        total: json.total || 0,
        pagina: json.pagina || pagina,
        rows: json.rows || rows
    };
}

export async function actualizarFactura(
    idFactura: number, 
    payload: PayloadFactura
): Promise<any> {
    if (!idFactura) {
        throw new Error("El ID de la factura es obligatorio para realizar una actualización.");
    }

    const response = await fetch(`${API_URL}/facturas/${idFactura}`, {
        method: "PUT", // O PATCH, dependiendo de cómo tengas configurada tu ruta en FastAPI
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Error al actualizar la factura #${idFactura}. Verifica los datos.`);
    }

    return await response.json();
}