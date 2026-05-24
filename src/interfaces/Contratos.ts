export interface Contrato {
  idContrato: number;
  idCliente: number;
  numeroContrato: number;
  fechaInicio: string;
  fechaVencimiento: string;
  presupuesto: number;
  estado: "Activo" | "Inactivo";
}