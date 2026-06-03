import { useState } from 'react';
import { Edit, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Filter } from 'lucide-react';
import type { PedidoHistorial } from '../hooks/hookPedi2s';
import { useDetallesPedido } from '../hooks/hookPedi2s';

function DetallesDesplegables({ id_pedido }: { id_pedido: number }) {
    const { detalles, cargandoDetalles } = useDetallesPedido(id_pedido);

    if (cargandoDetalles) return <div className="p-4 text-center text-blue-400 text-sm"><Loader2 className="animate-spin inline mr-2"/>Cargando sub-órdenes vinculadas...</div>;
    if (detalles.length === 0) return <div className="p-4 text-center text-slate-500 text-sm">No hay detalles de facturación asignados.</div>;

    return (
        <div className="p-4 bg-[#050810]/50 border-t border-slate-800 shadow-inner pl-6 sm:pl-20">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Desglose de Órdenes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {detalles.map((d: any, i: number) => (
                    <div key={i} className="bg-slate-900/80 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                        <div>
                            <span className="text-blue-400 font-bold text-sm block">Orden #{d.IdOrden || d.IdOrdenes}</span>
                            <span className="text-xs text-slate-500">{d.NombrePlatillo || 'Menú de Consumo'}</span>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold">C${d.MontoTotal?.toFixed(2) || '0.00'}</span>
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
            case 'ENTREGADO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'ANULADO': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    return (
        <section className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col mt-2">
            
            {/* TOOLBAR */}
            <div className="bg-slate-900/50 border-b border-slate-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-widest text-sm">
                    <Filter size={18} className="text-blue-500" /> Registros de Pedidos Agrupados
                </div>
                {/* Nota: Mantenemos el control de tipo en UI por si requieres enviarlo al filtro del SP */}
                <select 
                    value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
                    className="bg-[#090D1A] border border-slate-700 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                    <option value="">Filtro de Tipo Especial</option>
                    <option value="EVENTO">Eventos</option>
                    <option value="CONTRATO">Contratos</option>
                </select>
            </div>

            {/* LISTADO RESPONSIVO */}
            <div className="flex flex-col divide-y divide-slate-800/60">
                {cargando ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32}/></div>
                ) : pedidos.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">No se encontraron registros de pedidos en este bloque.</div>
                ) : (
                    pedidos.map((ped: PedidoHistorial) => {
                        const estaExpandido = expandidos.has(ped.IdPedido);
                        return (
                            <div key={ped.IdPedido} className={`transition-colors ${estaExpandido ? 'bg-slate-800/20' : 'hover:bg-slate-800/30'}`}>
                                <div onClick={() => toggleExpandir(ped.IdPedido)} className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between cursor-pointer">
                                    
                                    {/* ID Pedido */}
                                    <div className="flex items-center gap-4 lg:w-[25%]">
                                        <button className={`p-2 rounded-lg border ${estaExpandido ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-transparent'}`}>
                                            {estaExpandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        <div>
                                            <span className="font-mono font-black text-white text-lg block leading-none">Pedido #{ped.IdPedido}</span>
                                        </div>
                                    </div>

                                    {/* Cliente */}
                                    <div className="flex flex-col lg:w-[30%]">
                                        <div className="flex items-center gap-1.5 text-base font-bold text-slate-200">
                                            <User size={15} className="text-blue-400"/> 
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
                                    <div className="flex justify-between items-center border-t border-slate-700/50 lg:border-none pt-4 lg:pt-0 lg:w-[25%] lg:justify-end gap-6">
                                        <span className="font-mono font-black text-emerald-400 text-xl leading-none">
                                            C${Number(ped.MONTO_TOTAL || 0).toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); alEditar(ped); }}
                                            className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
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
            <div className="p-4 sm:p-5 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pág <span className="text-white bg-slate-800 px-3 py-1.5 rounded-lg ml-1 border border-slate-700">{paginaActual}</span></span>
                    <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                        <select value={filasPorPagina} onChange={(e) => alCambiarFilas(Number(e.target.value))} className="bg-slate-800 border border-slate-700 text-white text-sm font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => cambiarPagina(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1 || cargando} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-xl transition-colors border border-slate-700"><ChevronLeft size={20}/> Anterior</button>
                    <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={!hayMasPaginas || cargando} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-xl transition-colors border border-slate-700">Siguiente <ChevronRight size={20}/></button>
                </div>
            </div>
        </section>
    );
}