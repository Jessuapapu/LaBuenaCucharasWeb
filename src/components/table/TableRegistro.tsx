import { useState, useEffect, useMemo } from "react";
import ModalNuevoRegistro from "../modals/ModalNuevoRegistro";
import ModalEditarRegistro from "../modals/ModalEditarRegistro";
import { obtenerDetallesBodega } from "../../services/bodega"; // Ajusta la ruta según tu estructura
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
      <tr className="bg-white/40 border-b border-[#9ab7e2]/30 hover:bg-[#9ab7e2]/10 transition-colors text-slate-700">
        <td className="px-6 py-4">
          <button 
            onClick={handleExpand}
            className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 outline-none"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span className="font-mono font-medium">#{row.resumen.IdRegistro}</span>
          </button>
        </td>
        <td className="px-6 py-4 font-medium text-slate-800">{formatDate(row.resumen.Fecha)}</td>
        <td className="px-6 py-4 font-mono">
          <span className="bg-[#9ab7e2]/20 text-blue-800 px-2 py-1 rounded text-xs border border-[#9ab7e2]/40 font-medium">
            PROV-{row.resumen.IdProveedor}
          </span>
        </td>
        <td className="px-6 py-4 font-bold text-slate-800 font-mono">{row.resumen.TotalIngresado}</td>
        <td className="px-6 py-4 text-green-600 font-medium">{formatMoney(row.resumen.CostoTotal)}</td>
        <td className="px-6 py-4 text-center">
          <button onClick={() => setSelectedRegistro(row.resumen)} className="text-slate-500 hover:text-white bg-white hover:bg-blue-600 p-2 rounded-lg transition-colors border border-[#9ab7e2]/40 hover:border-blue-500 shadow-sm" title="Editar Registro">
            <IconEdit />
          </button>
        </td>
      </tr>
      
      {/* SECCIÓN DESPLEGADA CON LOS DETALLES */}
      {isExpanded && (
        <tr className="bg-[#9ab7e2]/5">
          <td colSpan={6} className="p-0 border-b border-[#9ab7e2]/20">
            <div className="px-14 py-5 animate-in slide-in-from-top-2 duration-200">
              {loadingDetalles ? (
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Cargando desglose...
                </div>
              ) : detalles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tabla interna Insumos */}
                  <div className="bg-white/90 rounded-xl p-4 border border-[#9ab7e2]/30 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-[#9ab7e2]/20 pb-2 flex items-center gap-1.5">
                      <span>📦</span> Desglose Insumos
                    </h4>
                    {detalles.Insumos?.length > 0 ? (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead>
                          <tr className="text-slate-400 border-b border-[#9ab7e2]/10 uppercase font-bold tracking-wider text-[10px]">
                            <th className="pb-1">ID</th>
                            <th className="pb-1">Cantidad</th>
                            <th className="pb-1 text-right">Costo Ind.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.Insumos.map((i, idx) => (
                            <tr key={idx} className="border-t border-[#9ab7e2]/10 hover:bg-[#9ab7e2]/5">
                              <td className="py-2 font-mono">INS-{i.IdInsumo}</td>
                              <td className="py-2 font-bold font-mono text-slate-800">{i.TotalIngresado}</td>
                              <td className="py-2 text-right font-semibold font-mono text-green-600">{formatMoney(i.CostoIndividual)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <span className="text-xs text-slate-400 italic block py-1">Sin insumos registrados.</span>}
                  </div>

                  {/* Tabla interna Ingredientes */}
                  <div className="bg-white/90 rounded-xl p-4 border border-[#9ab7e2]/30 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-[#9ab7e2]/20 pb-2 flex items-center gap-1.5">
                      <span>🍅</span> Desglose Ingredientes
                    </h4>
                    {detalles.Ingredientes?.length > 0 ? (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead>
                          <tr className="text-slate-400 border-b border-[#9ab7e2]/10 uppercase font-bold tracking-wider text-[10px]">
                            <th className="pb-1">ID</th>
                            <th className="pb-1">Cantidad</th>
                            <th className="pb-1 text-right">Costo Ind.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.Ingredientes.map((i, idx) => (
                            <tr key={idx} className="border-t border-[#9ab7e2]/10 hover:bg-[#9ab7e2]/5">
                              <td className="py-2 font-mono">ING-{i.IdIngrediente}</td>
                              <td className="py-2 font-bold font-mono text-slate-800">{i.TotalIngresado}</td>
                              <td className="py-2 text-right font-semibold font-mono text-green-600">{formatMoney(i.CostoIndividual)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <span className="text-xs text-slate-400 italic block py-1">Sin ingredientes registrados.</span>}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-red-500 font-medium flex items-center gap-1">⚠️ Error al cargar datos.</span>
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
    <th className="px-6 py-4 cursor-pointer hover:bg-[#9ab7e2]/15 transition-colors" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-md border border-[#9ab7e2]/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <input type="text" placeholder="🔍 Buscar por ID, proveedor o fecha..." className="w-full md:w-80 bg-white border border-[#9ab7e2]/40 text-slate-800 placeholder-slate-400 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#9ab7e2]/50 focus:border-[#9ab7e2] transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => setShowCreate(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-green-900/10 flex items-center gap-2 transition-transform hover:scale-105"><span>📦+</span> Registrar Entrada</button>
      </div>

      <div className="relative overflow-x-auto shadow-md rounded-xl border border-[#9ab7e2]/30 bg-white/70 backdrop-blur-md">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-[#9ab7e2]/15 border-b border-[#9ab7e2]/30">
            <tr>
              <HeaderCell label="ID Reg." sKey="IdRegistro" />
              <HeaderCell label="Fecha" sKey="Fecha" />
              <HeaderCell label="ID Prov." sKey="IdProveedor" />
              <HeaderCell label="Cant. Ingreso" sKey="TotalIngresado" />
              <HeaderCell label="Costo Total" sKey="CostoTotal" />
              <th className="px-6 py-4 text-center text-slate-700 font-semibold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
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
                <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                  No se encontraron registros de entrada. 🥗
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* PIE DE TABLA CLARO */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-[#9ab7e2]/30 bg-[#9ab7e2]/5 gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select 
                  className="bg-white border border-[#9ab7e2]/40 text-slate-700 rounded px-2 py-1 outline-none cursor-pointer focus:border-[#9ab7e2]" 
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
                      className="px-3 py-1 rounded bg-white border border-[#9ab7e2]/40 text-slate-700 disabled:opacity-40 hover:bg-[#9ab7e2]/10 font-medium shadow-sm transition-colors"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages || totalPages === 0} 
                      className="px-3 py-1 rounded bg-white border border-[#9ab7e2]/40 text-slate-700 disabled:opacity-40 hover:bg-[#9ab7e2]/10 font-medium shadow-sm transition-colors"
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