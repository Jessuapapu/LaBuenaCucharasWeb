import { useState, useEffect, useMemo } from "react";
import ModalNuevoCliente from "../Modals/ModalNuevoCliente";
import ModalEditarCliente from "../Modals/ModalEditarCliente";
import type { cliente } from "../../../context/Interfaces/Clientes";



interface TablaClientesProps {
  data: cliente[];
}

type SortKey = "NombreCliente" | "correo" | "dirreccion" | "";

// Iconos
const IconSort = () => (<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconEdit = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaClientes({ data }: TablaClientesProps) {
  const [clientes, setClientes] = useState<cliente[]>([]);
  const [search, setSearch] = useState("");
  console.log(data)
  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<cliente | null>(null);

  // Orden y Paginación
  const [sortKey, setSortKey] = useState<SortKey>("NombreCliente");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setClientes(data || []);
  }, [data]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  // Lógica de Filtrado y Orden
  const processedData = useMemo(() => {
    if (!clientes) return [];
    let rows = clientes.filter((c) => {
      const term = search.toLowerCase();
      return (
        (c.NombreCliente || "").toLowerCase().includes(term) ||
        (c.correo || "").toLowerCase().includes(term) ||
        (c.telefono || "").includes(term)
      );
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
  }, [clientes, search, sortKey, sortOrder]);

  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedData;
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };


  const handleUpdate = (updated: cliente) => {
    setClientes(prev => prev.map(c =>
      // Compara por ID si existe, sino por nombre (fallback)
      (c.IdCliente && c.IdCliente === updated.IdCliente) || c.NombreCliente === updated.NombreCliente ? updated : c
    ));
    setSelectedCliente(null);
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer select-none hover:bg-sky-50/50 transition-colors" onClick={() => handleSort(sKey)}>
      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
        {label}
        {sKey && sortKey === sKey ? (sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />) : <IconSort />}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">

      {/* Barra de Control */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-sky-100/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Buscar cliente, correo o teléfono..."
          className="bg-slate-50/80 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 focus:bg-white transition-all placeholder-slate-400 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowCreate(true)}
          className="w-full md:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-sky-600/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>+</span> Nuevo cliente
        </button>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto shadow-md rounded-2xl border border-skyy-100 bg-white">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50/70 border-b border-sky-100">
            <tr>
              <HeaderCell label="Nombre" sKey="NombreCliente" />
              <HeaderCell label="Dirección" sKey="dirreccion" />
              <HeaderCell label="Correo" sKey="correo" />
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((c, i) => (
                <tr key={i} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-800 text-base">{c.NombreCliente}</td>
                  <td className="px-6 py-4 text-slate-500 text-lg truncate max-w-xs" title={c.dirreccion}>{c.dirreccion}</td>
                  <td className="px-6 py-4 text-sky-600 font-semibold font-mono text-lg">{c.correo}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium font-mono text-base">{c.telefono}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedCliente(c)} className="text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 p-2 rounded-xl transition-all border border-slate-200/60 hover:border-sky-300 active:scale-95">
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center py-14 text-slate-400">No se encontraron clientes.</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-sky-100 bg-slate-50/50 gap-4 text-xs font-medium text-slate-500">
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
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm">Siguiente</button>
            </div>
          )}
        </div>
      </div>

      {showCreate && <ModalNuevoCliente onClose={() => setShowCreate(false)} />}
      {selectedCliente && <ModalEditarCliente cliente={selectedCliente} onClose={() => setSelectedCliente(null)} onSuccess={() => handleUpdate} />}
    </div>
  );
}