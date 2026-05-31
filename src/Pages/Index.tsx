import { useState, useEffect, useMemo, useCallback } from "react";
import AnimatedKpiCard from "../components/cards/KPICardAnimado";
import CardGraficoLinealSemanal from "../components/cards/CardsLineales/CardGrapLineal";
import GraficoRadioplatillos from "../components/Graficos/GraficoRadioplatillo";

// Importamos los modales necesarios
import ModalNuevoCliente from "../components/modals/ModalNuevoCliente";
import ModalNuevoContrato from "../components/modals/ModalNuevoContrato";
import FormularioNuevoPedido from "../components/forms/PedidosForms"; 
import { ShoppingCart, Users, FileText } from "lucide-react";

// Hooks
import { useClientes } from "../components/Hooks/hookClientes";
import { useFacturasPage } from "../components/Hooks/hookFacturas";
import { useOrdenes } from "../components/Hooks/hookOrdenes"; // Cambiamos el hook importado


// Interfaces
interface DatoGrafico {
  x: string;
  y: number;
}

export default function IndexPage() {
    // Consumir hooks existentes
    const { clientes, loading: loadingClientes, refetch: refetchClientes } = useClientes();
    const { data: Facturas = [], loading: loadingFacturas, refetch: refetchFacturas } = useFacturasPage();
    
    // Usar el hook de órdenes
    const { cargarVentasSemanales, ventasSemanales, loading: loadingVentas } = useOrdenes();

    // --- ESTADOS PARA MODALES ---
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalPedido, setShowModalPedido] = useState(false);
    const [showModalContrato, setShowModalContrato] = useState(false);

    // Cargar los datos de la gráfica al montar el componente
    useEffect(() => {
        const controller = new AbortController();
        cargarVentasSemanales(controller.signal);
        
        return () => controller.abort(); // Limpieza al desmontar
    }, []); 

    // --- CALCULOS DERIVADOS ---
    // Como ventasSemanales ya viene formateado [{x: 'Lunes', y: 10}] desde el servicio,
    // ya no necesitamos un useEffect intermedio para transformarlo.
    const datosVentas: DatoGrafico[] = ventasSemanales || [];

    const totalPedidosSemana = datosVentas.reduce((acc, curr) => acc + curr.y, 0);
    const totalFacturas = (Facturas || []).length;
    const totalClientes = (clientes || []).length;
    
    const isDashboardLoading = loadingVentas || loadingClientes || loadingFacturas;

    const radialData = useMemo(()=> {
        return datosVentas.map(d =>({
            dia: d.x,
            total_vendido: d.y,
            nombre_platillo: "Top" // Adaptar según necesites
        }))
    }, [datosVentas]);

    const handleSuccessPedido = useCallback(() => {
        alert("Pedido creado correctamente desde el Panel.");
        // Refrescar datos sin recargar la página
        cargarVentasSemanales();
        refetchFacturas();
        refetchClientes();
        setShowModalPedido(false);
    }, [cargarVentasSemanales, refetchFacturas, refetchClientes]);


    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            
            {/* 1. ENCABEZADO */}
            <header className="flex flex-col md:flex-row md:items-center justify-between bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Panel de Control
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        Bienvenido al sistema de gestión <span className="text-blue-400 font-bold">La Buena Cuchara</span>.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <div className="bg-blue-900/30 p-2 rounded-full text-blue-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Pedidos esta semana</p>
                        <p className="text-2xl font-bold text-white">{isDashboardLoading ? "..." : totalPedidosSemana}</p>
                    </div>
                </div>
            </header>
 
            {/* 2. GRID DE NAVEGACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedKpiCard
                titulo="Total Pedidos"
                value={isDashboardLoading ? "Cargando..." : totalPedidosSemana}
                    icon={<ShoppingCart size={24} />}
                    to="/pedidos"
                    colorPrincipal="#5db8c3"
                    colorSecundario="#3b5bc6"
                />

                <AnimatedKpiCard
                titulo="Total clientes"
                value={isDashboardLoading ? 'Cargando': totalClientes}
                icon= {<Users size={24}/>}
                to="/Clientes"
                colorPrincipal="#3b5bc6"
                colorSecundario="#5db8c3"
                 />

                 <AnimatedKpiCard
                 titulo="Facturas"
                 value={isDashboardLoading ? 'Cargando': totalFacturas}
                 icon={<FileText size={24}/>} to="/Facturas"
                 colorPrincipal="#5db8c3"
                 colorSecundario="#3b5bc6" />

                 <div className="w-full h-full ">
                        {isDashboardLoading ? (
                            <span className="text-blue-400 animate-pulse">Cargando gráfica...</span>
                        ) : (
                            <GraficoRadioplatillos data={radialData} />
                        )}
                    </div>
            </div>

            {/* 3. SECCIÓN DE ANÁLISIS Y GRÁFICAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Gráfica Grande */}
                <div className="lg:col-span-2 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                            Flujo de Pedidos Semanal
                        </h3>
                    </div>
                    <div className="w-full h-80 flex items-center justify-center">
                        {isDashboardLoading ? (
                            <span className="text-blue-400 animate-pulse">Cargando gráfica...</span>
                        ) : (
                            <CardGraficoLinealSemanal datos={datosVentas} />
                        )}
                    </div>
                </div>

                {/* --- ACCIONES RÁPIDAS (Funcionales) --- */}
                <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Acciones Rápidas</h3>
                        <p className="text-gray-400 text-sm mb-6">Operaciones frecuentes</p>
                        
                        <div className="space-y-3">
                            
                            {/* Botón Nuevo Pedido */}
                            <button 
                                onClick={() => setShowModalPedido(true)}
                                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left text-gray-300 hover:text-white transition-colors flex items-center gap-3 active:scale-95"
                            >
                                <span className="bg-green-900/30 text-green-400 p-1 rounded">＋</span> Registrar Pedido Manual
                            </button>

                            {/* Botón Nuevo Cliente */}
                            <button 
                                onClick={() => setShowModalCliente(true)}
                                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left text-gray-300 hover:text-white transition-colors flex items-center gap-3 active:scale-95"
                            >
                                <span className="bg-blue-900/30 text-blue-400 p-1 rounded">👤</span> Registrar Nuevo Cliente
                            </button>

                            {/* Botón Nuevo Contrato */}
                            <button 
                                onClick={() => setShowModalContrato(true)}
                                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left text-gray-300 hover:text-white transition-colors flex items-center gap-3 active:scale-95"
                            >
                                <span className="bg-purple-900/30 text-purple-400 p-1 rounded">📄</span> Nuevo Contrato
                            </button>

                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <div className="bg-blue-600/10 p-4 rounded-xl border border-blue-600/20">
                            <p className="text-blue-400 text-sm font-semibold mb-1">Tip del día</p>
                            <p className="text-blue-200 text-xs">Mantén actualizado el inventario de platillos para evitar cancelaciones.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RENDERIZADO CONDICIONAL DE MODALES --- */}
            {showModalCliente && (
                <ModalNuevoCliente onClose={() => setShowModalCliente(false)} />
            )}

            {showModalPedido && (
                <FormularioNuevoPedido onClose={() => setShowModalPedido(false)} onSave={handleSuccessPedido} />
            )}

            {showModalContrato && (
                <ModalNuevoContrato onClose={() => setShowModalContrato(false)} />
            )}

        </div>
    );
}