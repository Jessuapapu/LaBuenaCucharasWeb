import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useEstado, useMesas } from '../components/Hooks/hookComedor';
import { useOrdenesMesa } from "../components/Hooks/hookOrdenes";
import { socket } from '../services/websocket';
import { LayoutDashboard, Clock, UtensilsCrossed } from 'lucide-react';

// Ajusta las rutas a tu proyecto
import { GridMetricasAdmin } from "../grid/GridMetricasAdmin";
import { BarraHerramientasAdmin } from "../comedor/BarraHerramientaadmin";
import { TarjetaMesaAdmin } from "../comedor/TarjetaMesaAdmin";
import { PantallaCerradoAdmin } from "../comedor/PantallaCerrado";
import { EstadoVacioMesas } from "../comedor/EstadoVacioMesa";

export function IndexMesas() {
  const { estado, error, abrirComedor, cerrarComedor, cargandoAccion: procesandoEstado } = useEstado();
  const { numeroMesa, sumarMesa, restarMesa, cargandoAccion: procesandoMesas } = useMesas();
  const [mostrarControles, setMostrarControles] = useState(false);

  if (error != null || (estado && estado.status === false)) {
    return <PantallaCerradoAdmin abrirComedor={abrirComedor} procesandoEstado={procesandoEstado} />;
  }

  const totalMesas = numeroMesa?.length || 0;

  return (
    <div className="min-h-[100dvh] bg-[#090D1A] text-slate-200 p-3 sm:p-4 md:p-6 lg:p-8 font-sans antialiased selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
        
        {/* BARRA DE HERRAMIENTAS GENERAL */}
        <BarraHerramientasAdmin 
          mostrarControles={mostrarControles} setMostrarControles={setMostrarControles}
          cerrarComedor={cerrarComedor} procesandoEstado={procesandoEstado}
          sumarMesa={sumarMesa} restarMesa={restarMesa}
          procesandoMesas={procesandoMesas} cantidadMesas={totalMesas}
        />

        {/* MÉTRICAS DE OPERACIONES DE ADMINISTRACIÓN */}
        <GridMetricasAdmin cantidadMesas={totalMesas} mesas={numeroMesa || []} />

        {/* SECCIÓN DEL RESUMEN DE TARJETAS */}
        <section className="animate-[fade-in_0.4s_ease-out]">
          <h2 className="text-sm md:text-base font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <LayoutDashboard size={18} className="md:w-5 md:h-5" /> Estado en Vivo del Salón
          </h2>
          
          {totalMesas > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {
              //@ts-ignore
              numeroMesa.map((mesa: any, index: number) => (
                <TarjetaMesaAdmin key={index + 1} idMesa={index + 1} index={index + 1} />
              ))}
            </div>
          ) : (
            <EstadoVacioMesas />
          )}
        </section>

        {/* NUEVA SECCIÓN: TABLA DETALLADA INFERIOR */}
        <section className="animate-[fade-in_0.5s_ease-out] pt-4 md:pt-6">
          <h2 className="text-sm md:text-base font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={18} className="md:w-5 md:h-5" /> Registro Operativo en Tiempo Real
          </h2>
          
          {totalMesas > 0 && (
            <div className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden shadow-xl w-full">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-white/5 text-[10px] md:text-xs uppercase tracking-widest text-slate-400 whitespace-nowrap">
                      <th className="p-3 md:p-4 font-black">ID Mesa</th>
                      <th className="p-3 md:p-4 font-black">Estado</th>
                      <th className="p-3 md:p-4 font-black">N° Orden Activa</th>
                      <th className="p-3 md:p-4 font-black">Hora Apertura</th>
                      <th className="p-3 md:p-4 font-black text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {
                    //@ts-ignore
                    numeroMesa.map((mesa: any, index: number) => (
                      <FilaTablaGlobal key={`fila-${index + 1}`} idMesa={index + 1} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// Subcomponente atómico privado c/ WebSocket blindado
function FilaTablaGlobal({ idMesa }: { idMesa: number }) {
  const stringId = String(idMesa);
  const navigate = useNavigate();
  
  // Extraemos refresh para forzar recargas
  const { ordenActiva, cargando, refresh } = useOrdenesMesa(stringId) as any;

  // Lógica Robusta de Sockets
  useEffect(() => {
    // Función que recarga los datos de esta mesa específica
    const recargarMesa = (data: { IdMesa: number }) => {
      // Verificamos que el evento del servidor corresponda a esta fila
      if (Number(data.IdMesa) === idMesa && refresh) {
          refresh(); // Pide la info HTTP fresca al backend
      }
    };

    // Escuchamos AMBOS eventos posibles que el backend pueda emitir al modificar una mesa
    socket.on("orden_actualizada", recargarMesa);
    socket.on("orden_generada", recargarMesa);

    return () => {
      socket.off("orden_actualizada", recargarMesa);
      socket.off("orden_generada", recargarMesa);
    };
  }, [idMesa, refresh]);

  const tieneOrden = !!ordenActiva;

  return (
    <tr className="hover:bg-slate-800/30 transition-colors whitespace-nowrap">
      <td className="p-3 md:p-4 font-bold text-white font-mono text-sm md:text-base">Mesa #{idMesa}</td>
      <td className="p-3 md:p-4">
        {cargando ? (
          <span className="text-slate-500 animate-pulse text-[10px] md:text-xs">Sincronizando...</span>
        ) : tieneOrden ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] md:text-xs font-bold uppercase">
            Ocupada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] md:text-xs font-bold uppercase">
            Libre
          </span>
        )}
      </td>
      <td className="p-3 md:p-4 font-mono text-xs md:text-sm text-slate-300">
        {tieneOrden ? `#${ordenActiva.IdOrden}` : <span className="text-slate-600">--</span>}
      </td>
      <td className="p-3 md:p-4 text-slate-400 text-xs md:text-sm">
        {tieneOrden && ordenActiva.HoraEntrada
          ? new Date(ordenActiva.HoraEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--:--'}
      </td>
      <td className="p-3 md:p-4 text-right">
        <button
          onClick={() => navigate(`/mesa/${idMesa}`)}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white font-bold py-1.5 px-2.5 md:px-3 rounded-lg transition-all border border-white/5 active:scale-95 text-[10px] md:text-xs"
        >
          <UtensilsCrossed size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" /> Inspeccionar
        </button>
      </td>
    </tr>
  );
}