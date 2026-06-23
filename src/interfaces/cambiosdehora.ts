export interface CambioDeHoraModel {
  nombre: string;
  HoraInicio: string; 
  HoraFinal: string;  
  estado: boolean;
}

export interface CambioDeHoraModelEditar extends CambioDeHoraModel {
  nombreNuevo?: string;
}