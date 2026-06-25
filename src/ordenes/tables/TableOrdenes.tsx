import { useState } from 'react';
import { Edit, Calendar, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MapPin, Receipt, Search, Filter } from 'lucide-react';
import type { OrdenHistorial, DetalleOrden } from '../hooks/hookOrdenes';
import { useImagenPlatillo } from "../../components/Hooks/hookImagenes";

interface TablaOrdenesProps {
    ordenes: OrdenHistorial[];
    cargando: boolean;
    paginaActual: number;
    cambiarPagina: (nuevaPagina: number) => void;
    hayMasPaginas: boolean;
    alEditar: (orden: OrdenHistorial) => void;
    alBuscarCliente: (cliente: string) => void;
    filasPorPagina: number;
    alCambiarFilas: (filas: number) => void;
}

// Subcomponente: Platillo
function TarjetaPlatillo({ det }: { det: DetalleOrden }) {
    const { Urlimagen, cargando } = useImagenPlatillo(det.nombre_platillo);

    return (
        <div className="flex items-center gap-4 bg-slate-900/40 p-3 sm:p-4 rounded-xl border border-slate-800/60 hover:bg-slate-800/50 transition-colors shadow-inner">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-950/50 overflow-hidden shrink-0 flex items-center justify-center border border-slate-700/50">
                {cargando ? (
                    <Loader2 className="animate-spin text-sky-500" size={18}/>
                ) : Urlimagen ? (
                    <img src={Urlimagen} alt={det.nombre_platillo} className="w-full h-full object-cover"/>
                ) : (
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center leading-tight">Sin<br/>Img</span>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-sky-500/20 text-sky-400 font-black text-xs px-2 py-0.5 rounded">
                        {det.cantidad}x
                    </span>
                    <h5 className="text-sm sm:text-base text-white font-bold truncate">
                        {det.nombre_platillo}
                    </h5>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                    Precio Unitario: C${det.precio_unitario.toFixed(2)}
                </p>
            </div>

            <div className="text-right shrink-0">
                <span className="font-mono text-base sm:text-lg font-black text-emerald-400 block">
                    C${(det.cantidad * det.precio_unitario).toFixed(2)}
                </span>
            </div>
        </div>
    );
}

export function TablaOrdenes({ 
    ordenes, cargando, paginaActual, cambiarPagina, hayMasPaginas, alEditar, alBuscarCliente, 
    filasPorPagina, alCambiarFilas 
}: TablaOrdenesProps) {
    const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
    
    // Estados de filtros locales
    const [filtroId, setFiltroId] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    const toggleExpandir = (id: number) => {
        const nuevosExpandidos = new Set(expandidos);
        if (nuevosExpandidos.has(id)) nuevosExpandidos.delete(id);
        else nuevosExpandidos.add(id);
        setExpandidos(nuevosExpandidos);
    };

    // Aplicar filtros
    const ordenesFiltradas = ordenes.filter(o => {
        const matchId = filtroId ? String(o.id_pedido).includes(filtroId) : true;
        const matchEstado = filtroEstado ? o.estado_pedido === filtroEstado : true;
        return matchId && matchEstado;
    });

    const getEstadoStyles = (estado: string) => {
        switch (estado) {
            case 'ENTREGADO': return 'bg-emerald-300/70 text-emerald-600 border-emerald-500/30';
            case 'ANULADO': return 'bg-rose-300/70 text-rose-600 border-rose-500/30';
            default: return 'bg-amber-300/70 text-amber-600 border-amber-500/30';
        }
    };

    return (
        <div className="flex flex-col">
            
            {/* ================= BARRA DE FILTROS ================= */}
            <div className="p-5 border-b border-slate-800/50 bg-slate-900/40 rounded-t-xl mb-2">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full lg:w-auto text-white text-2xl font-bold">
                        <Filter size={24} className="text-sky-500" />
                        Historial Activo
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="text" placeholder="Nombre del cliente..." onChange={(e) => alBuscarCliente(e.target.value)}
                                className="w-full bg-slate-950/20 border border-slate-800/60 rounded-xl py-2 pl-9 pr-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-inner placeholder:text-black"
                            />
                        </div>

                        <div className="relative w-full sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">#</span>
                            <input 
                                type="text" placeholder="ID..." value={filtroId} onChange={(e) => setFiltroId(e.target.value)}
                                className="w-full bg-slate-950/20 border border-slate-800/60 rounded-xl py-2 pl-8 pr-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-inner placeholder:text-black"
                            />
                        </div>

                        <select 
                            value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full sm:w-44 bg-slate-950/20 border border-slate-800/60 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none shadow-inner"
                        >
                            <option value="" className="bg-slate-900 text-white">Todos los estados</option>
                            <option value="PENDIENTE" className="bg-slate-900 text-white">Pendientes</option>
                            <option value="ENTREGADO" className="bg-slate-900 text-white">Entregados</option>
                            <option value="ANULADO" className="bg-slate-900 text-white">Anulados</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ================= LISTA RESPONSIVA ================= */}
            <div className="p-4 bg-slate-950/20 rounded-b-xl flex flex-col min-h-[400px]">
                <div className="flex flex-col divide-y divide-slate-800/40 flex-1">
                    {cargando ? (
                        <div className="flex flex-col items-center justify-center py-20 m-auto">
                            <Loader2 className="animate-spin text-sky-500 mb-4" size={40}/>
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Cargando base de datos...</span>
                        </div>
                    ) : ordenesFiltradas.length === 0 ? (
                        <div className="text-center py-20 m-auto text-slate-500 font-medium border border-dashed border-slate-800/50 rounded-xl w-full">
                            No hay resultados que coincidan con tu búsqueda.
                        </div>
                    ) : (
                        ordenesFiltradas.map((ord) => {
                            const estaExpandido = expandidos.has(ord.id_pedido);
                            
                            return (
                                <div key={ord.id_pedido} className={`flex flex-col transition-colors group ${estaExpandido ? 'bg-slate-800/30' : 'hover:bg-slate-800/20'}`}>
                                    
                                    {/* FILA PRINCIPAL CLICKEABLE */}
                                    <div 
                                        onClick={() => toggleExpandir(ord.id_pedido)}
                                        className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between cursor-pointer"
                                    >
                                        
                                        <div className="flex items-center justify-between lg:justify-start gap-4 lg:w-[20%]">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExpandir(ord.id_pedido);
                                                    }}
                                                    className={`p-2 rounded-lg transition-all border active:scale-95 ${
                                                        estaExpandido ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/40 text-slate-400 border-slate-800/60 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    {estaExpandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                                <div>
                                                    <span className="font-mono font-black text-black text-lg block leading-none">#{ord.id_pedido}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                                                        <Calendar size={12}/> {new Date(ord.fecha).toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="lg:hidden">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getEstadoStyles(ord.estado_pedido)}`}>
                                                    {ord.estado_pedido}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 lg:w-[30%]">
                                            <span className="font-bold text-black text-base">{ord.cliente?.nombre_cliente || "Consumidor Final"}</span>
                                            <div className="flex items-start gap-1.5 text-sm text-black">
                                                <MapPin size={14} className="shrink-0 mt-0.5 text-slate-500" />
                                                <span className="truncate">{ord.cliente?.direccion_cliente || "Retiro en local"}</span>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex lg:w-[15%] justify-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getEstadoStyles(ord.estado_pedido)}`}>
                                                {ord.estado_pedido}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-slate-800/40 lg:border-none pt-4 lg:pt-0 lg:w-[25%] lg:justify-end gap-6">
                                            <div className="flex flex-col lg:items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest lg:hidden mb-1">Total de Orden</span>
                                                <span className="font-mono font-black text-emerald-700 text-xl leading-none">
                                                    C${ord.monto_total?.toFixed(2)}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alEditar(ord);
                                                }}
                                                className="flex items-center gap-2 p-2.5 bg-slate-900/40 hover:bg-sky-500 text-sky-400 hover:text-white rounded-xl transition-all border border-slate-800/60 hover:border-sky-500 shadow-sm active:scale-95 lg:opacity-0 lg:group-hover:opacity-100"
                                                title="Editar Orden"
                                            >
                                                <Edit size={18} />
                                                <span className="text-sm font-bold lg:hidden">Editar</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* ZONA EXPANDIDA */}
                                    {estaExpandido && (
                                        <div className="p-4 sm:p-6 bg-slate-950/40 border-t border-slate-800/50 shadow-inner">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Receipt size={18} className="text-sky-400" />
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Desglose de Platillos</h4>
                                            </div>
                                            
                                            {ord.detalles && ord.detalles.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                    {ord.detalles.map((det, i) => (
                                                        <TarjetaPlatillo key={i} det={det} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-900/40 border border-dashed border-slate-800/60 rounded-2xl p-6 text-center shadow-inner">
                                                    <p className="text-base text-slate-500 font-medium">No hay platillos registrados en esta orden.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* ================= PAGINACIÓN INFERIOR ================= */}
                <div className="pt-4 mt-4 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Página <span className="text-white bg-slate-900 px-3 py-1.5 rounded-lg mx-1 shadow-inner border border-slate-800/60">{paginaActual}</span>
                        </span>
                        
                        <div className="flex items-center gap-2 border-l border-slate-800/60 pl-4">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Mostrar:</span>
                            <select 
                                value={filasPorPagina} 
                                onChange={(e) => alCambiarFilas(Number(e.target.value))}
                                className="bg-slate-900/60 border border-slate-800/60 text-white text-sm font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-inner"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value={999999}>Todas</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <button 
                            onClick={() => cambiarPagina(Math.max(1, paginaActual - 1))} 
                            disabled={paginaActual === 1 || cargando}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/40 hover:bg-slate-800/60 disabled:opacity-40 disabled:hover:bg-slate-900/40 text-slate-300 font-bold rounded-xl transition-all border border-slate-800/50 shadow-sm"
                        >
                            <ChevronLeft size={20}/> <span className="hidden sm:inline">Anterior</span>
                        </button>
                        <button 
                            onClick={() => cambiarPagina(paginaActual + 1)} 
                            disabled={!hayMasPaginas || cargando}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/40 hover:bg-slate-800/60 disabled:opacity-40 disabled:hover:bg-slate-900/40 text-slate-300 font-bold rounded-xl transition-all border border-slate-800/50 shadow-sm"
                        >
                            <span className="hidden sm:inline">Siguiente</span> <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}