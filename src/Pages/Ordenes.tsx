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
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* 1. Encabezado */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Registro de Órdenes</h1>
            <p className="text-slate-800 mt-0.5 text-2xl font-medium">Historial, facturación y control de órdenes.</p>
          </div>
        </div>

        <button
          onClick={abrirCreacion}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden
        </button>
      </div>

      {/* 2. Métricas */}
      <div className="w-full">
        <MetricasOrdenes />
      </div>

      {/* 3. Contenedor Principal de la Tabla */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 overflow-hidden shadow-2xl">
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