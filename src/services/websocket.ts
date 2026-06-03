//prueba
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;


// Inicializamos la conexión. 
// autoConnect: false evita que se conecte antes de que el usuario inicie sesión (si fuera necesario)
export const socket: Socket = io(API_URL, {
    autoConnect: false, //conecta hasta que sea llamado
    transports: ["websocket"] // Forzamos el uso directo de WebSockets desde el inicio
});