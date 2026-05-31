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
          case 'FIJO': return 'bg-blue-900/50 text-blue-300 border-blue-700';
          case 'VARIABLE': return 'bg-purple-900/50 text-purple-300 border-purple-700';
          default: return 'bg-gray-700 text-gray-400 border-gray-600';
      }
  }

  // CORRECCIÓN 2: Usamos los iconos (IconSort, IconSortUp, IconSortDown) en lugar de texto
  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase">
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
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <input 
            type="text" 
            placeholder="🔍 Buscar proveedor, dirección..." 
            className="w-full md:w-80 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-all" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
        />
        <button onClick={() => setShowCreate(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 transition-transform hover:scale-105">
            <span>🏢+</span> Nuevo Proveedor
        </button>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              <HeaderCell label="ID" sKey="IdProveedor" />
              <HeaderCell label="Proveedor" sKey="NombreProveedor" />
              <HeaderCell label="Dirección" sKey="Direccion" />
              <HeaderCell label="Tipo" sKey="Tipo" />
              <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((p, i) => (
                <tr key={i} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">#{p.IdProveedor}</td>
                  <td className="px-6 py-4 font-bold text-white text-base">{p.NombreProveedor}</td>
                  <td className="px-6 py-4 truncate max-w-xs" title={p.Direccion}>{p.Direccion}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getTipoColor(p.Tipo)}`}>
                        {p.Tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => setSelectedProveedor(p)} 
                        className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                        title="Editar Proveedor"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No se encontraron proveedores.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Paginación */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-800 bg-gray-900 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 outline-none" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option><option value={20}>20</option><option value={-1}>Todos</option>
                </select>
            </div>
            <span>{paginatedRows.length} de {processedData.length} registros</span>
            {itemsPerPage !== -1 && (
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 text-white">Anterior</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 text-white">Siguiente</button>
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