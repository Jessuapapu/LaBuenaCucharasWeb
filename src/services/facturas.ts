
const API_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("access_token");
// Función auxiliar para obtener el token en tiempo real (evita problemas si el token cambia o se refresca)
//Y da pereaza escribir de nuevo lo mismo
const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};
import type { PayloadFactura, RespuestaFacturasPaginada, Factura, DetalleFacturaLinea } from "../interfaces/Factura";
import { FacturaMapper } from "../map/facturas";


export async function crearFactura(payload: PayloadFactura): Promise<{ message: string; id: number }> {
    //El mapper traduce
    const bodyBackend = FacturaMapper.toApiPayload(payload);
    const response = await fetch(`${API_URL}/facturas/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(bodyBackend)
    });

    if (!response.ok) {
        throw new Error("Error al emitir la factura. Verifica los datos.");
    }

    return await response.json();
}


export async function getFacturas(): Promise<Factura[]> {
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
    return FacturaMapper.toFrontendList(data);
}
export async function getFacturasPag(
    pagina: number = 1, 
    rows: number = 10, 
    filtros: Record<string, any> = {},
    signal?: AbortSignal
): Promise<RespuestaFacturasPaginada> {
    
    //Query Params base de la paginación
    const params = FacturaMapper.toApiParams(pagina, rows, filtros)

    const response = await fetch(`${API_URL}/facturas/?${params.toString()}`, {
        method: "GET",
        headers: getHeaders(),
        signal 
    });

    if (!response.ok) throw new Error(`Error al obtener las facturas paginadas.`);
    const json = await response.json();
    
    return FacturaMapper.toFrontendResponse(json, pagina, rows, filtros);
}

export async function obtenerDetalleFactura(idFactura: number): Promise<DetalleFacturaLinea[]> {
    if (!idFactura) throw new Error("El ID de la factura es requerido.");

    const response = await fetch(`${API_URL}/facturas/detalles/${idFactura}`, {
        method: "GET",
        headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`Error al obtener los detalles de la factura #${idFactura}.`);
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function actualizarFactura(
    idFactura: number, 
    payload: PayloadFactura
): Promise<{message: string}> {
    if (!idFactura) {
        throw new Error("El ID de la factura es obligatorio para realizar una actualización.");
    }
    const bodyBackend = FacturaMapper.toApiPayload(payload);

    const response = await fetch(`${API_URL}/facturas/${idFactura}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(bodyBackend)
    });

    if (!response.ok) {
        throw new Error(`Error al actualizar la factura #${idFactura}. Verifica los datos.`);
    }

    return await response.json();
}