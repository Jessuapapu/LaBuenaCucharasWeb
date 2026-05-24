import type { cliente } from "../interfaces/Clientes";

export function mapCliente(raw: any): cliente {
  return {
    idCliente: raw.IdCliente,
    nombre: raw.nombre ?? raw.NombreCliente,
    correo: raw.correo ?? raw.CorreoElectronico,
    telefono: String(raw.telefono ?? raw.Telefono),
    direccion: raw.direccion ?? raw.Dirreccion ?? raw.Direccion
  };
}

export function mapClientes(rawList: any[]): cliente[] {
  return rawList.map(mapCliente);
}