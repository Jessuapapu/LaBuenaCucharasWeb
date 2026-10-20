import type { PayloadFactura, RespuestaFacturasPaginada, Factura, DetalleFacturaLinea } from "../interfaces/Factura";

export const FacturaMapper = {
  //Transforma la búsqueda de la UI en Query Params para FastAPI
  toApiParams(pagina: number, rows: number, filtros: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams({
      pagina: pagina.toString(),
      rows: rows.toString(),
      todo: "0"
    });

    if (filtros.nombre_cliente && filtros.nombre_cliente.trim() !== "") {
      const termino = filtros.nombre_cliente.trim();
      const esNumero = /^\d+$/.test(termino);
      if (esNumero) {
        // Si el buscador es numérico, mapea a id_orden para aprovechar el índice SQL
        params.append("id_orden", parseInt(termino, 10).toString());
      }
    }

    if (filtros.id_orden) params.append("id_orden", filtros.id_orden.toString());
    if (filtros.id_cliente) params.append("id_cliente", filtros.id_cliente.toString());

    return params;
  },

  //Crear
  //Transforma el array plano 'idOrdenes' en el formato de objetos relacionales del backend.

  toApiPayload(payload: PayloadFactura): any {
    return {
      id_cliente: payload.IdCliente,
      fecha: payload.fecha,
      Estado: payload.Estado || "PENDIENTE", // Vinculado al estado/condición de pago inicial
      MetodoPago: payload.MetodoPago,
      //CondicionPago: payload.CondicionPago, //Por si no se entiende, busca el mapper (Estado)
      tipoDocumentoOrigen: payload.tipoDocumentoOrigen || "Orden",
      detalle: payload.detalles.map(d => ({ IdOrden: d.IdOrden }))
    };
  },


  toFrontendList(jsonArray: any[]): Factura[] {
    if (!Array.isArray(jsonArray)) return [];

    return jsonArray.map((f: any) => ({
      Id_factura: f.Id_factura,
      monto_total: Number(f.monto_total ?? f.MontoTotal ?? 0),
      cantidad_total: Number(f.cantidad_total || 0),
      estado_factura: f.estado_factura ? f.estado_factura.toUpperCase() : "PENDIENTE",
      fecha_factura: f.fecha_factura || "",
      nombre_cliente: f.nombre_cliente || "Consumidor Final"

    }));
  },

  toDetallesFactura(jsonArray: any[]): DetalleFacturaLinea[] {
    if (!Array.isArray(jsonArray)) return [];

    return jsonArray.map((d: any) => ({
      IdFactura: d.Id_factura,
      IdOrden: d.IdOrden,
      MontoTotal: Number(d.monto_total ?? d.MontoTotal),
      NombreCliente: d.NombreCliente ?? "Consumidor final",
      Cantidad: d.Cantidad
    }))
  },

  //Para paginacion
  toFrontendResponse(jsonResponse: any, pagina: number, rows: number): RespuestaFacturasPaginada {
    const Lista = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.data || [])//se extrae 
    const listaFacturas = this.toFrontendList(Lista)//se transforma

    return {
      data: listaFacturas,
      total: listaFacturas.length,
      pagina: pagina,
      rows: rows
    };
  }
};