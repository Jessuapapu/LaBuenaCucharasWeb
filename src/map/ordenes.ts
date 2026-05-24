import type { Orden } from "../interfaces/Ordenes";

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