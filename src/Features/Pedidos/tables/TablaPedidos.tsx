import { useState } from 'react';
import { Edit, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Filter } from 'lucide-react';
import type { PedidoHistorial } from '../hooks/hookPedi2s';
import { useDetallesPedido } from '../hooks/hookPedi2s';

function DetallesDesplegables({ id_pedido }: { id_pedido: number }) {
    const { detalles, cargandoDetalles } = useDetallesPedido(id_pedido);

    if (cargandoDetalles) return <div className="p-4 text-center text-[#147e9d] text-sm"><Loader2 className="animate-spin inline mr-2"/>Cargando órdenes vinculadas...</div>;
    if (detalles.length === 0) return <div className="p-4 text-center text-slate-500 text-sm">No hay detalles de facturación asignados.</div>;

    return (
        <div className="border-t border-sky-200 bg-sky-100/50 p-4 pl-6 sm:pl-20">
            <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-600">Desglose de órdenes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {detalles.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-3">
                        <div>
                            <span className="block text-sm font-bold text-[#147e9d]">Orden #{d.IdOrden || d.IdOrdenes}</span>
                            <span className="text-xs text-slate-500">{d.NombrePlatillo || 'Menú de Consumo'}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-800">C${d.MontoTotal?.toFixed(2) || '0.00'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TablaPedidos({ pedidos, cargando, paginaActual, cambiarPagina, hayMasPaginas, alEditar, filasPorPagina, alCambiarFilas, filtroTipo, setFiltroTipo }: any) {
    const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

    const toggleExpandir = (id: number) => {
        const nuevos = new Set(expandidos);
        if (nuevos.has(id)) nuevos.delete(id);
        else nuevos.add(id);
        setExpandidos(nuevos);
    };

    const getEstadoStyles = (estado: string) => {
        switch (estado?.toUpperCase()) {
            case 'ENTREGADO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'ANULADO': return 'bg-rose-100 text-rose-800 border-rose-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    return (
        <section className="mt-2 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#e9f0f4] shadow-sm">
            
            {/* TOOLBAR */}
            <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-200 bg-slate-200/60 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700">
                    <Filter size={18} className="text-[#147e9d]" /> Tipo de pedido
                </div>
                {/* Nota: Mantenemos el control de tipo en UI por si requieres enviarlo al filtro del SP */}
                <select 
                    value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
                    className="cursor-pointer rounded-xl border border-slate-300 bg-[#edf3f6] px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                    <option value="">Todos los tipos</option>
                    <option value="EVENTO">Eventos</option>
                    <option value="CONTRATO">Contratos</option>
                </select>
            </div>

            {/* LISTADO RESPONSIVO */}
            <div className="flex flex-col divide-y divide-slate-200 bg-slate-100/70">
                {cargando ? (
                    <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-[#147e9d]" size={32}/></div>
                ) : pedidos.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">No se encontraron registros de pedidos en este bloque.</div>
                ) : (
                    pedidos.map((ped: PedidoHistorial) => {
                        const estaExpandido = expandidos.has(ped.IdPedido);
                        return (
                            <div key={ped.IdPedido} className={`transition-colors ${estaExpandido ? 'bg-sky-100/60' : 'hover:bg-slate-200/50'}`}>
                                <div onClick={() => toggleExpandir(ped.IdPedido)} className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between cursor-pointer">
                                    
                                    {/* ID Pedido */}
                                    <div className="flex items-center gap-4 lg:w-[25%]">
                                        <button className={`rounded-lg border p-2 ${estaExpandido ? 'border-sky-600 bg-[#147e9d] text-white' : 'border-slate-300 bg-slate-100 text-slate-500'}`}>
                                            {estaExpandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        <div>
                                            <span className="block font-mono text-lg font-black leading-none text-slate-900">Pedido #{ped.IdPedido}</span>
                                        </div>
                                    </div>

                                    {/* Cliente */}
                                    <div className="flex flex-col lg:w-[30%]">
                                        <div className="flex items-center gap-1.5 text-base font-bold text-slate-800">
                                            <User size={15} className="text-[#147e9d]"/> 
                                            {ped.NombreCliente || 'Consumidor Final'}
                                        </div>
                                    </div>

                                    {/* Estado */}
                                    <div className="flex justify-start lg:w-[20%]">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getEstadoStyles(ped.Estado)}`}>
                                            {ped.Estado || 'PENDIENTE'}
                                        </span>
                                    </div>

                                    {/* Monto Total y Botón de Acciones */}
                                    <div className="flex items-center justify-between gap-6 border-t border-slate-200 pt-4 lg:w-[25%] lg:justify-end lg:border-none lg:pt-0">
                                        <span className="font-mono text-xl font-black leading-none text-emerald-800">
                                            C${Number(ped.MONTO_TOTAL || 0).toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); alEditar(ped); }}
                                            className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-100 p-2.5 text-[#147e9d] shadow-sm transition-all hover:bg-sky-200 active:scale-95"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </div>
                                </div>

                                {estaExpandido && <DetallesDesplegables id_pedido={ped.IdPedido} />}
                            </div>
                        );
                    })
                )}
            </div>
            
            {/* PAGINACIÓN */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-200/60 p-4 sm:flex-row sm:p-5">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-600">Pág <span className="ml-1 rounded-lg border border-sky-200 bg-sky-100 px-3 py-1.5 text-[#147e9d]">{paginaActual}</span></span>
                    <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                        <select value={filasPorPagina} onChange={(e) => alCambiarFilas(Number(e.target.value))} className="cursor-pointer rounded-lg border border-slate-300 bg-[#edf3f6] px-2 py-1.5 text-sm font-bold text-slate-700 outline-none">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => cambiarPagina(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1 || cargando} className="flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={20}/> Anterior</button>
                    <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={!hayMasPaginas || cargando} className="flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40">Siguiente <ChevronRight size={20}/></button>
                </div>
            </div>
        </section>
    );
}
