import { useState } from "react";
import type { CrearOrden} from "../../interfaces/Ordenes";
import { actualizarOrden, crearOrden, getOrdenesByCliente } from "../../services/ordenes";

//const API_URL = import.meta.env.VITE_API_URL;

export function useOrdenes(){
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const guardarOrden = async (nuevaOrden: CrearOrden) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const data = await crearOrden(nuevaOrden);
            setSuccess(true);
            return data;

        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado");
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
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

    // Devolvemos los estados y la función para que el formulario los use
    return {
        guardarOrden,
        actualizarOrden: actualizarOrdenhook,
        loading,
        error,
        success
    };
}