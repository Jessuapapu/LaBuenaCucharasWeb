import { useState, useEffect, useCallback } from 'react';

const UrlApi = import.meta.env.VITE_URL_API || 'http://127.0.0.1:8001';

export interface DetalleOrden {
    nombre_platillo: string;
    cantidad: number;
    precio_unitario: number;
}

export interface OrdenHistorial {
    id_pedido: number;
    monto_total: number;
    fecha: string;
    cliente: {
        nombre_cliente: string;
        direccion_cliente: string;
    };
    estado_pedido: string;
    detalles: DetalleOrden[];
}

export function useGestionOrdenes(pagina: number, rows: number, nombeCliente: string) {
    const [ordenes, setOrdenes] = useState<OrdenHistorial[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrdenes = useCallback(async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem("access_token");
            const queryParams = new URLSearchParams({
                pagina: String(pagina),
                rows: String(rows),
                todo: "false"
            });
            
            if (nombeCliente) queryParams.append("nombeCliente", nombeCliente);

            const res = await fetch(`${UrlApi}/ordenes/?${queryParams.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            });

            if (!res.ok) throw new Error("Error al obtener las órdenes");
            const data = await res.json();
            setOrdenes(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, [pagina, rows, nombeCliente]);

    useEffect(() => {
        fetchOrdenes();
    }, [fetchOrdenes]);

    return { ordenes, cargando, error, refetch: fetchOrdenes };
}

export function useMetricasGlobales() {
    const [metricas, setMetricas] = useState({ pendientes: 0, entregados: 0, anulados: 0, ingresos: 0, total: 0 });
    const [cargando, setCargando] = useState(true);

    const fetchMetricas = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token");
            
            // 1. Calcular primer y último día del mes actual
            const hoy = new Date();
            const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
            const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

            // 2. Añadir parámetros de fecha y todo=true a la URL
            const url = `${UrlApi}/ordenes/?todo=true&fechaInicio=${primerDia}&fechaFinal=${ultimoDia}`;

            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            });
            
            if (!res.ok) return;
            const data = await res.json();
            
            let pen = 0, ent = 0, anu = 0, ing = 0;

            // 3. El backend ya filtró por fecha, solo iteramos para sumar
            data.forEach((o: OrdenHistorial) => {
                if (o.estado_pedido === 'PENDIENTE') pen++;
                else if (o.estado_pedido === 'ENTREGADO') ent++;
                else if (o.estado_pedido === 'ANULADO') anu++;
                
                if (o.estado_pedido !== 'ANULADO') ing += (o.monto_total || 0);
            });
            
            setMetricas({ pendientes: pen, entregados: ent, anulados: anu, ingresos: ing, total: data.length });
        } catch (error) {
            console.error("Error obteniendo métricas mensuales:", error);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        fetchMetricas();
    }, [fetchMetricas]);

    return { metricas, cargandoMetricas: cargando, refetchMetricas: fetchMetricas };
}

export function useMutarOrden() {
    const [procesando, setProcesando] = useState(false);

    const ejecutarMutacion = async (url: string, method: string, payload: any) => {
        setProcesando(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Error en la operación (${res.status})`);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setProcesando(false);
        }
    };

    const crearOrden = async (nombre_cliente: string, detalles: DetalleOrden[]) => {
        const payload = {
            fecha: new Date().toISOString().split('T')[0],
            nombre_cliente: nombre_cliente,
            detalle: detalles
        };
        return ejecutarMutacion(`${UrlApi}/ordenes/`, "POST", payload);
    };

    const actualizarOrden = async (id_orden: number, nombre_cliente: string, estado: string, detalles: DetalleOrden[]) => {
        const payload = {
            nombre_cliente: nombre_cliente,
            estado: estado,
            detalles: detalles
        };
        return ejecutarMutacion(`${UrlApi}/ordenes/detalles/${id_orden}`, "PUT", payload);
    };

    return { crearOrden, actualizarOrden, procesando };
}