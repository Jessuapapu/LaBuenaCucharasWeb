
export interface Proveedor {
  IdProveedor: number;
  NombreProveedor: string;
  Direccion: string;
  Tipo: string;
}

export interface NuevoProveedor {
  nombre: string;
  direccion: string;
  tipo: string;
}

export interface Registro {
  IdRegistro: number;
  Fecha: string;
  TotalIngresado: number;
  IdProveedor: number;
  CostoTotal: string | number; 
}

export interface PayloadRegistro {
  Fecha: string;
  IdProveedor: number;
  TotalIngresado: number;
  CostoTotal: number;
}