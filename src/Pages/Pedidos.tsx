import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Package, Clock, CheckCircle, DollarSign, Plus } from "lucide-react";

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
        emerald: isActive ? 'bg-emerald-500 border-emerald-500 ring-emerald-500/50' : 'hover:border-emerald-500/50',
        blue: isActive ? 'bg-blue-500 border-blue-500 ring-blue-500/50' : 'hover:border-blue-500/50',
        yellow: isActive ? 'bg-yellow-500 border-yellow-500 ring-yellow-500/50' : 'hover:border-yellow-500/50',
        purple: isActive ? 'bg-purple-500 border-purple-500 ring-purple-500/50' : 'hover:border-purple-500/50',
    };

    return (
        <div 
            onClick={onClick}
            className={`relative p-5 rounded-2xl border shadow-lg transition-all duration-300 cursor-pointer group select-none bg-gray-900 border-gray-800 ${colors[color] || ''} ${isActive ? 'scale-[1.02] bg-gray-800 ring-2' : 'hover:bg-gray-800/50'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-400">{title}</p>
                    <h3 className="text-3xl font-extrabold text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-blue-400'}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                 <span className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10">
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
        <div className="min-h-screen bg-[#090D1A] text-slate-200 p-6 space-y-8 animate-[fade-in_0.5s_ease-out]">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-500 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8" /> Gestión de Pedidos
                    </h1>
                    <p className="text-blue-400 font-bold mt-1 text-sm ml-11">Control de despacho y flujo de caja en tiempo real.</p>
                </div>
                <button 
                    onClick={() => { setPedidoAEditar(null); setModalAbierto(true); }} 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Nuevo Pedido
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Ingresos Vista (Neto)" value={formatMoney(kpis.ingresos)} sub="Excluye anulados" color="emerald" 
                    icon={<DollarSign className="w-6 h-6" />} 
                    onClick={() => handleFilterClick("")} 
                    isActive={false}
                 />
                 <KpiCard 
                    title="Pedidos Totales" value={kpis.totalPedidos} sub="Ver todos" color="blue" 
                    icon={<Package className="w-6 h-6" />}
                    onClick={() => handleFilterClick("")} 
                    isActive={activeFilter === ""}
                />
                 <KpiCard 
                    title="Pendientes" value={kpis.pendientes} sub="Filtrar" color="yellow" 
                    icon={<Clock className="w-6 h-6" />}
                    onClick={() => handleFilterClick("PENDIENTE")}
                    isActive={activeFilter === "PENDIENTE"}
                />
                <KpiCard 
                    title="Entregados" value={kpis.entregados} sub="Filtrar" color="purple" 
                    icon={<CheckCircle className="w-6 h-6" />}
                    onClick={() => handleFilterClick("ENTREGADO")}
                    isActive={activeFilter === "ENTREGADO"}
                />
            </div>

            {/* TARJETAS DE PEDIDO */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pedidosFiltrados.slice(0, 6).map((pedido: any) => (
                    <CardPedido 
                        key={pedido.IdPedido} 
                        Pedido={pedido}
                        listaPlatillos={listaPlatillos} 
                        Actualizar={() => refetch()} 
                    />
                ))}
            </div>

            {/* GRÁFICA SEMANAL */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" /> Tendencia de Ventas (Órdenes)
                    </h3>
                </div>
                <div className="w-full h-[300px] bg-gray-950/50 rounded-xl border border-gray-800 p-2 relative flex items-center justify-center">
                    {loadingDashboard ? (
                        <span className="text-blue-500 font-bold tracking-widest animate-pulse">Cargando gráfico...</span>
                    ) : (
                        <CardGraficoLinealSemanal datos={datosVentas} />
                    )}
                </div>
            </div>

            {/* TABLA PRINCIPAL MODULAR */}
            <div className="bg-gray-900/50 rounded-3xl border border-gray-800/50 p-1">
                <div className="p-4 border-b border-gray-800 mb-2 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        Listado Detallado 
                        {activeFilter && <span className="ml-2 text-sm font-normal text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded">(Filtro: {activeFilter})</span>}
                    </h3>
                    {activeFilter && (
                        <button onClick={() => setActiveFilter("")} className="text-xs text-slate-400 hover:text-white underline">Limpiar filtros</button>
                    )}
                </div>
                
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