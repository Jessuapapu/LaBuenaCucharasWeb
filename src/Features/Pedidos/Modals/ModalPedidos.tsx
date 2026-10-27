import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-[fade-in_0.3s_ease-out] sm:p-6">
            
            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-sky-200 bg-[#e8f0f4] shadow-2xl shadow-slate-950/30 md:h-[85vh]">
                
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-sky-200 bg-gradient-to-r from-sky-100 to-slate-100 p-5 sm:p-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="hidden rounded-xl border border-sky-200 bg-sky-200/70 p-3 text-[#147e9d] sm:block">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-3xl">
                                {pedidoEdicion ? `Actualizar Pedido #${pedidoEdicion.IdPedido}` : "Agrupar Órdenes en Pedido"}
                            </h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-600 md:text-sm">
                                {pedidoEdicion ? "Actualiza cliente y órdenes vinculadas" : "Elige un cliente y las órdenes para este pedido"}
                            </p>
                        </div>
                    </div>
                    <button onClick={alCerrar} aria-label="Cerrar" className="rounded-xl border border-slate-300 bg-slate-100 p-2.5 text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-95">
                        <X size={24} />
                    </button>
                </div>

                {/* CUERPO DIVIDIDO EN 2 COLUMNAS */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    
                    {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
                    <div className="flex max-h-[45%] w-full shrink-0 flex-col gap-6 overflow-y-auto border-b border-sky-200 bg-[#dfeaf0] p-5 sm:p-6 lg:max-h-none lg:w-[35%] lg:border-b-0 lg:border-r lg:p-8">
                        
                        <div>
                            <div className="mb-4 flex items-center gap-2 text-slate-700">
                                <Settings2 size={18} className="text-[#147e9d]" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Configuración</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-600">Tipo de pedido</label>
                                    <select value={tipoPedido} onChange={(e) => setTipoPedido(e.target.value)} className="w-full cursor-pointer rounded-xl border border-slate-300 bg-[#f3f7f9] px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-sky-500/30">
                                        <option value="EVENTO">🥂 Evento Especial</option>
                                        <option value="CONTRATO">🏢 Contrato Fijo Empresarial</option>
                                    </select>
                                </div>
                                
                                {pedidoEdicion && (
                                    <div className="space-y-2">
                                        <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-600">Estado del pedido</label>
                                        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full cursor-pointer rounded-xl border border-slate-300 bg-[#f3f7f9] px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-sky-500/30">
                                            <option value="PENDIENTE">⏳ Pendiente (En Proceso)</option>
                                            <option value="ENTREGADO">✅ Entregado / Finalizado</option>
                                            <option value="ANULADO">CN Anulado</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 border-t border-slate-300 pt-6">
                            <div className="mb-4 flex items-center gap-2 text-slate-700">
                                <User size={18} className="text-[#3b5bc6]" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Selección de Cliente</h3>
                            </div>
                            
                            {pedidoEdicion ? (
                                /* EN EDICIÓN: El cliente no se puede cambiar */
                                <div className="rounded-2xl border border-sky-200 bg-sky-100/70 p-5">
                                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-600">Cliente vinculado</span>
                                    <div className="text-lg font-black text-slate-900">{pedidoEdicion.NombreCliente || "Consumidor Final"}</div>
                                </div>
                            ) : (
                                /* EN CREACIÓN: Selector de cliente */
                                <div className="relative">
                                    <select 
                                        value={clienteSeleccionado} 
                                        onChange={(e) => manejarCambioCliente(e.target.value)}
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-[#f3f7f9] px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                                    >
                                        <option value="" disabled>Seleccione un cliente registrado...</option>
                                        <option value="Consumidor Final" className="font-bold text-[#147e9d]">Consumidor Final</option>
                                        {clientes
                                            .filter(cli => cli.IdCliente !== 1 && cli.NombreCliente !== 'EXPORANEO/COMEDOR' && cli.NombreCliente?.toUpperCase() !== 'EXPORANEO/COMEDOR')
                                            .map(cli => (
                                                <option key={cli.IdCliente} value={cli.NombreCliente}>
                                                    {cli.NombreCliente}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    {cargandoClientes && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#3b5bc6]" size={18}/>}
                                </div>
                            )}

                            {clienteSeleccionado && (
                                <div className="mt-6 rounded-xl border border-sky-200 bg-sky-100 p-4 text-center animate-[fade-in_0.3s_ease-out]">
                                    {cargandoDetalles ? (
                                        <Loader2 className="mx-auto animate-spin text-[#147e9d]" size={24}/>
                                    ) : (
                                        <>
                                            <span className="block text-2xl font-black text-[#147e9d]">{listaOrdenes.length}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Órdenes seleccionadas</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: PICKER DE ÓRDENES */}
                    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#edf3f6] lg:w-[65%]">
                        
                        {!clienteSeleccionado ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-sky-300 bg-sky-100">
                                    <User size={40} className="text-[#147e9d]" />
                                </div>
                                <h3 className="mb-2 text-xl font-black text-slate-800">Elige un cliente para comenzar</h3>
                                <p className="max-w-sm text-slate-600">Aquí aparecerán sus órdenes disponibles para que puedas agruparlas en este pedido.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full overflow-hidden animate-[fade-in_0.3s_ease-out]">
                                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-200/70 p-4 md:p-6">
                                    <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-700">
                                        <Receipt size={18} className="text-[#147e9d]" />
                                        Órdenes de <span className="text-slate-900">{clienteSeleccionado}</span>
                                    </span>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto bg-[#edf3f6] p-4 md:p-6 custom-scrollbar">
                                    {cargandoOrdenes || cargandoDetalles ? (
                                        <div className="py-20 flex flex-col items-center justify-center">
                                            <Loader2 className="mb-4 animate-spin text-[#147e9d]" size={32}/>
                                            <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">Cargando datos...</span>
                                        </div>
                                    ) : ordenes.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <Receipt size={48} className="mb-4 text-slate-400" />
                                            <p className="text-lg font-bold text-slate-700">No hay órdenes disponibles</p>
                                            <p className="text-sm text-slate-500">No encontramos más órdenes para este cliente.</p>
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
                                                        ? 'bg-sky-100 border-sky-400 shadow-sm shadow-sky-900/10' 
                                                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200/70 hover:border-sky-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <div className={`transition-colors ${seleccionado ? "text-[#147e9d]" : "text-slate-400"}`}>
                                                            {seleccionado ? <CheckSquare size={24}/> : <Square size={24}/>}
                                                        </div>
                                                        <div>
                                                            <span className="block font-mono text-lg font-black leading-none text-slate-900">Orden #{orderId}</span>
                                                            <span className="mt-1 block text-xs font-medium text-slate-600">
                                                                {new Date(ord.fecha || ord.Fecha || Date.now()).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short'})}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0 px-0 sm:px-4">
                                                        <div className="flex items-start gap-2 text-sm text-slate-700">
                                                            <Receipt size={16} className="mt-0.5 shrink-0 text-slate-500" />
                                                            <span className="line-clamp-2">
                                                                {ord.detalles && ord.detalles.length > 0 
                                                                    ? ord.detalles.map((d: any) => `${d.cantidad}x ${d.nombre_platillo}`).join(', ')
                                                                    : <span className="italic text-slate-500">Detalles no disponibles</span>}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 font-mono text-xl font-black text-emerald-800">
                                                        C${(ord.monto_total || ord.MontoTotal || ord.MONTO_TOTAL || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {/* Paginación interna */}
                                {!cargandoOrdenes && ordenes.length > 0 && (
                                    <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-200/70 p-4">
                                        <span className="mx-1 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
                                            Página {paginaOrdenes}
                                        </span>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={(e) => { e.preventDefault(); setPaginaOrdenes(p => Math.max(1, p - 1)); }} disabled={paginaOrdenes === 1} className="flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40">
                                                <ChevronLeft size={18}/> Anterior
                                            </button>
                                            <button type="button" onClick={(e) => { e.preventDefault(); setPaginaOrdenes(p => p + 1); }} disabled={!hayMasOrdenes} className="flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40">
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
                <div className="flex shrink-0 flex-col-reverse items-center justify-between gap-4 rounded-b-[2rem] border-t border-sky-200 bg-slate-200/70 p-5 sm:flex-row lg:px-8">
                    <p className="text-xs font-medium text-slate-600">Selecciona al menos una orden para crear el pedido.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={alCerrar} className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:flex-none">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            onClick={handleSubmit} 
                            disabled={procesando || listaOrdenes.length === 0} 
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#147e9d] to-[#3b5bc6] px-8 py-3 font-bold text-white shadow-lg shadow-blue-900/15 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:active:scale-100 sm:flex-none"
                        >
                            {procesando ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>} 
                            {pedidoEdicion ? "Guardar Cambios" : "Crear Pedido"}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
