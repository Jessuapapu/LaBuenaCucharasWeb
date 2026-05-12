import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import NavbarMobile from "../components/NavbarMobiles/NavbarMobile";
import { Outlet } from "react-router-dom";
//import favicon from '../assets/Favicon.png'
import labuenacuchara from '../assets/Labuenacucharalogo.png'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

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