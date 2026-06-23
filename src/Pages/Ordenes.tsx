import { useState, useCallback, useEffect } from 'react';
import { useGestionOrdenes, type OrdenHistorial } from '../ordenes/hooks/hookOrdenes';
import { ModalEditorOrden } from '../ordenes/modales/ModalOrdenes';
import { TablaOrdenes } from '../ordenes/tables/TableOrdenes';
import { FileText, Plus } from 'lucide-react';
import { MetricasOrdenes } from '../ordenes/comunes/MetricasOrdenes';

// IMPORTANTE: Ajusta esta ruta a donde tengas exportada tu instancia de socket
import { socket } from '../services/websocket'; 

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
    <div className="min-h-[100dvh] text-slate-200 p-4 md:p-6 lg:p-8 font-sans antialiased">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">

        {/* Header */}
        <header
          className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200/60
        bg-white-800 backdrop-blur
        p-6
        md:p-8
    "
        >
          {/* Glow decorativo */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <FileText
                  size={30}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Registro de Órdenes
                </h1>

                <p className="mt-2 text-slate-700">
                  Historial, facturación y control de órdenes
                </p>
              </div>
            </div>

            <button
              onClick={abrirCreacion}
              className="
                flex items-center gap-2
                px-5 py-3
                rounded-xl
                bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-blue-500/60 hover:to-cyan-500
                transition-all
                duration-200
                font-semibold
                text-white
                shadow-lg
                shadow-blue-600/15
                hover:shadow-blue-500/40
            "
            >
              <Plus size={18} />
              Nueva Orden
            </button>
          </div>
        </header>

        {/* Métricas */}
        <section className="w-full">
          <MetricasOrdenes />
        </section>

        {/* Tabla */}
        <section className="border border-slate-700/40 rounded-3xl overflow-hidden backdrop-blur-sm">
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

      </div>

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