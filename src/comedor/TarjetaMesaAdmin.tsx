import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BotonMesa } from './grid/botonMesa'; 
import { socket } from '../services/websocket';
import { useOrdenesMesa, useDetalleOrden } from "../components/Hooks/hookOrdenes";
import { Loader2, ArrowUpRight, UtensilsCrossed, Receipt } from 'lucide-react';
import type { Detalles } from "../components/modals/ModalMostrarDetalles";

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

  // 🚀 EL SECRETO SENIOR: Guardamos todo en referencias mutables
  const ordenActivaRef = useRef(ordenActiva);
  const refreshRef = useRef(refresh);
  const obtenerDetalleRef = useRef(obtenerDetalle);
  
  // Actualizamos las referencias en cada render SIN causar re-renders adicionales
  useEffect(() => {
      ordenActivaRef.current = ordenActiva;
      refreshRef.current = refresh;
      obtenerDetalleRef.current = obtenerDetalle;
  });

  // 🌐 SOCKET BINDING PERFECTO: Se conecta 1 sola vez (arreglo vacío [])
  useEffect(() => {
    const handleWS = (data: { IdMesa: number }) => {
      if (Number(data.IdMesa) === idMesa) {
        // 1. Llamamos al refresh a través de la referencia
        if (refreshRef.current) refreshRef.current();
        
        // 2. Forzamos la actualización de los platillos
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
  }, [idMesa]); // <-- Clave: Ya no dependemos de funciones, solo del ID.

  // Sincronización Primaria al montar o cambiar de orden
  useEffect(() => {
    if (ordenActiva?.IdOrden && obtenerDetalle) {
      obtenerDetalle(ordenActiva.IdOrden);
    } else if (!ordenActiva) {
      setBorrador([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenActiva?.IdOrden]);

  // Deep-matching de platillos para evitar renderizados infinitos
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
      className={`group relative flex flex-col rounded-[1.5rem] border p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
        tieneOrden 
          ? 'bg-gradient-to-b from-slate-800 to-[#0F172A] border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)]' 
          : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
      }`}
      style={{ animationDelay: `${index * 15}ms` }}
    >
      {/* CABECERA */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-top-left -ml-2 -mt-2">
            <BotonMesa id={idMesa} />
          </div>
          
          <div className="flex flex-col -ml-4">
            <span className="text-sm font-black text-white leading-none">Mesa #{idMesa}</span>
            {tieneOrden ? (
                <span className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-wider">Orden #{ordenActiva.IdOrden}</span>
            ) : (
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Disponible</span>
            )}
          </div>
        </div>
        <ArrowUpRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>

      {/* MINI RESUMEN DEL TICKET */}
      <div className="flex-1 flex flex-col justify-center min-h-[100px] mb-4">
        {cargando || cargandoDetalles ? (
          <div className="flex flex-col items-center justify-center text-blue-400/70 py-2">
            <Loader2 className="animate-spin mb-2" size={20} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Sync...</span>
          </div>
        ) : tieneOrden && borrador.length > 0 ? (
          
          <div className="bg-[#070A14]/50 rounded-xl p-3 border border-white/5 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 mb-1">
                <Receipt size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumen</span>
            </div>
            
            <ul className="space-y-1.5">
                {borrador.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 truncate pr-2 flex-1">
                            <span className="text-blue-400 font-black mr-1">{item.cantidad}x</span>
                            {item.nombre_platillo}
                        </span>
                        <span className="text-slate-400 font-mono pl-2">C${item.precio_unitario * item.cantidad}</span>
                    </li>
                ))}
                
                {borrador.length > 3 && (
                    <li className="text-[10px] text-slate-500 font-medium italic pt-1">
                        + {borrador.length - 3} platillos más...
                    </li>
                )}
            </ul>

            <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                <span className="text-sm font-black text-emerald-400 font-mono">C${totalParcial.toFixed(2)}</span>
            </div>
          </div>

        ) : tieneOrden && borrador.length === 0 ? (
           <div className="text-center py-4 bg-slate-900/30 rounded-xl border border-dashed border-white/5">
            <p className="text-xs text-slate-400 font-medium">Ticket abierto sin platillos.</p>
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-900/20 rounded-xl border border-dashed border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sin consumo</p>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/mesa/${idMesa}`); }}
        className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl transition-all border ${
            tieneOrden 
            ? 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border-blue-500/20' 
            : 'bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white border-white/5'
        }`}
      >
        <UtensilsCrossed size={14} />
        {tieneOrden ? 'Inspeccionar Ticket' : 'Abrir Mesa'}
      </button>
    </div>
  );
}