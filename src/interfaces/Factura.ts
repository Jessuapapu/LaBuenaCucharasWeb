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