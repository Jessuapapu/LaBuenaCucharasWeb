
import { useState, useEffect, useMemo } from "react";
import ModalNuevaFactura from "../modals/ModalNuevaFactura";
//import ModalEditarFactura from "../modals/ModalEditarFactura";
import { useFacturaPaginacion } from "../Hooks/hookFacturas";
import type { Factura } from "../../interfaces/Factura";


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
      case 'pagada': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'anulada': return 'bg-red-950/50 text-red-400 border-red-800';
      default: return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-sky-50/50 transition-colors" onClick={() => sKey && handleSort(sKey)}>
      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
        {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* BARRA DE ACCIONES PRINCIPALES */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-sky-100/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar factura, cliente, estado..." 
            className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 focus:bg-white placeholder-slate-400 transition-all font-medium" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {loading && (
            <span className="absolute right-4 top-3 text-xs bg-sky-50 border border-sky-200 text-sky-600 px-2 py-0.5 rounded-md font-bold tracking-wider uppercase animate-pulse">Sincronizando...</span>
          )}
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="w-full md:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-sky-600/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>🧾</span> NUEVA FACTURA
        </button>
      </div>

      {/* CONTENEDOR TABLA RELACIONAL */}
      <div className="relative overflow-x-auto shadow-md rounded-2xl border border-sky-100 bg-white">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50/70 border-b border-sky-100">
            <tr>
              <HeaderCell label="Nº Factura" sKey="Id_factura" />
              <HeaderCell label="Fecha Fiscal" sKey="fecha_factura" />
              <HeaderCell label="Cliente Corporativo" sKey="" />
              <HeaderCell label="Monto Total" sKey="monto_total" />
              <HeaderCell label="Órdenes" sKey="" />
              <HeaderCell label="Estado" sKey="estado_factura" />
              <th className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${loading ? "opacity-50 transition-opacity" : ""}`}>
            {processedRows.length > 0 ? (
              processedRows.map((f, i) => (
                <tr key={f.Id_factura || i} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">#{f.Id_factura}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{f.fecha_factura}</td>
                  <td className="px-6 py-4 text-slate-800 font-black text-sm max-w-[200px] truncate">{f.cliente?.nombre_cliente || "N/A"}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-blue-600 text-sm">{formatMoney(f.monto_total)}</td>
                  <td className="px-6 py-4 font-mono text-slate-600 font-bold text-center text-xs">{f.cantidad_total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wide ${getStatusColor(f.estado_factura)}`}>
                      {f.estado_factura}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedFactura(f)} 
                      className="text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 p-2 rounded-xl transition-all border border-slate-200/60 hover:border-sky-300 active:scale-95"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-14 text-slate-400 font-medium italic">
                  {loading ? "Cargando registros fiscales..." : "Ningún registro fiscal coincide con los criterios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* SECCIÓN DE PAGINACIÓN */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-sky-100 bg-slate-50/50 gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <span>Mostrar filas:</span>
            <select 
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none font-bold" 
              value={itemsPerPage} 
              onChange={(e) => cambiarRows(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <span className="font-semibold text-slate-500">
            {processedRows.length} de {total} registros en servidor
          </span>

          {itemsPerPage !== -1 && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => cambiarPagina(Math.max(1, pagina - 1))} 
                disabled={pagina === 1 || loading} 
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm"
              >
                Anterior
              </button>
              <span className="px-2 text-slate-500 font-semibold text-xs">
                Pág. {pagina} de {totalPages || 1}
              </span>
              <button 
                onClick={() => cambiarPagina(Math.min(totalPages, pagina + 1))} 
                disabled={pagina === totalPages || loading} 
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm"
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
          idFactura={selectedFactura?.Id_factura} // Si viene de selectedFactura, se activa el modo edición automáticamente
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