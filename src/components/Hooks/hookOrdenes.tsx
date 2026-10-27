import { useState, useEffect, useCallback, useRef } from "react";
import type { CrearOrden } from "../../context/Interfaces/Ordenes";
import { actualizarOrden, crearOrden } from "../../context/Services/ordenes";
import { getVentasSemanales, obtenerTodasLasOrdenes, obtenerTodosLosPlatillos } from "../../context/Services/ordenes"; 
import type { Platillo } from "../../context/Interfaces/Platillos";

export interface OrdenComedor {
  IdOrden: number;
  estado: string;
  montoTotal: number;
  fecha: string;
}

import type { Detalles } from "../modals/ModalMostrarDetalles";
import { socket } from "../../context/Services/websocket";


const API_URL = import.meta.env.VITE_API_URL;

export function useOrdenes() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    
    // Nuevo estado para almacenar las ventas
    const [ordenes, setOrdenes] = useState<any[]>([]);
    const [platillos, setPlatillos] = useState<Platillo[]>([]);
    const [ventasSemanales, setVentasSemanales] = useState<any[]>([]);

    const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dataOrdenes, dataPlatillos] = await Promise.all([
        obtenerTodasLasOrdenes(),
        obtenerTodosLosPlatillos()
      ]);
      setOrdenes(dataOrdenes || []);
      setPlatillos(dataPlatillos || []);
    } catch (err: any) {
      console.error("Error al sincronizar datos:", err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga automática inicial
  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  // Guardar/Crear orden
  const guardarOrden = async (nuevaOrden: CrearOrden) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await crearOrden(nuevaOrden);
      setSuccess(true);
      fetchOrdenes(); // Auto-refrescar
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar la orden";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado o detalles de la orden
  const actualizarOrdenhook = async (id: number, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actualizarOrden(id, payload);
      fetchOrdenes(); // Auto-refrescar para actualizar la UI padre
      return res;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar la orden";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
 const cargarVentasSemanales = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVentasSemanales(signal);
      setVentasSemanales(data || []);
      return data;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ordenes,
    platillos,
    ventasSemanales,
    fetchOrdenes,
    guardarOrden,
    actualizarOrden: actualizarOrdenhook,
    cargarVentasSemanales,
    loading,
    error,
    success
  };
}
export function useOrdenesMesa(idMesa: string | undefined) {
    const [ordenActiva, setOrdenActiva] = useState<OrdenComedor | null>(null);
    const [historial, setHistorial] = useState<OrdenComedor[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const cargarOrdenes = async () => {
        if (!idMesa) return;
        setCargando(true);
        try {
            // 🚀 AÑADIMOS HEADERS ANTI-CACHÉ Y UN TIMESTAMP PARA ENGAÑAR AL NAVEGADOR
            const timestamp = new Date().getTime(); 
            const [resActiva, resHistorial] = await Promise.all([
                fetch(`${API_URL}/comedor/mesa/${idMesa}/true?t=${timestamp}`, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }),
                fetch(`${API_URL}/comedor/mesa/${idMesa}/false?t=${timestamp}`, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } })
            ]);

            if (resActiva.status === 401 || resHistorial.status === 401) {
                const hayToken = localStorage.getItem("access_token");
                if (hayToken) {
                    window.location.href = "/login";
                } else {
                    throw new Error("Acceso de lectura para cliente (401)");
                }
            }
            if (!resActiva.ok || !resHistorial.ok) throw new Error("Error en el servidor");

            const dataActiva = await resActiva.json();
            const dataHistorial: OrdenComedor[] = await resHistorial.json();

            setOrdenActiva(Array.isArray(dataActiva) ? (dataActiva[0] || null) : dataActiva);
            setHistorial(dataHistorial);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarOrdenes();
    }, [idMesa]);

    return { ordenActiva, historial, cargando, error, refresh: cargarOrdenes };
}

export function useDetalleOrden() {
    const [detallesOrden, setDetallesOrden] = useState<Detalles[]>([]);
    const [cargandoDetalles, setCargandoDetalles] = useState<boolean>(false);

    const obtenerDetalle = async (idOrden: number) => {
        setCargandoDetalles(true);
        setDetallesOrden([]);
        try {
            // 🚀 AÑADIMOS EL MISMO BLINDAJE ANTI-CACHÉ AQUÍ
            const timestamp = new Date().getTime();
            const res = await fetch(`${API_URL}/ordenes/detalle/?IdPedido=${idOrden}&t=${timestamp}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });

            const data: Detalles[] = await res.json();
            setDetallesOrden(data);

        } catch (error) {
            console.error(error);
        } finally {
            setCargandoDetalles(false);
        }
    };

    const limpiarDetalles = () => setDetallesOrden([]);

    return { detallesOrden, cargandoDetalles, obtenerDetalle, limpiarDetalles };
}

// --- 1. CREAR NUEVA ORDEN ---
export function useCrearOrden() {
    const [cargando, setCargando] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const crear = useCallback((payload: any, onSuccess: () => void) => {
    if (cargando) return;
    setCargando(true);

    const limpiarListeners = () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      socket.off("orden_generada", onExito);
      socket.off("error_generar", onError);
    };

    const onExito = () => { limpiarListeners(); setCargando(false); onSuccess(); };
    const onError = (data: any) => { limpiarListeners(); setCargando(false); alert(data.MENSAJE || "Error al generar orden."); };

    // Limpieza preventiva
    socket.off("orden_generada");
    socket.off("error_generar");

    socket.on("orden_generada", onExito);
    socket.on("error_generar", onError);

    timeoutRef.current = setTimeout(() => {
      limpiarListeners();
      setCargando(false);
      alert("Timeout: El servidor de comandas tardó más de 2 minutos.");
    }, 120000);

    socket.emit("crear_orden", payload);
  }, [cargando]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
  return { crear, cargando };
}

// --- 2. ACTUALIZAR ORDEN EXISTENTE ---
export function useActualizarOrden() {
    const [cargando, setCargando] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const actualizar = (payload: any, onSuccess: () => void) => {
        if (cargando) return;
        setCargando(true);

        const limpiar = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            socket.off("orden_actualizar", onExito);
            socket.off("error_actualizar", onError);
        };

        const onExito = () => { limpiar(); setCargando(false); onSuccess(); };
        const onError = (data: any) => { limpiar(); setCargando(false); alert(data.MENSAJE); };

        socket.on("orden_actualizar", onExito);
        socket.on("error_actualizar", onError);

        timeoutRef.current = setTimeout(() => {
            limpiar(); setCargando(false); alert("Timeout: El servidor tardó más de 2 minutos.");
        }, 120000);

        socket.emit("actualizar_orden", payload);
    };

    useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
    return { actualizar, cargando };
}

// --- 3. CANCELAR ORDEN ---
export function useCancelarOrden() {
    const [cargando, setCargando] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelar = (payload: any, onSuccess: () => void) => {
        if (cargando) return;
        setCargando(true);

        const limpiar = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            socket.off("orden_actualizar", onExito);
            socket.off("error_actualizar", onError);
        };

        const onExito = () => { limpiar(); setCargando(false); onSuccess(); };
        const onError = (data: any) => { limpiar(); setCargando(false); alert(data.MENSAJE); };

        socket.on("orden_actualizar", onExito);
        socket.on("error_actualizar", onError);

        timeoutRef.current = setTimeout(() => {
            limpiar(); setCargando(false); alert("Timeout de cancelación superado.");
        }, 120000);

        socket.emit("cancelar_orden", payload);
    };

    useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
    return { cancelar, cargando };
}

// --- 4. GUARDAR ORDEN (COMPLETAR/PAGAR) ---
export function useMandarACaja() {
    const [cargando, setCargando] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mandarACaja = (payload: any, onSuccess: () => void) => {
        if (cargando) return;
        setCargando(true);

        const limpiar = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            socket.off("orden_actualizar", onExito);
            socket.off("error_actualizar", onError);
        };

        const onExito = () => { 
            limpiar(); 
            setCargando(false); 
            onSuccess(); 
        };
        
        const onError = (data: any) => { 
            limpiar(); 
            setCargando(false); 
            // Mostramos el mensaje exacto que configuramos en Python (ej: "LA CAJA ESTÁ CERRADA")
            alert(`Fallo al enviar a caja: ${data.MENSAJE}`); 
        };

        socket.on("orden_actualizar", onExito);
        socket.on("error_actualizar", onError);

        // Timeout de seguridad
        timeoutRef.current = setTimeout(() => {
            limpiar(); 
            setCargando(false); 
            alert("Timeout de red: La terminal de caja no respondió a tiempo.");
        }, 15000); // 15 segundos es más que suficiente para una red local

        // Emitimos el evento que el backend ya espera para hacer la transferencia
        socket.emit("guardar_orden", payload);
    };

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    return { mandarACaja, cargando };
}

