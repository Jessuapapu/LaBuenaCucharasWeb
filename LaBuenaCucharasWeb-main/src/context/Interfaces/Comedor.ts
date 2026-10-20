
export interface Orden {
  IdOrden: number;
  HoraEntrada: string;
  HoraSalida: string | null;
  Activo: boolean;
}

// Interfaz para la estructura cruda que viene del servidor
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
