import { useState, useEffect } from "react";
import CardComponentsLink from "../components/cards/cardTextoLink";
import CardGraficoLinealSemanal from "../components/cards/CardsLineales/CardGrapLineal";

// Importamos los modales necesarios
import ModalNuevoCliente from "../components/modals/ModalNuevoCliente";
import ModalNuevoContrato from "../components/modals/ModalNuevoContrato";
// Asumiendo que guardaste el formulario de pedidos aquí en pasos anteriores
import FormularioNuevoPedido from "../components/forms/PedidosForms"; 

// Interfaces
interface DatoGrafico {
  x: string;
  y: number;
}

const Icono = ({ path }: { path: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline-block mr-2 text-blue-400">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

export default function IndexPage() {
    const [datosVentas, setDatosVentas] = useState<DatoGrafico[]>([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS PARA MODALES ---
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalPedido, setShowModalPedido] = useState(false);
    const [showModalContrato, setShowModalContrato] = useState(false);

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
            .catch((err) => console.error("Error cargando estadísticas:", err))
            .finally(() => setLoading(false));
    }, []);

    const totalPedidosSemana = datosVentas.reduce((acc, curr) => acc + curr.y, 0);

    // Manejadores genéricos para refrescar o notificar éxito
    const handleSuccessCliente = () => {
        // Aquí podrías recargar datos globales si fuera necesario
        alert("Cliente registrado correctamente desde el Panel.");
    };

    const handleSuccessPedido = () => {
        alert("Pedido creado correctamente desde el Panel.");
        // Opcional: Recargar gráfica de ventas
        window.location.reload(); 
    };

    const handleSuccessContrato = () => {
        alert("Contrato registrado correctamente.");
    };

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
                        <p className="text-2xl font-bold text-white">{loading ? "..." : totalPedidosSemana}</p>
                    </div>
                </div>
            </header>

            {/* 2. GRID DE NAVEGACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CardComponentsLink 
                    href={"/Pedidos"}
                    Titulo={<span className="flex items-center font-bold text-white"><Icono path="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />Pedidos</span>} 
                    Contenido="Gestiona las órdenes activas y el historial."
                />
                <CardComponentsLink 
                    href={"/Menu_Diario"}
                    Titulo={<span className="flex items-center font-bold text-white"><Icono path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />Menús</span>} 
                    Contenido="Actualiza la carta y disponibilidad del día."
                />
                <CardComponentsLink 
                    href={"/Comidas"}
                    Titulo={<span className="flex items-center font-bold text-white"><Icono path="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />Platillos</span>} 
                    Contenido="Administra el catálogo de comidas."
                />
                <CardComponentsLink 
                    href={"/Facturas"}
                    Titulo={<span className="flex items-center font-bold text-white"><Icono path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />Facturas</span>} 
                    Contenido="Revisa la facturación y reportes."
                />
            </div>

            {/* 3. SECCIÓN DE ANÁLISIS Y GRÁFICAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gráfica Grande */}
                <div className="lg:col-span-2 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                            Flujo de Pedidos Semanal
                        </h3>
                    </div>
                    <div className="w-full h-80 flex items-center justify-center">
                        {loading ? (
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
                <ModalNuevoCliente onClose={() => setShowModalCliente(false)} onSave={handleSuccessCliente} />
            )}

            {showModalPedido && (
                <FormularioNuevoPedido onClose={() => setShowModalPedido(false)} onSave={handleSuccessPedido} />
            )}

            {showModalContrato && (
                <ModalNuevoContrato onClose={() => setShowModalContrato(false)} onSave={handleSuccessContrato} />
            )}

        </div>
    );
}