
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
        headers: getHeaders(),
        body: JSON.stringify(bodyBackend)
    });

    if (!response.ok) {
        throw new Error("Error al emitir la factura. Verifica los datos.");
    }

    return await response.json();
}


export async function getFacturas(signal?: AbortSignal): Promise<Factura[]> {
    const response = await fetch(`${API_URL}/facturas/`, {
        method: "GET",
        headers: getHeaders(),
        signal
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
    signal?: AbortSignal): Promise<RespuestaFacturasPaginada> {
    
    //Query Params base de la paginación
    const params = FacturaMapper.toApiParams(pagina, rows, filtros)

    const response = await fetch(`${API_URL}/facturas/?${params.toString()}`, {
        method: "GET",
        headers: getHeaders(),
        signal 
    });

    if (!response.ok) throw new Error(`Error al obtener las facturas paginadas.`);
    const json = await response.json();
    
    return FacturaMapper.toFrontendResponse(json, pagina, rows);
}

export async function obtenerDetalleFactura(id_factura: number): Promise<DetalleFacturaLinea[]> {
    if (!id_factura) throw new Error("El ID de la factura es requerido.");

    const response = await fetch(`${API_URL}/facturas/detalles/${id_factura}`, {
        method: "GET",
        headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`Error al obtener los detalles de la factura #${id_factura}.`);
    
    const data = await response.json();
    const filadata= Array.isArray(data) ? data : (data.data ||[]);
    return FacturaMapper.toDetallesFactura(filadata)
}

export async function actualizarFactura( id_factura: number, payload: PayloadFactura): Promise<{message: string}> {
    if (!id_factura) {
        throw new Error("El ID de la factura es obligatorio para realizar una actualización.");
    }
    const bodyBackend = FacturaMapper.toApiPayload(payload);

    const response = await fetch(`${API_URL}/facturas/${id_factura}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(bodyBackend)
    });

    if (!response.ok) {
        throw new Error(`Error al actualizar la factura #${id_factura}. Verifica los datos.`);
    }

    return await response.json();
}