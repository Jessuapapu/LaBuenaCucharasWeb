import { useEffect } from 'react';
import { DollarSign, Clock, CheckCircle2, Ban, Loader2 } from 'lucide-react';
import { useMetricasGlobales } from '../hooks/hookOrdenes';
import { socket } from '../../../context/Services/websocket';

export function MetricasOrdenes() {
    const { metricas, cargandoMetricas, refetchMetricas } = useMetricasGlobales();
    const nombreMes = new Date().toLocaleString('es-ES', { month: 'long' });

    // 🌐 Sincronización en tiempo real para estadísticas
    useEffect(() => {
        const manejarCambioWebsocket = () => {
            console.log("[WS] Actualizando métricas mensuales...");
            refetchMetricas();
        };

        socket.on("orden_actualizada", manejarCambioWebsocket);
        socket.on("crear_orden", manejarCambioWebsocket);
        socket.on("orden_generada", manejarCambioWebsocket);

        return () => {
            socket.off("orden_actualizada", manejarCambioWebsocket);
            socket.off("crear_orden", manejarCambioWebsocket);
            socket.off("orden_generada", manejarCambioWebsocket);
        };
    }, [refetchMetricas]);

    if (cargandoMetricas) {
        return (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-slate-50 py-6 text-sm font-semibold text-slate-500">
                <Loader2 className="mr-1 animate-spin text-[#147e9d]" size={20}/>
                <span>Calculando resumen de {nombreMes}...</span>
            </div>
        );
    }

    return (
        <div className="mb-2 grid grid-cols-1 gap-3 animate-[fade-in_0.3s_ease-out] sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 shadow-sm shadow-emerald-900/10">
                <div className="rounded-xl border border-emerald-200 bg-emerald-200/70 p-3 text-emerald-800">
                    <DollarSign size={24} />
                </div>
                <div>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">Ingresos ({nombreMes})</span>
                    <span className="font-mono text-xl font-black text-emerald-900">C${metricas.ingresos.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 to-sky-50 p-4 shadow-sm shadow-blue-900/10">
                <div className="rounded-xl border border-blue-200 bg-blue-200/70 p-3 text-[#2949b4]">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">Pagados ({nombreMes})</span>
                    <span className="text-xl font-black text-blue-900">{metricas.entregados}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-100 to-yellow-50 p-4 shadow-sm shadow-amber-900/10">
                <div className="rounded-xl border border-amber-200 bg-amber-200/70 p-3 text-amber-800">
                    <Clock size={24} />
                </div>
                <div>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">En preparación</span>
                    <span className="text-xl font-black text-amber-900">{metricas.pendientes}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-100 to-orange-50 p-4 shadow-sm shadow-rose-900/10">
                <div className="rounded-xl border border-rose-200 bg-rose-200/70 p-3 text-rose-800">
                    <Ban size={24} />
                </div>
                <div>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">Anulados ({nombreMes})</span>
                    <span className="text-xl font-black text-rose-900">{metricas.anulados}</span>
                </div>
            </div>
        </div>
    );
}
