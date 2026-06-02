import type { PayloadFactura, RespuestaFacturasPaginada, Factura } from "../interfaces/Factura";

export const FacturaMapper = {
  //Transforma la búsqueda de la UI en Query Params para FastAPI
  toApiParams(pagina: number, rows: number, filtros: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams({
      pagina: pagina.toString(),
      rows: rows.toString(),
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
      fecha: payload.Fecha,
      estado: payload.CondicionPago || "PENDIENTE", // Vinculado al estado/condición de pago inicial
      // FastAPI espera un array de objetos: detalles: [{ IdOrden: X }, { IdOrden: Y }]
      detalles: Array.isArray(payload.idOrdenes)
        ? payload.idOrdenes.map((id) => ({ IdOrden: id }))
        : []
    };
  },

  //Lista: Mapea la fila cruda de la base de datos al formato estricto de tu interfaz Factura.
  toFrontendList(jsonArray: any[]): Factura[] {
    if (!Array.isArray(jsonArray)) return [];
    
    return jsonArray.map((f: any) => ({
      Id_factura: f.Id_factura,
      monto_total: Number(f.monto_total || 0),
      cantidad_total: Number(f.cantidad_total || 0),
      // Forzamos el uppercase para que calce con tu unión de tipos ("PAGADA" | "ANULADA")
      estado_factura: f.estado_factura ? f.estado_factura.toUpperCase() : "PENDIENTE",
      fecha_factura: f.fecha_factura || "",
      cliente: {
        nombre_cliente: f.cliente?.nombre_cliente || "Consumidor Final"
      }
    }));
  },

  //Para paginacion, filtra en memoria para suplir la falta de filtros de texto en el backend actual
  toFrontendResponse(jsonResponse: any, pagina: number, rows: number, filtros: Record<string, any>): RespuestaFacturasPaginada {
    let listaFacturas = this.toFrontendList(jsonResponse);

    // Filtro defensivo si el buscador tiene texto (Nombre del cliente o Estado)
    if (filtros.nombre_cliente && !/^\d+$/.test(filtros.nombre_cliente.trim())) {
      const terminoBusqueda = filtros.nombre_cliente.toLowerCase().trim();
      
      listaFacturas = listaFacturas.filter((f: Factura) => {
        const nombre = f.cliente.nombre_cliente.toLowerCase();
        const estado = f.estado_factura.toLowerCase();
        return nombre.includes(terminoBusqueda) || estado.includes(terminoBusqueda);
      });
    }

    return {
      data: listaFacturas,
      total: listaFacturas.length,
      pagina: pagina,
      rows: rows
    };
  }
};