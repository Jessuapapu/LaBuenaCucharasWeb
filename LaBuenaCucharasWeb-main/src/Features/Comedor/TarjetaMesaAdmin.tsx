import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BotonMesa } from './grid/botonMesa'; 
import { socket } from '../../context/Services/websocket';
import { useOrdenesMesa, useDetalleOrden } from "../../context/Hooks/hookOrdenes";
import { Loader2, ArrowUpRight, UtensilsCrossed, Receipt } from 'lucide-react';
import type { Detalles } from "../../components/Modals/ModalMostrarDetalles";

interface TarjetaProps {
  idMesa: number;
  index: number;
}

export function TarjetaMesaAdmin({ idMesa, index }: TarjetaProps) {
  const stringId = String(idMesa);
  const navigate = useNavigate();
  
  const { ordenActiva, cargando, refresh } = useOrdenesMesa(stringId) as any;
  const { detallesOrden, cargandoDetalles, obtenerDetalle } = useDetalleOrden();

  const [borrador, setBorrador] = useState<Detalles[]>([]);

  const ordenActivaRef = useRef(ordenActiva);
  const refreshRef = useRef(refresh);
  const obtenerDetalleRef = useRef(obtenerDetalle);
  
  useEffect(() => {
      ordenActivaRef.current = ordenActiva;
      refreshRef.current = refresh;
      obtenerDetalleRef.current = obtenerDetalle;
  });

  useEffect(() => {
    const handleWS = (data: { IdMesa: number }) => {
      if (Number(data.IdMesa) === idMesa) {
        if (refreshRef.current) refreshRef.current();
        const currentOrden = ordenActivaRef.current;
        if (currentOrden?.IdOrden && obtenerDetalleRef.current) {
            obtenerDetalleRef.current(currentOrden.IdOrden);
        } else if (!currentOrden) {
            setBorrador([]);
        }
      }
    };
    socket.on("orden_actualizada", handleWS);
    socket.on("orden_generada", handleWS); 
    return () => {
        socket.off("orden_actualizada", handleWS);
        socket.off("orden_generada", handleWS);
    };
  }, [idMesa]); 

  useEffect(() => {
    if (ordenActiva?.IdOrden && obtenerDetalle) {
      obtenerDetalle(ordenActiva.IdOrden);
    } else if (!ordenActiva) {
      setBorrador([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenActiva?.IdOrden]);

  useEffect(() => {
    if (detallesOrden && ordenActiva) {
      const datosMapeados = detallesOrden.map(d => ({
        nombre_platillo: d.nombre_platillo,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      }));
      if (JSON.stringify(borrador) !== JSON.stringify(datosMapeados)) {
        setBorrador(datosMapeados);
      }
    } else if (!ordenActiva) {
        setBorrador([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detallesOrden, ordenActiva?.IdOrden]);

  const tieneOrden = !!ordenActiva;
  const totalParcial = borrador.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

  return (
    <div 
      onClick={() => navigate(`/mesa/${idMesa}`)}
      className={`group relative flex flex-col rounded-[2rem] border p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md ${
        tieneOrden 
          ? 'bg-gradient-to-br from-[#f8e1dc] to-[#f4d4ce] border-rose-300 shadow-rose-500/20 hover:shadow-rose-500/30' 
          : 'bg-gradient-to-br from-[#e2f0e8] to-[#d6e9e8] border-teal-200 hover:border-teal-300 hover:shadow-xl'
      }`}
      style={{ animationDelay: `${index * 15}ms` }}
    >
      {/* CABECERA */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-top-left -ml-2 -mt-2">
            <BotonMesa id={idMesa} />
          </div>
          
          <div className="flex flex-col -ml-2">
            <span className={`text-xl font-black leading-none ${tieneOrden ? 'text-rose-900' : 'text-slate-900'}`}>
              Mesa #{idMesa}
            </span>
            {tieneOrden ? (
                <span className="text-xs font-bold text-rose-600 mt-1 uppercase tracking-widest">Orden #{ordenActiva.IdOrden}</span>
            ) : (
                <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Disponible</span>
            )}
          </div>
        </div>
        <ArrowUpRight size={22} className={`${tieneOrden ? 'text-rose-400 group-hover:text-rose-600' : 'text-slate-400 group-hover:text-sky-500'} transition-colors`} />
      </div>

      {/* MINI RESUMEN DEL TICKET */}
      <div className="flex-1 flex flex-col justify-center min-h-[110px] mb-4">
        {cargando || cargandoDetalles ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-2">
            <Loader2 className="animate-spin mb-2 text-sky-500" size={24} />
            <span className="text-xs uppercase tracking-widest font-bold animate-pulse">Sincronizando...</span>
          </div>
        ) : tieneOrden && borrador.length > 0 ? (
          
          <div className={`rounded-xl p-4 border flex flex-col gap-2 shadow-inner ${tieneOrden ? 'bg-[#f9ebe7] border-rose-200' : 'bg-[#eaf3eb] border-emerald-200'}`}>
            <div className={`flex items-center gap-1.5 border-b pb-2 mb-1 ${tieneOrden ? 'border-rose-200/60' : 'border-slate-200'}`}>
                <Receipt size={14} className={tieneOrden ? "text-rose-500" : "text-slate-400"} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${tieneOrden ? 'text-rose-600' : 'text-slate-500'}`}>Resumen Pedido</span>
            </div>
            
            <ul className="space-y-2">
                {borrador.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-800 truncate pr-2 flex-1">
                            <span className={`${tieneOrden ? 'text-rose-600' : 'text-sky-600'} font-black mr-1.5`}>{item.cantidad}x</span>
                            {item.nombre_platillo}
                        </span>
                        <span className="text-slate-600 font-mono pl-2">C${item.precio_unitario * item.cantidad}</span>
                    </li>
                ))}
                
                {borrador.length > 3 && (
                    <li className="text-[10px] text-slate-500 font-bold italic pt-1">
                        + {borrador.length - 3} platillos extras...
                    </li>
                )}
            </ul>

            <div className={`mt-2 pt-2 border-t flex justify-between items-end ${tieneOrden ? 'border-rose-200/60' : 'border-slate-200'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${tieneOrden ? 'text-rose-500' : 'text-slate-500'}`}>Total</span>
                <span className={`text-base font-black font-mono ${tieneOrden ? 'text-rose-700' : 'text-slate-800'}`}>C${totalParcial.toFixed(2)}</span>
            </div>
          </div>

        ) : tieneOrden && borrador.length === 0 ? (
           <div className="text-center py-5 bg-white/50 rounded-xl border border-dashed border-rose-300">
            <p className="text-sm text-rose-600 font-bold">Ticket abierto sin platillos.</p>
          </div>
        ) : (
          <div className="text-center py-6 bg-[#e9f2e7] rounded-xl border border-dashed border-emerald-300">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Mesa Libre</p>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/mesa/${idMesa}`); }}
        className={`w-full flex items-center justify-center gap-2 text-sm font-black py-3 px-4 rounded-xl transition-all border shadow-sm ${
            tieneOrden 
            ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-200' 
            : 'bg-[#dceee3] hover:bg-[#c9e6d3] text-emerald-900 hover:text-emerald-950 border-emerald-200'
        }`}
      >
        <UtensilsCrossed size={16} />
        {tieneOrden ? 'Inspeccionar Ticket' : 'Abrir Mesa'}
      </button>
    </div>
  );
}
