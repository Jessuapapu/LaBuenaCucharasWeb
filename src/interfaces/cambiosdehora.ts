export interface CambioDeHoraModel {
  nombre: string;
  HoraInicio: string; 
  HoraFinal: string;  
  estado: boolean;
}

export interface CambioDeHoraModelEditar extends CambioDeHoraModel {
  nombreNuevo?: string;
}

export interface RangoHorasData {
  hora: number;
  TotalOrdenes: number;
  DiasLaborados: number;
  PromedioOrdenes: number;
}