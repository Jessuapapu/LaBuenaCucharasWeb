import type { IngredienteModel, IngredientePayload, RelacionPayload } from "../Interfaces/ingredientes";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
}

export const ingredientesService = {
    obtenerTodos: async (): Promise<IngredienteModel[]> => {
        const res = await fetch(`${API_URL}/ingrediente`, {
            method: "GET",
            headers: getHeaders(),

        });
        if (!res.ok) throw new Error("Error al obtener los ingredientes");
        return res.json();
    },

    crear: async (nombre: string): Promise<void> => {
        const payload: IngredientePayload = { NombreIngrediente: nombre, Stock: 0 };
        const res = await fetch(`${API_URL}/ingrediente`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al crear el ingrediente");
    },

    actualizar: async (id: number, nombre: string): Promise<void> => {
        const payload: IngredientePayload = { NombreIngrediente: nombre, Stock: 0 };
        const res = await fetch(`${API_URL}/ingrediente/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al actualizar el ingrediente");
    },

    // Nota: Agregado para que tu frontend esté completo, asumiendo que crearás el endpoint
    eliminar: async (id: number): Promise<void> => {
        const res = await fetch(`${API_URL}/ingrediente/${id}`,
            {
                method: "DELETE",
                headers: getHeaders(),
            });
        if (!res.ok) throw new Error("Error al eliminar el ingrediente");
    },

    vincularAPlatillo: async (payload: RelacionPayload): Promise<void> => {
        const res = await fetch(`${API_URL}/ingrediente/relacion`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al vincular los ingredientes");
    }
};