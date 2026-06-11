export interface PayloadFactura {
  IdCliente: number;
  //Cantidad?: string | number;
  Fecha: string;
  MetodoPago: string;
  CondicionPago: string; //Por si no se entiende, busca el mapper (Estado)
  tipoDocumentoOrigen?: string | null;
  detalle: DetalleOrden[];
  idContrato: number | null;
}

export interface DetalleOrden{
  IdOrden: number;
}
export interface RespuestaFacturasPaginada {
    data: Factura[];
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
  cliente: {
    nombre_cliente: string;
  }
}

export interface DetalleFacturaLinea {
  IdFactura: number;
  IdOrden: number;
  MontoTotal: number;
  NombrePlatillo?: string; 
  Cantidad?: number;
  NombreCliente: string;
}
