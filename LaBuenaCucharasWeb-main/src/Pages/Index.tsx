import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown, ArrowRight, CalendarDays, FileText, Sparkles,
    ShoppingCart, TrendingUp, Users, UtensilsCrossed,
} from "lucide-react";
import AnimatedKpiCard from "../components/Cards/KPICardAnimado";
import CardGraficoLinealSemanal from "../components/Cards/CardsLineales/CardGrapLineal";
import ModalNuevoCliente from "../Features/Clientes/Modals/ModalNuevoCliente";
import ModalNuevoContrato from "../components/Modals/ModalNuevoContrato";
import FormularioNuevoPedido from "../components/Forms/PedidosForms";
import { useClientes } from "../context/Hooks/hookClientes";
import { useFacturasPage } from "../context/Hooks/hookFacturas";
import { useOrdenes } from "../context/Hooks/hookOrdenes";
import { useAuth } from "../context/Auth/Auth";
import AccionesRapidas from "../components/Filtro/AccionesRapidas";
import logoLaBuenaCuchara from "../assets/Labuenacucharalogo.png";

interface DatoGrafico {
    x: string;
    y: number;
}

export default function IndexPage() {
    const { clientes, loading: loadingClientes, refetch: refetchClientes } = useClientes();
    const { data: Facturas = [], loading: loadingFacturas, refetch: refetchFacturas } = useFacturasPage();
    const { cargarVentasSemanales, ventasSemanales, loading: loadingVentas } = useOrdenes();
    const { usuario } = useAuth();
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalPedido, setShowModalPedido] = useState(false);
    const [showModalContrato, setShowModalContrato] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        cargarVentasSemanales(controller.signal);
        return () => controller.abort();
    }, [cargarVentasSemanales]);

    const datosVentas: DatoGrafico[] = ventasSemanales || [];
    const totalPedidosSemana = datosVentas.reduce((acc, curr) => acc + curr.y, 0);
    const totalFacturas = (Facturas || []).length;
    const totalClientes = (clientes || []).length;
    const isDashboardLoading = loadingVentas || loadingClientes || loadingFacturas;
    const nombreUsuario = usuario?.username?.trim() || "equipo";

    const handleSuccessPedido = useCallback(() => {
        alert("Pedido creado correctamente desde el Panel.");
        cargarVentasSemanales();
        refetchFacturas();
        refetchClientes();
        setShowModalPedido(false);
    }, [cargarVentasSemanales, refetchFacturas, refetchClientes]);

    return (
        <div className="home-page space-y-8 pb-8">
            {/* Bienvenida: primer tramo después de iniciar sesión */}
            <section className="home-hero relative isolate flex min-h-[min(820px,calc(100svh-2rem))] overflow-hidden rounded-[2rem] border border-sky-100 bg-[#effafd]/75 shadow-[0_22px_60px_-35px_rgba(24,92,130,0.42)]">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
                    <div className="absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#f4d66c] sm:h-[38rem] sm:w-[38rem]" />
                    <div className="absolute -bottom-48 left-[28%] h-80 w-80 rounded-full bg-white/60 blur-2xl" />
                    <div className="absolute inset-0 opacity-[0.34] [background-image:radial-gradient(#3b82a2_0.8px,transparent_0.8px)] [background-size:22px_22px]" />
                </div>

                <div className="relative z-10 grid w-full items-center gap-2 px-6 py-10 sm:px-10 md:grid-cols-[0.92fr_1.08fr] md:px-14 lg:px-16">
                    <div className="max-w-2xl py-4 md:py-10">
                        <div className="mb-7 flex items-center gap-3">
                            <img src={logoLaBuenaCuchara} alt="" className="h-14 w-14 rounded-2xl border border-white/80 bg-white/80 p-1.5 object-contain shadow-sm sm:h-16 sm:w-16" />
                            <div>
                                <p className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">La Buena Cuchara</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-800 sm:text-xs">
                                    <Sparkles size={13} className="text-amber-500" /> Tu espacio de trabajo
                                </p>
                            </div>
                        </div>
                        <p className="mb-3 text-2xl font-bold text-sky-900/80 sm:text-3xl">¡Hola, {nombreUsuario}!</p>
                        <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                            Bienvenido a <span className="text-[#147e9d]">tu espacio</span>
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-slate-700 sm:text-lg">
                            Organiza tus pedidos y mantén cada detalle del Buffet en orden
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a href="#dashboard" className="inline-flex items-center gap-2 rounded-xl bg-[#147e9d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:-translate-y-0.5 hover:bg-[#106c87] focus:outline-none focus:ring-4 focus:ring-sky-800/20">
                                Ver resumen <ArrowDown size={17} />
                            </a>
                            <Link to="/Pedidos" className="inline-flex items-center gap-2 rounded-xl border border-sky-900/15 bg-white/70 px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-white">
                                Ir a pedidos <ArrowRight size={17} />
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-sky-950/70">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/75 text-[#147e9d] shadow-sm"><CalendarDays size={19} /></span>
                            <span>{new Intl.DateTimeFormat("es-NI", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span>
                        </div>
                    </div>

                    <div className="relative mx-auto flex min-h-[280px] w-full max-w-[650px] items-center justify-center md:min-h-[500px]">
                        <div className="absolute right-[4%] top-[10%] h-[74%] w-[82%] rotate-[-8deg] rounded-[48%_52%_42%_58%/47%_37%_63%_53%] bg-[#efcf59] shadow-inner" />
                        <div className="absolute right-[1%] top-[16%] h-[70%] w-[82%] rotate-[6deg] rounded-[45%] bg-white/45" />
                        <img src="/plato-bienvenida.png" alt="Plato de carne a la parrilla con papas y ensalada" className="relative z-10 w-full max-w-[610px] drop-shadow-[0_28px_28px_rgba(50,62,40,0.24)]" />
                        <div className="absolute bottom-[8%] left-[1%] z-20 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7fa] text-[#147e9d]"><UtensilsCrossed size={20} /></span>
                            <span><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Sabor de casa</span><span className="block text-sm font-extrabold text-slate-800">Hecho con cariño</span></span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 hidden h-2 bg-gradient-to-r from-[#5db8c3] via-[#f4d66c] to-[#3b5bc6] md:block" />
            </section>

            {/* Dashboard visible al continuar haciendo scroll */}
            <section id="dashboard" className="scroll-mt-6 space-y-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_55px_-40px_rgba(15,55,80,0.5)] backdrop-blur-sm sm:p-7 lg:p-8">
                <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#147e9d]">Vista general</p>
                        <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Resumen del negocio</h2>
                        <p className="mt-2 text-sm text-slate-600">Indicadores y herramientas para seguir el día.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 sm:self-auto">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Panel actualizado
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AnimatedKpiCard titulo="Pedidos esta semana" value={isDashboardLoading ? "Cargando..." : totalPedidosSemana} icon={<ShoppingCart size={24} />} to="/ordenes" colorPrincipal="#5db8c3" colorSecundario="#147e9d" />
                    <AnimatedKpiCard titulo="Facturas" value={isDashboardLoading ? "Cargando..." : totalFacturas} icon={<FileText size={24} />} to="/Facturas" colorPrincipal="#3b5bc6" colorSecundario="#6479d7" />
                    <AnimatedKpiCard titulo="Total de clientes" value={isDashboardLoading ? "Cargando..." : totalClientes} icon={<Users size={24} />} to="/Clientes" colorPrincipal="#2498a7" colorSecundario="#5db8c3" />
                    <AnimatedKpiCard titulo="Actividad semanal" value={isDashboardLoading ? "Cargando..." : totalPedidosSemana} icon={<TrendingUp size={24} />} to="/ordenes" colorPrincipal="#e5b936" colorSecundario="#ed9d43" />
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#f9fcfd] p-4 shadow-sm sm:p-6 lg:col-span-2">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-800">
                                    <span className="h-5 w-1.5 rounded-full bg-[#147e9d]" /> Flujo de pedidos semanal
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">Pedidos registrados por día</p>
                            </div>
                            <span className="rounded-lg bg-sky-50 p-2 text-[#147e9d]"><TrendingUp size={18} /></span>
                        </div>
                        <div className="flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2 sm:min-h-[340px]">
                            {isDashboardLoading ? (
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#147e9d] border-t-transparent" /> Cargando gráfica...</div>
                            ) : <CardGraficoLinealSemanal datos={datosVentas} />}
                        </div>
                    </div>
                    <div className="min-h-[360px]"><AccionesRapidas /></div>
                </div>
            </section>

            {showModalCliente && <ModalNuevoCliente onClose={() => setShowModalCliente(false)} />}
            {showModalPedido && <FormularioNuevoPedido onClose={() => setShowModalPedido(false)} onSave={handleSuccessPedido} />}
            {showModalContrato && <ModalNuevoContrato onClose={() => setShowModalContrato(false)} />}
        </div>
    );
}
