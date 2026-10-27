import { PowerOff, Minus, Plus, Loader2, ShieldAlert } from 'lucide-react';

interface BarraProps {
  cerrarComedor: () => Promise<void>;
  procesandoEstado: boolean;
  sumarMesa: () => Promise<void>;
  restarMesa: () => Promise<void>;
  procesandoMesas: boolean;
  cantidadMesas: number;
}

export function BarraHerramientasAdmin({
  cerrarComedor,
  procesandoEstado, sumarMesa, restarMesa, procesandoMesas, cantidadMesas
}: BarraProps) {
  return (
    <header className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-[#d9edf2]/55 via-[#e5efe8]/55 to-[#f5e5d4]/55 p-5 shadow-lg shadow-sky-900/5 md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-sky-300 bg-[#bfe1e9]/65 p-3 shadow-sm">
            <ShieldAlert className="text-sky-900" size={26} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Consola Administrador</h1>
            <span className="mt-0.5 text-xs font-bold uppercase tracking-widest text-teal-800">La Buena Cuchara · Control de mesas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-sky-200/80 pt-5 sm:grid-cols-3">
          <button
            onClick={cerrarComedor}
            disabled={procesandoEstado}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-[#f5d9d4]/70 px-4 py-3 text-sm font-black text-rose-900 shadow-sm transition hover:bg-[#efc8c1]/85 active:scale-[0.98] disabled:cursor-wait disabled:opacity-55"
          >
            {procesandoEstado ? <Loader2 className="animate-spin" size={17} /> : <PowerOff size={17} />}
            Detener Sistema
          </button>
          <button
            onClick={restarMesa}
            disabled={procesandoMesas || cantidadMesas === 0}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-[#f3e5c6]/70 px-4 py-3 text-sm font-black text-amber-950 shadow-sm transition hover:bg-[#eddbad]/85 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {procesandoMesas ? <Loader2 className="animate-spin" size={17} /> : <Minus size={17} />}
            Quitar mesa
          </button>
          <button
            onClick={sumarMesa}
            disabled={procesandoMesas}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-[#cfe8d5]/70 px-4 py-3 text-sm font-black text-emerald-950 shadow-sm transition hover:bg-[#bce0c5]/85 active:scale-[0.98] disabled:cursor-wait disabled:opacity-55"
          >
            {procesandoMesas ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
            Agregar mesa
          </button>
        </div>
      </div>
    </header>
  );
}
