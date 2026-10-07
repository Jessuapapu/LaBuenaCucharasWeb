import { useState, useEffect } from 'react';
import { X, Save, Loader2, CheckSquare, Square, Receipt, ChevronLeft, ChevronRight, User, Settings2, ShoppingBag } from 'lucide-react';

// Hooks de Pedidos
import { useGestionOrdenes } from '../../Ordenes/hooks/hookOrdenes';
import { useMutarPedido, useDetallesPedido } from '../hooks/hookPedi2s'; 
import { useClientes } from '../../../context/Hooks/hookClientes';

export function ModalEditorPedido({ abierto, alCerrar, alCompletar, pedidoEdicion }: any) {
    const { crearPedido, actualizarPedido, procesando } = useMutarPedido();
    
    // --- ESTADOS BASE ---
    const [estado, setEstado] = useState("PENDIENTE");
    const [tipoPedido, setTipoPedido] = useState("EVENTO");
    
    // --- ESTADOS PARA CREACIÓN/EDICIÓN (Picker) ---
    const [clienteSeleccionado, setClienteSeleccionado] = useState("");
    const [listaOrdenes, setListaOrdenes] = useState<number[]>([]);
    const [paginaOrdenes, setPaginaOrdenes] = useState(1);

    // --- CARGA DE CATÁLOGOS ---
    const { clientes, loading: cargandoClientes } = useClientes();
    
    // 1. Traemos las órdenes disponibles del cliente seleccionado
    const { ordenes, cargando: cargandoOrdenes } = useGestionOrdenes(paginaOrdenes, 6, clienteSeleccionado);
    
    // 2. Si estamos en edición, traemos las órdenes que YA tenía este pedido
    const { detalles, cargandoDetalles } = useDetallesPedido(pedidoEdicion?.IdPedido || null);

    // --- SINCRONIZACIÓN AL ABRIR/CERRAR ---
    useEffect(() => {
        if (pedidoEdicion && abierto) {
            // MODO EDICIÓN
            setEstado(pedidoEdicion.Estado || "PENDIENTE");
            setTipoPedido(pedidoEdicion.Tipo || pedidoEdicion.TipoPedidos || "EVENTO");
            // Seteamos el cliente para que el hook de órdenes busque las de este cliente
            setClienteSeleccionado(pedidoEdicion.NombreCliente || "");
        } else if (!pedidoEdicion && abierto) {
            // MODO CREACIÓN
            setEstado("PENDIENTE");
            setTipoPedido("EVENTO");
            setClienteSeleccionado("");
            setListaOrdenes([]);
            setPaginaOrdenes(1);
        }
    }, [pedidoEdicion, abierto]);

    // Pre-llenar las órdenes seleccionadas cuando lleguen los detalles del backend
    useEffect(() => {
        if (abierto && pedidoEdicion && detalles.length > 0) {
            const idsOriginales = detalles.map((d: any) => d.IdOrden || d.IdOrdenes);
            setListaOrdenes(idsOriginales);
        }
    }, [detalles, abierto, pedidoEdicion]);

    const manejarCambioCliente = (nombreCliente: string) => {
        setClienteSeleccionado(nombreCliente);
        setListaOrdenes([]);
        setPaginaOrdenes(1);
    };

    if (!abierto) return null;

    const toggleOrdenSeleccionada = (idOrden: number) => {
        setListaOrdenes(prev => 
            prev.includes(idOrden) 
                ? prev.filter(id => id !== idOrden) 
                : [...prev, idOrden]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let exito = false;

        if (listaOrdenes.length === 0) {
            return alert("Debe seleccionar al menos 1 orden para el pedido.");
        }

        if (pedidoEdicion) {
            // EDICIÓN: Mandamos también la lista modificada
            exito = await actualizarPedido(pedidoEdicion.IdPedido, estado, tipoPedido, listaOrdenes);
        } else {
            // CREACIÓN
            exito = await crearPedido(listaOrdenes, tipoPedido);
        }

        if (exito) { 
            alCompletar(); 
            alCerrar(); 
        }
    };

    const hayMasOrdenes = ordenes.length === 6;

    return (
        <div className="fixed inset-0 bg-[#050810]/90 backdrop-blur-md z-40 flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.3s_ease-out]">
            
            {/* CONTENEDOR PRINCIPAL */}
            <div className="bg-[#0F172A] border border-slate-700/50 w-full max-w-6xl h-[95vh] md:h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5">
                
                {/* HEADER */}
                <div className="flex justify-between items-center p-6 lg:px-8 border-b border-white/5 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hidden sm:block">
                            <ShoppingBag className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                {pedidoEdicion ? `Actualizar Pedido #${pedidoEdicion.IdPedido}` : "Agrupar Órdenes en Pedido"}
                            </h2>
                            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-widest mt-1 font-bold">
                                {pedidoEdicion ? "Reestructuración y actualización" : "Selección de cliente y vinculación"}
                            </p>
                        </div>
                    </div>
                    <button onClick={alCerrar} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500/20 p-2.5 rounded-xl active:scale-95 transition-all border border-slate-700 hover:border-red-500/30">
                        <X size={24} />
                    </button>
                </div>

                {/* CUERPO DIVIDIDO EN 2 COLUMNAS */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    
                    {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
                    <div className="w-full lg:w-[35%] bg-slate-900/50 border-r border-white/5 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
                        
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-slate-300">
                                <Settings2 size={18} className="text-blue-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Configuración</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Operación</label>
                                    <select value={tipoPedido} onChange={(e) => setTipoPedido(e.target.value)} className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all">
                                        <option value="EVENTO">🥂 Evento Especial</option>
                                        <option value="CONTRATO">🏢 Contrato Fijo Empresarial</option>
                                    </select>
                                </div>
                                
                                {pedidoEdicion && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Estado del Pedido</label>
                                        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all">
                                            <option value="PENDIENTE">⏳ Pendiente (En Proceso)</option>
                                            <option value="ENTREGADO">✅ Entregado / Finalizado</option>
                                            <option value="ANULADO">CN Anulado</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 border-t border-white/5 pt-6">
                            <div className="flex items-center gap-2 mb-4 text-slate-300">
                                <User size={18} className="text-purple-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Selección de Cliente</h3>
                            </div>
                            
                            {pedidoEdicion ? (
                                /* EN EDICIÓN: El cliente no se puede cambiar */
                                <div className="bg-[#050810]/50 border border-slate-700 rounded-2xl p-5 shadow-inner">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Cliente Vinculado (Bloqueado)</span>
                                    <div className="text-lg font-black text-white">{pedidoEdicion.NombreCliente || "Consumidor Final"}</div>
                                </div>
                            ) : (
                                /* EN CREACIÓN: Selector de cliente */
                                <div className="relative">
                                    <select 
                                        value={clienteSeleccionado} 
                                        onChange={(e) => manejarCambioCliente(e.target.value)}
                                        className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 cursor-pointer appearance-none transition-all shadow-inner"
                                    >
                                        <option value="" disabled>Seleccione un cliente registrado...</option>
                                        <option value="Consumidor Final" className="font-bold text-blue-400">Consumidor Final</option>
                                        {clientes
                                            .filter(cli => cli.IdCliente !== 1 && cli.NombreCliente !== 'EXPORANEO/COMEDOR' && cli.NombreCliente?.toUpperCase() !== 'EXPORANEO/COMEDOR')
                                            .map(cli => (
                                                <option key={cli.IdCliente} value={cli.NombreCliente}>
                                                    {cli.NombreCliente}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    {cargandoClientes && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-purple-500" size={18}/>}
                                </div>
                            )}

                            {clienteSeleccionado && (
                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center animate-[fade-in_0.3s_ease-out]">
                                    {cargandoDetalles ? (
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={24}/>
                                    ) : (
                                        <>
                                            <span className="block text-2xl font-black text-blue-400">{listaOrdenes.length}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Órdenes Seleccionadas</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: PICKER DE ÓRDENES */}
                    <div className="w-full lg:w-[65%] bg-[#0A0F1D] flex flex-col relative overflow-hidden">
                        
                        {!clienteSeleccionado ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-600">
                                    <User size={40} className="text-slate-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-300 mb-2">Esperando Selección</h3>
                                <p className="text-slate-500 max-w-sm">Selecciona un cliente en el panel izquierdo para cargar sus órdenes disponibles y agregarlas a este pedido.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full overflow-hidden animate-[fade-in_0.3s_ease-out]">
                                <div className="p-4 md:p-6 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center shrink-0">
                                    <span className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                        <Receipt size={18} className="text-emerald-500" />
                                        Órdenes de <span className="text-white">{clienteSeleccionado}</span>
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-3 bg-[#0A0F1D]">
                                    {cargandoOrdenes || cargandoDetalles ? (
                                        <div className="py-20 flex flex-col items-center justify-center">
                                            <Loader2 className="animate-spin text-blue-500 mb-4" size={32}/>
                                            <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">Cargando datos...</span>
                                        </div>
                                    ) : ordenes.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <Receipt size={48} className="text-slate-700 mb-4" />
                                            <p className="text-lg font-bold text-slate-400">Sin órdenes recientes</p>
                                            <p className="text-sm text-slate-500">No se encontraron más órdenes para este cliente.</p>
                                        </div>
                                    ) : (
                                        ordenes.map((ord: any) => {
                                            // Compatibilidad si la key viene como id_pedido u IdOrdenes
                                            const orderId = ord.id_pedido || ord.IdOrdenes;
                                            const seleccionado = listaOrdenes.includes(orderId);
                                            
                                            return (
                                                <div 
                                                    key={orderId} 
                                                    onClick={() => toggleOrdenSeleccionada(orderId)}
                                                    className={`p-4 md:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer rounded-2xl border transition-all duration-200 shadow-sm ${
                                                        seleccionado 
                                                        ? 'bg-blue-600/10 border-blue-500/50 hover:bg-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <div className={`transition-colors ${seleccionado ? "text-blue-500" : "text-slate-600"}`}>
                                                            {seleccionado ? <CheckSquare size={24}/> : <Square size={24}/>}
                                                        </div>
                                                        <div>
                                                            <span className="font-mono font-black text-white text-lg block leading-none">Ord #{orderId}</span>
                                                            <span className="text-xs text-slate-400 mt-1 block font-medium">
                                                                {new Date(ord.fecha || ord.Fecha || Date.now()).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short'})}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0 px-0 sm:px-4">
                                                        <div className="flex items-start gap-2 text-sm text-slate-300">
                                                            <Receipt size={16} className="shrink-0 mt-0.5 text-slate-500" />
                                                            <span className="line-clamp-2">
                                                                {ord.detalles && ord.detalles.length > 0 
                                                                    ? ord.detalles.map((d: any) => `${d.cantidad}x ${d.nombre_platillo}`).join(', ')
                                                                    : <span className="italic text-slate-500">Detalles no disponibles</span>}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="font-mono font-black text-emerald-400 text-xl shrink-0">
                                                        C${(ord.monto_total || ord.MontoTotal || ord.MONTO_TOTAL || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {/* Paginación interna */}
                                {!cargandoOrdenes && ordenes.length > 0 && (
                                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-3 py-1.5 rounded-lg mx-1 border border-slate-700">
                                            Página {paginaOrdenes}
                                        </span>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={(e) => { e.preventDefault(); setPaginaOrdenes(p => Math.max(1, p - 1)); }} disabled={paginaOrdenes === 1} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold rounded-xl transition-colors border border-slate-700">
                                                <ChevronLeft size={18}/> Anterior
                                            </button>
                                            <button type="button" onClick={(e) => { e.preventDefault(); setPaginaOrdenes(p => p + 1); }} disabled={!hayMasOrdenes} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold rounded-xl transition-colors border border-slate-700">
                                                Siguiente <ChevronRight size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="p-6 lg:px-8 border-t border-slate-700 bg-slate-900/90 rounded-b-[2rem] flex flex-col-reverse sm:flex-row justify-between items-center gap-4 shrink-0">
                    <p className="text-xs text-slate-500 font-medium">Asegúrese de guardar los cambios antes de cerrar esta ventana.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={alCerrar} className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-600 shadow-sm">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            onClick={handleSubmit} 
                            disabled={procesando || listaOrdenes.length === 0} 
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 border border-emerald-500/50"
                        >
                            {procesando ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>} 
                            {pedidoEdicion ? "Guardar Cambios" : "Crear Pedido"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}