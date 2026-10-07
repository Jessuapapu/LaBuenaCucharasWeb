import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { socket } from '../Services/websocket';
import { api } from '../Services/api'; // <-- Tu Axios configurado
import type { UserInfo, AuthContextType } from '../Interfaces/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
    const [usuario, setUsuario] = useState<UserInfo | null>(() => {
        const guardado = localStorage.getItem('user_info');
        return guardado ? JSON.parse(guardado) : null;
    });

    useEffect(() => {
        const verificarSesionBackend = async () => {
            // Si hay token al abrir la página, validamos contra la dependencia /auth/me de FastAPI
            if (token) {
                try {
                    const response = await api.get("/auth/me");
                    if (response.data && response.data.activo) {
                        // abrimos el túnel en vivo (espero)
                        if (!socket.connected) {
                            socket.auth = { token };
                            socket.connect();
                        }
                    }
                } catch (error) {
                    // Tu interceptor de api.ts ya se encarga de limpiar todo si da 401/403
                    console.error("Error verificando sesión persistente", error);
                }
            }
        };

        verificarSesionBackend();
    }, [token]);

    // A login
    const login = (nuevoToken: string, datosUsuario: UserInfo) => {
        setToken(nuevoToken);
        setUsuario(datosUsuario);
        
        localStorage.setItem('access_token', nuevoToken);
        localStorage.setItem('user_info', JSON.stringify(datosUsuario));

        //Pasamos credenciales y conectamos
        socket.auth = { token: nuevoToken }; 
        socket.connect(); 
    };

    // CERRAR SESIÓN
    const logout = () => {
        setToken(null);
        setUsuario(null);
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');

        // lo desconecta
        socket.disconnect(); 
    };

    return (
        <AuthContext.Provider value={{ token, usuario, estaAutenticado: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    return context;
};