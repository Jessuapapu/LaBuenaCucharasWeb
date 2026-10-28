export interface DetalleOrden {
  nombre_platillo: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Orden {
  IdOrden: number;
  HoraEntrada: string;
  HoraSalida: string | null;
  Activo: boolean;
  Mesero?: string;
  Detalles?: DetalleOrden[]; // Agregado para la vista de cocina
}

export interface MesaBackend {
  Id: number;
  Ordenes: Orden[];
}

export interface Mesa {
  id: number;
  estado: 'disponible' | 'ocupada';
  ordenActiva?: Orden;
  capacidad?: number;
}

// Interfaz específica para aplanar los datos en la vista del cocinero
export interface OrdenCocina {
  IdMesa: number;
  IdOrden: number;
  HoraEntrada: string;
  Mesero: string;
  Detalles: DetalleOrden[];
}