import { useState } from 'react';
import { Edit, Calendar, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MapPin, Receipt, Search, Filter } from 'lucide-react';
import type { OrdenHistorial, DetalleOrden } from '../modales/hooks/hookOrdenes';
import { useImagenPlatillo } from "../../../context/Hooks/hookImagenes";

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
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-100/80 p-3 shadow-sm transition-colors hover:border-sky-200 sm:p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-16 sm:w-16">
                {cargando ? (
                    <Loader2 className="animate-spin text-sky-500" size={18}/>
                ) : Urlimagen ? (
                    <img src={Urlimagen} alt={det.nombre_platillo} className="w-full h-full object-cover"/>
                ) : (
                    <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-widest text-slate-400">Sin<br/>Img</span>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-xs font-black text-[#147e9d]">
                        {det.cantidad}x
                    </span>
                    <h5 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                        {det.nombre_platillo}
                    </h5>
                </div>
                <p className="text-xs font-medium text-slate-500">
                    Precio Unitario: C${det.precio_unitario.toFixed(2)}
                </p>
            </div>

            <div className="text-right shrink-0">
                <span className="block font-mono text-base font-black text-emerald-700 sm:text-lg">
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
            case 'ENTREGADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'ANULADO': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="flex flex-col">
            
            {/* ================= BARRA DE FILTROS ================= */}
            <div className="mb-2 rounded-t-2xl border-b border-slate-200 bg-slate-200/60 p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex w-full items-center gap-3 text-xl font-extrabold text-slate-800 lg:w-auto">
                        <span className="rounded-xl bg-sky-100 p-2.5 text-[#147e9d]"><Filter size={19} /></span>
                        <div><span className="block">Órdenes registradas</span><span className="mt-0.5 block text-xs font-medium text-slate-500">Busca y filtra el historial</span></div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" placeholder="Nombre del cliente..." onChange={(e) => alBuscarCliente(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-[#edf3f6] py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                            />
                        </div>

                        <div className="relative w-full sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">#</span>
                            <input 
                                type="text" placeholder="ID..." value={filtroId} onChange={(e) => setFiltroId(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-[#edf3f6] py-2.5 pl-8 pr-3 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                            />
                        </div>

                        <select 
                            value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-[#edf3f6] px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 sm:w-44"
                        >
                            <option value="">Todos los estados</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="ENTREGADO">Entregados</option>
                            <option value="ANULADO">Anulados</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ================= LISTA RESPONSIVA ================= */}
            <div className="flex min-h-[400px] flex-col rounded-b-2xl bg-slate-100/70 p-2 sm:p-4">
                <div className="flex flex-1 flex-col divide-y divide-slate-100">
                    {cargando ? (
                        <div className="flex flex-col items-center justify-center py-20 m-auto">
                            <Loader2 className="animate-spin text-sky-500 mb-4" size={40}/>
                            <span className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-500">Cargando órdenes...</span>
                        </div>
                    ) : ordenesFiltradas.length === 0 ? (
                        <div className="m-auto w-full rounded-xl border border-dashed border-slate-200 py-20 text-center font-medium text-slate-500">
                            No hay resultados que coincidan con tu búsqueda.
                        </div>
                    ) : (
                        ordenesFiltradas.map((ord) => {
                            const estaExpandido = expandidos.has(ord.id_pedido);
                            
                            return (
                                <div key={ord.id_pedido} className={`group flex flex-col rounded-xl transition-colors ${estaExpandido ? 'bg-sky-100/60' : 'hover:bg-slate-100/70'}`}>
                                    
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
                                                        estaExpandido ? 'border-sky-600 bg-[#147e9d] text-white shadow-md shadow-sky-900/15' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-sky-200 hover:text-[#147e9d]'
                                                    }`}
                                                >
                                                    {estaExpandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                                <div>
                                                    <span className="block font-mono text-lg font-black leading-none text-slate-800">#{ord.id_pedido}</span>
                                                    <span className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
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
                                            <span className="text-base font-bold text-slate-800">{ord.cliente?.nombre_cliente || "Consumidor Final"}</span>
                                            <div className="flex items-start gap-1.5 text-sm text-slate-500">
                                                <MapPin size={14} className="shrink-0 mt-0.5 text-slate-500" />
                                                <span className="truncate">{ord.cliente?.direccion_cliente || "Retiro en local"}</span>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex lg:w-[15%] justify-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getEstadoStyles(ord.estado_pedido)}`}>
                                                {ord.estado_pedido}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-4 lg:w-[25%] lg:justify-end lg:border-none lg:pt-0">
                                            <div className="flex flex-col lg:items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest lg:hidden mb-1">Total de Orden</span>
                                                <span className="font-mono text-xl font-black leading-none text-emerald-700">
                                                    C${ord.monto_total?.toFixed(2)}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alEditar(ord);
                                                }}
                                                className="flex items-center gap-2 rounded-xl border border-sky-100 bg-slate-50 p-2.5 text-[#147e9d] shadow-sm transition-all hover:border-sky-300 hover:bg-sky-100 active:scale-95 lg:opacity-0 lg:group-hover:opacity-100"
                                                title="Editar Orden"
                                            >
                                                <Edit size={18} />
                                                <span className="text-sm font-bold lg:hidden">Editar</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* ZONA EXPANDIDA */}
                                    {estaExpandido && (
                                        <div className="border-t border-sky-200 bg-sky-100/40 p-4 sm:p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Receipt size={18} className="text-[#147e9d]" />
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">Desglose de platillos</h4>
                                            </div>
                                            
                                            {ord.detalles && ord.detalles.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                    {ord.detalles.map((det, i) => (
                                                        <TarjetaPlatillo key={i} det={det} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6 text-center">
                                                    <p className="text-base font-medium text-slate-500">No hay platillos registrados en esta orden.</p>
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
                <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Página <span className="mx-1 rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-[#147e9d]">{paginaActual}</span>
                        </span>
                        
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Mostrar:</span>
                            <select 
                                value={filasPorPagina} 
                                onChange={(e) => alCambiarFilas(Number(e.target.value))}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
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
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-bold text-slate-600 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 disabled:opacity-40 sm:flex-none"
                        >
                            <ChevronLeft size={20}/> <span className="hidden sm:inline">Anterior</span>
                        </button>
                        <button 
                            onClick={() => cambiarPagina(paginaActual + 1)} 
                            disabled={!hayMasPaginas || cargando}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-bold text-slate-600 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 disabled:opacity-40 sm:flex-none"
                        >
                            <span className="hidden sm:inline">Siguiente</span> <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
