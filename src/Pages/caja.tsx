import { useState } from 'react';
import { Lock, Unlock, DollarSign, Receipt, CreditCard, Loader2, Eye, Undo2, MonitorSpeaker } from 'lucide-react';
import { useCaja } from '../Features/Caja/hook/useCaja'; 
import { apiCaja } from '../context/Services/caja';
import { ModalCobro } from '../Features/Caja/modals/ModalCobro';
import { ModalReembolso } from '../Features/Caja/modals/ModalReembolso';
import { ModalAdministrarCaja } from '../Features/Caja/modals/ModalAdministrarCaja';

export default function CajaPage() {
    const { estadoCaja, datosCaja, cargando, abrirCaja, cerrarCaja, refetch } = useCaja();
    
    // Estados para Modales
    const [ordenACobrar, setOrdenACobrar] = useState<any | null>(null);
    const [ordenAReembolsar, setOrdenAReembolsar] = useState<any | null>(null);
    const [ordenAAdministrar, setOrdenAAdministrar] = useState<any | null>(null);

    const procesarPagosMultiples = async (idOrden: number, pagos: any[]): Promise<boolean> => {
        try {
            for (const pago of pagos) {
                await apiCaja.pagarOrden({ IdOrden: idOrden, Monto: pago.monto, Metodo: pago.metodo, Referencia: pago.referencia || "" });
            }
            await apiCaja.finalizarOrden(idOrden);
            refetch(); 
            return true;
        } catch (error) {
            console.error(error);
            alert("Error al procesar el pago.");
            return false;
        }
    };

    if (cargando) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-sky-500" size={48}/>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500 animate-pulse">Sincronizando Terminal...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* ENCABEZADO PRINCIPAL (Estilo bg-white-800) */}
            <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl shadow-lg border ${estadoCaja ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500/30 text-white shadow-emerald-500/20' : 'bg-gradient-to-br from-rose-500 to-red-600 border-rose-500/30 text-white shadow-rose-500/20'}`}>
                        {estadoCaja ? <MonitorSpeaker size={28} /> : <Lock size={28} />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Terminal de Caja</h1>
                        <p className="text-sm font-bold tracking-widest uppercase mt-1 flex items-center gap-2 text-slate-500">
                            Estado actual: 
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] text-white ${estadoCaja ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-rose-500 shadow-sm shadow-rose-500/30'}`}>
                                {estadoCaja ? 'OPERATIVA' : 'CERRADA'}
                            </span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={estadoCaja ? cerrarCaja : abrirCaja} 
                    className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 text-white ${estadoCaja ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}
                >
                    {estadoCaja ? <Lock size={18}/> : <Unlock size={18}/>}
                    {estadoCaja ? 'Cerrar Turno' : 'Aperturar Caja'}
                </button>
            </div>

            {!estadoCaja ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white-800 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl">
                    <div className="p-6 bg-slate-100 rounded-full border border-slate-200 shadow-inner mb-6">
                        <Lock size={48} className="text-slate-400" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Terminal Fuera de Servicio</h2>
                    <p className="text-slate-500 font-medium mt-2 text-lg">Aperture la caja para comenzar a procesar pagos y órdenes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                    
                    {/* PANEL IZQUIERDO: ACTIVAS (Cristal Oscuro) */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Receipt size={24} className='text-amber-400'/> Cuentas Pendientes
                            </h3>
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black font-mono px-3 py-1 rounded-lg text-sm shadow-inner">
                                {datosCaja?.OrdenesActivas?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {datosCaja?.OrdenesActivas?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500/60 font-medium">
                                    <Receipt size={56} className="mb-4 text-slate-700"/>
                                    <p>Esperando nuevas órdenes...</p>
                                </div>
                            ) : (
                                datosCaja?.OrdenesActivas?.map((orden: any) => (
                                    <div key={orden.IdOrden} className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all group">
                                        <div>
                                            <div className="font-mono font-black text-white text-xl">Ord #{orden.IdOrden}</div>
                                            <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Total Cuenta: C${orden.Monto.toFixed(2)}</div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t border-slate-800/60 pt-4 sm:border-none sm:pt-0">
                                            <div className="text-left sm:text-right">
                                                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-widest">Faltante</span>
                                                <span className="font-mono font-black text-amber-400 text-2xl drop-shadow-md">C${orden.MontoRestante.toFixed(2)}</span>
                                            </div>
                                            
                                            <div className="flex bg-slate-950/60 border border-slate-800/60 rounded-xl overflow-hidden shadow-inner">
                                                <button onClick={() => setOrdenAAdministrar(orden)} className="p-3.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition-colors border-r border-slate-800/60" title="Ver Detalles y Administrar">
                                                    <Eye size={20} />
                                                </button>
                                                <button onClick={() => setOrdenACobrar(orden)} className="p-3.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]" title="Procesar Cobro">
                                                    <DollarSign size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* PANEL DERECHO: ATENDIDAS (Cristal Oscuro) */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={24}/> Facturadas
                            </h3>
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black font-mono px-3 py-1 rounded-lg text-sm shadow-inner">
                                {datosCaja?.OrdenesAtendidas?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {datosCaja?.OrdenesAtendidas?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500/60 font-medium">
                                    <CreditCard size={56} className="mb-4 text-slate-700"/>
                                    <p>Sin transacciones completadas</p>
                                </div>
                            ) : (
                                datosCaja?.OrdenesAtendidas?.map((orden: any) => (
                                    <div key={orden.IdOrden} className="bg-slate-950/20 border border-slate-800/50 p-4 rounded-2xl flex justify-between items-center hover:bg-slate-800/40 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-1 border-r border-slate-800/60 pr-3">
                                                <button onClick={() => setOrdenAAdministrar(orden)} className="p-2 text-slate-500 hover:text-sky-400 bg-slate-900/40 hover:bg-slate-800 rounded-lg transition-colors" title="Ver Detalles">
                                                    <Eye size={18}/>
                                                </button>
                                                <button onClick={() => setOrdenAReembolsar(orden)} className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900/40 hover:bg-slate-800 rounded-lg transition-colors" title="Emitir Reembolso">
                                                    <Undo2 size={18}/>
                                                </button>
                                            </div>
                                            <div>
                                                <div className="font-mono font-black text-slate-200">Ord #{orden.IdOrden}</div>
                                                <div className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mt-0.5">Pagado</div>
                                            </div>
                                        </div>
                                        <div className="font-mono font-black text-emerald-400 text-lg">C${orden.Monto.toFixed(2)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="mt-4 pt-5 border-t border-slate-800/60 flex justify-between items-center relative z-10">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos Brutos</span>
                            <span className="text-3xl font-black font-mono text-white tracking-tighter drop-shadow-md">
                                C${datosCaja?.OrdenesAtendidas?.reduce((a:number, b:any) => a + b.Monto, 0).toFixed(2) || "0.00"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ZONA DE MODALES */}
            {ordenACobrar && <ModalCobro orden={ordenACobrar} onClose={() => setOrdenACobrar(null)} onConfirmarPagos={procesarPagosMultiples} />}
            {ordenAReembolsar && <ModalReembolso orden={ordenAReembolsar} onClose={() => setOrdenAReembolsar(null)} onSuccess={refetch} />}
            {ordenAAdministrar && <ModalAdministrarCaja orden={ordenAAdministrar} onClose={() => setOrdenAAdministrar(null)} onSuccess={refetch} />}
        </div>
    );
}