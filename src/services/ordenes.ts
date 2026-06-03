import { mapOrdenes } from "../map/ordenes";
import type { CrearOrden, ApiResponseCrearOrden } from "../interfaces/Ordenes";
import type { Platillo } from "../interfaces/Platillos";

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

export async function obtenerTodasLasOrdenes(): Promise<any[]> {
  const res = await fetch(`${API_URL}/ordenes/`, {
    method: "GET",
    headers: getHeaders()
  });

  if (!res.ok) throw new Error("Error al obtener el catálogo completo de órdenes");

  const data = await res.json();
  // Si tu backend devuelve las órdenes envueltas en { data: [...] }, extraemos el arreglo
  const arregloOrdenes = data.data ?? data;
  
  return mapOrdenes(arregloOrdenes);
}

export async function obtenerTodosLosPlatillos(): Promise<Platillo[]> {
  const res = await fetch(`${API_URL}/platillos/`, {
    method: "GET",
    headers: getHeaders()
  });

  if (!res.ok) throw new Error("Error al cargar el catálogo de platillos");

  const data = await res.json();
  return data.data ?? data;
}

export async function getOrdenesByCliente(idCliente: number) {
    const res = await fetch(`${API_URL}/clientes/detalles/${idCliente}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    if (!res.ok) throw new Error("Error al obtener ordenes");

    const data = await res.json();

    return mapOrdenes(data.data ?? data);
}

export async function crearOrden(nuevaOrden: CrearOrden): Promise<ApiResponseCrearOrden> {
    const response = await fetch(`${API_URL}/ordenes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(nuevaOrden),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || "Error al registrar la orden");
    }
    return data;
}

export async function actualizarOrden(idOrden: number, payload: Partial<CrearOrden>) {
    const response = await fetch(`${API_URL}/ordenes/detalles/${idOrden}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || "Error al actualizar la orden");
    }
    return data;
}

export async function getVentasPlatillos(): Promise<any[]> {
    const response = await fetch(`${API_URL}/ordenes/platillos/conteo`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Inyección de seguridad
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error("Error al obtener estadísticas de ventas");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function getVentasSemanales(signal?: AbortSignal): Promise<any[]> {
    const resGrafica = await fetch(`${API_URL}/ordenes/conteo/semanal`, { 
        signal 
    });
    
    if (!resGrafica.ok) {
        throw new Error("Error al obtener las ventas semanales");
    }
    
    const dataGrafica = await resGrafica.json();
    
    const formattedData = dataGrafica.map((d: any) => ({
        x: d.dia.charAt(0).toUpperCase() + d.dia.slice(1),
        y: d.conteo
    }));
    
    return formattedData;
}

export async function obtenerOrdenporNombre(NombreCliente:string): Promise<any[]> {
    //nombeCliente porque asi lo espera el backend y todo true ara que los datos no se mutilen al cargar
    const response= await fetch(`${API_URL}/ordenes/?nombeCliente=${encodeURIComponent(NombreCliente)}&todo=true`, {
        method: "GET",
        headers: getHeaders(),
    })
    if(!response.ok){
        throw new Error("No se encontro ordenes")
    }
    const data=  await response.json();
    //Ya que retorna la lista de un solo desde el MostrarOrdenes
    const arregloOrdenes= data.data ??data;
    return mapOrdenes(arregloOrdenes)
}