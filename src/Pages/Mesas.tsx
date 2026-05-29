import { useEffect } from "react";
import { useComedor } from "../components/Hooks/hookComedor";
import MesaOrden from "../components/Filtro/Mesaorden";
import { Plus, RefreshCw, AlertCircle, LayoutDashboard } from "lucide-react";
import { socket } from "../services/websocket";

export default function ComedorPage() {
  const { mesas, loading, error, refresh, agregarMesa } = useComedor();

  // Determinamos si tenemos datos para mostrar, independientemente del estado de carga o error
  const tieneMesas = mesas.length > 0;

  //conexion websocket
  useEffect(() => {
    // Si la base de datos cambia o un mesero actualiza una orden, Python avisa aquí
    const handleMesaActualizada = (data: { IdMesa: number; Estado?: string }) => {
      console.log(`Mesa modificada en tiempo real: ${data.IdMesa}. Refrescando monitor...`);
      refresh(); // Recarga los datos de tu API HTTP de forma silenciosa
    };

    socket.on("orden_actualizada", handleMesaActualizada);
    socket.on("mesa_actualizada", handleMesaActualizada); // Por si manejas un evento directo para el estado físico

    return () => {
      socket.off("orden_actualizada", handleMesaActualizada);
      socket.off("mesa_actualizada", handleMesaActualizada);
    };
  }, [refresh]);

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-slate-200 border rounded-xl">
      {/* HEADER ESTATICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/50 rounded-2xl">
            <LayoutDashboard className="text-blue-500" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">MONITOR COMEDOR</h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 font-medium">La Buena Cuchara</p>
              {error && (
                <span className="flex items-center gap-1 text-xs text-red-500 bg-red-800/10 px-2 py-0.5 rounded-full">
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
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
                numero_mesa={`Mesa ${mesa.id}`}
                capacidad={mesa.capacidad || 4} // Pasa la capacidad real de tu BD
                estado={mesa.estado} // 'disponible' | 'ocupada' | 'cuenta_pedida' | 'limpieza'
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
          /* CASO: COMEDOR VACÍO */
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="bg-slate-900 p-6 rounded-full mb-4">
              <Plus size={40} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-white">No hay mesas configuradas</h2>
            <p className="text-slate-400 mb-6">El comedor está vacío para hoy.</p>
            <button 
              onClick={agregarMesa}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors"
            >
              Comenzar a añadir mesas
            </button>
          </div>
        ) : (
          /* LOADING INICIAL (SKELETONS) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        )}
      </main>
      
      {/* FOOTER INFORMATIVO */}
      <footer className="mt-12 flex justify-between items-center border-t border-slate-800 pt-6">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#6167db] rounded-full shadow-[0_0_10px_rgba(97,103,219,0.4)]" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#b93e9f] rounded-full shadow-[0_0_10px_rgba(185,62,159,0.4)]" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">En Servicio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#20b37e] rounded-full shadow-[0_0_10px_rgba(32,179,126,0.4)]" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Por Pagar</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          Sistema Monitor <span className="text-white ml-2 px-2 py-1 bg-slate-800 rounded">{mesas.length} Mesas Totales</span>
        </p>
      </footer>
    </div>
  );
}