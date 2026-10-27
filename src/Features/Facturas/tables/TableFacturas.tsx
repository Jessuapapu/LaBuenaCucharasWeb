import { useState, useEffect, useMemo } from "react";
import ModalNuevaFactura from "../modals/ModalNuevaFactura";
import { useFacturaPaginacion } from "../../../context/Hooks/hookFacturas";
import type { Factura } from "../../../context/Interfaces/Factura";
import { FilePlus2 } from "lucide-react";

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
      case 'pagada': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'anulada': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const HeaderCell = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <th 
      className={`px-6 py-4 ${sKey ? 'cursor-pointer hover:bg-slate-200/80' : ''} transition-colors`} 
      onClick={() => sKey && handleSort(sKey)}
    >
      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
        {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-200/60 p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar por Nº orden o nombre cliente..." 
            className="w-full rounded-xl border border-slate-300 bg-[#edf3f6] px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/30" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {loading && (
            <span className="absolute right-4 top-3 rounded-md border border-sky-200 bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800 animate-pulse">Sincronizando...</span>
          )}
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="w-full rounded-xl bg-gradient-to-r from-[#147e9d] to-[#3b5bc6] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-900/15 transition-all hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] md:w-auto"
        >
          <FilePlus2 size={17} /> Emitir factura
        </button>
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/70 shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-200/70">
            <tr>
              <HeaderCell label="Nº Factura" sKey="Id_factura" />
              <HeaderCell label="Fecha y Hora" sKey="fecha_factura" />
              <HeaderCell label="Cliente" sKey="" />
              <HeaderCell label="Monto Total" sKey="monto_total" />
              <HeaderCell label="Órdenes" sKey="" />
              <HeaderCell label="Estado" sKey="estado_factura" />
              <th className="px-6 py-4 text-center text-slate-600 font-bold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-200 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
            {processedRows.length > 0 ? (
              processedRows.map((f, i) => (
                <tr key={`${f.Id_factura}-${i}`} className="group transition-colors hover:bg-sky-100/60">
                  <td className="px-6 py-4 font-mono text-lg font-bold text-slate-800">#{f.Id_factura}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-slate-600">
                    {formatearFechaHora(f.fecha_factura)}
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-lg font-black text-slate-800">{f.nombre_cliente || "N/A"}</td>
                  <td className="px-6 py-4 font-mono text-lg font-extrabold text-[#147e9d]">{formatMoney(f.monto_total)}</td>
                  <td className="px-6 py-4 text-center font-mono text-lg font-bold text-slate-700">{f.cantidad_total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wide ${getStatusColor(f.estado_factura)}`}>
                      {f.estado_factura}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedFactura(f)} 
                      aria-label={`Editar factura ${f.Id_factura}`}
                      className="rounded-xl border border-sky-200 bg-sky-100 p-2 text-[#147e9d] transition-all hover:border-sky-300 hover:bg-sky-200 active:scale-95 opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="bg-slate-100/80 py-14 text-center font-medium italic text-slate-500">
                  {loading ? "Cargando registros fiscales..." : "Ningún registro fiscal coincide con los criterios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-200/60 p-4 text-xs font-medium text-slate-600 sm:flex-row">
          <div className="flex items-center gap-2">
            <span>Mostrar filas:</span>
            <select 
              className="rounded-lg border border-slate-300 bg-[#edf3f6] px-2 py-1 font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-sky-500/30" 
              value={itemsPerPage} 
              onChange={(e) => cambiarRows(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <span className="font-semibold text-slate-600">
            {processedRows.length} de {total} registros
          </span>

          {itemsPerPage !== -1 && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => cambiarPagina(Math.max(1, pagina - 1))} 
                disabled={pagina === 1 || loading} 
                className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-2 text-slate-500 font-semibold text-xs">
                Pág. {pagina} de {totalPages || 1}
              </span>
              <button 
                onClick={() => cambiarPagina(Math.min(totalPages, pagina + 1))} 
                disabled={pagina === totalPages || loading} 
                className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
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
