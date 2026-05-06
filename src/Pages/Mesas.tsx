import { useComedor } from "../components/Hooks/hookComedor";
import MesaOrden from "../components/Filtro/Mesaorden";
import { Plus, RefreshCw, AlertCircle, LayoutDashboard } from "lucide-react";

export default function ComedorPage() {
  const { mesas, loading, error, refresh, agregarMesa } = useComedor();

  // Determinamos si tenemos datos para mostrar, independientemente del estado de carga o error
  const tieneMesas = mesas.length > 0;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-200">
      {/* HEADER ESTATICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-600/20 rounded-2xl">
            <LayoutDashboard className="text-green-500" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">MONITOR COMEDOR</h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 font-medium">La Buena Cuchara</p>
              {error && (
                <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                  <AlertCircle size={12} /> Error de conexión
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={refresh}
            disabled={loading}
            className={`p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all ${loading ? 'opacity-50' : ''}`}
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={agregarMesa}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <Plus size={20} />
            Añadir Mesa
          </button>
        </div>
      </header>

      {/* ÁREA DE VISUALIZACIÓN */}
      <main>
        {tieneMesas ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {mesas.map((mesa) => (
              <MesaOrden 
                key={mesa.id}
                numero_mesa={mesa.id.toString()}
                estado={mesa.estado}
                idOrden={mesa.ordenActiva?.IdOrden || 0}
                HoraEntrada={
                  mesa.ordenActiva 
                    ? new Date(mesa.ordenActiva.HoraEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : "--:--"
                }
              />
            ))}
          </div>
        ) : !loading ? (
          /* CASO: COMEDOR VACÍO (SIN MESAS CONFIGURADAS) */
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="bg-slate-900 p-6 rounded-full mb-4">
              <Plus size={40} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-white">No hay mesas configuradas</h2>
            <p className="text-slate-500 mb-6">El comedor está vacío para hoy.</p>
            <button 
              onClick={agregarMesa}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Comenzar a añadir mesas
            </button>
          </div>
        ) : (
          /* LOADING INICIAL */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        )}
      </main>
      
      {/* FOOTER INFORMATIVO */}
      <footer className="mt-12 flex justify-between items-center border-t border-slate-900 pt-6">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,44,44,0.4)]" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Ocupadas</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          Sistema Monitor <span className="text-white ml-2 px-2 py-1 bg-slate-900 rounded">{mesas.length} Mesas Totales</span>
        </p>
      </footer>
    </div>
  );
}