import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Package, Clock, CheckCircle, DollarSign, Plus, RefreshCw, Layers } from "lucide-react";

// COMPONENTES ORIGINALES
import CardGraficoLinealSemanal from "../components/cards/CardsLineales/CardGrapLineal";
import CardPedido from "../components/cards/CardOrden";
import type { Platillo } from "../interfaces/Platillos";

// HOOKS Y TABLAS COMPATIBLES CON TU PA
import { useGestionPedidos, type PedidoHistorial } from '../Pedidos/hooks/hookPedi2s';
import { ModalEditorPedido } from '../Pedidos/Modals/ModalPedidos';
import { TablaPedidos } from '../Pedidos/tables/TablaPedidos';

// WEBSOCKETS
import { socket } from '../services/websocket';

interface DatoGrafico {
    x: string;
    y: number;
}

const KpiCard = ({ title, value, sub, icon, color, onClick, isActive }: any) => {
    const colors: any = {
        emerald: {
            border: isActive ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' : 'border-slate-800/60 hover:border-emerald-500/40',
            bg: isActive ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-emerald-900/20' : 'bg-slate-900/40 via-slate-900/30 to-slate-950/20',
            iconBg: isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/30'
        },
        blue: {
            border: isActive ? 'border-sky-500/60 ring-2 ring-sky-500/20' : 'border-slate-800/60 hover:border-sky-500/40',
            bg: isActive ? 'bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-sky-900/20' : 'bg-slate-900/40 via-slate-900/30 to-slate-950/20',
            iconBg: isActive ? 'bg-sky-500 text-white' : 'bg-sky-950/50 text-sky-400 border border-sky-800/30'
        },
        yellow: {
            border: isActive ? 'border-amber-500/60 ring-2 ring-amber-500/20' : 'border-slate-800/60 hover:border-amber-500/40',
            bg: isActive ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-amber-900/20' : 'bg-slate-900/40 via-slate-900/30 to-slate-950/20',
            iconBg: isActive ? 'bg-amber-500 text-white' : 'bg-amber-950/50 text-amber-400 border border-amber-800/30'
        },
        purple: {
            border: isActive ? 'border-violet-500/60 ring-2 ring-violet-500/20' : 'border-slate-800/60 hover:border-violet-500/40',
            bg: isActive ? 'bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-violet-900/20' : 'bg-slate-900/40 via-slate-900/30 to-slate-950/20',
            iconBg: isActive ? 'bg-violet-500 text-white' : 'bg-violet-950/50 text-violet-400 border border-violet-800/30'
        },
    };
    const currentTheme = colors[color] || colors.blue;

    return (
        <div 
            onClick={onClick}
            className={`relative p-5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 cursor-pointer group select-none flex flex-col justify-between h-32 ${currentTheme.bg} ${currentTheme.border}'}`}
        >
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl transition-opacity opacity-0 group-hover:opacity-20 ${isActive ? 'opacity-30 bg-sky-400' : 'bg-white'}`} />
            <div className="flex justify-between items-start z-10">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
                    <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm ${currentTheme.iconBg}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-2 z-10">
                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${isActive ? 'bg-white/10 text-white border-white/20' : 'bg-slate-950/40 text-slate-400 border-slate-800/60'}">
                    {sub}
                 </span>
            </div>
        </div>
    );
};

export default function PedidosPage() {
    const API_URL = import.meta.env.VITE_URL_API || 'http://127.0.0.1:8001';

    const [page, setPage] = useState(1);
    const [rows, setRows] = useState(10);
    const [filtroTipo, setFiltroTipo] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>(""); 
    
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pedidoAEditar, setPedidoAEditar] = useState<PedidoHistorial | null>(null);

    // Consumo del Hook alineado a la PA
    const { pedidos, cargando, refetch } = useGestionPedidos(page, rows, filtroTipo);

    const [datosVentas, setDatosVentas] = useState<DatoGrafico[]>([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [listaPlatillos] = useState<Platillo[]>([]);

    const cargarGraficoPantalla = async () => {
        setLoadingDashboard(true);
        try {
            const resGrafica = await fetch(`${API_URL}/ordenes/conteo/semanal`);
            if (resGrafica.ok) {
                const dataGrafica = await resGrafica.json();
                const formattedData = dataGrafica.map((d: any) => ({
                    x: d.dia.charAt(0).toUpperCase() + d.dia.slice(1),
                    y: d.conteo
                }));
                setDatosVentas(formattedData);
            }
        } catch (err) {
            console.error("Error cargando gráfica:", err);
        } finally {
            setLoadingDashboard(false);
        }
    };

    useEffect(() => {
        cargarGraficoPantalla();
    }, []);

    // Tiempo Real Sincronizado
    useEffect(() => {
        const manejarCambioWebsocket = () => {
            refetch();
            cargarGraficoPantalla();
        };
        socket.on("pedido_actualizado", manejarCambioWebsocket);
        socket.on("crear_pedido", manejarCambioWebsocket);

        return () => {
            socket.off("pedido_actualizado", manejarCambioWebsocket);
            socket.off("crear_pedido", manejarCambioWebsocket);
        };
    }, [refetch]);

    // Calcular KPIs Dinámicos basados en la PA
    const kpis = useMemo(() => {
        const totalPedidos = pedidos.length;
        const pendientes = pedidos.filter((p: PedidoHistorial) => p.Estado?.toUpperCase() === 'PENDIENTE').length;
        const entregados = pedidos.filter((p: PedidoHistorial) => p.Estado?.toUpperCase() === 'ENTREGADO').length;
        
        // Mapeado a la llave MONTO_TOTAL del SP
        const ingresos = pedidos.reduce((acc, curr) => {
            if (curr.Estado?.toUpperCase() === 'ANULADO') return acc;
            return acc + Number(curr.MONTO_TOTAL || 0);
        }, 0);

        return { totalPedidos, pendientes, entregados, ingresos };
    }, [pedidos]);

    const formatMoney = (amount: number) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

    const handleFilterClick = (status: string) => {
        setActiveFilter(activeFilter === status ? "" : status);
    };

    const pedidosFiltrados = useMemo(() => {
        if (!activeFilter) return pedidos;
        return pedidos.filter(p => p.Estado?.toUpperCase() === activeFilter.toUpperCase());
    }, [pedidos, activeFilter]);

    const hasNextPage = pedidos.length === rows;

    return (
        <div className="min-h-screen bg-[#070a13] text-slate-200 p-4 md:p-6 space-y-6 animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-xl gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white-800 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-xl gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Gestión de Pedidos</h1>
                        <p className="text-slate-400 mt-0.5 text-xs font-medium">Flujo transaccional y despacho automatizado para La Buena Cuchara.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setPedidoAEditar(null); setModalAbierto(true); }} 
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-6 h-6" /> Nuevo Pedido
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Bloque Izquierdo: Matriz de 4 KPIs */}
                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    <KpiCard
                        title="Ingresos Vista (Neto)" 
                        value={formatMoney(kpis.ingresos)} 
                        sub="Excluye anulados" 
                        color="emerald" 
                        icon={<DollarSign className="w-5 h-5" />} 
                        onClick={() => handleFilterClick("")} 
                        isActive={activeFilter === ""}
                     />
                     <KpiCard 
                        title="Pedidos Totales" 
                        value={kpis.totalPedidos} 
                        sub="Ver listado completo" 
                        color="blue" 
                        icon={<Layers className="w-5 h-5" />}
                        onClick={() => handleFilterClick("")} 
                        isActive={activeFilter === ""}
                    />
                     <KpiCard 
                        title="Órdenes Pendientes" 
                        value={kpis.pendientes} 
                        sub="Filtrar pendientes" 
                        color="yellow" 
                        icon={<Clock className="w-5 h-5" />}
                        onClick={() => handleFilterClick("PENDIENTE")}
                        isActive={activeFilter === "PENDIENTE"}
                    />
                    <KpiCard 
                        title="Órdenes Entregadas" 
                        value={kpis.entregados} 
                        sub="Filtrar despachados" 
                        color="purple" 
                        icon={<CheckCircle className="w-5 h-5" />}
                        onClick={() => handleFilterClick("ENTREGADO")}
                        isActive={activeFilter === "ENTREGADO"}
                    />
                </div>

                {/* Bloque Derecho: Gráfica de Tendencia Semanal */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 shadow-sm shadow-slate-900/5 flex flex-col justify-between h-full min-h-[300px] lg:h-[560px]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-800" /> Histórico de Demanda Semanal
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Volumen total de órdenes procesadas por día.</p>
                        </div>
                    </div>
                    
                    <div className="w-full flex-1 bg-slate-950/40 rounded-xl border border-slate-900 flex items-center justify-center p-2 relative">
                        {loadingDashboard ? (
                            <div className="flex flex-col items-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Analizando métricas...</span>
                            </div>
                        ) : (
                            <CardGraficoLinealSemanal datos={datosVentas} />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Monitoreo de Comensales (Últimos activos)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {pedidosFiltrados.slice(0, 6).map((pedido: any) => (
                        <CardPedido 
                            key={pedido.IdPedido} 
                            Pedido={pedido}
                            listaPlatillos={listaPlatillos} 
                            Actualizar={() => refetch()} 
                        />
                    ))}
                </div>
            </div>

            {/* TABLA PRINCIPAL MODULAR */}
            <div className="bg-white-900/20 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-900/60 bg-slate-900/40 flex justify-between items-center">
                <div>
                    <h3 className="text-base font-bold text-white">Auditoría Operativa de Órdenes</h3>
                        <p className="text-[11px] text-slate-700 mt-0.5">Historial transaccional completo e impresiones de comandas.</p>
                </div>
                    {activeFilter && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-700 border border-slate-500/30 bg-slate-200/20 px-2 py-0.5 rounded-md">
                                Filtro: {activeFilter}
                            </span>
                        <button onClick={() => setActiveFilter("")} className="text-xs text-slate-700 font-bold hover:text-white transition-colors underline underline-offset-4">Reestablecer vista</button>
                        </div>
                    )}
                </div>

                <div className="p-2 bg-slate-950/20">
                    <TablaPedidos 
                        pedidos={pedidosFiltrados} 
                        cargando={cargando}
                        paginaActual={page}
                        cambiarPagina={setPage}
                        hayMasPaginas={hasNextPage}
                        alEditar={(pedido: PedidoHistorial) => { setPedidoAEditar(pedido); setModalAbierto(true); }}
                        filasPorPagina={rows}
                        alCambiarFilas={(r: number) => { setRows(r); setPage(1); }}
                        filtroTipo={filtroTipo}
                        setFiltroTipo={setFiltroTipo}
                    />
                </div>
            </div>

            {/* MODAL CREADOR/EDITOR */}
            <ModalEditorPedido
                abierto={modalAbierto}
                alCerrar={() => setModalAbierto(false)}
                alCompletar={refetch}
                pedidoEdicion={pedidoAEditar}
            />
        </div>
    );
}