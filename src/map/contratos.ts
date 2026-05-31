import type { Contrato } from "../interfaces/Contratos";

export function mapContrato(raw: any): Contrato {
  return {
    idContrato: raw.IdContrato,
    idCliente: raw.IdCliente,
    numeroContrato: raw.NumeroContrato,
    fechaInicio: raw.FechaInicio,
    fechaVencimiento: raw.FechaVencimiento,
    presupuesto: Number(raw.Presupuesto ?? 0),
    estado: raw.Estado=== "Inactivo" ? "Inactivo" : "Activo",
    direccion_cliente: raw.direccion || raw.dirreccion
  };
}

export function mapContratos(rawList: any[]): Contrato[] {
  //if(!Array-isArray(rawList)) return []
  return rawList.map(mapContrato);
}