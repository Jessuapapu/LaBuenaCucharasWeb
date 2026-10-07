import { useState, useEffect, useMemo } from "react";
import ModalNuevaFactura from "../modals/ModalNuevaFactura";
import { useFacturaPaginacion } from "../../../components/Hooks/hookFacturas";
import type { Factura } from "../../../context/Interfaces/Factura";

type SortKey = "Id_factura" | "monto_total" | "fecha_factura" | "estado_factura" | "";

const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaFacturas() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("fecha_factura");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      if (!search.trim()) {
        cambiarPagina(1);
        aplicarFiltros({ id_orden: null, nombre_cliente: null, estado: null });
        return;
      }

      const term = search.trim();
      const esNumero = /^\d+$/.test(term);

      cambiarPagina(1);

      if (esNumero) {
        aplicarFiltros({ id_orden: parseInt(term, 10), nombre_cliente: null });
      } else {
        aplicarFiltros({ id_orden: null, nombre_cliente: term });
      }
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [search, aplicarFiltros, cambiarPagina]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', minimumFractionDigits: 2 }).format(val);

  const formatearFechaHora = (fechaString?: string) => {
    if (!fechaString) return "N/A";
    try {
      const date = new Date(fechaString);
      return new Intl.DateTimeFormat('es-NI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      return fechaString;
    }
  };

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

  const handleRefreshTable = () => {
    refetch();
    setShowCreate(false);
    setSelectedFactura(null);
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case 'pagada': return 'bg-emerald-900/70 text-emerald-400 border-emerald-500/30';
      case 'anulada': return 'bg-rose-900/70 text-rose-400 border-rose-500/30';
      default: return 'bg-sky-900/70 text-sky-400 border-sky-500/30';
    }
  };

  const HeaderCell = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <th 
      className={`px-6 py-4 ${sKey ? 'cursor-pointer hover:bg-slate-800/60' : ''} transition-colors`} 
      onClick={() => sKey && handleSort(sKey)}
    >
      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
        {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar por Nº orden o nombre cliente..." 
            className="w-full bg-slate-950/20 border border-slate-800/60 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-500 transition-all font-medium shadow-inner" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {loading && (
            <span className="absolute right-4 top-3 text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-2 py-0.5 rounded-md font-bold tracking-wider uppercase animate-pulse">Sincronizando...</span>
          )}
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>🧾</span> NUEVA FACTURA
        </button>
      </div>

      <div className="relative overflow-x-auto shadow-2xl rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="bg-slate-900/60 border-b border-slate-800/50">
            <tr>
              <HeaderCell label="Nº Factura" sKey="Id_factura" />
              <HeaderCell label="Fecha y Hora" sKey="fecha_factura" />
              <HeaderCell label="Cliente Corporativo" sKey="" />
              <HeaderCell label="Monto Total" sKey="monto_total" />
              <HeaderCell label="Órdenes" sKey="" />
              <HeaderCell label="Estado" sKey="estado_factura" />
              <th className="px-6 py-4 text-center text-slate-400 font-bold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-800/40 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
            {processedRows.length > 0 ? (
              processedRows.map((f, i) => (
                <tr key={`${f.Id_factura}-${i}`} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-black text-lg">#{f.Id_factura}</td>
                  <td className="px-6 py-4 text-lg font-mono text-black whitespace-nowrap">
                    {formatearFechaHora(f.fecha_factura)}
                  </td>
                  <td className="px-6 py-4 text-black font-black text-lg max-w-[200px] truncate">{f.nombre_cliente || "N/A"}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-sky-800 text-lg">{formatMoney(f.monto_total)}</td>
                  <td className="px-6 py-4 font-mono text-black font-bold text-center text-lg">{f.cantidad_total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wide ${getStatusColor(f.estado_factura)}`}>
                      {f.estado_factura}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedFactura(f)} 
                      className="text-slate-400 hover:text-sky-400 bg-slate-950/40 hover:bg-slate-800/60 p-2 rounded-xl transition-all border border-slate-800/60 hover:border-sky-500/50 active:scale-95 opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-14 text-slate-500 font-medium italic bg-slate-950/20">
                  {loading ? "Cargando registros fiscales..." : "Ningún registro fiscal coincide con los criterios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-800/50 bg-slate-900/40 gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span>Mostrar filas:</span>
            <select 
              className="bg-slate-950/40 border border-slate-800/60 text-white rounded-lg px-2 py-1 outline-none font-bold focus:ring-1 focus:ring-sky-500 shadow-inner" 
              value={itemsPerPage} 
              onChange={(e) => cambiarRows(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <span className="font-semibold text-slate-500">
            {processedRows.length} de {total} registros
          </span>

          {itemsPerPage !== -1 && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => cambiarPagina(Math.max(1, pagina - 1))} 
                disabled={pagina === 1 || loading} 
                className="px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:bg-slate-800/60 text-slate-300 font-bold disabled:opacity-40 transition-colors shadow-sm"
              >
                Anterior
              </button>
              <span className="px-2 text-slate-500 font-semibold text-xs">
                Pág. {pagina} de {totalPages || 1}
              </span>
              <button 
                onClick={() => cambiarPagina(Math.min(totalPages, pagina + 1))} 
                disabled={pagina === totalPages || loading} 
                className="px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:bg-slate-800/60 text-slate-300 font-bold disabled:opacity-40 transition-colors shadow-sm"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {(showCreate || selectedFactura) && (
        <ModalNuevaFactura 
          id_factura={selectedFactura?.Id_factura} 
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