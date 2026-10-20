import type { Contrato } from "../interfaces/Contratos";

export function mapContrato(raw: any): Contrato {
  return {
    idContrato: raw.IdContrato,
    idCliente: raw.IdCliente?? raw.id_cliente,
    numeroContrato: raw.NumeroContrato?? raw.numero_contrato,
    fechaInicio: raw.FechaInicio ?? raw.fecha_inicio,
    fechaVencimiento: raw.FechaVencimiento?? raw.fecha_vencimiento,
    presupuesto: Number(raw.Presupuesto ?? raw.presupuesto?? 0),
    estado: raw.Estado=== "Inactivo" ? "Inactivo" : "Activo",
    direccion_cliente: raw.direccion || raw.dirreccion
  };
}

export function mapContratos(rawList: any[]): Contrato[] {
  //if(!Array-isArray(rawList)) return []
  return rawList.map(mapContrato);
}