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
            <div className="flex items-center justify-center py-6 bg-[#0F172A] border border-slate-800 rounded-2xl">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={20}/>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Calculando balances de {nombreMes}...</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2 animate-[fade-in_0.3s_ease-out]">
            <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <DollarSign size={24} />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block truncate">Ingresos ({nombreMes})</span>
                    <span className="text-xl font-black text-white font-mono">C${metricas.ingresos.toFixed(2)}</span>
                </div>
            </div>

            <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block truncate">Pagados ({nombreMes})</span>
                    <span className="text-xl font-black text-white">{metricas.entregados}</span>
                </div>
            </div>

            <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Clock size={24} />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block truncate">En Preparación</span>
                    <span className="text-xl font-black text-white">{metricas.pendientes}</span>
                </div>
            </div>

            <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                    <Ban size={24} />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block truncate">Anulados ({nombreMes})</span>
                    <span className="text-xl font-black text-white">{metricas.anulados}</span>
                </div>
            </div>
        </div>
    );
}