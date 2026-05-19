import TablaPedidos from "../components/table/TablePedidos";
import { useEffect, useState, useMemo } from "react";
import CardGraficoLinealSemanal from "../components/cards/CardsLineales/CardGrapLineal";
import FormularioNuevoPedido from "../components/forms/PedidosForms";
import { TrendingUp, Package, Clock, CheckCircle, DollarSign, Plus } from "lucide-react";
import CardPedido from "../components/cards/CardOrden";

// Interfaces
interface DatoGrafico {
    x: string;
    y: number;
}

// Componente KpiCard Interactivo
const KpiCard = ({ title, value, sub, icon, color, onClick, isActive }: any) => {
    // Mapeo de colores manual para que Tailwind los detecte
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
    const [data, setData] = useState<any[]>([]);
    const [datosVentas, setDatosVentas] = useState<DatoGrafico[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Filtro activo para los KPIs
    const [activeFilter, setActiveFilter] = useState<string>("");
    
    const filteredData = useMemo(() => {
        if (!activeFilter) return data;
        return data.filter(p => p.estado_pedido?.toUpperCase() === activeFilter.toUpperCase());
    }, [data, activeFilter]);

    // Fetch de Pedidos
    const fetchPedidos = () => {
        fetch("http://127.0.0.1:8001/pedidos/?pagina=1&rows=10&todo=true")
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error("Error cargando pedidos:", err));
    };

    // Fetch de Gráfica
    useEffect(() => {
        fetch("http://127.0.0.1:8001/pedidos/conteo/semanal")
            .then((res) => res.json())
            .then((data) => {
                const formattedData = data.map((d: any) => ({
                    x: d.dia.charAt(0).toUpperCase() + d.dia.slice(1),
                    y: d.conteo
                }));
                setDatosVentas(formattedData);
            })
            .catch((err) => console.error("Error:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchPedidos(); }, []);

    // Calcular KPIs
    const kpis = useMemo(() => {
        const totalPedidos = data.length;
        // Filtro insensible a mayúsculas/minúsculas para mayor seguridad
        const pendientes = data.filter((p: any) => p.estado_pedido?.toUpperCase() === 'PENDIENTE').length;
        const entregados = data.filter((p: any) => p.estado_pedido?.toUpperCase() === 'ENTREGADO').length;
        
        const ingresos = data.reduce((acc, curr) => {
            // --- CORRECCIÓN CLAVE ---
            // Si el pedido está ANULADO, retornamos el acumulador sin sumar nada.
            if (curr.estado_pedido?.toUpperCase() === 'ANULADO') {
                return acc;
            }

            const totalPedido = curr.detalles?.reduce((sum: number, det: any) => sum + (det.cantidad * det.precio_unitario), 0) || 0;
            return acc + totalPedido;
        }, 0);

        return { totalPedidos, pendientes, entregados, ingresos };
    }, [data]);

    const formatMoney = (amount: number) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

    // Manejador de Clic en las Tarjetas
    const handleFilterClick = (status: string) => {
        if (activeFilter === status) {
            setActiveFilter("");
        } else {
            setActiveFilter(status);
        }
    };

    return (
        <div className="min-h-screen bg-gray-250 p-6 space-y-8 animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-500" />
                        Gestión de Pedidos
                    </h1>
                    <p className="text-blue-400  font-bold mt-1 text-sm ml-11">Control de despacho y flujo de caja en tiempo real.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Nuevo Pedido
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <KpiCard
                    title="Ingresos Totales (Neto)" value={formatMoney(kpis.ingresos)} sub="Excluye anulados" color="emerald" borderColor="emerald" 
                    icon={<DollarSign className="w-6 h-6" />} 
                    onClick={() => handleFilterClick("")} 
                    isActive={false}
                 />
                 <KpiCard 
                        title="Pedidos Totales" value={kpis.totalPedidos} sub="Ver todos" color="blue" borderColor="blue"
                        icon={<Package className="w-6 h-6" />}
                        onClick={() => handleFilterClick("")} 
                        isActive={activeFilter === ""}
                    />
                 <KpiCard 
                    title="Pendientes" value={kpis.pendientes} sub="Filtrar" color="yellow" borderColor="yellow"
                    icon={<Clock className="w-6 h-6" />}
                    onClick={() => handleFilterClick("PENDIENTE")}
                    isActive={activeFilter === "PENDIENTE"}
                />
                <KpiCard 
                    title="Entregados" value={kpis.entregados} sub="Filtrar" color="purple" borderColor="purple"
                    icon={<CheckCircle className="w-6 h-6" />}
                    onClick={() => handleFilterClick("ENTREGADO")}
                    isActive={activeFilter === "ENTREGADO"}
                />
                
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredData.map((Pedido) =>(
                    <CardPedido Pedido={Pedido} 
                        onUpdate={(actualizado) => {
                            // Opcional: Actualizar la lista local si no quieres recargar
                            console.log("Pedido actualizado:", actualizado);
                        }}></CardPedido>
                    ))}
            </div>

            {/* SECCIÓN DE RESUMEN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Gráfica */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" /> Tendencia de Ventas</h3>
                    </div>
                    <div className="flex-1 w-full min-h-[300px] bg-gray-950/30 rounded-xl border border-gray-800/50 p-2 relative">
                        {loading ? <span className="text-gray-500 text-sm animate-pulse absolute inset-0 m-auto w-fit h-fit">Cargando...</span> : <CardGraficoLinealSemanal datos={datosVentas} />}
                    </div>
                </div>
            </div>

            {/* SECCIÓN DE DETALLE (TABLA) */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-1">
                <div className="p-4 border-b border-gray-800 mb-2 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        Listado Detallado 
                        {activeFilter && <span className="ml-2 text-sm font-normal text-gray-400">(Filtro: {activeFilter})</span>}
                    </h3>
                    {activeFilter && (
                        <button onClick={() => setActiveFilter("")} className="text-xs text-blue-400 hover:text-blue-300 underline">Limpiar filtros</button>
                    )}
                </div>
                
                <TablaPedidos data={data} externalStatus={activeFilter} />
            </div>

            {showModal && <FormularioNuevoPedido onClose={() => setShowModal(false)} onSave={fetchPedidos} />}
        </div>
    );
}