import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

console.log(API_URL)
// Mapeo exacto del Recordset de tu Procedimiento Almacenado
export interface PedidoHistorial {
    IdPedido: number;
    MONTO_TOTAL: number;   // Cambiado a la nomenclatura de tu SP
    Estado: string;        // O.Estado
    NombreCliente: string; // C.NombreCliente
    Fecha?: string;        // Opcional por si deseas agregarlo al SELECT del SP luego
    
}

export function useGestionPedidos(pagina: number, rows: number, tipo: string = "") {
    const [pedidos, setPedidos] = useState<PedidoHistorial[]>([]);
    const [cargando, setCargando] = useState(true);

    const fetchPedidos = useCallback(async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem("access_token");
            const queryParams = new URLSearchParams({
                pagina: String(pagina),
                rows: String(rows),
                todo: "0"
            });
            // El parámetro se envía al backend para el WHERE de la PA
            if (tipo) queryParams.append("tipo", tipo);

            const res = await fetch(`${API_URL}/pedidos/?${queryParams.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) setPedidos(result.data);
        } catch (err) {
            console.error("Error al obtener pedidos:", err);
        } finally {
            setCargando(false);
        }
    }, [pagina, rows, tipo]);

    useEffect(() => { window.scrollTo(0,0); fetchPedidos(); }, [fetchPedidos]);

    return { pedidos, cargando, refetch: fetchPedidos };
}

// Hook para los detalles (MostrarDetallesPedidos)
export function useDetallesPedido(id_pedido: number | null) {
    const [detalles, setDetalles] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!id_pedido) return;
        const fetchDetalles = async () => {
            setCargando(true);
            try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${API_URL}/pedidos/${id_pedido}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) setDetalles(result.data);
            } catch (err) {
                console.error("Error detalles pedido:", err);
            } finally {
                setCargando(false);
            }
        };
        fetchDetalles();
    }, [id_pedido]);

    return { detalles, cargandoDetalles: cargando };
}

export function useMetricasPedidos() {
    // Reajustamos las métricas basándonos en los estados operativos retornados por la PA
    const [metricas, setMetricas] = useState({ pendientes: 0, entregados: 0, anulados: 0, total: 0 });
    const [cargando, setCargando] = useState(true);

    const fetchMetricas = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/pedidos/?todo=1`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (!result.success) return;
            
            let pen = 0, ent = 0, anu = 0;
            result.data.forEach((p: PedidoHistorial) => {
                const est = p.Estado?.toUpperCase();
                if (est === 'PENDIENTE') pen++;
                if (est === 'ENTREGADO') ent++;
                if (est === 'ANULADO') anu++;
            });
            
            setMetricas({ pendientes: pen, entregados: ent, anulados: anu, total: result.data.length });
        } catch (error) {
            console.error("Error al calcular métricas:", error);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { fetchMetricas(); }, [fetchMetricas]);
    return { metricas, cargandoMetricas: cargando, refetchMetricas: fetchMetricas };
}

export function useMutarPedido() {
    const [procesando, setProcesando] = useState(false);

    const crearPedido = async (listaIdOrdenes: number[], tipoPedido: string) => {
        setProcesando(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/pedidos/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ listaIdOrdenes, TipoPedido: tipoPedido })
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        } finally { setProcesando(false); }
    };

    // Actualizado para enviar la nueva lista de órdenes
    const actualizarPedido = async (id_pedido: number, estado: string, tipoPedido: string, listaIdOrdenes: number[]) => {
        setProcesando(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/pedidos/${id_pedido}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ Estado: estado, TipoPedido: tipoPedido, listaIdOrdenes }) 
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        } finally { setProcesando(false); }
    };

    return { crearPedido, actualizarPedido, procesando };
}