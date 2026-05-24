import type { Contrato } from "../interfaces/Contratos";

export function mapContrato(raw: any): Contrato {
  return {
    idContrato: raw.IdContrato,
    idCliente: raw.IdCliente,
    numeroContrato: raw.NumeroContrato,
    fechaInicio: raw.FechaInicio,
    fechaVencimiento: raw.FechaVencimiento,
    presupuesto: Number(raw.Presupuesto ?? 0),
    estado: raw.Estado
  };
}

export function mapContratos(rawList: any[]): Contrato[] {
  return rawList.map(mapContrato);
}