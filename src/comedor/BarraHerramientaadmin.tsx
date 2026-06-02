import { Settings2, PowerOff, Minus, Plus, Loader2, ShieldAlert } from 'lucide-react';

interface BarraProps {
  mostrarControles: boolean;
  setMostrarControles: (val: boolean) => void;
  cerrarComedor: () => Promise<void>;
  procesandoEstado: boolean;
  sumarMesa: () => Promise<void>;
  restarMesa: () => Promise<void>;
  procesandoMesas: boolean;
  cantidadMesas: number;
}

export function BarraHerramientasAdmin({
  mostrarControles, setMostrarControles, cerrarComedor,
  procesandoEstado, sumarMesa, restarMesa, procesandoMesas, cantidadMesas
}: BarraProps) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl shadow-xl">
      <div className="flex flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl">
            <ShieldAlert className="text-red-400" size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tight">Consola Administrador</h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">La Buena Cuchara</span>
          </div>
        </div>

        <button
          onClick={() => setMostrarControles(!mostrarControles)}
          className={`p-2.5 rounded-xl transition-all border ${
            mostrarControles 
              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
              : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Settings2 size={18} className={mostrarControles ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
        </button>
      </div>

      {/* PANEL COLLAPSABLE */}
      <div className={`grid transition-all duration-300 ease-in-out ${mostrarControles ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4">
            
            <div className="flex-1 min-w-[220px] bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2.5 pl-1">Turno General</span>
              <button
                onClick={cerrarComedor}
                disabled={procesandoEstado}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 px-4 rounded-xl transition-all border border-red-500/10 disabled:opacity-50 text-sm"
              >
                <PowerOff size={14} /> Detener Sistema
              </button>
            </div>

            <div className="flex-[2] min-w-[300px] bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2.5 pl-1">Estructura del Salón</span>
              <div className="flex gap-3">
                <button
                  onClick={restarMesa}
                  disabled={procesandoMesas || cantidadMesas === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-xl transition-all border border-white/5 disabled:opacity-50 text-sm"
                >
                  {procesandoMesas ? <Loader2 className="animate-spin" size={14} /> : <Minus size={14} />}
                  Quitar Celda
                </button>
                <button
                  onClick={sumarMesa}
                  disabled={procesandoMesas}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold py-2 px-4 rounded-xl transition-all border border-blue-500/20 disabled:opacity-50 text-sm"
                >
                  {procesandoMesas ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                  Inyectar Mesa
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}