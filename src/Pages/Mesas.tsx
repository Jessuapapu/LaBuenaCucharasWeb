import { useState, useEffect} from "react";
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
  const [mostrarControles, setMostrarControles] = useState(false);

  if (error != null || (estado && estado.status === false)) {
    return <PantallaCerradoAdmin abrirComedor={abrirComedor} procesandoEstado={procesandoEstado} />;
  }

  const totalMesas = numeroMesa?.length || 0;

  return (
    // Fondo eliminado: dejamos que respire con el fondo general de la app
    <div className="min-h-[100dvh] text-slate-900 p-4 md:p-6 lg:p-8 font-sans antialiased bg-transparent">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* BARRA DE HERRAMIENTAS GENERAL */}
        <BarraHerramientasAdmin 
          mostrarControles={mostrarControles} setMostrarControles={setMostrarControles}
          cerrarComedor={cerrarComedor} procesandoEstado={procesandoEstado}
          sumarMesa={sumarMesa} restarMesa={restarMesa}
          procesandoMesas={procesandoMesas} cantidadMesas={totalMesas}
        />

        {/* MÉTRICAS DE OPERACIONES */}
        <GridMetricasAdmin cantidadMesas={totalMesas} mesas={numeroMesa || []} />

        {/* SECCIÓN DEL RESUMEN DE TARJETAS */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <LayoutDashboard size={22} className="text-sky-500" />
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
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <Clock size={22} className="text-sky-500" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
              Registro Operativo en Tiempo Real
            </h2>
          </div>
          
          {totalMesas > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 whitespace-nowrap">
                      <th className="p-5 font-black">ID Mesa</th>
                      <th className="p-5 font-black">Estado</th>
                      <th className="p-5 font-black">N° Orden Activa</th>
                      <th className="p-5 font-black">Hora Apertura</th>
                      <th className="p-5 font-black text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
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
    <tr className={`transition-colors whitespace-nowrap hover:bg-slate-50/50`}>
      <td className="p-5 font-black text-slate-900 font-mono text-base">Mesa #{idMesa}</td>
      <td className="p-5">
        {cargando ? (
          <span className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Sync...</span>
        ) : tieneOrden ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest">
            Ocupada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest">
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
            ? 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200' 
            : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-sky-600 border-slate-200'
          }`}
        >
          <UtensilsCrossed size={16} /> Inspeccionar
        </button>
      </td>
    </tr>
  );
}
