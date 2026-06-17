import { useState, useEffect, useMemo } from "react";
import ModalNuevoProveedor from "../modals/ModalNuevoProovedor";
import ModalEditarProveedor from "../modals/ModalEditarProvedor";
import type { Proveedor } from "../../interfaces/Proveedor";

interface TablaProveedoresProps {
  data: Proveedor[];
}

type SortKey = "NombreProveedor" | "Direccion" | "Tipo" | "IdProveedor" | "";

// Iconos SVG
const IconSort = () => (<svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaProveedores({ data }: TablaProveedoresProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [search, setSearch] = useState("");
  
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("IdProveedor");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { setProveedores(data || []); }, [data]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  // Filtrado Seguro
  const processedData = useMemo(() => {
    if (!proveedores) return [];
    let rows = proveedores.filter((p) => {
      const term = search.toLowerCase();
      // Code defensive: ensure properties exist
      const nombre = (p.NombreProveedor || "").toLowerCase();
      const direccion = (p.Direccion || "").toLowerCase();
      const tipo = (p.Tipo || "").toLowerCase();
      
      return (
        nombre.includes(term) ||
        direccion.includes(term) ||
        tipo.includes(term)
      );
    });

    if (sortKey) {
      rows.sort((a, b) => {
        const valA = (a[sortKey] || "").toString();
        const valB = (b[sortKey] || "").toString();
        
        // Orden numérico para ID, string para lo demás
        if (sortKey === "IdProveedor") {
            return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [proveedores, search, sortKey, sortOrder]);

  // Paginación
  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedData;
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // CORRECCIÓN 1: Definimos la variable totalPages que faltaba
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };



  const handleUpdate = (updated: Proveedor) => {
    setProveedores(prev => prev.map(p => p.IdProveedor === updated.IdProveedor ? updated : p));
    setSelectedProveedor(null);
  };

  const getTipoColor = (tipo: string) => {
      switch((tipo || "").toUpperCase()) {
          case 'FIJO': return 'bg-sky-50 text-sky-700 border-sky-200';
          case 'VARIABLE': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  }

  // CORRECCIÓN 2: Usamos los iconos (IconSort, IconSortUp, IconSortDown) en lugar de texto
  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-sky-50/50 transition-colors" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
            {label}
            {sKey && sortKey === sKey ? (
                sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />
            ) : (
                <IconSort />
            )}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* Barra de Herramientas */}
      <div className="bg-white-800 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-sky-100/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <input 
              type="text" 
              placeholder="🔍 Buscar proveedor, dirección..." 
              className="w-full md:w-80 bg-slate-50/80 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 focus:bg-white transition-all placeholder-slate-400" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-sky-600/10 flex items-center justify-center gap-2 transition-all active:scale-95">
            <span className="text-sm">+</span> Nuevo Proveedor
        </button>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-sky-100 bg-white">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50/70 border-b border-sky-100">
            <tr>
              <HeaderCell label="ID" sKey="IdProveedor" />
              <HeaderCell label="Proveedor" sKey="NombreProveedor" />
              <HeaderCell label="Dirección" sKey="Direccion" />
              <HeaderCell label="Tipo" sKey="Tipo" />
              <th className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((p, i) => (
                <tr key={i} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">#{p.IdProveedor}</td>
                  <td className="px-6 py-4 font-black text-slate-800 text-sm">{p.NombreProveedor}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-xs" title={p.Direccion}>{p.Direccion}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-extrabold border ${getTipoColor(p.Tipo)}`}>
                        {p.Tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => setSelectedProveedor(p)} 
                        className="text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 p-2 rounded-xl transition-colors border border-slate-200/60 hover:border-sky-300"
                        title="Editar Proveedor"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 font-medium">No se encontraron proveedores.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Paginación */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-sky-100 bg-slate-50/50 gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none font-bold" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option><option value={20}>20</option><option value={-1}>Todos</option>
                </select>
            </div>
            <span className="font-semibold">{paginatedRows.length} de {processedData.length} registros</span>
            {itemsPerPage !== -1 && (
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm">Anterior</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm">Siguiente</button>
                </div>
            )}
        </div>
      </div>

      {/* Modales */}
      {showCreate && <ModalNuevoProveedor onClose={() => setShowCreate(false)}  />}
      {selectedProveedor && <ModalEditarProveedor proveedor={selectedProveedor} onClose={() => setSelectedProveedor(null)} onSave={handleUpdate} />}
    </div>
  );
}