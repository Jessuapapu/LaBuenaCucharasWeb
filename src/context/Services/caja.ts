const UrlApi = import.meta.env.VITE_URL_API || 'http://127.0.0.1:8001';

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
});

export const apiCaja = {
    obtenerCaja: async () => fetch(`${UrlApi}/caja/`, { headers: getHeaders() }).then(r => r.json()),
    obtenerEstado: async () => fetch(`${UrlApi}/caja/Estado`, { headers: getHeaders() }).then(r => r.json()),
    abrirCaja: async () => fetch(`${UrlApi}/caja/abrir`, { method: "PUT", headers: getHeaders() }).then(r => r.json()),
    cerrarCaja: async () => fetch(`${UrlApi}/caja/cerrar`, { method: "PUT", headers: getHeaders() }).then(r => r.json()),
    
    pagarOrden: async (payload: any) => fetch(`${UrlApi}/caja/pagar`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(payload) }).then(r => r.json()),
    finalizarOrden: async (idOrden: number) => fetch(`${UrlApi}/caja/finalizar/${idOrden}`, { method: "POST", headers: getHeaders() }).then(r => r.json()),
    
    // 🆕 NUEVOS ENDPOINTS:
    anularOrden: async (idOrden: number) => fetch(`${UrlApi}/caja/${idOrden}`, { method: "DELETE", headers: getHeaders() }).then(r => r.json()),
    actualizarMonto: async (payload: {IdOrden: number, Monto: number}) => fetch(`${UrlApi}/caja/actualizar`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(payload) }).then(r => r.json()),
    reembolsarOrden: async (payload: {IdOrden: number, Monto: number, Razon: string}) => fetch(`${UrlApi}/caja/reembolso`, { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) }).then(r => r.json()),
    
    // Para ver los detalles extraídos directamente de la BD sin caché
    obtenerDetalles: async (idOrden: number) => fetch(`${UrlApi}/ordenes/detalle/?IdPedido=${idOrden}&t=${new Date().getTime()}`, { headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json())
};