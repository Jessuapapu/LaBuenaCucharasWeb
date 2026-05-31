import type { cliente } from "../interfaces/Clientes";

export function mapCliente(raw: any): cliente {
  return {
    IdCliente: raw.IdCliente,
    NombreCliente: raw.nombre ?? raw.NombreCliente,
    correo: raw.correo ?? raw.CorreoElectronico,
    telefono: String(raw.telefono ?? raw.Telefono),
    dirreccion: raw.direccion ?? raw.Dirreccion ?? raw.Direccion
  };
}

export function mapClientes(rawList: any[]): cliente[] {
  return rawList.map(mapCliente);
}