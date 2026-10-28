import { X, CircleDashed, Tag, Home, ClipboardList, FileText, UtensilsCrossed, CalendarDays, 
    Users, Package, CogIcon, ChefHat } from "lucide-react";
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
        return `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/10"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
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
        <div className={`flex items-center ${sidebarOpen ? "justify-start gap-3 pl-4" : "justify-center"} h-20 border-b border-slate-100  p-3 transition-all duration-300`}>
            <div className="h-10 w-10 shrink-0 flex items-center justify-center overflow-hidden bg-slate-50 rounded-xl p-1 shadow-sm border border-slate-100 ">
              {logoSrc ? (
                // Usamos la etiqueta <img> para mostrar el logo
                <img 
                    src={logoSrc} 
                    alt={`Logo de ${businessName}`} 
                    className="max-h-full max-w-full object-contain"
                />
            ) : (
                // Fallback si no hay logo
                <h1 className="text-base font-black text-blue-600 tracking-wider">{businessName}</h1>
            )} 
            {sidebarOpen && (
                <motion.h1 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-sm font-black tracking-tight text-slate-800 truncate ml-2 uppercase"
                >
                    {businessName}
                </motion.h1>
            )} 
            </div>
            
        </div>
    );

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            <aside
                onMouseEnter={() => setSidebarOpen(true)}  // Abre al posicionarse encima
                onMouseLeave={() => setSidebarOpen(false)} // Cierra al retirar el mouse
                //Para mas suave el tono dl sidebar: from-blue-400 via-blue-200 to-blue-600/60
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-gradient-to-r from-cyan-400/60 to-blue-500 backdrop-blur-md shadow-xl shadow-blue-600/15 z-50 transition-all duration-300 ease-in-out border-r border-white/30
                ${sidebarOpen ? "w-64" : "w-20"}`}
                //style={{ backgroundColor: '#0b1323' }} 
            >
                {/* Nuevo Componente de Logo */}
                <LogoDisplay /> 

                <nav className="flex-1 px-3 py-6 space-y- overflow-y-auto custom-scrollbar">
                    <LinkItem to="/" icon={<Home/>} label="Inicio" />
                    <LinkItem to= "/ordenes" icon={<ClipboardList/>} label="Ordenes" />
                    <LinkItem to="/Pedidos" icon={<FileText/>} label="Pedidos" />
                    <LinkItem to="/Facturas" icon={<FileText/>} label="Facturas" />
                    <LinkItem to="/Comidas" icon={<UtensilsCrossed/>} label="Comidas" />
                    <LinkItem to="/Menu_Diario" icon={<CalendarDays/>} label="Menu Diario" />
                    <LinkItem to="/Clientes" icon={<Users/>} label="Clientes" />
                    <LinkItem to="/Inventario" icon={<Package/>} label="Inventario" />
                    <LinkItem to= "/Mesas" icon={<CircleDashed/>} label="Mesas" />
                    <LinkItem to= "/Cocina" icon={<ChefHat/>} label="Cocina" />
                    <LinkItem to= "/Caja" icon={<Tag/>} label="Caja" />
                    <LinkItem to= "/Configuracion" icon={<CogIcon/>} label="Configuracion" />
                    {/* Puedes añadir más LinkItems aquí */}
                </nav>

                {/* Botón para contraer/expandir en Desktop */}
                {/*<button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-1/2 translate-y-1/2 w-6 h-6 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-xl border border-white/20 z-[60] transition-transform active:scale-90"
                >
                    {sidebarOpen ? <ChevronLeft size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
                </button>*/}
                

                <div className="p-4 border-t border-slate-100">
                    <div className={`flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl py-2 transition-all ${!sidebarOpen ? 'px-0' : 'px-4'}`}>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                        />

                        <motion.aside
                            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-br from-[#d9edf2] via-[#e5efe8] to-[#f5e5d4] text-slate-800 z-50 p-4 lg:hidden shadow-2xl flex flex-col border-r border-sky-200"
                            //style={{ backgroundColor: '#004aad' }} // COLOR EXACTO DEL LOGO
                        >
                            <div className="flex justify-between items-center mb-4">
                                {/* Logo en Móvil */}
                                <LogoDisplay />

                                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                                {/* Navegación móvil abreviada o completa */}
                                <Link to="/" onClick={() => setSidebarOpen(false)} className={getLinkClass("/")}>🏠 Inicio</Link>
                                <Link to="/Pedidos" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Pedidos")}>📝 Pedidos</Link>
                                <Link to="/Comidas" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Comidas")}>🍔 Comidas</Link>
                                <Link to="/Menu_Diario" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Menu_Diario")}>🧾 Menu Diario</Link>
                                <Link to="/ordenes" onClick={() => setSidebarOpen(false)} className={getLinkClass("/ordenes")}>🧾 Ordenes</Link>
                                <Link to="/Facturas" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Facturas")}>🧾 Facturas</Link>
                                <Link to="/Clientes" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Clientes")}>👤 Clientes</Link>
                                <Link to="/Inventario" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Inventario")}>📦 Inventario</Link>
                                <Link to="/Mesas" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Mesas")}>🪑 Mesas</Link>
                                <Link to="/Caja" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Caja")}>💵 Caja</Link>
                                <Link to="/Configuracion" onClick={() => setSidebarOpen(false)} className={getLinkClass("/Configuracion")}>⚙️ Configuración</Link>
                            </nav>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
