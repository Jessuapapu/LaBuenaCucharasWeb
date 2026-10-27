import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Package, Clock, CheckCircle, DollarSign, Plus, RefreshCw, Layers } from "lucide-react";

// COMPONENTES ORIGINALES
import CardGraficoLinealSemanal from "../components/cards/CardsLineales/CardGrapLineal";
import CardPedido from "../components/cards/CardOrden";
import type { Platillo } from "../context/Interfaces/Platillos";

// HOOKS Y TABLAS COMPATIBLES CON TU PA
import { useGestionPedidos, type PedidoHistorial } from '../Features/Pedidos/hooks/hookPedi2s';
import { ModalEditorPedido } from '../Features/Pedidos/Modals/ModalPedidos';
import { TablaPedidos } from '../Features/Pedidos/tables/TablaPedidos';

// WEBSOCKETS
import { socket } from '../context/Services/websocket';

interface DatoGrafico {
    x: string;
    y: number;
}

const KpiCard = ({ title, value, sub, icon, color, onClick, isActive }: any) => {
    const colors: Record<string, { card: string; icon: string; value: string }> = {
        emerald: { card: "border-emerald-200 bg-gradient-to-br from-emerald-100 to-emerald-50", icon: "bg-emerald-200/80 text-emerald-800", value: "text-emerald-950" },
        blue: { card: "border-blue-200 bg-gradient-to-br from-blue-100 to-sky-50", icon: "bg-blue-200/80 text-blue-800", value: "text-blue-950" },
        amber: { card: "border-amber-200 bg-gradient-to-br from-amber-100 to-yellow-50", icon: "bg-amber-200/80 text-amber-900", value: "text-amber-950" },
        cyan: { card: "border-cyan-200 bg-gradient-to-br from-cyan-100 to-sky-50", icon: "bg-cyan-200/80 text-cyan-900", value: "text-cyan-950" },
    };
    const theme = colors[color] || colors.blue;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            aria-pressed={onClick ? isActive : undefined}
            className={`group flex min-h-36 w-full flex-col justify-between rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 disabled:opacity-100 ${theme.card} ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : "cursor-default"} ${isActive ? "ring-2 ring-[#147e9d]/25" : ""}`}
        >
            <span className="flex w-full items-start justify-between gap-3">
                <span>
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-600">{title}</span>
                    <span className={`mt-1 block text-2xl font-black tracking-tight ${theme.value}`}>{value}</span>
                </span>
                <span className={`rounded-xl p-2.5 shadow-sm ${theme.icon}`}>{icon}</span>
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-600">{sub}</span>
        </button>
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
        <div className="space-y-7 pb-8 animate-in fade-in duration-500">
            <header className="flex flex-col justify-between gap-5 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/95 p-5 shadow-[0_16px_45px_-34px_rgba(15,70,100,0.4)] backdrop-blur-sm sm:flex-row sm:items-center sm:p-7">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-[#3b5bc6] to-[#5db8c3] p-3.5 text-white shadow-lg shadow-sky-900/15"><Package className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#147e9d]">Gestión del restaurante</p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Pedidos</h1>
                        <p className="mt-1 text-sm text-slate-600 sm:text-base">Agrupa órdenes de consumo para eventos y contratos.</p>
                    </div>
                </div>
                <button
                    onClick={() => { setPedidoAEditar(null); setModalAbierto(true); }}
                    className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#147e9d] to-[#3b5bc6] px-6 py-3 text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-500/25 sm:w-auto"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 transition-colors group-hover:bg-white/25"><Plus className="h-5 w-5" /></span>
                    <span className="text-left"><span className="block text-sm font-extrabold">Nuevo pedido</span><span className="block text-[11px] font-medium text-white/80">Agrupar órdenes</span></span>
                </button>
            </header>

            <section className="space-y-3">
                <div className="px-1"><h2 className="text-lg font-extrabold text-slate-800">Resumen de pedidos</h2><p className="text-sm text-slate-500">Indicadores de los pedidos cargados</p></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard title="Ingresos cargados" value={formatMoney(kpis.ingresos)} sub="Sin pedidos anulados" color="emerald" icon={<DollarSign className="h-5 w-5" />} />
                    <KpiCard title="Pedidos cargados" value={kpis.totalPedidos} sub="Mostrar todos los estados" color="blue" icon={<Layers className="h-5 w-5" />} onClick={() => handleFilterClick("")} isActive={activeFilter === ""} />
                    <KpiCard title="Pendientes" value={kpis.pendientes} sub="Filtrar pendientes" color="amber" icon={<Clock className="h-5 w-5" />} onClick={() => handleFilterClick("PENDIENTE")} isActive={activeFilter === "PENDIENTE"} />
                    <KpiCard title="Entregados" value={kpis.entregados} sub="Filtrar entregados" color="cyan" icon={<CheckCircle className="h-5 w-5" />} onClick={() => handleFilterClick("ENTREGADO")} isActive={activeFilter === "ENTREGADO"} />
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[#e2ebf0]/95 p-3 shadow-[0_20px_55px_-40px_rgba(15,55,80,0.5)] backdrop-blur-sm sm:p-5">
                <div className="mb-3 flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-end">
                    <div><h2 className="text-xl font-extrabold text-slate-800">Pedidos agrupados</h2><p className="mt-1 text-sm text-slate-500">Consulta los grupos creados y sus órdenes vinculadas.</p></div>
                    {activeFilter && <div className="flex items-center gap-3 self-start sm:self-auto"><span className="rounded-lg border border-sky-200 bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-800">Filtro: {activeFilter}</span><button onClick={() => setActiveFilter("")} className="text-xs font-bold text-sky-800 underline underline-offset-4 hover:text-sky-950">Limpiar filtro</button></div>}
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
            </section>

            <section className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-200 pb-3">
                    <div><h2 className="text-xl font-extrabold text-slate-800">Órdenes recientes</h2><p className="mt-1 text-sm text-slate-500">Actividad de consumo reciente de tus clientes.</p></div>
                </div>
                {pedidosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {pedidosFiltrados.slice(0, 6).map((pedido: any) => <CardPedido key={pedido.IdPedido} Pedido={pedido} listaPlatillos={listaPlatillos} Actualizar={() => refetch()} />)}
                    </div>
                ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-8 text-center text-sm font-medium text-slate-500">No hay órdenes recientes para mostrar con este filtro.</div>}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-[#e2ebf0]/95 p-4 shadow-sm sm:p-6">
                <div className="mb-4">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800"><TrendingUp className="h-5 w-5 text-[#147e9d]" /> Demanda semanal</h2>
                    <p className="mt-1 text-sm text-slate-500">Volumen de órdenes procesadas por día.</p>
                </div>
                <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100/80 p-3">
                    {loadingDashboard ? <div className="flex flex-col items-center gap-2"><RefreshCw className="h-5 w-5 animate-spin text-[#147e9d]" /><span className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-slate-500">Analizando métricas...</span></div> : <CardGraficoLinealSemanal datos={datosVentas} />}
                </div>
            </section>

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
