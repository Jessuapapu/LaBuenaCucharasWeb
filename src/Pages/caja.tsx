import { useState } from 'react';
import { Lock, Unlock, DollarSign, Receipt, CreditCard, Loader2, Eye, Undo2 } from 'lucide-react';
import { useCaja } from '../Caja/hook/useCaja'; 
import { apiCaja } from '../services/caja';
import { ModalCobro } from '../Caja/modals/ModalCobro';
import { ModalReembolso } from '../Caja/modals/ModalReembolso';
import { ModalAdministrarCaja } from '../Caja/modals/ModalAdministrarCaja';

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
            <div className="min-h-screen bg-[#090D1A] flex flex-col items-center justify-center gap-4 text-blue-500">
                <Loader2 className="animate-spin" size={48}/>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Sincronizando Terminal...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-800/60 text-slate-400 p-4 md:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-[1400px] mx-auto space-y-6 flex flex-col h-full animate-[fade-in_0.5s_ease-out]">
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl border shadow-inner ${estadoCaja ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {estadoCaja ? <Unlock size={28} /> : <Lock size={28} />}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Monitor de Caja</h1>
                            <p className="text-xs md:text-sm font-bold tracking-widest uppercase mt-1 text-slate-400 flex items-center gap-2">
                                Estado del Sistema: 
                                <span className={estadoCaja ? 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded' : 'text-red-400 bg-red-500/10 px-2 py-0.5 rounded'}>
                                    {estadoCaja ? 'OPERATIVA' : 'CERRADA'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button onClick={estadoCaja ? cerrarCaja : abrirCaja} className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 border ${estadoCaja ? 'bg-red-600 hover:bg-red-500 border-red-500/50 shadow-red-900/40' : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 shadow-emerald-900/40'} text-white`}>
                        {estadoCaja ? 'Cerrar Turno' : 'Aperturar Caja'}
                    </button>
                </header>

                {!estadoCaja ? (
                    <div className="flex flex-col items-center justify-center py-40 bg-white-800 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-2xl">
                        <div className="p-6 bg-slate-900/40 rounded-full border border-slate-800/50 shadow-inner mb-6"><Lock size={48} className="text-blue-500" /></div>
                        <h2 className="text-2xl font-black text-black">Terminal Fuera de Servicio</h2>
                        <p className="text-slate-500 font-medium mt-2">Aperture la caja para comenzar a recibir órdenes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
                        
                        {/* PANEL IZQUIERDO: ACTIVAS */}
                        <div className="bg-900/40 border border-slate-800/50 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Receipt size={22} className='text-blue-500'/> Cuentas Pendientes
                                </h3>
                                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black font-mono px-3 py-1 rounded-lg text-sm">{datosCaja?.OrdenesActivas?.length || 0}</span>
                            </div>

                            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                                {datosCaja?.OrdenesActivas?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60"><Receipt size={48} className="mb-4"/><p>Esperando órdenes...</p></div>
                                ) : (
                                    datosCaja?.OrdenesActivas?.map((orden: any) => (
                                        <div key={orden.IdOrden} className="bg-[#0A0F1D] border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-500/50 transition-colors">
                                            <div>
                                                <div className="font-mono font-black text-white text-xl">Ord #{orden.IdOrden}</div>
                                                <div className="text-xs font-bold text-slate-500 mt-1 uppercase">Total: C${orden.Monto.toFixed(2)}</div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Faltante</span>
                                                    <span className="font-mono font-black text-amber-400 text-2xl">C${orden.MontoRestante.toFixed(2)}</span>
                                                </div>
                                                
                                                <div className="flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                                                    <button onClick={() => setOrdenAAdministrar(orden)} className="p-3.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors border-r border-slate-800" title="Ver Detalles y Administrar">
                                                        <Eye size={20} />
                                                    </button>
                                                    <button onClick={() => setOrdenACobrar(orden)} className="p-3.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors" title="Procesar Cobro">
                                                        <DollarSign size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* PANEL DERECHO: ATENDIDAS */}
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-lg font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={22}/> Facturadas / Cerradas
                                </h3>
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black font-mono px-3 py-1 rounded-lg text-sm">{datosCaja?.OrdenesAtendidas?.length || 0}</span>
                            </div>

                            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                                {datosCaja?.OrdenesAtendidas?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60"><CreditCard size={48} className="mb-4"/><p>Registro vacío</p></div>
                                ) : (
                                    datosCaja?.OrdenesAtendidas?.map((orden: any) => (
                                        <div key={orden.IdOrden} className="bg-slate-900/50 border border-emerald-500/10 p-4 rounded-2xl flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-1 border-r border-slate-700 pr-3">
                                                    <button onClick={() => setOrdenAAdministrar(orden)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors" title="Ver Detalles">
                                                        <Eye size={18}/>
                                                    </button>
                                                    <button onClick={() => setOrdenAReembolsar(orden)} className="p-2 text-slate-500 hover:text-amber-400 transition-colors" title="Emitir Reembolso">
                                                        <Undo2 size={18}/>
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="font-mono font-black text-slate-300">Ord #{orden.IdOrden}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Pagado</div>
                                                </div>
                                            </div>
                                            <div className="font-mono font-black text-emerald-500 text-lg">C${orden.Monto.toFixed(2)}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center relative z-10">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ingresos Brutos</span>
                                <span className="text-2xl font-black font-mono text-white tracking-tighter">
                                    C${datosCaja?.OrdenesAtendidas?.reduce((a:number, b:any) => a + b.Monto, 0).toFixed(2) || "0.00"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ZONA DE MODALES */}
            {ordenACobrar && <ModalCobro orden={ordenACobrar} onClose={() => setOrdenACobrar(null)} onConfirmarPagos={procesarPagosMultiples} />}
            {ordenAReembolsar && <ModalReembolso orden={ordenAReembolsar} onClose={() => setOrdenAReembolsar(null)} onSuccess={refetch} />}
            {ordenAAdministrar && <ModalAdministrarCaja orden={ordenAAdministrar} onClose={() => setOrdenAAdministrar(null)} onSuccess={refetch} />}
        </div>
    );
}