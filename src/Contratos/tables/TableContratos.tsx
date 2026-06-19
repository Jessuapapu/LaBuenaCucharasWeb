import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react";

// Modales
import ModalNuevoContratos from "../../Contratos/modals/ModalNuevoContratito";
import ModalEditarContratoProps from "../../Contratos/modals/ModalEditarContratito";


// Interfaces (Asegúrate de que la ruta sea correcta)
//@ts-ignore
import type { Contrato } from "../../interfaces/Contratos";

interface TablaContratosProps {
    data: any[]; // Usamos any[] temporalmente por si el PA retorna llaves con mayúsculas
    refetch?: () => void; // Recibir la función refetch para actualizar la tabla sin recargar la página
}

type SortKey = "NumeroContrato" | "Estado" | "Presupuesto" | "FechaVencimiento" | "";

export default function TablaContratos({ data, refetch }: TablaContratosProps) {
    console.log(data)
    const [contratos, setContratos] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // Estados para modales
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [contratoAEditar, setContratoAEditar] = useState<any | null>(null);

    // Estados para Paginación y Ordenamiento
    const [sortKey, setSortKey] = useState<SortKey>("NumeroContrato");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => { setContratos(data || []); }, [data]);
    useEffect(() => { setCurrentPage(1); }, [search]);

    // --- FORMATEADORES ---
    const formatMoney = (amount: number) => {
        if (amount === undefined || amount === null) return "N/A";
        return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "S/F";
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

  const getStatusColor = (est: string) => {
    switch (est?.toUpperCase()) {
        case 'ACTIVO': return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20';
        case 'VENCIDO': return 'text-amber-700 bg-amber-500/10 border-amber-500/20';
        case 'ANULADO': return 'text-red-400 bg-red-500/10 border-red-500/20';
        default: return 'text-sky-700 bg-sky-50 border-sky-200';
    }
  };

    // --- PROCESAMIENTO DE DATOS ---
    const processedData = useMemo(() => {
        if (!contratos) return [];

        let rows = contratos.filter((c) => {
            const term = search.toLowerCase();

            // Adaptación a mayúsculas/minúsculas según retorne la base de datos
            const numContrato = String(c.NumeroContrato || c.numeroContrato || "");
            const estado = String(c.Estado || c.estado || "").toLowerCase();
            const presupuesto = String(c.Presupuesto || c.presupuesto || "");
            const cliente = String(c.NombreCliente || c.nombre_cliente || "");

            return (
                numContrato.includes(term) ||
                estado.includes(term) ||
                presupuesto.includes(term) ||
                cliente.toLowerCase().includes(term)
            );
        });

        if (sortKey) {
            rows.sort((a, b) => {
                // Obtenemos las llaves independientemente del casing
                const getVal = (obj: any, key: string) => {
                    if (key === 'NumeroContrato') return obj.NumeroContrato || obj.numeroContrato || 0;
                    if (key === 'Estado') return obj.Estado || obj.estado || "";
                    if (key === 'Presupuesto') return obj.Presupuesto || obj.presupuesto || 0;
                    if (key === 'FechaVencimiento') return new Date(obj.FechaVencimiento || obj.fechaVencimiento || 0).getTime();
                    return obj[key] ?? "";
                };

                const valA = getVal(a, sortKey);
                const valB = getVal(b, sortKey);

                if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }
        return rows;
    }, [contratos, search, sortKey, sortOrder]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);

    const paginatedRows = useMemo(() => {
        if (itemsPerPage === -1) return processedData;
        const start = (currentPage - 1) * itemsPerPage;
        return processedData.slice(start, start + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortOrder("asc"); }
    };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-sky-50/50 transition-colors select-none" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-wider">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* TOOLBAR */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-sky-100/80 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
                type="text" 
                placeholder="Buscar contrato, cliente, estado..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all placeholder-slate-400" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
        </div>

        <button 
            onClick={() => setModalNuevoAbierto(true)} 
            className="w-full md:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-sky-600/10 flex justify-center items-center gap-2 transition-all active:scale-95"
        >
            <Plus size={18} /> Nuevo Contrato
        </button>
      </div>

      {/* TABLA DE DATOS */}
      <div className="relative overflow-hidden shadow-md rounded-2xl border border-sky-100 bg-white">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
            <thead className="bg-slate-50/70 border-b border-sky-100">
                <tr>
                <HeaderCell label="Nº Contrato" sKey="NumeroContrato" />
                <HeaderCell label="Cliente" sKey="" />
                <HeaderCell label="Fechas (Inicio - Fin)" sKey="FechaVencimiento" />
                <HeaderCell label="Presupuesto" sKey="Presupuesto" />
                <HeaderCell label="Estado Operativo" sKey="Estado" />
                <th className="px-6 py-4 text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {paginatedRows.length > 0 ? (
                paginatedRows.map((c, i) => {
                    const numContrato = c.NumeroContrato || c.numeroContrato;
                    const cliente = c.NombreCliente || c.nombre_cliente || c.idCliente; // Respaldo por si no viene el nombre
                    const pto = c.Presupuesto || c.presupuesto || 0;
                    const est = c.Estado || c.estado || "N/A";
                    
                    return (
                        <tr key={i} className="hover:bg-sky-50/30 transition-colors group">
                        <td className="px-6 py-4 font-black font-mono text-slate-400 text-xs">#{numContrato}</td>
                        
                        <td className="px-6 py-4 font-black text-slate-800 text-sm">{cliente}</td>
                        
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-slate-600 font-mono">{formatDate(c.FechaInicio || c.fechaInicio)}</span>
                                <span className="text-xs font-mono text-slate-400">{formatDate(c.FechaVencimiento || c.fechaVencimiento)}</span>
                            </div>
                        </td>
                        
                        <td className="px-6 py-4 font-extrabold font-mono text-blue-600 text-sm">
                            {formatMoney(pto)}
                        </td>
                        
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${getStatusColor(est)}`}>
                                {est}
                            </span>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => setContratoAEditar(c)} 
                                className="text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 p-2 rounded-xl transition-all border border-slate-200/60 hover:border-sky-300 active:scale-95"
                                title="Editar Estado del Contrato"
                            >
                                <Edit size={16} />
                            </button>
                        </td>
                        </tr>
                    )
                })
                ) : (
                <tr>
                    <td colSpan={6} className="text-center py-16">
                        <p className="text-slate-400 font-medium italic">No se encontraron registros de contratos.</p>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* PAGINACIÓN */}
        {processedData.length > 0 && (
            <div className="p-4 border-t border-sky-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                    <span>Mostrar filas:</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                        className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none font-bold"
                    >
                        <option value={5}>5 Filas</option>
                        <option value={10}>10 Filas</option>
                        <option value={20}>20 Filas</option>
                        <option value={-1}>Ver Todo</option>
                    </select>
                </div>
                <span className="font-semibold test-slate-500">Mostrando{paginatedRows.length} de {processedData.length}</span>
                {itemsPerPage !== -1 && (
                    <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm inline-flex items-center gap-1">
                            <ChevronLeft size={16}/> Ant
                        </button>
                        <span className="px-2 text-slate-500 font-semibold">
                            Pág {currentPage} de {totalPages}
                        </span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-colors shadow-sm inline-flex items-center gap-1">
                            Sig <ChevronRight size={16}/>
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

            {/* MODALES */}
            {modalNuevoAbierto && (
                <ModalNuevoContratos
                    onClose={() => setModalNuevoAbierto(false)}
                    onCompletar={() => {
                        setModalNuevoAbierto(false);
                        if (refetch) refetch(); else window.location.reload();
                    }}
                />
            )}

            {contratoAEditar && (
                <ModalEditarContratoProps
                    contrato={contratoAEditar}
                    onClose={() => setContratoAEditar(null)}
                    onCompletar={() => {
                        setContratoAEditar(null);
                        if (refetch) refetch(); else window.location.reload();
                    }}
                />
            )}
        </div>
    );
}