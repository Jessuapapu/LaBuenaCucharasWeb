export interface PayloadFactura {
  IdCliente: number;
  Cantidad: string | number;
  Fecha: string;
  MetodoPago: string;
  CondicionPago: string;
  tipoDocumentoOrigen: string | null;
  MONTOTOTAL: number;
  idOrdenes: number[];
  idContrato: number | null;
}
export interface RespuestaFacturasPaginada {
    data: any[];
    total: number;
    pagina: number;
    rows: number;
}
export interface Factura {
  Id_factura: number;
  monto_total: number;
  cantidad_total: number;
  estado_factura: "PENDIENTE"| "ANULADA"|"PAGADA" | string;
  fecha_factura: string; // ISO string o formato de fecha de SQL Server
  cliente: ClienteFactura;
}
export interface ClienteFactura {
  nombre_cliente: string;
}

export interface DetalleFacturaLinea {
  IdFactura: number;
  IdOrden: number;
  CostoTotalOrden: number;
  NombrePlatillo?: string; 
  Cantidad?: number;
  [key: string]: any;     // Flexibilidad para campos adicionales del SP
}