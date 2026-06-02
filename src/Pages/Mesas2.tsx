import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';

// Interfaces
import type { ComedorOrdenIN, Detalles } from "../components/modals/ModalMostrarDetalles";

// Hooks
import { useMenu, useEstado } from "../components/Hooks/hookComedor";
import { useOrdenesMesa, useDetalleOrden, useCancelarOrden, type OrdenComedor } from "../components/Hooks/hookOrdenes";
import { useCrearOrden, useActualizarOrden, useGuardarOrden } from "../components/Hooks/hookOrdenes";

// Servicio de WebSocket para tiempo real
import { socket } from "../services/websocket";

// Componentes
import { MenuDiaGrid } from "../grid/MenuGrid";
import { OrdenActivaTable } from "../components/table/OrdenActivaTable";
import { ModalPlatilloExtra } from "../components/modals/ModalDetallesExtra";
import { ModalDetalleOrden } from "../components/modals/ModalMostrarDetalles";
import { ModalDialogo } from "../components/modals/ModalDialogo";

// Iconos UI Premium
import { ArrowLeft, Receipt, ChefHat, History, Search, Loader2, ChevronRight, AlertCircle, Power } from 'lucide-react';

export function MenuMesas() {
    
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const { ordenActiva, historial, cargando, refresh: refreshOrden } = useOrdenesMesa(id) as any;

    const estadoComedor = useEstado();
    const menu = useMenu();
    
    const { detallesOrden, cargandoDetalles, obtenerDetalle } = useDetalleOrden();

    const { crear, cargando: creando } = useCrearOrden();
    const { actualizar, cargando: actualizando } = useActualizarOrden();
    const { guardar, cargando: cerrando } = useGuardarOrden();
    const { cancelar, cargando: cancelando } = useCancelarOrden();
    
    const cargandoAccionWebsocket = creando || actualizando || cerrando || cancelando;

    const [borrador, setBorrador] = useState<Detalles[]>([]);
    const [modalExtraAbierto, setModalExtraAbierto] = useState(false);
    const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);

    // @ts-ignore
    const [idOrdenHistorial, setIdOrdenHistorial] = useState<number | null>(null); 

    const [dialogo, setDialogo] = useState({
        abierto: false,
        tipo: 'info' as 'exito' | 'peligro' | 'info',
        titulo: '',
        mensaje: '',
        textoConfirmar: 'Aceptar',
        mostrarCancelar: false,
        accionConfirmar: () => navigate('/mesa')
    });

    const cerrarDialogo = () => setDialogo(prev => ({ ...prev, abierto: false }));

    const mostrarAlerta = (titulo: string, mensaje: string, tipo: 'exito' | 'peligro' | 'info' = 'exito', accionPostAlerta?: () => void) => {
        setDialogo({
            abierto: true, tipo, titulo, mensaje, textoConfirmar: 'Entendido',
            mostrarCancelar: false, 
            accionConfirmar: () => {
                cerrarDialogo();
                if (accionPostAlerta) accionPostAlerta();
            }
        });
    };

    const mostrarConfirmacion = (titulo: string, mensaje: string, accionConfirmar: () => void, tipo: 'peligro' | 'info' = 'peligro') => {
        setDialogo({
            abierto: true, tipo, titulo, mensaje, textoConfirmar: 'Sí, continuar',
            mostrarCancelar: true, 
            accionConfirmar: () => {
                cerrarDialogo();
                accionConfirmar();
            }
        });
    };

    // 🚀 REFERENCIA MUTABLE: Mantiene siempre el estado real de ordenActiva accesible al WebSocket
    const ordenActivaRef = useRef(ordenActiva);
    useEffect(() => {
        ordenActivaRef.current = ordenActiva;
    }, [ordenActiva]);

    // 🌐 HANDLER DE WEBSOCKET: Escucha "orden_actualizada" de forma asíncrona y segura
    useEffect(() => {
        const handleOrdenActualizadaWebsocket = (data: { IdMesa: number }) => {
            if (Number(data.IdMesa) === Number(id)) {
                console.log(`[WebSocket] Sincronizando Mesa #${id} por actualización externa...`);
                
                // 1. Refrescar estado de la mesa (GET HTTP) para interceptar nuevas órdenes creadas
                if (refreshOrden) {
                    refreshOrden();
                }
                
                // 2. Extraer los platos actualizados utilizando la referencia síncrona
                const currentOrden = ordenActivaRef.current;
                if (currentOrden?.IdOrden && obtenerDetalle) {
                    obtenerDetalle(currentOrden.IdOrden);
                }
            }
        };

        socket.on("orden_actualizada", handleOrdenActualizadaWebsocket);

        return () => {
            socket.off("orden_actualizada", handleOrdenActualizadaWebsocket);
        };
    }, [id, obtenerDetalle, refreshOrden]);

    // CONTROL DE CICLOS 1: Sincronización del IdOrden primitivo al montar o cambiar de mesa
    useEffect(() => {
        if (ordenActiva?.IdOrden && obtenerDetalle) {
            obtenerDetalle(ordenActiva.IdOrden);
        } else if (borrador.length > 0) {
            setBorrador([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordenActiva?.IdOrden]); 

    // CONTROL DE CICLOS 2: Deep mapping comparativo para blindar la UI contra re-renders infinitos
    useEffect(() => {
        if (detallesOrden && ordenActiva) {
            const datosMapeados = detallesOrden.map(d => ({
                nombre_platillo: d.nombre_platillo,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario
            }));

            if (JSON.stringify(borrador) !== JSON.stringify(datosMapeados)) {
                setBorrador(datosMapeados);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(detallesOrden), ordenActiva?.IdOrden]);

    const agregarAlBorrador = (nombre: string, precio: number, cantidadAdd: number = 1) => {
        setBorrador(prev => {
            const existe = prev.find(p => p.nombre_platillo === nombre);
            if (existe) {
                return prev.map(p => p.nombre_platillo === nombre ? { ...p, cantidad: p.cantidad + cantidadAdd } : p);
            }
            return [...prev, { nombre_platillo: nombre, precio_unitario: precio, cantidad: cantidadAdd }];
        });
    };

    const modificarCantidadBorrador = (nombre: string, delta: number) => {
        setBorrador(prev => prev.map(item => {
            if (item.nombre_platillo === nombre) return { ...item, cantidad: item.cantidad + delta };
            return item;
        }).filter(item => item.cantidad > 0)); 
    };

    const generarPayload = (): ComedorOrdenIN => ({ IdMesa: Number(id), Detalles: borrador });

    const manejarCrearOActualizar = () => {
        if (borrador.length === 0) return;
        const payload = generarPayload();
        
        if (ordenActiva) {
            actualizar(payload, () => mostrarAlerta("¡Actualizado!", "Los platillos se mandaron a cocina correctamente.", "exito"));
        } else {
            crear(payload, () => mostrarAlerta("¡Orden Enviada!", "El ticket fue abierto exitosamente.", "exito", () => window.location.reload()));
        }
    };

    const manejarTerminarOrden = () => {
        if (!ordenActiva) return;
        mostrarConfirmacion("Cobrar Orden", "¿La mesa ya ha cancelado la cuenta? Esta acción cerrará el ticket actual.",
            () => guardar(generarPayload(), () => mostrarAlerta("Orden Cerrada", "La mesa ahora está libre.", "exito", () => navigate('/Mesas'))), 'info'
        );
    };

    const manejarCancelarOrden = () => {
        if (!ordenActiva) return;
        mostrarConfirmacion("Anular Ticket", "Estás a punto de cancelar por completo la orden a la cocina. ¿Estás seguro?",
            () => cancelar(generarPayload(), () => mostrarAlerta("Anulada", "La orden ha sido cancelada y la mesa está libre.", "exito", () => navigate('/Mesas'))), 'peligro'
        );
    };

    // VISTA DE ERROR / CERRADO
    if (estadoComedor.error != null || estadoComedor.estado?.status === false || menu.error != null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#090D1A] p-4 relative">
                <div className="absolute w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="bg-slate-900 border border-white/5 px-6 py-10 rounded-3xl shadow-2xl text-center w-full max-w-sm relative z-10">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Power className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Comedor Cerrado</h1>
                    <p className="text-slate-400 text-sm mb-8 font-medium">El sistema no está operando en este momento.</p>
                    <button onClick={() => navigate('/Mesas')} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-xl transition-all border border-white/5 shadow-md active:scale-95">
                        <ArrowLeft size={18} /> Volver al Tablero
                    </button>
                </div>
            </div>
        );
    }

    // VISTA DE CARGA
    if (cargando) {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#090D1A]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <div className="text-slate-400 font-bold uppercase tracking-widest animate-pulse text-sm">Escaneando Mesa...</div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#090D1A] text-slate-200 p-4 md:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-[1200px] mx-auto animate-[fade-in_0.3s_ease-out] pb-24">

                {/* CABECERA */}
                <div className="flex items-center gap-4 mb-8 bg-[#0F172A] p-4 rounded-2xl border border-white/5 shadow-lg">
                    <button 
                        onClick={() => navigate('/Mesas')} 
                        className="p-3 bg-slate-800/80 border border-white/5 rounded-xl shadow-sm hover:bg-slate-700 hover:text-white transition-all text-slate-400 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            Mesa <span className="text-blue-500">#{id}</span>
                        </h1>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestión de Consumo</span>
                    </div>
                </div>

                {/* PANEL 1: ORDEN ACTIVA */}
                <section className="bg-[#0F172A] rounded-3xl border border-white/5 shadow-xl mb-8 overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-white/5 bg-slate-900/30 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20"><Receipt size={20} /></div>
                        <h2 className="text-lg font-black text-white tracking-wide">Ticket en Curso</h2>
                    </div>
                    
                    <div className="p-5 md:p-6">
                        {cargandoDetalles ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Extrayendo Datos...</span>
                            </div>
                        ) : (
                            <OrdenActivaTable 
                                detalles={borrador}
                                ordenActivaId={ordenActiva ? ordenActiva.IdOrden : null}
                                cargandoAccion={cargandoAccionWebsocket}
                                alModificarCantidad={modificarCantidadBorrador}
                                alCrearOActualizar={manejarCrearOActualizar}
                                alTerminarOrden={manejarTerminarOrden}
                                alCancelarOrden={manejarCancelarOrden}
                            />
                        )}
                    </div>
                </section>

                {/* PANEL 2: MENÚ DEL DÍA */}
                <section className="bg-[#0F172A] rounded-3xl border border-white/5 shadow-xl mb-8 overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-white/5 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><ChefHat size={20} /></div>
                            <h2 className="text-lg font-black text-white tracking-wide">Menú del Día</h2>
                        </div>
                        <button 
                            onClick={() => setModalExtraAbierto(true)}
                            className="bg-slate-800/80 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <Search size={16} /> Buscar Platillo Extra
                        </button>
                    </div>

                    <div className="p-5 md:p-6">
                        <MenuDiaGrid 
                            cargando={menu.cargando} 
                            listaMenu={menu.menu || []} 
                            alAgregar={(nombre, precio) => agregarAlBorrador(nombre, precio, 1)}
                        />
                    </div>
                </section>

                {/* PANEL 3: HISTORIAL */}
                <section className="bg-[#0F172A] rounded-3xl border border-white/5 shadow-xl overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-white/5 bg-slate-900/30 flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20"><History size={20} /></div>
                        <h2 className="text-lg font-black text-white tracking-wide">Historial de la Mesa</h2>
                    </div>

                    <div className="p-5 md:p-6">
                        {historial && historial.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {historial.map((orden: OrdenComedor) => (
                                    <div 
                                        key={orden.IdOrden}
                                        onClick={() => {
                                            setIdOrdenHistorial(orden.IdOrden);
                                            setModalHistorialAbierto(true);
                                            if (obtenerDetalle) obtenerDetalle(orden.IdOrden);
                                        }}
                                        className="group flex items-center justify-between bg-slate-900/50 border border-white/5 p-4 rounded-2xl cursor-pointer transition-all hover:bg-slate-800 hover:border-blue-500/30 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
                                                <Receipt size={16} className="text-slate-500 group-hover:text-blue-400"/>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm text-slate-200 group-hover:text-white">Pedido #{orden.IdOrden}</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Cobrado</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
                                <AlertCircle className="text-slate-600 mb-3" size={28} />
                                <p className="text-slate-400 text-sm font-medium">No hay registros de pedidos cerrados hoy.</p>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* MODALES EXTERNOS */}
                <ModalPlatilloExtra 
                    abierto={modalExtraAbierto}
                    alCerrar={() => setModalExtraAbierto(false)}
                    alConfirmar={(nombre, precio, cant) => agregarAlBorrador(nombre, precio, cant)}
                />

                <ModalDetalleOrden
                    abierto={modalHistorialAbierto}
                    cargando={cargandoDetalles}
                    detalles={detallesOrden || []}
                    alCerrar={() => setModalHistorialAbierto(false)}
                    esActiva={false} 
                />

                <ModalDialogo
                    abierto={dialogo.abierto}
                    tipo={dialogo.tipo}
                    titulo={dialogo.titulo}
                    mensaje={dialogo.mensaje}
                    textoConfirmar={dialogo.textoConfirmar}
                    mostrarCancelar={dialogo.mostrarCancelar}
                    alConfirmar={dialogo.accionConfirmar}
                    alCancelar={cerrarDialogo}
                />

            </div>
        </div>
    );
}

export default MenuMesas;