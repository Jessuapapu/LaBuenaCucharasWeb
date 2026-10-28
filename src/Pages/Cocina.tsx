import { ChefHat, BellRing, UtensilsCrossed, Clock, AlertTriangle, Power } from 'lucide-react';
import { useCocina } from '../context/Hooks/hookCocina';
import { useEstado } from '../context/Hooks/hookComedor'; // Importamos el estado global del comedor

export function IndexCocina() {
  const { ordenes, cargando: cargandoCocina, notificacion, marcarOrdenLista } = useCocina();
  const { estado, error, cargando: cargandoEstado } = useEstado();

  // 1. VALIDACIÓN: SI EL COMEDOR ESTÁ CERRADO O HAY ERROR DE CONEXIÓN
  if (error != null || (estado && estado.status === false)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-br from-[#edf4f2] via-[#e5f0f2] to-[#f5ead9] p-4 relative">
        <div className="bg-[#e3eff0] border border-sky-200 px-8 py-12 rounded-3xl shadow-2xl text-center w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200 shadow-sm">
            <Power className="text-rose-600" size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase">Cocina Cerrada</h1>
          <p className="text-slate-600 text-base mb-8 font-medium">El sistema de mesas no está operando actualmente. Las comandas están pausadas.</p>
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-rose-50/80 text-rose-700 rounded-xl border border-rose-200/80 font-black text-sm uppercase tracking-widest animate-pulse">
            Esperando apertura del salón...
          </div>
        </div>
      </div>
    );
  }

  // 2. PANTALLA PRINCIPAL DE COCINA (Estilo IndexMesas)
  return (
    <div className="min-h-[100dvh] text-slate-900 p-4 md:p-6 lg:p-8 font-sans antialiased bg-gradient-to-br from-[#edf4f2]/35 via-[#e5f0f2]/30 to-[#f5ead9]/35 relative overflow-hidden">
      
      {/* NOTIFICACIÓN FLOTANTE ANIMADA (Visual) adaptada a colores claros */}
      {notificacion && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 border ${
          notificacion.tipo === 'nueva' 
            ? 'bg-[#e6f2ed] text-emerald-900 border-emerald-300' 
            : 'bg-[#fdf4e3] text-amber-900 border-amber-300'
        }`}>
          {notificacion.tipo === 'nueva' ? <BellRing size={28} className="animate-bounce text-emerald-600" /> : <AlertTriangle size={28} className="animate-pulse text-amber-600" />}
          <span className="text-xl font-black uppercase tracking-widest">{notificacion.msj}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 mb-6 border-b border-sky-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#c8e4e9] text-teal-800 rounded-xl border border-sky-300 shadow-sm">
                <ChefHat size={28} />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-widest">
                    Panel de Cocina
                </h1>
                <span className="text-teal-700 font-bold uppercase tracking-widest text-xs">
                    {ordenes.length} Comandas en curso
                </span>
            </div>
          </div>
        </div>

        {/* ESTADOS DE CARGA O VACÍO */}
        {cargandoCocina || cargandoEstado ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <ChefHat className="w-16 h-16 text-teal-600 animate-spin mb-4" />
            <span className="text-teal-900 font-black uppercase tracking-widest animate-pulse text-sm">Sincronizando Comandas...</span>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-[#e4eff0]/40 border-2 border-dashed border-sky-300/80 rounded-3xl">
            <div className="p-6 bg-white/50 rounded-full mb-4 border border-sky-100 shadow-sm">
                <UtensilsCrossed size={64} className="text-teal-700/50" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-700">Cocina Despejada</h2>
            <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-wider">No hay tickets pendientes</p>
          </div>
        ) : (
          
          /* GRID DE ÓRDENES ACTIVAS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ordenes.map(orden => (
              <div key={orden.IdOrden} className="bg-[#e4eff0]/65 border border-sky-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md hover:border-sky-300">
                
                {/* CABECERA TICKET */}
                <div className="bg-gradient-to-r from-[#d1e8ec]/75 to-[#e4eddc]/75 border-b border-sky-200/80 p-5 flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce8e4] text-rose-800 border border-rose-200 text-xs font-black uppercase tracking-widest mb-2 shadow-sm">
                      Mesa {orden.IdMesa}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">#{orden.IdOrden}</h3>
                    <p className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wide">Mesero: {orden.Mesero}</p>
                  </div>
                  <div className="flex flex-col items-end text-slate-600 bg-white/40 px-3 py-2 rounded-lg border border-sky-200/50 shadow-sm">
                    <Clock size={16} className="mb-1 text-teal-700" />
                    <span className="font-mono font-bold text-sm">
                      {new Date(orden.HoraEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* LISTA PLATILLOS */}
                <div className="p-5 flex-grow bg-[#e8f1ef]/45">
                  <ul className="space-y-3">
                    {orden.Detalles.map((detalle, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-3 bg-white/60 rounded-xl border border-sky-100 shadow-sm">
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#dceee2] text-emerald-900 font-black rounded-lg border border-emerald-200 text-lg">
                          {detalle.cantidad}
                        </span>
                        <div className="pt-1.5">
                          <p className="font-bold text-slate-800 text-base leading-tight uppercase">
                            {detalle.nombre_platillo}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ACCIÓN DESPACHAR */}
                <div className="p-5 bg-gradient-to-r from-[#d1e8ec]/40 to-[#e4eddc]/40 border-t border-sky-200/80">
                  <button
                    onClick={() => marcarOrdenLista(orden.IdMesa, orden.IdOrden)}
                    className="w-full inline-flex items-center justify-center gap-2 font-black py-4 px-4 rounded-xl transition-all border active:scale-95 text-sm uppercase tracking-widest shadow-md bg-[#dceee2] hover:bg-[#c8e4d1] text-emerald-900 hover:text-emerald-950 border-emerald-300 hover:shadow-lg"
                  >
                    <BellRing size={20} className="animate-pulse" />
                    Orden Lista
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}