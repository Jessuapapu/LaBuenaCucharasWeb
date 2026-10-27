import { Calendar, Clock, Settings2, ChevronUp, ChevronDown } from "lucide-react";
import ModalPedido from "../modals/ModalOrden";
import { useState } from "react";
import type { CrearOrden, CardPedidoProps, OrdenVisualizar } from "../../context/Interfaces/Ordenes";
import { useOrdenes } from "../../context/Hooks/hookOrdenes";
import type { Platillo } from "../../context/Interfaces/Platillos";

interface Props extends CardPedidoProps {
  Pedido: OrdenVisualizar;
  listaPlatillos: Platillo[];
}
export default function CardPedido({Pedido, onClick, listaPlatillos}: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [mostrarDetalles, setmostarDetalles]= useState(false);
    const { guardarOrden } = useOrdenes();


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
        PENDIENTE: "bg-amber-100 text-amber-800 border-amber-200",
        ENTREGADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
        ANULADO: "bg-rose-100 text-rose-800 border-rose-200",
    };

    const estadoFormateado = Pedido.estado_pedido?.toUpperCase() || "PENDIENTE";
    const currentStatusClass = statusConfig[estadoFormateado] ?? "bg-slate-100 text-slate-600 border-slate-200";

  // Rebanado del array de platillos para mantener la estética inicial compacta
  const detallesAMostrar = mostrarDetalles
    ? Pedido.detalles
    : Pedido.detalles?.slice(0, 2);
    const tienePlatillos = Pedido.detalles && Pedido.detalles.length > 0;

    return (
        <div 
      onClick={onClick}
      className="group relative flex h-auto min-h-[360px] w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#e9f0f4] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/10"
    >
      {/* SUPERIOR */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-200/60 p-4">
        <div className="rounded-md border border-sky-200 bg-sky-100 px-2 py-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#147e9d]">
            #{Pedido.idOrden}
          </span>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${currentStatusClass}`}>
          <Clock size={10} />
          {estadoFormateado}
        </div>
      </div>

      {/* CUERPO */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente</p>
            <h5 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-[#147e9d]">
              {Pedido.cliente?.nombre_cliente || "Consumidor Final"}
            </h5>
            <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-1 font-medium">
              <Calendar size={12} />
              <span>{Pedido.fecha ? new Date(Pedido.fecha).toLocaleDateString() : "---"}</span>
            </div>
          </div>

          {/* Contenedor desplegable*/}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-100/80 p-3 transition-all">
            
            {/* Solo renderiza las filas si y solo si el usuario expandió el control */}
            {mostrarDetalles && detallesAMostrar.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] animate-fade-in">
                <span className="flex-1 truncate pr-2 text-slate-700">
                  <span className="font-mono font-bold text-[#147e9d]">{item.cantidad}x</span>{" "}
                  {item.nombre_platillo}
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  C$ {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Mensaje de colapso preventivo */}
            {!mostrarDetalles && (
              <div className="text-[10px] text-slate-500 italic py-0.5 text-center font-medium">
                Desglose de comanda oculto
              </div>
            )}

            {/* CONTROL DISPARADOR EXPANDIBLE */}
            {tienePlatillos ? (
              <button
                type="button"
                onClick={handleToggleDetalles}
                className="mt-1 flex w-full items-center justify-center gap-1 border-t border-slate-200 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#147e9d] transition-colors hover:text-blue-700"
              >
                {mostrarDetalles ? (
                  <>
                    <ChevronUp size={12} className="stroke-[2.5]" />
                    <span>Ocultar detalles</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="stroke-[2.5]" />
                    <span>Ver detalles ({Pedido.detalles?.length})</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-[10px] text-slate-500 italic py-1 text-center">Sin platillos cargados</div>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-5 pt-0 mt-auto">
        <div className="flex items-end justify-between rounded-2xl border border-slate-200 bg-slate-200/70 p-3">
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Monto Total</p>
            <p className="font-mono text-2xl font-black tracking-tight text-slate-900">
              C$ {Number(Pedido.monto_total ?? 0).toFixed(2)}
            </p>
          </div>
          
          <button 
            type="button"
            onClick={handleOpenModal}
            className="rounded-xl bg-gradient-to-br from-[#147e9d] to-[#3b5bc6] p-3 text-white shadow-md shadow-sky-900/15 transition-all hover:brightness-105 active:scale-95"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Modal de Pedido */}
      {isEditModalOpen && (
        <ModalPedido
          Orden={Pedido} 
          listaPlatillos={listaPlatillos}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
    );
}
