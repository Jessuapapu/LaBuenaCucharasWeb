import { useState, useCallback, useEffect } from 'react';
import { useGestionOrdenes, type OrdenHistorial } from '../Features/Ordenes/hooks/hookOrdenes';
import { ModalEditorOrden } from '../Features/Ordenes/modales/ModalOrdenes';
import { TablaOrdenes } from '../Features/Ordenes/tables/TableOrdenes';
import { ClipboardList, Plus } from 'lucide-react';
import { MetricasOrdenes } from '../Features/Ordenes/comunes/MetricasOrdenes';

// IMPORTANTE: Ajusta esta ruta a donde tengas exportada tu instancia de socket
import { socket } from '../context/Services/websocket'; 

export function OrdenesPage() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { ordenes, cargando, refetch } = useGestionOrdenes(page, rows, searchQuery);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenAEditar, setOrdenAEditar] = useState<OrdenHistorial | null>(null);

  useEffect(() => {
    const manejarCambioWebsocket = () => {
      console.log("[WS] Cambio detectado en el sistema de órdenes. Sincronizando tabla...");
      refetch();
    };

    socket.on("orden_actualizada", manejarCambioWebsocket);
    socket.on("crear_orden", manejarCambioWebsocket); 
    socket.on("orden_generada", manejarCambioWebsocket);

    return () => {
      socket.off("orden_actualizada", manejarCambioWebsocket);
      socket.off("crear_orden", manejarCambioWebsocket);
      socket.off("orden_generada", manejarCambioWebsocket);
    };
  }, [refetch]);

  let timeoutId: any;
  const manejarBusquedaCliente = useCallback((query: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setSearchQuery(query);
      setPage(1);
    }, 500);
  }, []);

  const manejarCambioDeFilas = (cantidad: number) => {
    setRows(cantidad);
    setPage(1); 
  };

  const abrirCreacion = () => {
    setOrdenAEditar(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (orden: OrdenHistorial) => {
    setOrdenAEditar(orden);
    setModalAbierto(true);
  };

  const hasNextPage = ordenes.length === rows;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. Encabezado */}
      <div className="flex flex-col justify-between gap-5 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/95 p-5 shadow-[0_16px_45px_-34px_rgba(15,70,100,0.4)] backdrop-blur-sm sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#3b5bc6] to-[#5db8c3] p-3.5 text-white shadow-lg shadow-sky-900/15">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#147e9d]">Gestión del restaurante</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Órdenes</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Consulta, organiza y registra las órdenes de consumo.</p>
          </div>
        </div>

        <button
          onClick={abrirCreacion}
          className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#147e9d] to-[#3b5bc6] px-6 py-3 text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/25 focus:outline-none focus:ring-4 focus:ring-sky-500/25 sm:w-auto"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 transition-colors group-hover:bg-white/25"><Plus className="h-5 w-5" /></span>
          <span className="text-left"><span className="block text-sm font-extrabold">Nueva orden</span><span className="block text-[11px] font-medium text-white/80">Registrar consumo</span></span>
        </button>
      </div>

      {/* 2. Resumen del mes */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div><h2 className="text-lg font-extrabold text-slate-800">Resumen del mes</h2><p className="text-sm text-slate-500">Estado e ingresos de las órdenes</p></div>
        </div>
        <MetricasOrdenes />
      </section>

      {/* 3. Historial y filtros */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[#e2ebf0]/95 p-3 shadow-[0_20px_55px_-40px_rgba(15,55,80,0.5)] backdrop-blur-sm sm:p-5">
        <TablaOrdenes
          ordenes={ordenes}
          cargando={cargando}
          paginaActual={page}
          cambiarPagina={setPage}
          hayMasPaginas={hasNextPage}
          alEditar={abrirEdicion}
          alBuscarCliente={manejarBusquedaCliente}
          filasPorPagina={rows}
          alCambiarFilas={manejarCambioDeFilas}
        />
      </section>

      <ModalEditorOrden
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alCompletar={refetch}
        ordenEdicion={ordenAEditar}
      />
    </div>
  );
}

export default OrdenesPage;
