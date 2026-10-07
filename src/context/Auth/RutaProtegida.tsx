import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './Auth';



export function RutaProtegida() {
    const { estaAutenticado } = useAuth();

    // Si no está logueado, lo redirigimos al login
    // El "replace" borra el historial para que no pueda volver atrás con el navegador
    if (!estaAutenticado) {
        return <Navigate to="/Login" replace />;
    }

    // Si está logueado, Outlet renderiza la ruta hija (el componente que sí quería ver)
    return <Outlet />;
}   