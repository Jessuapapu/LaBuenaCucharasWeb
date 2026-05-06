import { X, CircleDashed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import React from "react"; // Necesario para la desestructuración de props

// Interfaz actualizada para aceptar la URL del logo
interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
    logoSrc: string; // <-- NUEVA PROPIEDAD: URL o ruta local del logo
    businessName: string; // <-- Opcional: Nombre del negocio para fallback o ALT
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, logoSrc, businessName = "La Buena Cuchara" }: SidebarProps) {
    const location = useLocation();

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 font-medium ${isActive
            ? "bg-[#2179e9]/90 text-white  border-white shadow-lg "
            : "text-blue-100 hover:bg-white/5 hover:text-white"
            }`;
    };

    const LinkItem = ({ to, icon, label }: { to: string, icon: React.ReactNode | string, label: string }) => (
        <Link to={to} className={getLinkClass(to)}>
            {icon} {label}
        </Link>
    );

    // --- CÓDIGO DEL LOGO ---
    const LogoDisplay = () => (
        <div className="flex items-center justify-center h-20 border-b border-white/10  p-3">
            {logoSrc ? (
                // Usamos la etiqueta <img> para mostrar el logo
                <img 
                    src={logoSrc} 
                    alt={`Logo de ${businessName}`} 
                    className="max-h-full max-w-full object-contain"
                />
            ) : (
                // Fallback si no hay logo
                <h1 className="text-xl font-bold tracking-wider">{businessName}</h1>
            )}
        </div>
    );
    // ------------------------

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 text-white shadow-2xl z-50 transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ backgroundColor: '#0b1323' }} // COLOR EXACTO DE LOGO
            >
                {/* Nuevo Componente de Logo */}
                <LogoDisplay /> 

                <nav className="flex-1 px-2 py-6 space-y-2">
                    <LinkItem to="/" icon={<span role="img" aria-label="Inicio">🏠</span>} label="Inicio" />
                    <LinkItem to="/Pedidos" icon={<span role="img" aria-label="Pedidos">📝</span>} label="Pedidos" />
                    <LinkItem to="/Facturas" icon={<span role="img" aria-label="Facturas">📒</span>} label="Facturas" />
                    <LinkItem to="/Comidas" icon={<span role="img" aria-label="Comidas">🍔</span>} label="Comidas" />
                    <LinkItem to="/Menu_Diario" icon={<span role="img" aria-label="Menú Diario">🧾</span>} label="Menu Diario" />
                    <LinkItem to="/Clientes" icon={<span role="img" aria-label="Clientes">👤</span>} label="Clientes" />
                    <LinkItem to="/Inventario" icon={<span role="img" aria-label="Inventario">🖥️</span>} label="Inventario" />
                    <LinkItem to= "/Mesas" icon={<span role="img" aria-label="Mesas"><CircleDashed/></span>} label="Mesas" />
                    {/* Puedes añadir más LinkItems aquí */}
                </nav>

                <div className="p-4 border-t border-white/10 text-xs text-center text-blue-200">
                    v1.0
                </div>
            </aside>

            {/* --- MOBILE SIDEBAR --- */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />

                        <motion.aside
                            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 w-64 h-screen text-white z-50 p-4 lg:hidden shadow-2xl flex flex-col"
                            style={{ backgroundColor: '#004aad' }} // COLOR EXACTO DEL LOGO
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                {/* Logo en Móvil */}
                                <LogoDisplay />

                                <button onClick={() => setSidebarOpen(false)}>
                                    <X className="w-6 h-6 text-white hover:bg-white/20 rounded" />
                                </button>
                            </div>
                            <nav className="space-y-2 flex-1">
                                {/* Navegación móvil abreviada o completa */}
                                <Link to="/" onClick={() => setSidebarOpen(false)} className={getLinkClass("/")}>🏠 Inicio</Link>
                                <Link to="/Pedidos" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Pedidos")}>📝 Pedidos</Link>
                                <Link to="/Comidas" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Comidas")}>🍔 Comidas</Link>
                                <Link to="/Menu_Diario" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Menu_Diario")}>🧾 Menu Diario</Link>
                                {/* Añade el resto de enlaces si son necesarios */}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}