import type { Proveedor, NuevoProveedor, PayloadRegistro } from "../interfaces/Proveedor";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

export const proveedoresServiceEditar = {
    actualizarProveedor: async (id: number, datos: Proveedor): Promise<void> => {
        const response = await fetch(`${API_URL}/proveedores/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el proveedor");
        }
    }
};

export const proveedoresServiceNuevo = {

    crearProveedor: async (datos: NuevoProveedor): Promise<void> => {
        const response = await fetch(`${API_URL}/proveedores/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            throw new Error("Error al crear el proveedor. Estado: " + response.status);
        }

        // Esperar el JSON para confirmar la finalización de la API
        await response.json();
    }
};

export const bodegaService = {
    /**
     * Crea un nuevo registro en bodega.
     * Los parámetros se envían por URL según la estructura actual del backend.
     */
    crearRegistro: async (costoTotal: number, idProveedor: number, totalIngresado: number): Promise<void> => {
        const url = `${API_URL}/bodega/?costo_total=${costoTotal}&id_proveedor=${idProveedor}&total_ingresado=${totalIngresado}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            throw new Error("Error al crear el registro. Estado: " + response.status);
        }

        await response.json();
    }
};

export const obtenerProveedoresServices = {
    obtenerProveedores: async (): Promise<Proveedor[]> => {
        const response = await fetch(`${API_URL}/proveedores/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // Inyección de seguridad
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) {
            throw new Error("Error al obtener la lista de proveedores");
        }
        return await response.json();
    }
}


export async function actualizarRegistro(id: number, payload: PayloadRegistro): Promise<void> {
    const response = await fetch(`${API_URL}/registros/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Error al actualizar el registro");
    }
}

export async function getProveedores(): Promise<Proveedor[]> {
    const response = await fetch(`${API_URL}/proveedores/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error(`Error al obtener proveedores. Estado: ${response.status}`);
    }

    return response.json();
}