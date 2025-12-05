import { useState, useEffect, useMemo } from "react";
import ModalPedido from "../modals/ModalPedido";

// Iconos SVG
const IconSort = () => (
  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
);
const IconSortUp = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
);
const IconSortDown = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>
);

// Interfaces
interface Detalle {
  nombre_platillo: string;
  cantidad: number;
  precio_unitario: number;
}

interface Pedido {
  id_pedido: number;
  numero_pedido: number;
  fecha: string;
  estado_pedido: string;
  cliente: {
    nombre_cliente: string;
    direccion_cliente: string;
  };
  detalles: Detalle[];
  factura?: { monto_total: number };
}

interface Row {
  id_unico: number;
  numero_pedido: number;
  resumen: Pedido;
  detalles: Detalle[];
  montoCalculado: number;
}

// CORRECCIÓN: Agregamos externalStatus a la interfaz
interface TablaPedidosProps {
  data: Pedido[];
  externalStatus?: string; 
}

type SortKey = "numero_pedido" | "fecha" | "monto_total" | "estado_pedido" | "";

export default function TablaPedidos({ data, externalStatus }: TablaPedidosProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Pedido | null>(null);

  // Filtro de estado local
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const [sortKey, setSortKey] = useState<SortKey>("numero_pedido");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // EFECTO: Sincronizar filtro externo (Cards) con filtro local
  useEffect(() => {
    if (externalStatus !== undefined) {
        setStatusFilter(externalStatus);
    }
  }, [externalStatus]);

  // Agrupación
  const rows: Row[] = useMemo(() => {
    const grouped: Record<number, Pedido[]> = {};
    data.forEach((item) => {
      const key = item.id_pedido; 
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([idKey, items]) => {
        const primerItem = items[0];
        const total = primerItem.detalles.reduce((acc, det) => acc + det.cantidad * det.precio_unitario, 0);
        return {
            id_unico: Number(idKey),
            numero_pedido: primerItem.numero_pedido ?? primerItem.id_pedido, 
            resumen: primerItem,
            detalles: primerItem.detalles,
            montoCalculado: total
        };
    });
  }, [data]);

  // Filtrado y Ordenamiento
  const processedRows = useMemo(() => {
    let result = rows.filter((row) => {
      const resumen = row.resumen;
      const quickSearch = search.toLowerCase();
      
      const matchQuick =
        resumen.cliente?.nombre_cliente.toLowerCase().includes(quickSearch) ||
        resumen.estado_pedido.toLowerCase().includes(quickSearch) ||
        row.numero_pedido.toString().includes(quickSearch);

      let matchStatus = true;
      if (statusFilter && resumen.estado_pedido !== statusFilter) matchStatus = false;

      return matchQuick && matchStatus;
    });

    if (sortKey) {
        result.sort((a, b) => {
            let valueA: any;
            let valueB: any;
            switch (sortKey) {
                case "numero_pedido": valueA = a.numero_pedido; valueB = b.numero_pedido; break;
                case "fecha": valueA = new Date(a.resumen.fecha).getTime(); valueB = new Date(b.resumen.fecha).getTime(); break;
                case "monto_total": valueA = a.montoCalculado; valueB = b.montoCalculado; break;
                case "estado_pedido": valueA = a.resumen.estado_pedido; valueB = b.resumen.estado_pedido; break;
                default: return 0;
            }
            if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
            if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    return result;
  }, [rows, search, statusFilter, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
      if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      else { setSortKey(key); setSortOrder("desc"); }
  };

  const handleSave = () => { setSelected(null); window.location.reload(); };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ENTREGADO': return 'bg-purple-900/50 text-purple-300 border-purple-700';
          case 'ANULADO': return 'bg-red-900/50 text-red-300 border-red-700';
          case 'PENDIENTE': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
          default: return 'bg-gray-700 text-gray-300';
      }
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey?: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => sKey && handleSort(sKey)}>
        <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase">
            {label}
            {sKey && sortKey === sKey ? (sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />) : (sKey && <IconSort />)}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* Panel de Control */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <input type="text" placeholder="🔍 Buscar pedido..." className="w-full md:w-64 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
            
            {/* El Select también controla el estado, sincronizado */}
            <select 
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="ENTREGADO">Entregados</option>
                <option value="ANULADO">Anulados</option>
            </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto shadow-xl rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
                <HeaderCell label="Nº Pedido" sKey="numero_pedido" />
                <HeaderCell label="Fecha" sKey="fecha" />
                <HeaderCell label="Total" sKey="monto_total" />
                <HeaderCell label="Estado" sKey="estado_pedido" />
                <HeaderCell label="Cliente" />
                <th className="px-6 py-4 text-center text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {processedRows.length > 0 ? (
                processedRows.map((row) => (
                <tr key={row.id_unico} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">#{row.numero_pedido}</td>
                    <td className="px-6 py-4">{row.resumen.fecha}</td>
                    <td className="px-6 py-4 font-medium text-white">${row.montoCalculado.toFixed(2)}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(row.resumen.estado_pedido)}`}>{row.resumen.estado_pedido}</span></td>
                    <td className="px-6 py-4 text-white">{row.resumen.cliente?.nombre_cliente}</td>
                    <td className="px-6 py-4 text-center">
                        <button className="text-blue-400 hover:text-white border border-blue-900 hover:bg-blue-600 px-3 py-1 rounded transition-all text-xs font-medium" onClick={() => setSelected(row.resumen)}>
                            Ver Detalles
                        </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No hay pedidos con este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <ModalPedido pedido={selected} onClose={() => setSelected(null)} onSave={handleSave} />}
    </div>
  );
}