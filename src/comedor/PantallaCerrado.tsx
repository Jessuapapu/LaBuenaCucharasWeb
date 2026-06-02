import { Power, Loader2 } from 'lucide-react';

export function PantallaCerradoAdmin({ abrirComedor, procesandoEstado }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#090D1A] p-4 relative">
      <div className="absolute w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="bg-slate-900 border border-white/5 px-6 py-10 rounded-2xl shadow-2xl text-center w-full max-w-sm relative z-10">
        <span className="text-5xl block mb-6 animate-pulse">😴</span>
        <h1 className="text-2xl font-black text-white mb-2">Turno Inactivo</h1>
        <p className="text-slate-400 text-sm mb-8">El monitor del comedor se encuentra apagado.</p>
        <button
          onClick={abrirComedor}
          disabled={procesandoEstado}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {procesandoEstado ? <Loader2 className="animate-spin" size={18} /> : <Power size={18} />}
          Encender Comedor
        </button>
      </div>
    </div>
  );
}
