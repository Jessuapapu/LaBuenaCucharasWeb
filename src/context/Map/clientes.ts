import type { cliente } from "../interfaces/Clientes";

export function mapCliente(raw: any): cliente {
  console.log(raw)
  return {
    IdCliente: raw.IdCliente,
    NombreCliente: raw.nombre ?? raw.NombreCliente,
    correo: raw.correo ?? raw.CorreoElectronico,
    telefono: String(raw.telefono ?? raw.Telefono),
    dirreccion: raw.direccion ?? raw.Dirreccion ?? raw.Direccion ?? raw.dirreccion
  };
}

export function mapClientes(rawList: any[]): cliente[] {
  return rawList.map(mapCliente);
}