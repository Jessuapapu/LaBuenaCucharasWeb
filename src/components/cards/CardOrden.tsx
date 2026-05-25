import { Calendar, Clock, Settings2, ChevronUp, ChevronDown } from "lucide-react";
import ModalPedido from "../modals/ModalPedido";
import { useState } from "react";
import type { CrearOrden, CardPedidoProps, OrdenVisualizar } from "../../interfaces/Ordenes";
import { useOrdenes } from "../Hooks/hookOrdenes";

interface Props extends CardPedidoProps {
  Pedido: OrdenVisualizar;
}
export default function CardPedido({Pedido, onClick, Actualizar}: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [mostrarDetalles, setmostarDetalles]= useState(false);
    const { guardarOrden, loading, error, success } = useOrdenes();


    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
    };

    const handleToggleDetalles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setmostarDetalles(prev => !prev);
  };

  const handleSave = async (nuevaOrden: CrearOrden) => {
    const resultado =
      await guardarOrden(nuevaOrden);
    if (resultado) {
      setIsEditModalOpen(false);
    }
  };


    // Mapeo de colores basado en tus estados del Modal (PENDIENTE, ENTREGADO, ANULADO)
    const statusConfig: Record<string, string> = {
        PENDIENTE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        ENTREGADO: "bg-green-500/10 text-green-400 border-green-500/20",
        ANULADO: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const currentStatusClass =
    statusConfig[Pedido.estado_pedido] ??
    "bg-slate-500/10 text-slate-400 border-slate-500/20";

  const detallesAMostrar = mostrarDetalles
    ? Pedido.detalles
    : Pedido.detalles?.slice(0, 2);

    return (
        <div 
            onClick={onClick}
            className="group relative flex flex-col w-[320px] h-[380px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer"
        >
            {/* SUPERIOR */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div className="bg-blue-600/20 border border-blue-500/30 px-2 py-1 rounded-md">
                    <span className="text-[10px] font-black text-blue-400 uppercase">
                        #{Pedido.id_pedido}
                    </span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter ${currentStatusClass}`}>
                    <Clock size={10} />
                    {Pedido.estado_pedido}
                </div>
            </div>

            {/* CUERPO */}
            <div className="p-5 space-y-4 flex-1">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Cliente</p>
                    <h5 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {Pedido.cliente.nombre_cliente}
                    </h5>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-1">
                        <Calendar size={12} />
                        <span>{new Date(Pedido.fecha).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* DETALLES */}
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2">
                    {detallesAMostrar?.map((item, idx) => (
                        <div key={idx}className="flex justify-between text-[11px]">
                        <span className="text-slate-400 truncate flex-1">
                            {item.cantidad}x{" "}
                            {item.nombre_platillo}
                        </span>
                        <span className="text-slate-500 font-mono">$
                            {(item.precio_unitario *item.cantidad).toFixed(2)}
                        </span>
                        </div>
                    ))}

                    {/* BOTÓN EXPANDIR */}
                    {Pedido.detalles?.length > 2 && (
                        <button
                        type="button"
                        onClick={handleToggleDetalles}
                        className="w-full flex items-center justify-center gap-1 text-[10px] text-blue-400 hover:text-blue-300
                            border-t border-white/5 pt-2 transition-colorsfont-semibold">
                        {mostrarDetalles ? (
                            <>
                            <ChevronUp size={12} />
                            Mostrar menos
                            </>
                        ) : (
                            <>
                            <ChevronDown size={12} />
                            Más detalles
                            </>
                        )}

                        </button>
                    )}
                    </div>
                </div>

            {/* FOOTER */}
            <div className="p-5 pt-0 mt-auto">
                <div className="flex justify-between items-end bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Monto Total</p>
                        <p className="text-2xl font-black text-white">
                            ${Number(Pedido.monto_total?? 0).toFixed(2) || "0.00"}
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleOpenModal}
                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        <Settings2 size={18} />
                    </button>
                </div>
            </div>

            {/* Modal de Pedido */}
            {isEditModalOpen && (
                <ModalPedido
                    pedido={Pedido} 
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}