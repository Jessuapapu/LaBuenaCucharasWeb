export interface UsuarioData {
  Username: string;
  fecha_creacion: string | Date;
  rol: string;
  activo: boolean;
}

export interface UsuariosPageProps {
  usuariosIniciales?: UsuarioData[];
  onRegistrar: (username: string, contra: string, rol: string) => Promise<boolean>;
  onActualizar: (username: string, contra?: string, rol?: string) => Promise<boolean>;
  onDesactivar: (username: string) => Promise<boolean>;
}