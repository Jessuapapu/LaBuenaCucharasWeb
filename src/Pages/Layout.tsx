import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import NavbarMobile from "../components/NavbarMobiles/NavbarMobile";
import { Outlet, useLocation, Navigate } from "react-router-dom";
//import favicon from '../assets/Favicon.png'
import labuenacuchara from '../assets/Labuenacucharalogo.png'

export default function Layout() {


    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const isLogin = location.pathname.toLowerCase() === "/login";
    const token = localStorage.getItem("access_token");

    // Si no hay token y no estamos en /login, forzamos redirección
    if (!token && !isLogin) {
        return <Navigate to="/login" replace />;
    }

    // Estilos que contienen la imagen SVG como fondo repetitivo
    const backgroundStyle = {
        // 1. Apunta a tu archivo SVG
        backgroundImage: `url('/src/assets/Fondo.svg')`,
        // 2. Asegura que se repita
        backgroundRepeat: 'repeat',
        // 3. Define el tamaño de cada "mosaico" (AJUSTAR ESTO)
        backgroundSize: '300px 170px', 
        // 4. Color de respaldo si el SVG no carga
        backgroundColor: '#080d15' 
    };

    // Si estamos en la ruta de Login, no mostramos la sidebar
    if (isLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <main className="w-full">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* --- FONDO REPETITIVO SVG --- */}
            <div 
                className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none"
                style={backgroundStyle}
            ></div>
            
            {/* Sidebar (z-index 50) */}
            
            <Sidebar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                logoSrc={labuenacuchara} 
                businessName="La Buena Cuchara" // <-- ¡AQUÍ ESTÁ LA SOLUCIÓN!
            />

            {/* Contenedor Principal (z-index 10) */}
            <div
                className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col relative z-10
                    ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}
            >
                {/* Navbar Mobile (solo visible en pantallas pequeñas) */}
                <div className="lg:hidden">
                        <NavbarMobile setSidebarOpen={setSidebarOpen} />
                </div>

                {/* Contenido de la Página */}
                <main className="p-4 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}