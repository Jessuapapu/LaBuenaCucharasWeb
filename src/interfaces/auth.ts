export interface UserInfo {
    id?: number;
    username: string;
    rol: string;
}

export interface AuthContextType {
    token: string | null;
    usuario: UserInfo | null;
    estaAutenticado: boolean;
    login: (nuevoToken: string, datosUsuario: UserInfo) => void;
    logout: () => void;
}