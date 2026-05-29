//prueba
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para INYECTAR el Token en cada petición de forma automática
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para CAPTURAR excepciones de tus dependencias de FastAPI (401 o 403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;

            // 401: jwt.decode falló o usuario_id es None (no validó credenciales)
            // 403: usuario.activo es False (Deshabilitado)
            if (status === 401 || (status === 403 && error.response.data?.detail === "Usuario deshabilitado o inactivo")) {
                console.warn("Sesión inválida o usuario deshabilitado. Redirigiendo al login...");
                
                // Limpieza de datos locales y desconexión inmediata del socket
                localStorage.clear();
                import("../services/websocket").then(({ socket }) => socket.disconnect());
                
                // Forzar redirección al login
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);