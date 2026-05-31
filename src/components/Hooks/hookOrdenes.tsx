import { useState } from "react";
import type { CrearOrden } from "../../interfaces/Ordenes";
import { actualizarOrden, crearOrden } from "../../services/ordenes";
import { getVentasSemanales } from "../../services/ordenes"; // Asegúrate de importar el servicio

export function useOrdenes() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    
    // Nuevo estado para almacenar las ventas
    const [ventasSemanales, setVentasSemanales] = useState<any[]>([]);

    const guardarOrden = async (nuevaOrden: CrearOrden) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const data = await crearOrden(nuevaOrden);
            setSuccess(true);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const actualizarOrdenhook = async (id: number, payload: any) => {
        setLoading(true);
        setError(null);

        try {
            const res = await actualizarOrden(id, payload);
            return res;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error al actualizar la orden";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    
    const cargarVentasSemanales = async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getVentasSemanales(signal);
            setVentasSemanales(data);
            return data;
        } catch (err) {
            // Ignoramos el error si fue provocado intencionalmente por el AbortController
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Devolvemos los estados y la función para que el formulario/vista los use
    return {
        guardarOrden,
        actualizarOrden: actualizarOrdenhook,
        cargarVentasSemanales,
        ventasSemanales,
        loading,
        error,
        success
    };
}