import { useState, useEffect, useMemo } from "react";
import ModalNuevoMenu from "../modals/ModalNuevoMenu";
import ModalEditarMenu from "../modals/ModalEditarMenu"; // <--- IMPORTAR

// Interfaz actualizada
interface Menu {
    id: number; // <--- IMPORTANTE: Necesario para el PUT
    Fecha: string;
    NombrePlatillo: string;
    monto: number;
}

interface TablaMenusProps {
    data: Menu[];
}

type SortKey = "Fecha" | "NombrePlatillo" | "";

// Iconos
const IconSort = () => (<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconEdit = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaMenus({ data }: TablaMenusProps) {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [search, setSearch] = useState("");

    // Estados para Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null); // Para Editar

    const [sortKey, setSortKey] = useState<SortKey>("Fecha");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setMenus(data || []);
    }, [data]);

    useEffect(() => { setCurrentPage(1); }, [search]);

    // Filtrado Seguro
    const processedData = useMemo(() => {
        if (!menus) return [];
        let rows = menus.filter((m) => {
            const nombre = (m.NombrePlatillo || "").toString().toLowerCase();
            const fecha = (m.Fecha || "").toString().toLowerCase();
            const termino = search.toLowerCase();
            return nombre.includes(termino) || fecha.includes(termino);
        });

        if (sortKey) {
            rows.sort((a, b) => {
                const valA = (a[sortKey] || "").toString().toLowerCase();
                const valB = (b[sortKey] || "").toString().toLowerCase();
                if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }
        return rows;
    }, [menus, search, sortKey, sortOrder]);

    const paginatedRows = useMemo(() => {
        if (itemsPerPage === -1) return processedData;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortOrder("asc"); }
    };


    const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
        <th className="px-6 py-4 cursor-pointer select-none hover:bg-gray-800 transition-colors" onClick={() => handleSort(sKey)}>
            <div className="flex items-center gap-2 text-gray-300">
                {label}
                {sKey && sortKey === sKey ? (sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />) : <IconSort />}
            </div>
        </th>
    );

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">

            {/* Barra Superior */}
            <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <input
                    type="text"
                    placeholder="🔍 Buscar por platillo o fecha..."
                    className="w-full md:w-64 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <span>📅</span> Asignar Menú
                </button>
            </div>

            {/* Tabla */}
            <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-gray-900 border-b border-gray-800">
                        <tr>
                            <HeaderCell label="Fecha Programada" sKey="Fecha" />
                            <HeaderCell label="Platillo" sKey="NombrePlatillo" />
                            <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((m, i) => (
                                <tr key={i} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                                    <td className="px-6 py-4 font-mono text-blue-300">
                                        {m.Fecha || "Sin fecha"}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white text-base">
                                        {m.NombrePlatillo || "Sin nombre"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedMenu(m)}
                                            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                                            title="Editar Menú"
                                        >
                                            <IconEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={3} className="text-center py-10 text-gray-500">No hay menús programados.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Footer Paginación */}
                <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-800 bg-gray-900 gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Mostrar</span>
                        <select
                            className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 outline-none"
                            value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
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
            {showCreateModal && (
                <ModalNuevoMenu
                    onClose={() => setShowCreateModal(false)}
                    onSave={() => setShowCreateModal(false)}
                />
            )}

            {selectedMenu && (
                <ModalEditarMenu
                    menu={selectedMenu}
                    onClose={() => setSelectedMenu(null)}
                    
                />
            )}
        </div>
    );
}