import { useState, useEffect, useMemo } from "react";
import ModalNuevoMenu from "../modals/ModalNuevoMenu";
import { useImagenesPlatillo } from "../../../context/Hooks/hookImagenes";
import type { Menu_dario } from "../../../context/Interfaces/Platillos";

interface TablaMenusProps {
    data: Menu_dario[];
    modalDta: any;
    listaPlatillos: any[];
    setmodalDta: (menu: any | null) => void;
    guardarOEditarMenu: (datos: any) => Promise<void>;
}

type SortKey = "Fecha" | "NombrePlatillo" | "";

const IconSort = () => (<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconEdit = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

// Subcomponente para renderizar la imagen asíncronamente desde el hook
function CeldaImagenPlatillo({ IdPlatillo }: { IdPlatillo: number }) {
    const { Urlimagen, cargando } = useImagenesPlatillo(IdPlatillo);

    if (cargando) {
        return <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />;
    }

    return (
        <img
            src={Urlimagen || "https://placehold.co/100x100/dce8ed/475569?text=🍽️"}
            alt={`Platillo${IdPlatillo}`}
            className="w-9 h-9 rounded-xl object-cover border border-slate-200/80 bg-slate-50 shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
    );
}

export default function TablaMenus({ data, modalDta, setmodalDta, guardarOEditarMenu, listaPlatillos }: TablaMenusProps) {
    const [menus, setMenus] = useState<Menu_dario[]>([]);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("Fecha");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => { setMenus(data || []); }, [data]);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const processedData = useMemo(() => {
        if (!menus) return [];
        let rows = [...menus].filter((m) => {
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
        const startIndex = (currentPage - 1) * itemsPerPage;
        if (itemsPerPage === -1) return processedData;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

    const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
        <th className="px-6 py-4 cursor-pointer select-none hover:bg-sky-50/50 transition-colors" onClick={() => {
            if (sortKey === sKey) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            else { setSortKey(sKey); setSortOrder("asc"); }
        }}>
            <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs uppercase">
                {label}
                {sKey && sortKey === sKey ? (sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />) : <IconSort />}
            </div>
        </th>
    );

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            {/* Buscador Simple */}
            <div className="bg-[#e8f0f3]/85 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-sky-200/80 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="🔍 Buscar por platillo o fecha..."
                    className="w-full md:w-80 bg-[#f0f5f7] border border-slate-300 text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-cyan-700 focus:bg-[#f7fafb] transition-all placeholder-slate-500 font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="relative overflow-x-auto shadow-sm rounded-2xl border border-sky-200/80 bg-[#e8f0f3]/90">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-[#dce8ed] border-b border-slate-300">
                        <tr>
                            <HeaderCell label="Fecha Programada" sKey="Fecha" />
                            <HeaderCell label="Platillo" sKey="NombrePlatillo" />
                            <th className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((m, i) => (
                                <tr key={m.id || i} className="hover:bg-sky-50/30 transition-colors group">
                                    <td className="px-6 py-4 font-semibold font-mono text-sky-600 text-xs">
                                        {m.Fecha ? m.Fecha.split('T')[0] : "Sin fecha"}
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-800 text-sm">
                                        <div className="flex items-center gap-3">
                                            <CeldaImagenPlatillo IdPlatillo={Number(m.id)} />
                                            <span>{m.NombrePlatillo || "Sin nombre"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setmodalDta({ id: m.id, Fecha: m.Fecha ? m.Fecha.split('T')[0] : "", NombrePlatillo: m.NombrePlatillo, Monto: m.Monto })}
                                            className="text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 p-2 rounded-xl transition-all border border-slate-200/60 hover:border-sky-300 active:scale-95 inline-flex items-center justify-center"
                                            title="Editar Menú"
                                        >
                                            <IconEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={3} className="text-center py-14 text-slate-400 font-medium italic">No hay menús programados.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Paginación */}
            <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-slate-300 bg-[#dfe9ed] gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <span>Mostrar</span>
                        <select className="bg-[#f0f5f7] border border-slate-300 text-slate-700 rounded-lg px-2 py-1.5 outline-none font-bold" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                            <option value={10}>10</option><option value={20}>20</option><option value={-1}>Todos</option>
                        </select>
                    </div>
                    <span className="font-semibold">{paginatedRows.length} de {processedData.length} registros</span>
                    {itemsPerPage !== -1 && (
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-[#edf3f5] border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm">Anterior</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-[#edf3f5] border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm">Siguiente</button>
                        </div>
                    )}
                </div>
            </div>

            {modalDta && (
                <ModalNuevoMenu MenuData={modalDta} listaPlatillos={listaPlatillos} onClose={() => setmodalDta(null)} onSave={guardarOEditarMenu} />
            )}
        </div>
    );
}
