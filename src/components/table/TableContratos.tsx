import { useState, useEffect, useMemo } from "react";
import ModalNuevoContrato from "../modals/ModalNuevoContrato";
import ModalEditarContrato from "../modals/ModalEditarContrato";
import type { Contrato } from "../../interfaces/Contratos";
// Interfaces

interface TablaContratosProps {
  data: Contrato[];
}

type SortKey = "numeroContrato" | "estado" | "presupuesto" | "fechaVencimiento" | "";


const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaContratos({ data }: TablaContratosProps) {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [search, setSearch] = useState("");
  
  const [showCreate, setShowCreate] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("numeroContrato");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  // @ts-ignore
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { setContratos(data || []); }, [data]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  // Formateadores
  const formatMoney = (amount: number) => {
    // Protección contra valores nulos en presupuesto
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "S/F";
    return new Date(dateString).toLocaleDateString();
  };

  const processedData = useMemo(() => {
    if (!contratos) return [];
    let rows = contratos.filter((c) => {
      const term = search.toLowerCase();
      
      // --- CÓDIGO DEFENSIVO (SOLUCIÓN DEL ERROR) ---
      // Usamos el operador de coalescencia nula (??) para asegurar que si el valor no existe, usemos ""
      const numContrato = (c.numeroContrato ?? "").toString();
      const estado = (c.estado ?? "").toLowerCase();
      const presupuesto = (c.presupuesto ?? "").toString();
      const idCliente = (c.idCliente ?? "").toString();

      return (
        numContrato.includes(term) ||
        estado.includes(term) ||
        presupuesto.includes(term) ||
        idCliente.includes(term)
      );
    });

    if (sortKey) {
      rows.sort((a, b) => {
        // Protección también al ordenar
        const valA = a[sortKey] ?? "";
        const valB = b[sortKey] ?? "";
        
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [contratos, search, sortKey, sortOrder]);

  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedData;
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };



  const getStatusColor = (estado: string) => {
      if (!estado) return 'bg-gray-700 text-gray-400';
      switch(estado.toLowerCase()) {
          case 'activo': return 'bg-green-900/50 text-green-300 border-green-700';
          case 'vencido': return 'bg-red-900/50 text-red-300 border-red-700';
          case 'inactivo': return 'bg-gray-700 text-gray-400 border-gray-600';
          default: return 'bg-blue-900/50 text-blue-300 border-blue-700';
      }
  }

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <input type="text" placeholder="🔍 Buscar contrato, cliente, estado..." className="w-full md:w-80 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => setShowCreate(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2"><span>📄+</span> Nuevo Contrato</button>
      </div>

      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              <HeaderCell label="Nº" sKey="numeroContrato" />
              <HeaderCell label="ID Cliente" sKey="" />
              <HeaderCell label="presupuesto" sKey="presupuesto" />
              <HeaderCell label="Inicio" sKey="" />
              <HeaderCell label="Vencimiento" sKey="fechaVencimiento" />
              <HeaderCell label="estado" sKey="estado" />
              <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((c, i) => (
                <tr key={i} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">#{c.numeroContrato}</td>
                  <td className="px-6 py-4 font-mono text-blue-300">{c.idCliente}</td>
                  <td className="px-6 py-4 font-medium text-white">{formatMoney(c.presupuesto)}</td>
                  <td className="px-6 py-4">{formatDate(c.fechaInicio)}</td>
                  <td className="px-6 py-4">{formatDate(c.fechaVencimiento)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(c.estado)}`}>{c.estado}</span></td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => setSelectedContrato(c)} 
                        className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                        title="Editar Contrato"
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">No se encontraron contratos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && <ModalNuevoContrato onClose={() => setShowCreate(false)}  />}
      
      {/* Aseguramos que solo renderizamos el modal si IdContrato existe */}
      {selectedContrato && selectedContrato.idContrato && (
        <ModalEditarContrato 
            contrato={selectedContrato as Contrato & { IdContrato: number }} 
            onClose={() => setSelectedContrato(null)} 
        />
      )}
    </div>
  );
}