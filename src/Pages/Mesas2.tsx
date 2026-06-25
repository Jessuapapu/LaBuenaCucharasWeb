import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import type { ComedorOrdenIN, Detalles } from "../components/modals/ModalMostrarDetalles";
import { useMenu, useEstado } from "../components/Hooks/hookComedor";
import { useOrdenesMesa, useDetalleOrden, useCancelarOrden, type OrdenComedor } from "../components/Hooks/hookOrdenes";
import { useCrearOrden, useActualizarOrden, useMandarACaja } from "../components/Hooks/hookOrdenes";
import { socket } from "../services/websocket";

import { MenuDiaGrid } from "../Comedor/grid/MenuGrid";
import { OrdenActivaTable } from "../components/table/OrdenActivaTable";
import { ModalPlatilloExtra } from "../components/modals/ModalDetallesExtra";
import { ModalDetalleOrden } from "../components/modals/ModalMostrarDetalles";
import { ModalDialogo } from "../components/modals/ModalDialogo";

import { ArrowLeft, Receipt, ChefHat, History, Search, Loader2, AlertCircle, Power, ChevronRight } from 'lucide-react';

export default   function MenuMesas() {
    
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const { ordenActiva, historial, cargando, refresh: refreshOrden } = useOrdenesMesa(id) as any;
    const estadoComedor = useEstado();
    const menu = useMenu();
    const { detallesOrden, cargandoDetalles, obtenerDetalle } = useDetalleOrden();

    const { crear, cargando: creando } = useCrearOrden();
    const { actualizar, cargando: actualizando } = useActualizarOrden();
    const { mandarACaja, cargando: enviandoCaja } = useMandarACaja(); 
    const { cancelar, cargando: cancelando } = useCancelarOrden();
    
    const cargandoAccionWebsocket = creando || actualizando || enviandoCaja || cancelando;

    const [borrador, setBorrador] = useState<Detalles[]>([]);
    const [modalExtraAbierto, setModalExtraAbierto] = useState(false);
    const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
    //@ts-ignore
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

    const ordenActivaRef = useRef(ordenActiva);
    useEffect(() => {
        ordenActivaRef.current = ordenActiva;
    }, [ordenActiva]);

    useEffect(() => {
        const handleOrdenActualizadaWebsocket = (data: { IdMesa: number }) => {
            if (Number(data.IdMesa) === Number(id)) {
                if (refreshOrden) refreshOrden();
                const currentOrden = ordenActivaRef.current;
                if (currentOrden?.IdOrden && obtenerDetalle) {
                    obtenerDetalle(currentOrden.IdOrden);
                }
            }
        };
        socket.on("orden_actualizada", handleOrdenActualizadaWebsocket);
        return () => { socket.off("orden_actualizada", handleOrdenActualizadaWebsocket); };
    }, [id, obtenerDetalle, refreshOrden]);

    useEffect(() => {
        if (ordenActiva?.IdOrden && obtenerDetalle) obtenerDetalle(ordenActiva.IdOrden);
        else if (borrador.length > 0) setBorrador([]);
    }, [ordenActiva?.IdOrden]); 

    useEffect(() => {
        if (detallesOrden && ordenActiva) {
            const datosMapeados = detallesOrden.map(d => ({
                nombre_platillo: d.nombre_platillo,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario
            }));
            if (JSON.stringify(borrador) !== JSON.stringify(datosMapeados)) setBorrador(datosMapeados);
        }
    }, [JSON.stringify(detallesOrden), ordenActiva?.IdOrden]);

    const agregarAlBorrador = (nombre: string, precio: number, cantidadAdd: number = 1) => {
        setBorrador(prev => {
            const existe = prev.find(p => p.nombre_platillo === nombre);
            if (existe) return prev.map(p => p.nombre_platillo === nombre ? { ...p, cantidad: p.cantidad + cantidadAdd } : p);
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
            actualizar(payload, () => mostrarAlerta("¡Comanda Lista!", "Los platillos se actualizaron y enviaron a cocina.", "exito"));
        } else {
            crear(payload, () => mostrarAlerta("¡Orden Abierta!", "El ticket fue generado en la cocina exitosamente.", "exito", () => window.location.reload()));
        }
    };

    const manejarMandarACaja = () => {
        if (!ordenActiva) return;
        mostrarConfirmacion(
            "Enviar a Caja", 
            "¿Deseas enviar el ticket a la terminal del Cajero para su facturación y cobro? Esta mesa quedará libre inmediatamente.",
            () => mandarACaja(generarPayload(), () => {
                mostrarAlerta(
                    "Transferencia Exitosa", 
                    "La cuenta está ahora en el Monitor de Caja. Mesa liberada.", 
                    "exito", 
                    () => navigate('/Mesas')
                );
            }), 
            'info'
        );
    };

    const manejarCancelarOrden = () => {
        if (!ordenActiva) return;
        mostrarConfirmacion("Anular Ticket", "Estás a punto de cancelar por completo la orden a la cocina. ¿Estás seguro?",
            () => cancelar(generarPayload(), () => mostrarAlerta("Anulada", "La orden ha sido cancelada y la mesa está libre.", "exito", () => navigate('/Mesas'))), 'peligro'
        );
    };

    if (estadoComedor.error != null || estadoComedor.estado?.status === false || menu.error != null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 relative">
                <div className="bg-white border border-slate-200 px-6 py-10 rounded-3xl shadow-2xl text-center w-full max-w-sm relative z-10">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
                        <Power className="text-rose-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Comedor Cerrado</h1>
                    <p className="text-slate-600 text-base mb-8 font-medium">El sistema de mesas no está operando.</p>
                    <button onClick={() => navigate('/Mesas')} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-4 px-5 rounded-xl transition-all border border-slate-300 shadow-sm active:scale-95">
                        <ArrowLeft size={20} /> Volver al Tablero
                    </button>
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-16 h-16 text-sky-500 animate-spin mb-4" />
                <div className="text-slate-500 font-black uppercase tracking-widest animate-pulse text-sm">Escaneando Mesa...</div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-slate-50/50 text-slate-800 p-4 md:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-24">

                <div className="flex items-center gap-4 mb-8 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-xl">
                    <button 
                        onClick={() => navigate('/Mesas')} 
                        className="p-3 bg-slate-100 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-200 hover:text-slate-900 transition-all text-slate-600 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Mesa <span className="text-sky-500">#{id}</span>
                        </h1>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gestión de Consumo</span>
                    </div>
                </div>

                {/* ORDEN ACTIVA */}
                <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl mb-8 overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-200/60 bg-slate-50/50 flex items-center gap-3">
                        <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-200 shadow-sm"><Receipt size={24} /></div>
                        <h2 className="text-xl font-black text-slate-900 tracking-wide">Ticket en Curso</h2>
                    </div>
                    
                    <div className="p-5 md:p-6">
                        {cargandoDetalles ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-3" />
                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Extrayendo Datos...</span>
                            </div>
                        ) : (
                            <OrdenActivaTable 
                                detalles={borrador}
                                ordenActivaId={ordenActiva ? ordenActiva.IdOrden : null}
                                cargandoAccion={cargandoAccionWebsocket}
                                alModificarCantidad={modificarCantidadBorrador}
                                alCrearOActualizar={manejarCrearOActualizar}
                                alTerminarOrden={manejarMandarACaja} 
                                alCancelarOrden={manejarCancelarOrden}
                            />
                        )}
                    </div>
                </section>

                {/* MENÚ DEL DÍA */}
                <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl mb-8 overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-200/60 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shadow-sm"><ChefHat size={24} /></div>
                            <h2 className="text-xl font-black text-slate-900 tracking-wide">Menú del Día</h2>
                        </div>
                        <button 
                            onClick={() => setModalExtraAbierto(true)}
                            className="bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <Search size={18} /> Buscar Platillo Extra
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

                {/* HISTORIAL */}
                <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-200/60 bg-slate-50/50 flex items-center gap-3">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200 shadow-sm"><History size={24} /></div>
                        <h2 className="text-xl font-black text-slate-900 tracking-wide">Historial de la Mesa</h2>
                    </div>

                    <div className="p-5 md:p-6">
                        {historial && historial.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {historial.map((orden: OrdenComedor) => (
                                    <div 
                                        key={orden.IdOrden}
                                        onClick={() => {
                                            setIdOrdenHistorial(orden.IdOrden);
                                            setModalHistorialAbierto(true);
                                            if (obtenerDetalle) obtenerDetalle(orden.IdOrden);
                                        }}
                                        className="group flex items-center justify-between bg-slate-50 border border-slate-200 p-5 rounded-2xl cursor-pointer transition-all hover:bg-white hover:border-sky-300 hover:shadow-md shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 group-hover:bg-sky-100 group-hover:text-sky-600 group-hover:border-sky-200 transition-colors">
                                                <Receipt size={20} className="text-slate-600 group-hover:text-sky-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-base text-slate-900">Pedido #{orden.IdOrden}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-0.5">Procesado</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={22} className="text-slate-400 group-hover:text-sky-500 transition-transform group-hover:translate-x-1" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                <AlertCircle className="text-slate-400 mb-3" size={32} />
                                <p className="text-slate-500 text-sm font-bold">No hay registros previos en esta mesa hoy.</p>
                            </div>
                        )}
                    </div>
                </section>
                
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