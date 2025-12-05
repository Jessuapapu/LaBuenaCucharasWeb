import { useState, useEffect, useMemo } from "react";
import ModalPlatillo from "../modals/ModalPlatillo";      // Modal para Editar
import ModalNuevoPlatillo from "../modals/ModalAgregarPlatillos";

// --- Interfaces y Tipos ---
interface Platillo {
  nombre_platillo: string;
  nombre_categoria: string;
}

interface TablaComidasProps {
  data: Platillo[];
}

type SortKey = "nombre_platillo" | "nombre_categoria" | "";

// --- Iconos SVG ---
const IconSort = () => (<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconEdit = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaComidas({ data }: TablaComidasProps) {
  // --- Estados de Datos ---
  const [platillos, setPlatillos] = useState<Platillo[]>([]);

  // --- Estados de Filtros y Orden ---
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Estados de Modales ---
  const [selectedPlatillos, setSelectedPlatillos] = useState<Platillo[] | null>(null); // Para Editar
  const [showNewModal, setShowNewModal] = useState(false); // Para Crear

  // Sincronizar datos iniciales
  useEffect(() => {
    setPlatillos(data);
  }, [data]);

  // Resetear paginación al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoriaFilter]);

  // --- Lógica de Filtrado y Ordenamiento ---
  const processedData = useMemo(() => {
    let rows = platillos.filter(
      (p) =>
        p.nombre_platillo.toLowerCase().includes(search.toLowerCase()) &&
        (categoriaFilter
          ? p.nombre_categoria.toLowerCase().includes(categoriaFilter.toLowerCase())
          : true)
    );

    if (sortKey) {
      rows.sort((a, b) => {
        const valA = a[sortKey] || "";
        const valB = b[sortKey] || "";
        return sortOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return rows;
  }, [platillos, search, categoriaFilter, sortKey, sortOrder]);

  // --- Lógica de Paginación ---
  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

  // --- Manejadores ---
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleCreateNew = (nuevo: Platillo) => {
    setPlatillos((prev) => [...prev, nuevo]);
    setShowNewModal(false);
  };

  const handleUpdateList = (updatedList: Platillo[]) => {
    // Aquí actualizamos el estado local. 
    // Si editaste uno solo, updatedList tendrá tamaño 1, pero aquí asumimos 
    // que ModalPlatillo devuelve la lista que estaba editando.
    
    // Si es edición masiva:
    if(updatedList.length > 1) {
        setPlatillos(updatedList);
    } else if (updatedList.length === 1) {
        // Si editamos una fila especifica, buscamos y reemplazamos
        // Nota: Esto asume nombre único o usa un ID real en producción.
        const updatedItem = updatedList[0];
        setPlatillos(prev => prev.map(p => 
            // Lógica simple de reemplazo (mejorar con ID único si tienes)
            p.nombre_platillo === selectedPlatillos![0].nombre_platillo ? updatedItem : p
        ));
    }
    setSelectedPlatillos(null);
  };

  // Helper para Headers
  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th 
      className="px-6 py-4 cursor-pointer select-none hover:bg-gray-800 transition-colors"
      onClick={() => handleSort(sKey)}
    >
      <div className="flex items-center gap-2 text-gray-300 font-semibold">
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
      
      {/* --- BARRA DE HERRAMIENTAS --- */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Buscar platillo..."
            className="w-full md:w-56 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="📂 Filtrar categoría..."
            className="w-full md:w-48 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <span>+</span> Nuevo
          </button>
          
          <button
            onClick={() => setSelectedPlatillos(platillos)} // Edición Masiva
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 transition-all"
          >
            Editar Lista
          </button>
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-gray-900 border-b border-gray-800">
            <tr>
              <HeaderCell label="Platillo" sKey="nombre_platillo" />
              <HeaderCell label="Categoría" sKey="nombre_categoria" />
              <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((p, i) => (
                <tr key={i} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white text-base">
                    {p.nombre_platillo}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#004aad]/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-[#004aad]/40">
                      {p.nombre_categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedPlatillos([p])}
                      className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors"
                      title="Editar este platillo"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-500 text-lg">
                  No se encontraron platillos. 🥗
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* --- PAGINACIÓN --- */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-800 bg-gray-900 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select 
                    className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 outline-none focus:border-blue-500"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={-1}>Todos</option>
                </select>
            </div>
            
            <span>
                Mostrando {paginatedRows.length} de {processedData.length} resultados
            </span>

            {itemsPerPage !== -1 && (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                        Anterior
                    </button>
                    <span className="text-white">Pág {currentPage}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* --- MODALES --- */}
      {showNewModal && (
        <ModalNuevoPlatillo 
          onClose={() => setShowNewModal(false)}
          onSave={handleCreateNew}
        />
      )}

      {selectedPlatillos && (
        <ModalPlatillo
          platillos={selectedPlatillos}
          onClose={() => setSelectedPlatillos(null)}
          onSave={handleUpdateList}
        />
      )}
    </div>
  );
}