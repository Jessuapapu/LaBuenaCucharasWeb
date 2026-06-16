export interface PlatilloRanking {
  idPlatillo: number;
  nombrePlatillo: string;
  unidadesVendidas: number;
  ingresoTotal: number;
  precioPromedio: number;
  [key: string]: string | number; //Para que Nivo no se queje y lo lea bien
}

export const AnalyticsMapper = {
  toPlatillosRanking(jsonArray: any[]): PlatilloRanking[] {
    if (!Array.isArray(jsonArray)) return [];
    
    return jsonArray.map((item: any) => ({
      idPlatillo: Number(item.id_platillo || 0),
      nombrePlatillo: item.nombre_platillo || "Platillo Desconocido",
      unidadesVendidas: Number(item.unidades_vendidas || 0),
      ingresoTotal: Number(item.ingreso_total_generado || 0),
      precioPromedio: Number(item.precio_promedio_venta || 0)
    }));
  }
};