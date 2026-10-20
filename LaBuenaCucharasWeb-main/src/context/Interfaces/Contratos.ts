export interface Contrato {
  idContrato: number;
  idCliente: number;
  numeroContrato: number;
  fechaInicio: string;
  fechaVencimiento: string;
  presupuesto: number;
  estado: "Activo" | "Inactivo";
  direccion_cliente: string;
}

export interface NuevoContrato {
  numero_contrato: number;
  fecha_inicio: string;
  nombre_cliente: string;
  presupuesto: number;
  fecha_fin: string;
}
