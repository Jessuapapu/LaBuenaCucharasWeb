
import { useState, useEffect, useMemo } from "react";
import ModalNuevaFactura from "../modals/ModalNuevaFactura";
import ModalEditarFactura from "../modals/ModalEditarFactura";
import { useFacturaPaginacion } from "../Hooks/hookFacturas";

interface Cliente {
  nombre_cliente: string;
  direccion_cliente: string;
}

interface Factura {
  id_pedido: number;
  monto_total: number;
  cantidad_total: number;
  estado_factura: string;
  fecha_factura: string;
  cliente: Cliente;
}

type SortKey = "id_pedido" | "monto_total" | "fecha_factura" | "estado_factura" | "";

// Iconos SVG

const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaFacturas() {
  //const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("fecha_factura");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  //const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    data: facturas,
    total,
    pagina,
    rows: itemsPerPage,
    loading,
    cambiarPagina,
    cambiarRows,
    aplicarFiltros,
    refetch
  } = useFacturaPaginacion(1, 10);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
    
    // Si el usuario limpia el buscador, limpiamos los filtros en el hook/api
    if (!search.trim()) {
      aplicarFiltros({});
      return;
    }

    const term = search.trim();
    const esNumero = /^\d+$/.test(term); // Evalúa si el texto ingresado contiene solo dígitos

    // Mapeamos dinámicamente según lo que el usuario haya digitado
    if (esNumero) {
      // Si digitó solo números, asumimos de forma inteligente que busca por Nº de Pedido u Orden
      aplicarFiltros({
        id_orden: parseInt(term, 10),
        id_cliente: null // Aseguramos limpiar los otros para que no choquen
      });
    } else {
      // Si digitó texto (letras), asumimos que está buscando por el Estado de la factura (ej: "Pagada")
      aplicarFiltros({
        id_orden: null,
      });
    }

  }, 400); //400ms espera al usuario

  return () => clearTimeout(delayDebounceFn);
}, [search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const formatMoney = (val: number) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(val);

  const processedRows = useMemo(() => {
    if (!Array.isArray(facturas)) return [];
    const rows = [...facturas];

    if (sortKey) {
      rows.sort((a, b) => {
        const valA = a[sortKey] ?? "";
        const valB = b[sortKey] ?? "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    } return rows;
    }, [facturas,sortKey,sortOrder]);

  //const paginatedRows = useMemo(() => {
    //if (itemsPerPage === -1) return processedRows;
    //const start = (currentPage - 1) * itemsPerPage;
    //return processedRows.slice(start, start + itemsPerPage);
  //}, [processedRows, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(total / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const handleCreate = () => {
    refetch()
    setShowCreate(false);
  };

  const handleUpdate = () => {
    refetch()
    setSelectedFactura(null);
  };

  const getStatusColor = (status: string) => {
      switch((status || "").toLowerCase()) {
          case 'pagada': return 'bg-green-900/50 text-green-300 border-green-700';
          case 'anulada': return 'bg-red-900/50 text-red-300 border-red-700';
          default: return 'bg-blue-900/50 text-blue-300 border-blue-700';
      }
  }

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* Barra de Control */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="🔍 Buscar factura, cliente, estado..." 
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-all" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {loading && (
            <span className="absolute right-3 top-2.5 text-xs text-gray-500 animate-pulse">Procesando...</span>
          )}
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-colors">
          <span>🧾+</span> Nueva Factura
        </button>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              <HeaderCell label="Nº Pedido" sKey="id_pedido" />
              <HeaderCell label="Fecha" sKey="fecha_factura" />
              <HeaderCell label="Cliente" sKey="" />
              <HeaderCell label="Monto" sKey="monto_total" />
              <HeaderCell label="Items" sKey="" />
              <HeaderCell label="Estado" sKey="estado_factura" />
              <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-40 transition-opacity" : ""}>
            {processedRows.length > 0 ? (
              processedRows.map((f, i) => (
                <tr key={f.id_pedido || i} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">#{f.id_pedido}</td>
                  <td className="px-6 py-4">{f.fecha_factura}</td>
                  <td className="px-6 py-4 text-white">{f.cliente?.nombre_cliente}</td>
                  <td className="px-6 py-4 font-mono text-green-400">{formatMoney(f.monto_total)}</td>
                  <td className="px-6 py-4 font-mono text-blue-300 text-center">{f.cantidad_total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(f.estado_factura)}`}>
                      {f.estado_factura}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedFactura(f)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors border border-gray-700 hover:border-blue-500">
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  {loading ? "Cargando registros..." : "No se encontraron facturas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Paginación */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-800 bg-gray-900 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select 
                  className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 outline-none" 
                  value={itemsPerPage} 
                  onChange={(e) => cambiarRows(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
            <span>
              {processedRows.length} de {total} registros
            </span>
            {itemsPerPage !== -1 && (
                <div className="flex gap-2">
                    <button 
                      onClick={() => cambiarPagina(Math.max(1, pagina - 1))} 
                      disabled={pagina === 1 || loading} 
                      className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white transition-all"
                    >
                      Anterior
                    </button>
                    <span className="flex items-center px-2 text-gray-300 font-medium">
                      Pág. {pagina} de {totalPages || 1}
                    </span>
                    <button 
                      onClick={() => cambiarPagina(Math.min(totalPages, pagina + 1))} 
                      disabled={pagina === totalPages || loading} 
                      className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white transition-all"
                    >
                      Siguiente
                    </button>
                </div>
            )}
        </div>
      </div>

      {showCreate && <ModalNuevaFactura onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {selectedFactura && <ModalEditarFactura factura={selectedFactura} onClose={() => setSelectedFactura(null)} onSave={handleUpdate} />}
    </div>
  );
}