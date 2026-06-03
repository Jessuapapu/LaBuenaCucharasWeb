import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react";

// Modales
import ModalNuevoContratos from "../modals/ModalNuevoContratito";
import ModalEditarContratoProps from "../modals/ModalEditarContratito";


// Interfaces (Asegúrate de que la ruta sea correcta)
//@ts-ignore
import type { Contrato } from "../../interfaces/Contratos";

interface TablaContratosProps {
  data: any[]; // Usamos any[] temporalmente por si el PA retorna llaves con mayúsculas
  refetch?: () => void; // Recibir la función refetch para actualizar la tabla sin recargar la página
}

type SortKey = "NumeroContrato" | "Estado" | "Presupuesto" | "FechaVencimiento" | "";

export default function TablaContratos({ data, refetch }: TablaContratosProps) {
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
        case 'ACTIVO': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'VENCIDO': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        case 'ANULADO': return 'text-red-400 bg-red-500/10 border-red-500/20';
        default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
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
    <th className="px-6 py-4 cursor-pointer hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-slate-300 font-black text-[10px] uppercase tracking-widest">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-[fade-in_0.5s_ease-out]">
      
      {/* TOOLBAR */}
      <div className="bg-[#0F172A] p-4 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
                type="text" 
                placeholder="Buscar contrato, cliente, estado..." 
                className="w-full pl-11 pr-4 py-2.5 bg-[#0A0F1D] border border-slate-700 text-white text-sm font-medium rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 shadow-inner transition-all" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
        </div>

        <button 
            onClick={() => setModalNuevoAbierto(true)} 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 active:scale-95 transition-all"
        >
            <Plus size={18} /> Nuevo Contrato
        </button>
      </div>

      {/* TABLA DE DATOS */}
      <div className="relative overflow-hidden shadow-2xl rounded-2xl border border-slate-800 bg-[#0F172A]">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                <HeaderCell label="Nº Contrato" sKey="NumeroContrato" />
                <HeaderCell label="Cliente" sKey="" />
                <HeaderCell label="Fechas (Inicio - Fin)" sKey="FechaVencimiento" />
                <HeaderCell label="Presupuesto" sKey="Presupuesto" />
                <HeaderCell label="Estado Operativo" sKey="Estado" />
                <th className="px-6 py-4 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
                {paginatedRows.length > 0 ? (
                paginatedRows.map((c, i) => {
                    const numContrato = c.NumeroContrato || c.numeroContrato;
                    const cliente = c.NombreCliente || c.nombre_cliente || c.idCliente; // Respaldo por si no viene el nombre
                    const pto = c.Presupuesto || c.presupuesto || 0;
                    const est = c.Estado || c.estado || "N/A";
                    
                    return (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4 font-black font-mono text-white text-base">#{numContrato}</td>
                        
                        <td className="px-6 py-4 font-bold text-slate-300">{cliente}</td>
                        
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-mono text-slate-300">{formatDate(c.FechaInicio || c.fechaInicio)}</span>
                                <span className="text-xs font-mono text-slate-500">{formatDate(c.FechaVencimiento || c.fechaVencimiento)}</span>
                            </div>
                        </td>
                        
                        <td className="px-6 py-4 font-black font-mono text-emerald-400">
                            {formatMoney(pto)}
                        </td>
                        
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(est)}`}>
                                {est}
                            </span>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => setContratoAEditar(c)} 
                                className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 inline-flex items-center justify-center border border-transparent hover:border-blue-500"
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
                        <p className="text-slate-500 font-bold">No se encontraron registros de contratos.</p>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* PAGINACIÓN */}
        {processedData.length > 0 && (
            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Mostrando <span className="text-white bg-slate-800 px-2 py-1 rounded mx-1">{paginatedRows.length}</span> de {processedData.length}
                    </span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                        className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    >
                        <option value={5}>5 Filas</option>
                        <option value={10}>10 Filas</option>
                        <option value={20}>20 Filas</option>
                        <option value={-1}>Ver Todo</option>
                    </select>
                </div>
                
                {itemsPerPage !== -1 && (
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-lg transition-colors border border-slate-700 text-xs">
                            <ChevronLeft size={16}/> Ant
                        </button>
                        <div className="px-3 py-1.5 bg-slate-950 text-slate-400 font-bold rounded-lg text-xs border border-slate-800">
                            Pág {currentPage} de {totalPages}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-lg transition-colors border border-slate-700 text-xs">
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