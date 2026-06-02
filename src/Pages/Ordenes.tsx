import { useState, useMemo, useEffect } from "react";
import { useOrdenes } from "../components/Hooks/hookOrdenes";
import CardPedido from "../components/cards/CardOrden";
import type { Platillo } from "../interfaces/Platillos";
import type { CrearOrden, OrdenVisualizar } from "../interfaces/Ordenes";
import { Plus, Filter } from "lucide-react";
import ModalOrden from "../components/modals/ModalOrden";


export default function OrdenesPage(){
  const [data, setData] = useState<OrdenVisualizar[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [listaPlatillos, setListaPlatillos] = useState<Platillo[]>([]);
  
  // Estado para controlar la apertura del modal de creación (si lo necesitas)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Consumimos el hook real de órdenes en el sistema
  const { ordenes, platillos, loading, fetchOrdenes, guardarOrden } = useOrdenes();

  // Sincronizamos los datos asíncronos del hook con el estado local de la página
  useEffect(() => {
    if (ordenes) setData(ordenes as OrdenVisualizar[]);
    if (platillos) setListaPlatillos(platillos);
  }, [ordenes, platillos]);

  // Filtrado predictivo en memoria
  const filteredData = useMemo(() => {
    if (!activeFilter) return data;
    return data.filter(p => p.estado_pedido?.toUpperCase() === activeFilter.toUpperCase());
  }, [data, activeFilter]);

  const handleNuevaOrden = async(nuevaOrden: CrearOrden) => {
    const resultado = await guardarOrden(nuevaOrden);
    if (resultado) {
      setIsModalOpen(false);
      fetchOrdenes(); // Forzamos recarga limpia del backend
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ENCABEZADO CON BOTÓN DE ACCIÓN */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registro de pedidos</h1>
          <p className="text-gray-400 mt-1 text-sm">Gestiona los pedidos y flujos de cocina en tiempo real.</p>
        </div>
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-950/30 transition-all active:scale-[0.98] self-start sm:self-center uppercase"
        >
          <Plus size={18} className="stroke-[3]" />
          Nueva Orden
        </button>
      </div>

      {/* BOTONERA DE FILTROS (Agregada para dar uso real a activeFilter) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 w-fit">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider border-r border-slate-800 mr-1">
          <Filter size={12} />
          <span>Filtros:</span>
        </div>
        {[
          { label: "Todos", value: "" },
          { label: "Pendientes", value: "PENDIENTE" },
          { label: "Entregados", value: "ENTREGADO" },
          { label: "Anulados", value: "ANULADO" }
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === tab.value
                ? "bg-slate-800 text-white shadow-md border border-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DETECTOR DE CARGA (LOADING STATE) */}
      {loading && data.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500 font-medium font-mono">
          Sincronizando registros con el servidor de comandas...
        </div>
      ) : (
        /* REJILLA DE PEDIDOS (GRID) - Centrada perfectamente para los 320px de tus Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center sm:justify-items-start">
          {filteredData.length > 0 ? (
            filteredData.map((Orden) => (
              <CardPedido 
                key={Orden.idOrden} 
                Pedido={Orden} 
                listaPlatillos={listaPlatillos}
                onClick={() => {
                  console.log("Card seleccionada de forma externa:", Orden.idOrden);
                }}
              />
            ))
          ) : (
            <div className="col-span-full w-full text-center py-12 text-sm text-slate-500 italic bg-gray-950/40 rounded-2xl border border-dashed border-gray-850">
              No se encontraron pedidos bajo el estado seleccionado
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CREACIÓN (Se activa con el botón del encabezado) */}
      {isModalOpen && (
        <ModalOrden
          listaPlatillos={listaPlatillos}
          onClose={() => setIsModalOpen(false)}
          onSave={handleNuevaOrden}
        />
      )}
    </div>
  );
}