import { useState, useEffect, useMemo } from "react";
import ModalNuevoRegistro from "../Modals/ModalNuevoRegistro";
import ModalEditarRegistro from "../Modals/ModalEditarRegistro";
import { obtenerDetallesBodega } from "../../context/Services/bodega"; // Ajusta la ruta según tu estructura
import { ChevronDown, ChevronUp } from "lucide-react";

interface Registro {
  IdRegistro: number;
  Fecha: string;
  TotalIngresado: number;
  IdProveedor: number;
  CostoTotal: string | number;
}

interface Row {
  id_unico: number;
  resumen: Registro;
}

interface TablaRegistrosProps {
  data: Registro[];
}

type SortKey = "IdRegistro" | "Fecha" | "TotalIngresado" | "CostoTotal" | "IdProveedor" | "";

const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

// --- SUBCÓMPONENTE PARA LA FILA DESPLEGABLE ---
const FilaRegistro = ({ 
  row, 
  formatDate, 
  formatMoney, 
  setSelectedRegistro 
}: { 
  row: Row, 
  formatDate: (d: string) => string, 
  formatMoney: (m: string | number) => string, 
  setSelectedRegistro: (r: Registro) => void 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detalles, setDetalles] = useState<{ Insumos: any[], Ingredientes: any[] } | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    
    setIsExpanded(true);
    if (!detalles) {
      setLoadingDetalles(true);
      try {
        const data = await obtenerDetallesBodega(row.resumen.IdRegistro);
        setDetalles(data);
      } catch (error) {
        console.error("Error cargando detalles", error);
      } finally {
        setLoadingDetalles(false);
      }
    }
  };

  return (
    <>
      <tr className="border-b border-slate-200/80 bg-[#e8f0f3]/50 text-slate-700 transition-colors hover:bg-sky-100/60">
        <td className="px-6 py-4">
          <button 
            onClick={handleExpand}
            className="flex items-center gap-2 text-slate-600 outline-none transition-colors hover:text-cyan-800"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span className="font-mono font-medium">#{row.resumen.IdRegistro}</span>
          </button>
        </td>
        <td className="px-6 py-4 font-medium text-slate-800">{formatDate(row.resumen.Fecha)}</td>
        <td className="px-6 py-4 font-mono">
          <span className="rounded-lg border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-900">
            PROV-{row.resumen.IdProveedor}
          </span>
        </td>
        <td className="px-6 py-4 font-bold text-slate-800 font-mono">{row.resumen.TotalIngresado}</td>
        <td className="px-6 py-4 font-semibold text-emerald-800">{formatMoney(row.resumen.CostoTotal)}</td>
        <td className="px-6 py-4 text-center">
          <button onClick={() => setSelectedRegistro(row.resumen)} className="rounded-xl border border-slate-300 bg-slate-100 p-2 text-slate-600 shadow-sm transition-colors hover:border-cyan-700 hover:bg-cyan-700 hover:text-white" title="Editar registro">
            <IconEdit />
          </button>
        </td>
      </tr>
      
      {/* SECCIÓN DESPLEGADA CON LOS DETALLES */}
      {isExpanded && (
        <tr className="bg-[#dfe9ed]/80">
          <td colSpan={6} className="border-b border-slate-300 p-0">
            <div className="px-4 py-5 animate-in slide-in-from-top-2 duration-200 sm:px-7 lg:px-10">
              {loadingDetalles ? (
                <div className="flex items-center gap-2 text-cyan-800 text-sm font-medium">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-700"></div>
                  Cargando desglose...
                </div>
              ) : detalles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tabla interna Insumos */}
                  <div className="rounded-2xl border border-sky-200 bg-[#e8f0f3] p-4 shadow-sm">
                    <h4 className="mb-3 flex items-center gap-1.5 border-b border-slate-300 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <span>📦</span> Desglose Insumos
                    </h4>
                    {detalles.Insumos?.length > 0 ? (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-300 uppercase text-[10px] font-bold tracking-wider text-slate-500">
                            <th className="pb-1">ID</th>
                            <th className="pb-1">Cantidad</th>
                            <th className="pb-1 text-right">Costo Ind.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.Insumos.map((i, idx) => (
                            <tr key={idx} className="border-t border-slate-200 hover:bg-sky-100/50">
                              <td className="py-2 font-mono">INS-{i.IdInsumo}</td>
                              <td className="py-2 font-bold font-mono text-slate-800">{i.TotalIngresado}</td>
                              <td className="py-2 text-right font-semibold font-mono text-emerald-800">{formatMoney(i.CostoIndividual)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <span className="text-xs text-slate-400 italic block py-1">Sin insumos registrados.</span>}
                  </div>

                  {/* Tabla interna Ingredientes */}
                  <div className="rounded-2xl border border-sky-200 bg-[#e8f0f3] p-4 shadow-sm">
                    <h4 className="mb-3 flex items-center gap-1.5 border-b border-slate-300 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <span>🍅</span> Desglose Ingredientes
                    </h4>
                    {detalles.Ingredientes?.length > 0 ? (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-300 uppercase text-[10px] font-bold tracking-wider text-slate-500">
                            <th className="pb-1">ID</th>
                            <th className="pb-1">Cantidad</th>
                            <th className="pb-1 text-right">Costo Ind.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.Ingredientes.map((i, idx) => (
                            <tr key={idx} className="border-t border-slate-200 hover:bg-sky-100/50">
                              <td className="py-2 font-mono">ING-{i.IdIngrediente}</td>
                              <td className="py-2 font-bold font-mono text-slate-800">{i.TotalIngresado}</td>
                              <td className="py-2 text-right font-semibold font-mono text-emerald-800">{formatMoney(i.CostoIndividual)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <span className="text-xs text-slate-400 italic block py-1">Sin ingredientes registrados.</span>}
                  </div>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-sm font-medium text-rose-700">⚠️ Error al cargar datos.</span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function TablaRegistros({ data }: TablaRegistrosProps) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("Fecha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { 
    if (Array.isArray(data)) setRegistros(data);
    else setRegistros([]);
  }, [data]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const formatMoney = (amount: string | number) => {
    const val = Number(amount);
    if (isNaN(val)) return "N/A";
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(val);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "S/F";
    return new Date(dateString).toLocaleDateString();
  };

  const rows: Row[] = useMemo(() => {
    if (!Array.isArray(registros)) return [];
    const grouped: Record<number, Registro[]> = {};
    registros.forEach((item) => {
      const key = item.IdRegistro; 
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return Object.entries(grouped).map(([idKey, items]) => ({
        id_unico: Number(idKey),
        resumen: items[0], 
    }));
  }, [registros]);

  const processedRows = useMemo(() => {
    let result = rows.filter((row) => {
      const r = row.resumen;
      const term = search.toLowerCase();
      const idReg = (r.IdRegistro || "").toString();
      const idProv = (r.IdProveedor || "").toString();
      const fecha = (r.Fecha || "").toLowerCase();
      return idReg.includes(term) || idProv.includes(term) || fecha.includes(term);
    });

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a.resumen[sortKey as keyof Registro] ?? "";
        const valB = b.resumen[sortKey as keyof Registro] ?? "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [rows, search, sortKey, sortOrder]);

  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedRows;
    const start = (currentPage - 1) * itemsPerPage;
    return processedRows.slice(start, start + itemsPerPage);
  }, [processedRows, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedRows.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const handleUpdate = (updated: Registro) => {
    setRegistros(prev => prev.map(r => r.IdRegistro === updated.IdRegistro ? updated : r));
    setSelectedRegistro(null);
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer transition-colors hover:bg-slate-200/70" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );
  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-sky-200/80 bg-[#e8f0f3]/85 p-4 shadow-sm backdrop-blur-md md:flex-row">
        <input type="text" placeholder="🔍 Buscar por ID, proveedor o fecha..." className="w-full rounded-xl border border-slate-300 bg-[#f0f5f7] px-4 py-2.5 text-sm text-slate-800 placeholder-slate-500 transition-all outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 md:w-80" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => setShowCreate(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-900/15 transition-all hover:-translate-y-0.5 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-700/40 md:w-auto"><span>📦+</span> Nuevo registro</button>
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-sky-200/80 bg-[#e8f0f3]/90 shadow-sm backdrop-blur-md">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="border-b border-slate-300 bg-[#dce8ed]">
            <tr>
              <HeaderCell label="ID Reg." sKey="IdRegistro" />
              <HeaderCell label="Fecha" sKey="Fecha" />
              <HeaderCell label="ID Prov." sKey="IdProveedor" />
              <HeaderCell label="Cant. Ingreso" sKey="TotalIngresado" />
              <HeaderCell label="Costo Total" sKey="CostoTotal" />
              <th className="px-6 py-4 text-center text-slate-700 font-semibold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {paginatedRows.length > 0 ? (

              paginatedRows.map((row) => (
                <FilaRegistro 
                  key={row.id_unico} 
                  row={row} 
                  formatDate={formatDate} 
                  formatMoney={formatMoney} 
                  setSelectedRegistro={setSelectedRegistro} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center italic text-slate-600">
                  No se encontraron registros de entrada. 🥗
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* PIE DE TABLA CLARO */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-300 bg-[#dfe9ed] p-4 text-sm text-slate-600 md:flex-row">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select 
                  className="cursor-pointer rounded-lg border border-slate-300 bg-[#f0f5f7] px-2 py-1.5 text-slate-700 outline-none focus:border-cyan-700" 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={-1}>Todos</option>
                </select>
            </div>
            <span className="font-medium">{paginatedRows.length} de {processedRows.length} registros</span>
            {itemsPerPage !== -1 && (
                <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1} 
                      className="rounded-lg border border-slate-300 bg-[#edf3f5] px-3 py-1.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-200 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages || totalPages === 0} 
                      className="rounded-lg border border-slate-300 bg-[#edf3f5] px-3 py-1.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-200 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                </div>
            )}
        </div>
      </div>

      {showCreate && <ModalNuevoRegistro onClose={() => setShowCreate(false)}  />}
      {selectedRegistro && <ModalEditarRegistro registro={selectedRegistro} onClose={() => setSelectedRegistro(null)} onSave={handleUpdate} />}
    </div>
  );
}
