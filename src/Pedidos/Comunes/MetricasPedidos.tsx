import { useEffect } from 'react';
import { CalendarDays, Briefcase, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useMetricasPedidos } from '../hooks/hookPedi2s';
import { socket } from '../../services/websocket';

export function MetricasPedidos() {
    const { metricas, cargandoMetricas, refetchMetricas } = useMetricasPedidos();

    useEffect(() => {
        const manejarCambioWebsocket = () => refetchMetricas();
        socket.on("pedido_actualizado", manejarCambioWebsocket);
        socket.on("crear_pedido", manejarCambioWebsocket);

        return () => {
            socket.off("pedido_actualizado", manejarCambioWebsocket);
            socket.off("crear_pedido", manejarCambioWebsocket);
        };
    }, [refetchMetricas]);

    if (cargandoMetricas) {
        return (
            <div className="flex items-center justify-center py-6 bg-[#0F172A] border border-slate-800 rounded-2xl">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={20}/>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sincronizando registros...</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2 animate-[fade-in_0.3s_ease-out]">
            

            <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Clock size={24} />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">En Proceso</span>
                    <span className="text-xl font-black text-white">{metricas.pendientes}</span>
                </div>
            </div>

            <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Finalizados</span>
                    <span className="text-xl font-black text-white">{metricas.entregados}</span>
                </div>
            </div>
        </div>
    );
}