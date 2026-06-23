import { useState, useEffect, useMemo, useCallback } from "react";
import AnimatedKpiCard from "../components/cards/KPICardAnimado";
import CardGraficoLinealSemanal from "../components/cards/CardsLineales/CardGrapLineal";
import GraficoRadioplatillos from "../components/Graficos/GraficoRadioplatillo";

// Importamos los modales necesarios
import ModalNuevoCliente from "../Clientes/Modals/ModalNuevoCliente";
import ModalNuevoContrato from "../components/modals/ModalNuevoContrato";
import FormularioNuevoPedido from "../components/forms/PedidosForms"; 
import { ShoppingCart, Users, FileText, TrendingUp } from "lucide-react";

// Hooks
import { useClientes } from "../components/Hooks/hookClientes";
import { useFacturasPage } from "../components/Hooks/hookFacturas";
import { useOrdenes } from "../components/Hooks/hookOrdenes"; // Cambiamos el hook importado
import AccionesRapidas from "../components/Filtro/AccionesRapidas";


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
    }, [cargarVentasSemanales]); 

    // --- CALCULOS DERIVADOS ---
    // Como ventasSemanales ya viene formateado [{x: 'Lunes', y: 10}] desde el servicio,
    // ya no necesitamos un useEffect intermedio para transformarlo.
    const datosVentas: DatoGrafico[] = ventasSemanales || [];

    const totalPedidosSemana = datosVentas.reduce((acc, curr) => acc + curr.y, 0);
    const totalFacturas = (Facturas || []).length;
    const totalClientes = (clientes || []).length;
    
    const isDashboardLoading = loadingVentas || loadingClientes || loadingFacturas;

    //const radialData = useMemo(()=> {
      //  return datosVentas.map(d =>({
        //    dia: d.x,
        //    total_vendido: d.y,
        //    nombre_platillo: "Top" // Adaptar según necesites
       // }))
   // }, [datosVentas]);

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
            <header className="flex flex-col md:flex-row md:items-center justify-between bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-700 tracking-tight">
                        Panel de Control
                    </h1>
                    <p className="text-slate-700 mt-1 text-2xl font-semibold">
                        Bienvenido al sistema de gestión <span className="text-blue-600 font-extrabold">La Buena Cuchara</span>.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4 bg-white/90 p-3.5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-base text-slate-500 uppercase font-bold tracking-wider">Pedidos esta semana</p>
                        <p className="text-xl font-black text-slate-800 mt-0.5">{isDashboardLoading ? (
                                <span className="inline-block w-8 h-5 bg-slate-100 animate-pulse rounded" />
                            ) : (
                                totalPedidosSemana
                            )}</p>
                    </div>
                </div>
            </header>
 
            {/* 2. GRID DE NAVEGACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <AnimatedKpiCard
                titulo="Total Ordenes"
                value={isDashboardLoading ? "Cargando..." : totalPedidosSemana}
                    icon={<ShoppingCart size={24} />}
                    to="/ordenes"
                    colorPrincipal="#5db8c3"
                    colorSecundario="#3b5bc6"
                />

                 <AnimatedKpiCard
                 titulo="Facturas"
                 value={isDashboardLoading ? 'Cargando': totalFacturas}
                 icon={<FileText size={24}/>} to="/Facturas"
                 colorPrincipal="#5db8c3"
                 colorSecundario="#3b5bc6" />
                 
                 <AnimatedKpiCard
                    titulo="Total clientes"
                    value={isDashboardLoading ? 'Cargando': totalClientes}
                    icon= {<Users size={24}/>}
                    to="/Clientes"
                    colorPrincipal="#3b5bc6"
                    colorSecundario="#5db8c3"
                 />

                 {/*<div className="w-full h-full ">
                        {isDashboardLoading ? (
                            <span className="text-blue-400 animate-pulse">Cargando gráfica...</span>
                        ) : (
                            //ya no es un radial, es de barrras
                            <GraficoRadioplatillos />
                        )}
                    </div>*/}
            </div>

            {/* 3. SECCIÓN DE ANÁLISIS Y GRÁFICAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Gráfica Grande */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm shadow-slate-900/5 border border-slate-200/60 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                            <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                            Flujo de Pedidos Semanal
                        </h3>
                    </div>
                    <div className="w-full h-80 flex items-center justify-center bg-white/50 border border-slate-100 rounded-xl p-2 shadow-inner">
                        {isDashboardLoading ? (
                            <div className="flex flex-col items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Cargando gráfica...</div>
                        ) : (
                            <CardGraficoLinealSemanal datos={datosVentas} />
                        )}
                    </div>
                </div>

                {/* --- ACCIONES RÁPIDAS (Funcionales) --- */}
                {/*{<AccionesRapidas />}*/}
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