export interface IngredienteModel {
  id: number;
  Nombre: string;
}

// Interfaz para el POST/PUT (Pydantic payload)
export interface IngredientePayload {
  NombreIngrediente: string;
  Stock: number;
}

export interface RelacionPayload {
  IdPLatillo: string;
  ingredientes: number[];
}