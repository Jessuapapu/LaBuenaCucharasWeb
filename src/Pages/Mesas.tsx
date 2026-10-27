import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEstado, useMesas } from '../context/Hooks/hookComedor';
import { useOrdenesMesa } from "../context/Hooks/hookOrdenes";
import { socket } from '../context/Services/websocket';
import { LayoutDashboard, Clock, UtensilsCrossed } from 'lucide-react';

import { GridMetricasAdmin } from "../Features/Comedor/grid/GridMetricasAdmin";
import { BarraHerramientasAdmin } from "../Features/Comedor/BarraHerramientaadmin";
import { TarjetaMesaAdmin } from "../Features/Comedor/TarjetaMesaAdmin";
import { PantallaCerradoAdmin } from "../Features/Comedor/PantallaCerrado";
import { EstadoVacioMesas } from "../Features/Comedor/EstadoVacioMesa";

export function IndexMesas() {
  const { estado, error, abrirComedor, cerrarComedor, cargandoAccion: procesandoEstado } = useEstado();
  const { numeroMesa, sumarMesa, restarMesa, cargandoAccion: procesandoMesas } = useMesas();
  if (error != null || (estado && estado.status === false)) {
    return <PantallaCerradoAdmin abrirComedor={abrirComedor} procesandoEstado={procesandoEstado} />;
  }

  const totalMesas = numeroMesa?.length || 0;

  return (
    <div className="min-h-[100dvh] text-slate-900 p-4 md:p-6 lg:p-8 font-sans antialiased bg-gradient-to-br from-[#edf4f2]/35 via-[#e5f0f2]/30 to-[#f5ead9]/35">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* BARRA DE HERRAMIENTAS GENERAL */}
        <BarraHerramientasAdmin 
          cerrarComedor={cerrarComedor} procesandoEstado={procesandoEstado}
          sumarMesa={sumarMesa} restarMesa={restarMesa}
          procesandoMesas={procesandoMesas} cantidadMesas={totalMesas}
        />

        {/* MÉTRICAS DE OPERACIONES */}
        <GridMetricasAdmin cantidadMesas={totalMesas} mesas={numeroMesa || []} />

        {/* SECCIÓN DEL RESUMEN DE TARJETAS */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-sky-200 pb-3">
            <LayoutDashboard size={22} className="text-teal-700" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
              Estado en Vivo del Salón
            </h2>
          </div>
          
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

        {/* TABLA DETALLADA INFERIOR */}
        <section className="pt-4 md:pt-6">
          <div className="flex items-center gap-2 mb-6 border-b border-amber-200 pb-3">
            <Clock size={22} className="text-amber-700" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
              Registro Operativo en Tiempo Real
            </h2>
          </div>
          
          {totalMesas > 0 && (
            <div className="bg-[#e4eff0]/65 border border-sky-200/80 rounded-2xl overflow-hidden shadow-sm w-full">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#d1e8ec]/75 to-[#e4eddc]/75 border-b border-sky-200/80 text-xs uppercase tracking-widest text-slate-700 whitespace-nowrap">
                      <th className="p-5 font-black">ID Mesa</th>
                      <th className="p-5 font-black">Estado</th>
                      <th className="p-5 font-black">N° Orden Activa</th>
                      <th className="p-5 font-black">Hora Apertura</th>
                      <th className="p-5 font-black text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-200/60 bg-[#e8f1ef]/45">
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

// Subcomponente de la Fila
function FilaTablaGlobal({ idMesa }: { idMesa: number }) {
  const stringId = String(idMesa);
  const navigate = useNavigate();
  
  const { ordenActiva, cargando, refresh } = useOrdenesMesa(stringId) as any;

  useEffect(() => {
    const recargarMesa = (data: { IdMesa: number }) => {
      if (Number(data.IdMesa) === idMesa && refresh) {
          refresh(); 
      }
    };
    socket.on("orden_actualizada", recargarMesa);
    socket.on("orden_generada", recargarMesa);
    return () => {
      socket.off("orden_actualizada", recargarMesa);
      socket.off("orden_generada", recargarMesa);
    };
  }, [idMesa, refresh]);

  const tieneOrden = !!ordenActiva;

  return (
    <tr className="transition-colors whitespace-nowrap odd:bg-[#e8f1ef]/55 even:bg-[#e1eeef]/55 hover:bg-[#d0e8e8]/75">
      <td className="p-5 font-black text-slate-900 font-mono text-base">Mesa #{idMesa}</td>
      <td className="p-5">
        {cargando ? (
          <span className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Sync...</span>
        ) : tieneOrden ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/65 text-rose-700 text-xs font-black uppercase tracking-widest">
            Ocupada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/65 text-emerald-800 text-xs font-black uppercase tracking-widest">
            Libre
          </span>
        )}
      </td>
      <td className={`p-5 font-mono text-sm font-bold ${tieneOrden ? 'text-rose-600' : 'text-slate-400'}`}>
        {tieneOrden ? `#${ordenActiva.IdOrden}` : '--'}
      </td>
      <td className="p-5 text-slate-600 font-bold text-sm">
        {tieneOrden && ordenActiva.HoraEntrada
          ? new Date(ordenActiva.HoraEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--:--'}
      </td>
      <td className="p-5 text-right">
        <button
          onClick={() => navigate(`/mesa/${idMesa}`)}
          className={`inline-flex items-center gap-2 font-bold py-2 px-4 rounded-xl transition-all border active:scale-95 text-xs uppercase tracking-widest shadow-sm ${
            tieneOrden 
            ? 'bg-[#f7e3df]/65 hover:bg-[#f1d0c9]/85 text-rose-700 border-rose-200' 
            : 'bg-[#dceee2]/65 hover:bg-[#c8e4d1]/85 text-emerald-900 hover:text-emerald-950 border-emerald-200'
          }`}
        >
          <UtensilsCrossed size={16} /> Inspeccionar
        </button>
      </td>
    </tr>
  );
}
