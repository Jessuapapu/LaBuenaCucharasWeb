import { useEffect, useCallback } from "react";
import { socket } from "../../services/websocket";

// Definimos la estructura de datos que tu backend (OrdenComedorIN) espera recibir
interface PayloadOrdenComedor {
    IdMesa: number;
    Detalles: any[]; 
}

export function useComedorSocket(onOrdenActualizada?: (idMesa: number) => void) {
    
    useEffect(() => {
        // Escuchar cuando el backend avisa que una mesa sufrió cambios
        const handleOrdenActualizada = (data: { IdMesa: number }) => {
            console.log(`Mesa #${data.IdMesa} ha sido actualizada en tiempo real.`);
            if (onOrdenActualizada) {
                onOrdenActualizada(data.IdMesa);
            }
        };

        // Escuchar errores específicos emitidos por el servidor al cliente (to=sid)
        const handleGenericError = (error: { MENSAJE: string }) => {
            alert(`Error del Servidor: ${error.MENSAJE}`);
        };

        // Suscripción a eventos del backend
        socket.on("orden_actualizada", handleOrdenActualizada);
        socket.on("error_generar", handleGenericError);
        socket.on("error_actualizar", handleGenericError);

        // Limpieza de eventos cuando el usuario sale de la vista del comedor
        return () => {
            socket.off("orden_actualizada", handleOrdenActualizada);
            socket.off("error_generar", handleGenericError);
            socket.off("error_actualizar", handleGenericError);
        };
    }, [onOrdenActualizada]);

    // ---- MÉTODOS DE EMISIÓN HACIA FASTAPI ----

    // Abrir orden en una mesa vacía
    const crearNuevaOrden = useCallback((idMesa: number, detalles: any[]) => {
        const payload: PayloadOrdenComedor = { IdMesa: idMesa, Detalles: detalles };
        socket.emit("crear_orden", payload);
    }, []);

    // Modificar/Agregar platos a una orden existente
    const actualizarOrdenMesa = useCallback((idMesa: number, detalles: any[]) => {
        const payload: PayloadOrdenComedor = { IdMesa: idMesa, Detalles: detalles };
        socket.emit("actualizar_orden", payload);
    }, []);

    // Anular la orden de la mesa
    const cancelarOrdenMesa = useCallback((idMesa: number, detalles: any[] = []) => {
        const payload: PayloadOrdenComedor = { IdMesa: idMesa, Detalles: detalles };
        socket.emit("cancelar_orden", payload);
    }, []);

    // Cerrar cuenta / Guardar como ENTREGADO
    const finalizarYGuardarOrden = useCallback((idMesa: number, detalles: any[] = []) => {
        const payload: PayloadOrdenComedor = { IdMesa: idMesa, Detalles: detalles };
        socket.emit("guardar_orden", payload);
    }, []);

    return {
        crearNuevaOrden,
        actualizarOrdenMesa,
        cancelarOrdenMesa,
        finalizarYGuardarOrden,
        isConnected: socket.connected
    };
}