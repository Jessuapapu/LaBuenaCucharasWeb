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
    <header className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-xl">
      <div className="flex flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl shadow-sm">
            <ShieldAlert className="text-rose-600" size={26} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Consola Administrador</h1>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">La Buena Cuchara</span>
          </div>
        </div>

        <button
          onClick={() => setMostrarControles(!mostrarControles)}
          className={`p-3 rounded-xl transition-all border shadow-sm ${
            mostrarControles 
              ? 'bg-sky-500 border-sky-400 text-white shadow-sky-500/30' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Settings2 size={20} className={mostrarControles ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
        </button>
      </div>

      {/* PANEL COLLAPSABLE */}
      <div className={`grid transition-all duration-300 ease-in-out ${mostrarControles ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="pt-5 border-t border-slate-200/60 flex flex-wrap gap-5">
            
            <div className="flex-1 min-w-[220px] bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 pl-1">Turno General</span>
              <button
                onClick={cerrarComedor}
                disabled={procesandoEstado}
                className="w-full flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black py-3 px-4 rounded-xl transition-all border border-rose-200 disabled:opacity-50 text-sm shadow-sm"
              >
                <PowerOff size={16} /> Detener Sistema
              </button>
            </div>

            <div className="flex-[2] min-w-[300px] bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-3 pl-1">Estructura del Salón</span>
              <div className="flex gap-4">
                <button
                  onClick={restarMesa}
                  disabled={procesandoMesas || cantidadMesas === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black py-3 px-4 rounded-xl transition-all border border-slate-300 disabled:opacity-50 text-sm shadow-sm"
                >
                  {procesandoMesas ? <Loader2 className="animate-spin" size={16} /> : <Minus size={16} />}
                  Quitar Celda
                </button>
                <button
                  onClick={sumarMesa}
                  disabled={procesandoMesas}
                  className="flex-1 flex items-center justify-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-700 font-black py-3 px-4 rounded-xl transition-all border border-sky-200 disabled:opacity-50 text-sm shadow-sm"
                >
                  {procesandoMesas ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
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