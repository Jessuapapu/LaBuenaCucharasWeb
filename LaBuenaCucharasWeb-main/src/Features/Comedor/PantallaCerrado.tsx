import { Power, Loader2 } from 'lucide-react';

export function PantallaCerradoAdmin({ abrirComedor, procesandoEstado }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 p-4 relative">
      <div className="bg-white border border-slate-200 px-8 py-12 rounded-3xl shadow-2xl text-center w-full max-w-md relative z-10">
        <span className="text-6xl block mb-6 animate-pulse">😴</span>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Turno Inactivo</h1>
        <p className="text-slate-500 text-base font-medium mb-10">El monitor del comedor se encuentra apagado.</p>
        <button
          onClick={abrirComedor}
          disabled={procesandoEstado}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 text-lg"
        >
          {procesandoEstado ? <Loader2 className="animate-spin" size={22} /> : <Power size={22} />}
          Encender Comedor
        </button>
      </div>
    </div>
  );
}