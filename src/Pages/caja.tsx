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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#edf4f2] to-[#f4ead9] rounded-3xl">
                <Loader2 className="animate-spin text-teal-700" size={48}/>
                <span className="text-sm font-bold uppercase tracking-widest text-teal-900 animate-pulse">Sincronizando Terminal...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 rounded-3xl bg-gradient-to-br from-[#edf4f2] via-[#e5f0f2] to-[#f5ead9] p-3 md:p-5">
            
            <div className="bg-gradient-to-r from-[#d4eaf0] via-[#deede8] to-[#f3e6d1] p-6 rounded-2xl border border-sky-200 shadow-sm shadow-sky-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl shadow-sm border ${estadoCaja ? 'bg-[#c4e5d0] border-emerald-300 text-emerald-900' : 'bg-[#f3d9d3] border-rose-300 text-rose-900'}`}>
                        {estadoCaja ? <MonitorSpeaker size={28} /> : <Lock size={28} />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Terminal de Caja</h1>
                        <p className="text-sm font-bold tracking-widest uppercase mt-1 flex items-center gap-2 text-slate-700">
                            Estado actual: 
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] text-white ${estadoCaja ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-rose-500 shadow-sm shadow-rose-500/30'}`}>
                                {estadoCaja ? 'OPERATIVA' : 'CERRADA'}
                            </span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={estadoCaja ? cerrarCaja : abrirCaja} 
                    className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 flex justify-center items-center gap-2 text-white ${estadoCaja ? 'bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 shadow-rose-900/10' : 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-900/10'}`}
                >
                    {estadoCaja ? <Lock size={18}/> : <Unlock size={18}/>}
                    {estadoCaja ? 'Cerrar Turno' : 'Aperturar Caja'}
                </button>
            </div>

            {!estadoCaja ? (
                <div className="flex flex-col items-center justify-center py-32 bg-gradient-to-br from-[#e0edf0] to-[#f2e5d2] border border-sky-200 rounded-2xl shadow-lg">
                    <div className="p-6 bg-[#d1e6e8] rounded-full border border-sky-300 shadow-inner mb-6">
                        <Lock size={48} className="text-sky-900" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Terminal Fuera de Servicio</h2>
                    <p className="text-slate-700 font-medium mt-2 text-lg">Aperture la caja para comenzar a procesar pagos y órdenes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                    
                    <div className="bg-gradient-to-br from-[#f5e5c7] via-[#f2e7d4] to-[#f3ddd2] border border-amber-300/80 rounded-3xl p-6 lg:p-8 shadow-lg shadow-amber-900/5 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-black text-amber-950 uppercase tracking-widest flex items-center gap-2">
                                <Receipt size={24} className='text-orange-800'/> Cuentas Pendientes
                            </h3>
                            <span className="bg-[#edcf91] border border-amber-400 text-amber-950 font-black font-mono px-3 py-1 rounded-lg text-sm shadow-inner">
                                {datosCaja?.OrdenesActivas?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {datosCaja?.OrdenesActivas?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-amber-950/70 font-medium">
                                    <Receipt size={56} className="mb-4 text-orange-700"/>
                                    <p>Esperando nuevas órdenes...</p>
                                </div>
                            ) : (
                                datosCaja?.OrdenesActivas?.map((orden: any) => (
                                    <div key={orden.IdOrden} className="bg-gradient-to-r from-[#f8edda] to-[#f4e2d6] border border-amber-300 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-orange-400 hover:from-[#f6e4c3] hover:to-[#f1d6c7] transition-all group">
                                        <div>
                                            <div className="font-mono font-black text-amber-950 text-xl">Ord #{orden.IdOrden}</div>
                                            <div className="text-xs font-bold text-amber-950/75 mt-1 uppercase tracking-wider">Total Cuenta: C${orden.Monto.toFixed(2)}</div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t border-amber-200 pt-4 sm:border-none sm:pt-0">
                                            <div className="text-left sm:text-right">
                                                <span className="text-[10px] font-bold uppercase text-orange-950/75 block tracking-widest">Faltante</span>
                                                <span className="font-mono font-black text-orange-900 text-2xl">C${orden.MontoRestante.toFixed(2)}</span>
                                            </div>
                                            
                                            <div className="flex bg-[#f2e4ce] border border-amber-300 rounded-xl overflow-hidden shadow-inner">
                                                <button onClick={() => setOrdenAAdministrar(orden)} className="p-3.5 text-amber-950 hover:text-white hover:bg-amber-700 transition-colors border-r border-amber-300" title="Ver Detalles y Administrar">
                                                    <Eye size={20} />
                                                </button>
                                                <button onClick={() => setOrdenACobrar(orden)} className="p-3.5 bg-[#d5e8ce] text-emerald-950 hover:bg-emerald-700 hover:text-white transition-all" title="Procesar Cobro">
                                                    <DollarSign size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#cfe9d6] via-[#d9eee4] to-[#cce8e8] border border-emerald-300/80 rounded-3xl p-6 lg:p-8 shadow-lg shadow-emerald-900/5 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={24}/> Facturadas
                            </h3>
                            <span className="bg-[#a9d7b4] border border-emerald-400 text-emerald-950 font-black font-mono px-3 py-1 rounded-lg text-sm shadow-inner">
                                {datosCaja?.OrdenesAtendidas?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {datosCaja?.OrdenesAtendidas?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-emerald-950/75 font-medium">
                                    <CreditCard size={56} className="mb-4 text-teal-800"/>
                                    <p>Sin transacciones completadas</p>
                                </div>
                            ) : (
                                datosCaja?.OrdenesAtendidas?.map((orden: any) => (
                                    <div key={orden.IdOrden} className="bg-gradient-to-r from-[#e1f0df] to-[#d3ece6] border border-emerald-300 p-4 rounded-2xl flex justify-between items-center hover:from-[#d5ebd4] hover:to-[#c6e5dd] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-1 border-r border-emerald-300 pr-3">
                                                <button onClick={() => setOrdenAAdministrar(orden)} className="p-2 text-teal-950 hover:text-white bg-[#c8e5dc] hover:bg-teal-800 rounded-lg transition-colors" title="Ver Detalles">
                                                    <Eye size={18}/>
                                                </button>
                                                <button onClick={() => setOrdenAReembolsar(orden)} className="p-2 text-rose-800 hover:text-white bg-[#f2dfd7] hover:bg-rose-700 rounded-lg transition-colors" title="Emitir Reembolso">
                                                    <Undo2 size={18}/>
                                                </button>
                                            </div>
                                            <div>
                                                <div className="font-mono font-black text-slate-900">Ord #{orden.IdOrden}</div>
                                                <div className="text-[10px] font-bold text-teal-900 uppercase tracking-widest mt-0.5">Pagado</div>
                                            </div>
                                        </div>
                                        <div className="font-mono font-black text-teal-950 text-lg">C${orden.Monto.toFixed(2)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="mt-4 pt-5 border-t border-emerald-400/70 flex justify-between items-center relative z-10">
                            <span className="text-xs font-bold text-teal-950/80 uppercase tracking-widest">Ingresos Brutos</span>
                            <span className="text-3xl font-black font-mono text-teal-950 tracking-tighter">
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
