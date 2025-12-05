import { useState, useEffect, useMemo } from "react";
import ModalNuevoRegistro from "../modals/ModalNuevoRegistro";
import ModalEditarRegistro from "../modals/ModalEditarRegistro";

// Interfaz adaptada a tu JSON
interface Registro {
  IdRegistro: number;
  Fecha: string;
  TotalIngresado: number;
  IdProveedor: number;
  CostoTotal: string | number; // Puede venir como string del JSON
}

// Estructura de Fila (Igual a Pedidos)
interface Row {
  id_unico: number;
  resumen: Registro;
}

interface TablaRegistrosProps {
  data: Registro[];
}

type SortKey = "IdRegistro" | "Fecha" | "TotalIngresado" | "CostoTotal" | "IdProveedor" | "";

// Iconos SVG

const IconEdit = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);

export default function TablaRegistros({ data }: TablaRegistrosProps) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [search, setSearch] = useState("");
  
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("Fecha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sincronizar datos y proteger contra null
  useEffect(() => { 
    if (Array.isArray(data)) {
        setRegistros(data);
    } else {
        setRegistros([]);
    }
  }, [data]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  // Formateadores
  const formatMoney = (amount: string | number) => {
    const val = Number(amount);
    if (isNaN(val)) return "N/A";
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(val);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "S/F";
    // Cortamos la fecha si viene larga o la formateamos
    return new Date(dateString).toLocaleDateString();
  };

  // 1. Agrupación (Protegida contra el error forEach)
  const rows: Row[] = useMemo(() => {
    if (!Array.isArray(registros)) return []; // <--- ESTO EVITA EL CRASH

    const grouped: Record<number, Registro[]> = {};
    registros.forEach((item) => {
      const key = item.IdRegistro; 
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([idKey, items]) => {
        return {
            id_unico: Number(idKey),
            resumen: items[0], 
        };
    });
  }, [registros]);

  // 2. Filtrado y Ordenamiento
  const processedRows = useMemo(() => {
    let result = rows.filter((row) => {
      const r = row.resumen;
      const term = search.toLowerCase();
      
      // Conversión segura a string
      const idReg = (r.IdRegistro || "").toString();
      const idProv = (r.IdProveedor || "").toString();
      const fecha = (r.Fecha || "").toLowerCase();

      return (
        idReg.includes(term) ||
        idProv.includes(term) ||
        fecha.includes(term)
      );
    });

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a.resumen[sortKey as keyof Registro] ?? "";
        const valB = b.resumen[sortKey as keyof Registro] ?? "";
        
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [rows, search, sortKey, sortOrder]);

  // 3. Paginación
  const paginatedRows = useMemo(() => {
    if (itemsPerPage === -1) return processedRows;
    const start = (currentPage - 1) * itemsPerPage;
    return processedRows.slice(start, start + itemsPerPage);
  }, [processedRows, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedRows.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const handleCreate = (nuevo: Registro) => {
    setRegistros(prev => [nuevo, ...prev]);
    setShowCreate(false);
  };

  const handleUpdate = (updated: Registro) => {
    setRegistros(prev => prev.map(r => r.IdRegistro === updated.IdRegistro ? updated : r));
    setSelectedRegistro(null);
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort(sKey)}>
        <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase">
            {label} {sKey && sortKey === sKey && (sortOrder === "asc" ? "↑" : "↓")}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* Barra de Control */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <input type="text" placeholder="🔍 Buscar por ID, proveedor o fecha..." className="w-full md:w-80 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => setShowCreate(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2"><span>📦+</span> Registrar Entrada</button>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              <HeaderCell label="ID Reg." sKey="IdRegistro" />
              <HeaderCell label="Fecha" sKey="Fecha" />
              <HeaderCell label="ID Prov." sKey="IdProveedor" />
              <HeaderCell label="Cant. Ingreso" sKey="TotalIngresado" />
              <HeaderCell label="Costo Total" sKey="CostoTotal" />
              <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.id_unico} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">#{row.resumen.IdRegistro}</td>
                  <td className="px-6 py-4 text-white">{formatDate(row.resumen.Fecha)}</td>
                  <td className="px-6 py-4 font-mono text-blue-300">
                    <span className="bg-blue-900/30 px-2 py-1 rounded text-xs border border-blue-800">PROV-{row.resumen.IdProveedor}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{row.resumen.TotalIngresado}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">{formatMoney(row.resumen.CostoTotal)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedRegistro(row.resumen)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors border border-gray-700 hover:border-blue-500" title="Editar Registro">
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-800 bg-gray-900 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 outline-none" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option><option value={20}>20</option><option value={-1}>Todos</option>
                </select>
            </div>
            <span>{paginatedRows.length} de {processedRows.length} registros</span>
            {itemsPerPage !== -1 && (
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 text-white">Anterior</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 text-white">Siguiente</button>
                </div>
            )}
        </div>
      </div>

      {showCreate && <ModalNuevoRegistro onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {selectedRegistro && <ModalEditarRegistro registro={selectedRegistro} onClose={() => setSelectedRegistro(null)} onSave={handleUpdate} />}
    </div>
  );
}