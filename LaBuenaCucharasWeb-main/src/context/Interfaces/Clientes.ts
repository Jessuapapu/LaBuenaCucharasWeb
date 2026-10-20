
export interface cliente {
  IdCliente: number;
  NombreCliente: string;
  correo: string;
  telefono: string;
  dirreccion: string; //porque nunca se supo en el BACKEND SI ERA DIRECCION O DIRRECCION
}

export interface NuevoCliente {
  nombre: string;
  direccion: string;
  correo: string;
  telefono: string;
}



