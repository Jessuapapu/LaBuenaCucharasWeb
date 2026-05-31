import type { Orden, OrdenVisualizar,DetalleOrdenLista, ClienteOrden } from "../interfaces/Ordenes";

export function mapOrden(raw: any): Orden {
  return {
    idOrden: raw.id_pedido ?? raw.IdOrdenes,
    estado: raw.estado_pedido ?? raw.Estado,
    montoTotal: Number(raw.monto_total ?? raw.MONTOTOTAL ?? 0),
    fecha: raw.fecha
  };
}

export function mapOrdenes(rawList: any[]): Orden[] {
  return rawList.map(mapOrden);
}

function mapDetalleOrden(rawDet: any): DetalleOrdenLista {
  return {
    id_orden: rawDet.id_orden ?? rawDet.IdOrdenes ?? 0,
    nombre_platillo: rawDet.nombre_platillo ?? rawDet.NombrePlatillo ?? "Platillo Desconocido",
    cantidad: Number(rawDet.cantidad ?? rawDet.CantidadPlatillo ?? 0),
    precio_unitario: Number(rawDet.precio_unitario ?? rawDet.PrecioUnico ?? 0)
  };
}

export function mapOrdenVisualizar(raw: any): OrdenVisualizar {
  return {
    idOrden: raw.id_pedido ?? raw.IdOrdenes ?? 0,
    estado_pedido: raw.estado_pedido ?? raw.Estado ?? "Pendiente",
    monto_total: Number(raw.monto_total ?? raw.MONTOTOTAL ?? raw.CostoTotal ?? 0),
    fecha: raw.fecha ?? raw.Fecha ?? raw.FechaPedido ?? "",
    
    // Mapeo seguro del objeto anidado cliente
    cliente: {
      idCliente: raw.cliente?.idCliente ?? raw.IdCliente ?? 0,
      nombre_cliente: raw.cliente?.nombre_cliente ?? raw.NombreCliente ?? "Cliente General",
      // Absorbe tanto 'direccion' como 'dirreccion' por si acaso
      direccion_cliente: raw.cliente?.direccion_cliente ?? raw.cliente?.dirreccion ?? raw.dirreccion ?? ""
    },
    
    // Si vienen detalles, los mapeamos uno a uno; si no, dejamos un array vacío seguro
    detalles: Array.isArray(raw.detalles) 
      ? raw.detalles.map(mapDetalleOrden) 
      : []
  };
}
//para listados masivos
export function mapOrdenesVisualizar(rawList: any[]): OrdenVisualizar[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(mapOrdenVisualizar);
}

export function mapclienteOrden(raw: any): ClienteOrden{
    return{
       idCliente: raw.idCliente ?? raw.IdCliente,
       nombre_cliente: raw.nombre_cliente ?? raw.NombreCliente,
       direccion_cliente: raw.direccion_cliente?? raw.dirreccion ?? "" // es direccion o dirreccion? 
    }

}