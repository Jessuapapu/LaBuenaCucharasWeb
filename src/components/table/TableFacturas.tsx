
import { useState, useEffect, useMemo } from "react";
import ModalNuevaFactura from "../modals/ModalNuevaFactura";
//import ModalEditarFactura from "../modals/ModalEditarFactura";
import { useFacturaPaginacion } from "../Hooks/hookFacturas";
import type { Factura } from "../../interfaces/Factura";

interface Cliente {
  nombre_cliente: string;
  direccion_cliente: string;
}

type SortKey = "Id_factura" | "monto_total" | "fecha_factura" | "estado_factura" | "";

// Iconos SVG

const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaFacturas() {
  //const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("fecha_factura");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  //const [currentPage, setCurrentPage] = useState(1);
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
      aplicarFiltros({id_orden: null, nombre_cliente: null, estado: null});
      return;
    }

    const term = search.trim();
    const esNumero = /^\d+$/.test(term); // Evalúa si el texto ingresado contiene solo dígitos

    // Mapeamos dinámicamente según lo que el usuario haya digitado
    if (esNumero) {
      // Si digitó solo números, asumimos de forma inteligente que busca por Nº de Pedido u Orden
      aplicarFiltros({
        id_orden: parseInt(term, 10),
        nombre_cliente: null // Aseguramos limpiar los otros para que no choquen
      });
    } else {
      // Si digitó texto (letras), asumimos que está buscando por el Estado de la factura (ej: "Pagada")
      aplicarFiltros({
        id_orden: null,
        nombre_cliente: term
      });
    }

  }, 400); //400ms espera al usuario

  return () => clearTimeout(delayDebounceFn);
}, [search, aplicarFiltros]);

  useEffect(() => { cambiarPagina(1); }, [search, cambiarPagina]);

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
    } 
    return rows;
  }, [facturas, sortKey, sortOrder]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(total / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else { 
      setSortKey(key); 
      setSortOrder("asc"); 
    }
  };

  // Sincroniza y recarga la vista al terminar cualquier acción
  const handleRefreshTable = () => {
    refetch();
    setShowCreate(false);
    setSelectedFactura(null);
  };

  const getStatusColor = (status: string) => {
    switch((status || "").toLowerCase()) {
      case 'pagada': return 'bg-green-950/50 text-green-400 border-green-800';
      case 'anulada': return 'bg-red-950/50 text-red-400 border-red-800';
      default: return 'bg-blue-950/50 text-blue-400 border-blue-800';
    }
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => sKey && handleSort(sKey)}>
      <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase tracking-wider">
        {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* BARRA DE ACCIONES PRINCIPALES */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar factura, cliente, estado..." 
            className="w-full bg-gray-950 border border-gray-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-all font-medium" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {loading && (
            <span className="absolute right-4 top-3 text-xs text-blue-400 font-semibold animate-pulse">Sincronizando...</span>
          )}
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-black tracking-wide shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>🧾</span> NUEVA FACTURA
        </button>
      </div>

      {/* CONTENEDOR TABLA RELACIONAL */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-950 border-b border-gray-800">
            <tr>
              <HeaderCell label="Nº Factura" sKey="Id_factura" />
              <HeaderCell label="Fecha Fiscal" sKey="fecha_factura" />
              <HeaderCell label="Cliente Corporativo" sKey="" />
              <HeaderCell label="Monto Total" sKey="monto_total" />
              <HeaderCell label="Órdenes" sKey="" />
              <HeaderCell label="Estado" sKey="estado_factura" />
              <th className="px-6 py-4 text-center text-gray-300 text-xs font-semibold uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-40 transition-opacity" : ""}>
            {processedRows.length > 0 ? (
              processedRows.map((f, i) => (
                <tr key={f.Id_factura || i} className="bg-gray-900 border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">#{f.Id_factura}</td>
                  <td className="px-6 py-4 text-xs font-mono">{f.fecha_factura}</td>
                  <td className="px-6 py-4 text-white font-medium max-w-[200px] truncate">{f.cliente?.nombre_cliente || "N/A"}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-emerald-400">{formatMoney(f.monto_total)}</td>
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold text-center">{f.cantidad_total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wide ${getStatusColor(f.estado_factura)}`}>
                      {f.estado_factura}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedFactura(f)} 
                      className="text-gray-400 hover:text-white bg-gray-950 hover:bg-blue-600 p-2 rounded-xl transition-all border border-gray-800 hover:border-blue-500 active:scale-95"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 font-medium italic">
                  {loading ? "Cargando registros fiscales..." : "Ningún registro fiscal coincide con los criterios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* SECCIÓN DE PAGINACIÓN */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-800 bg-gray-950 gap-4 text-xs text-gray-400 font-semibold">
          <div className="flex items-center gap-2">
            <span>Mostrar filas:</span>
            <select 
              className="bg-gray-900 border border-gray-800 text-white rounded-lg px-2 py-1 outline-none font-mono" 
              value={itemsPerPage} 
              onChange={(e) => cambiarRows(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <span className="font-mono text-gray-400">
            {processedRows.length} de {total} registros en servidor
          </span>

          {itemsPerPage !== -1 && (
            <div className="flex gap-2">
              <button 
                onClick={() => cambiarPagina(Math.max(1, pagina - 1))} 
                disabled={pagina === 1 || loading} 
                className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-30 text-white transition-all text-xs font-bold"
              >
                Anterior
              </button>
              <span className="flex items-center px-3 text-gray-300 font-mono">
                Pág. {pagina} de {totalPages || 1}
              </span>
              <button 
                onClick={() => cambiarPagina(Math.min(totalPages, pagina + 1))} 
                disabled={pagina === totalPages || loading} 
                className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white transition-all text-xs font-bold"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* un solo modal */}
      {(showCreate || selectedFactura) && (
        <ModalNuevaFactura 
          idFacturaExistente={selectedFactura?.Id_factura} // Si viene de selectedFactura, se activa el modo edición automáticamente
          onClose={() => {
            setShowCreate(false);
            setSelectedFactura(null);
          }} 
          onSave={handleRefreshTable} 
        />
      )}
    </div>
  );
}