import { useState, useEffect, useMemo } from "react";
import ModalNuevoPlatillo from "../Modals/ModalAgregarPlatillos";
import ModalEditPlatillo from "../Modals/ModalEditPlatillos";
import type { Platillo } from "../../interfaces/Platillos";
import { useImagenesPlatillo } from "../../components/Hooks/hookImagenes";
//import { useMenu_diario } from "../Hooks/hookMenu_diario";

interface TablaComidasProps {
  data: Platillo[];
}

// Subcomponente para renderizar la imagen asíncronamente desde el hook
function CeldaImagenPlatillo({ IdPlatillo }: { IdPlatillo: number }) {
    const { Urlimagen, cargando } = useImagenesPlatillo(IdPlatillo);

    if (cargando) {
        return <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse border border-white/10" />;
    }

    return (
        <img
            src={Urlimagen && Urlimagen.trim() !== "" ? Urlimagen : "https://placehold.co/100x100/1f2937/ffffff?text=🍽️"}
            alt={`Platillo ${IdPlatillo}`}
            className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-white/5 shadow-md transition-transform group-hover:scale-105"
        />
    );
}

type SortKey = "nombre_platillo" | "nombre_categoria" | "precio" | "";

// --- Iconos SVG ---
const IconSort = () => (<svg className="w-4 h-4 text-white-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconEdit = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const IconFilter = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>);

export default function TablaComidas({ data }: TablaComidasProps) {
  const [platillos, setPlatillos] = useState<Platillo[]>([]);

  // --- Filtros Básicos ---
  const [search, setSearch] = useState("");
  
  // --- Filtros Avanzados ---
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoriaFilter, setCategoriaFilter] = useState("");
  
  // --- Ordenamiento y Paginación ---
  const [sortKey, setSortKey] = useState<SortKey>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Modales ---
  const [editingPlatillo, setEditingPlatillo] = useState<Platillo | null>(null);
  //const [selectedPlatillos, setSelectedPlatillos] = useState<Platillo[] | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    setPlatillos(data);
  }, [data]);

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoriaFilter]);

  // --- LÓGICA DE FILTRADO ---
  const processedData = useMemo(() => {
    let rows = platillos.filter((p) => {
      // 1. Búsqueda por Nombre con fallback
      const matchSearch = (p.nombre_platillo || "").toLowerCase().includes(search.toLowerCase());
      
      // 2. Filtro Categoría con fallback
      const matchCategoria = categoriaFilter
        ? (p.nombre_categoria || "").toLowerCase().includes(categoriaFilter.toLowerCase())
        : true;

      return matchSearch && matchCategoria;
    });

    if (sortKey) {
      rows.sort((a, b) => {
        // @ts-ignore
        const valA = a[sortKey] || "";
        // @ts-ignore
        const valB = b[sortKey] || "";
        return sortOrder === "asc"
          ? String(valA).localeCompare(String(valB), undefined, {numeric: true})
          : String(valB).localeCompare(String(valA), undefined, {numeric: true});
      });
    }
    return rows;
  }, [platillos, search, categoriaFilter, sortKey, sortOrder]);

  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSaveEdit = (editado: Platillo) => {
    setPlatillos(prev => prev.map(p => 
      // Comparamos por ID si existe, o por nombre como fallback
      (p.id_platillo === editado.id_platillo || p.nombre_platillo === editingPlatillo?.nombre_platillo) 
      ? editado 
      : p
    ));
    setEditingPlatillo(null);
  };
  
  const handleCreateNew = (nuevo: any) => {
    // Interceptamos y forzamos los nombres exactos que necesita la tabla
    const platilloSeguro = {
      ...nuevo,
      id_platillo: nuevo.id_platillo || Date.now(),
      // Mapeamos varias opciones por si el backend usa nombres diferentes
      nombre_platillo: nuevo.nombre_platillo || nuevo.nombre || "Nuevo Platillo",
      nombre_categoria: nuevo.nombre_categoria || nuevo.categoria || "Sin Categoría",
      precio: nuevo.precio || 0
    };

    setPlatillos(prev => [...prev, platilloSeguro]);
    setShowNewModal(false);
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort(sKey)}>
      <div className="flex items-center gap-2 text-white/70 font-semibold text-xs uppercase tracking-wider">
        {label}
        {sKey && sortKey === sKey ? (sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />) : <IconSort />}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
            
            {/* --- BARRA DE HERRAMIENTAS --- */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-md border border-[#9ab7e2]/30">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                        <input
                            type="text"
                            placeholder="🔍 Buscar platillo..."
                            className="w-full md:w-64 bg-white border border-[#9ab7e2]/40 text-slate-800 placeholder-slate-400 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#9ab7e2] outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors ${showAdvanced ? "bg-blue-900/30 border-blue-500 text-blue-400" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}`}
                        >
                            <IconFilter /> Filtros
                        </button>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <span>+</span> Nuevo
                        </button>
                    </div>
                </div>

                {/* --- PANEL DE FILTROS AVANZADOS --- */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800 animate-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-bold">Categoría</label>
                            <input
                                type="text"
                                placeholder="Ej: Bebidas, Postres"
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                value={categoriaFilter}
                                onChange={(e) => setCategoriaFilter(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-end justify-end">
                            <button 
                                onClick={() => {
                                    setSearch("");
                                    setCategoriaFilter("");
                                }}
                                className="text-sm text-blue-400 hover:text-blue-300 underline px-2 mb-2"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- TABLA --- */}
            <div className="relative overflow-x-auto shadow-xl rounded-xl border border-[#9ab7e2]/30 bg-white/70 backdrop-blur-md">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-[#9ab7e2]/15 border-b border-[#9ab7e2]/30 text-slate-700">
                        <tr>
                            <HeaderCell label="Platillo" sKey="nombre_platillo" />
                            <HeaderCell label="Categoría" sKey="nombre_categoria" />
                            <th className="px-6 py-4 text-center text-gray-300 font-semibold text-xs uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((p, i) => {
                                const RowKey = p.id_platillo ? `platillo-id-${p.id_platillo}` : `platillo-index-${i}`;
                                return(
                                <tr key={RowKey} className="bg-[#9ab7e2]/10 hover:bg-[#9ab7e2]/10 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-slate-800 text-base">
                                        <div className="flex items-center gap-3">
                                            <CeldaImagenPlatillo IdPlatillo={Number(p.id_platillo || "0")} />
                                            <span>{p.nombre_platillo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-blue-700 bg-[#9ab7e2]/20 px-2 py-1 rounded text-xs font-medium border border-[#9ab7e2]/40">
                                            {p.nombre_categoria}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setEditingPlatillo(p)}
                                            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                                            title="Editar Platillo"
                                        >
                                            <IconEdit />
                                        </button>
                                    </td>
                                </tr>
                            )})
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">
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
                            className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 outline-none cursor-pointer"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={-1}>Todos</option>
                        </select>
                    </div>
                    
                    <span>{paginatedRows.length} de {processedData.length} registros</span>

                    {itemsPerPage !== -1 && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50"
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

            {editingPlatillo && (
                <ModalEditPlatillo
                    platillo={editingPlatillo}
                    onClose={() => setEditingPlatillo(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
  );
}