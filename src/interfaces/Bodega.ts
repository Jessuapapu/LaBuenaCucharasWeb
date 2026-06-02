export type NivelStockInsumo = "Alta" | "Media" | "Baja";

export interface ItemInventario {
  idRegistro: number;
  nombre: string;
  cantidad_actual: number;
  unidad_medida: string;
  tipo: "INGREDIENTE" | "INSUMO";
  // por no tener ambos contables
  stock_minimo?: number | NivelStockInsumo; 
}