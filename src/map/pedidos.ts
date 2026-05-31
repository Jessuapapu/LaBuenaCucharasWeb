import type { OrdenVisualizar } from "../interfaces/Ordenes" 

export const pedidosMapper = {
    fromJsonList(data: any[]): OrdenVisualizar[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      idOrden: Number(item.id_pedido || item.id_orden || 0), // Escudo por si cambian las llaves en la API
      idPedido: Number(item.id_pedido || item.idPedido || 0),
      fecha: item.fecha || new Date().toISOString().split("T")[0],
      monto_total: Number(item.monto_total || item.MONTOTOTAL || 0), // Forzamos conversión a número seguro
      estado_pedido: item.estado_pedido || item.estado || "PENDIENTE",
      TipodePedidos: (item.TipodePedido || "Evento")as "Evento"|"Contrato"|"Buffet",
      cliente: {
        idCliente: Number(item.id_cliente || item.idCliente || 0),
        nombre_cliente: item.nombre_cliente || item.nombre || "Cliente Anónimo",
        direccion_cliente: item.direccion_cliente || item.direccion || "Dirección no especificada"
      },
      
      // Mapeamos los detalles asegurando los tipos de datos internos
      detalles: Array.isArray(item.detalles) 
        ? item.detalles.map((d: any) => ({
            id_orden: Number(d.id_orden || item.id_pedido || 0),
            nombre_platillo: d.nombre_platillo || d.platillo || "Platillo",
            cantidad: Number(d.cantidad || 0),
            precio_unitario: Number(d.precio_unitario || d.precio || 0)
          }))
        : []
    }));
  }
}