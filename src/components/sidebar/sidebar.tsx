import { X, CircleDashed, ChevronLeft, ChevronRight } from "lucide-react";
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
        return `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
            ? "bg-[#2179e9]/90 text-white shadow-lg shadow-blue-900/20"
            : "text-blue-100 hover:bg-white/5 hover:text-white"
            } ${!sidebarOpen ? "justify-center px-2" : ""}`;
    };

    const LinkItem = ({ to, icon, label }: { to: string, icon: React.ReactNode | string, label: string }) => (
        <Link to={to} className={getLinkClass(to)} title={!sidebarOpen ? label : ""}>
            <span className="text-xl shrink-0">{icon}</span>
            {/* El texto desaparece suavemente al contraer */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="whitespace-nowrap overflow-hidden"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );

    // --- CÓDIGO DEL LOGO ---
    const LogoDisplay = () => (
        <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} h-20 border-b border-white/10  p-3 transition-all duration-300`}>
            <div className="h-10 w-10 shrink-0 flex items-center justify-center overflow-hidden">
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
            {sidebarOpen && (
                <motion.h1 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-sm font-black tracking-tighter truncate ml-2 uppercase"
                >
                    {businessName}
                </motion.h1>
            )} 
            </div>
            
        </div>
    );
    // ------------------------

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen text-white shadow-2xl z-50 transition-all duration-300 ease-in-out border-r border-white/5
                ${sidebarOpen ? "w-64" : "w-20"}`}
                style={{ backgroundColor: '#0b1323' }} 
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
                    <LinkItem to= "/ordenes" icon={<span role="img" aria-label="Ordenes"><CircleDashed/></span>} label="Ordenes" />
                    {/* Puedes añadir más LinkItems aquí */}
                </nav>

                {/* Botón para contraer/expandir en Desktop */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-1/2 translate-y-1/2 w-6 h-6 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-xl border border-white/20 z-[60] transition-transform active:scale-90"
                >
                    {sidebarOpen ? <ChevronLeft size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
                </button>

                <div className="p-4 border-t border-white/5">
                    <div className={`flex items-center justify-center bg-white/5 rounded-xl py-2 transition-all ${!sidebarOpen ? 'px-0' : 'px-4'}`}>
                         <span className="text-[10px] font-black text-blue-400">
                            {sidebarOpen ? "V 1.0.4" : "1.0"}
                         </span>
                    </div>
                </div>
            </aside>

            {/* --- MOBILE SIDEBAR --- */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div className="lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
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
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}