import { useState, useEffect, useMemo } from "react";
import FormularioNuevoPedido from "../Forms/PedidosForms";
import type { DetallePlatillo } from "../../context/Interfaces/Platillos";

// --- Iconos SVG ---
const IconSort = () => (<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);
const IconSortUp = () => (<svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>);
const IconSortDown = () => (<svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>);
const IconFilter = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>);


interface Pedido {
  id_pedido: number;
  numero_pedido: number;
  fecha: string;
  estado_pedido: string;
  estado: string;
  cliente: {
    nombre_cliente: string;
    direccion_cliente: string;
  };
  detalles: DetallePlatillo[];
}

interface Row {
  id_unico: number;
  numero_pedido: number;
  resumen: Pedido;
  detalles: DetallePlatillo[];
  montoCalculado: number;
}

interface TablaPedidosProps {
  data: Pedido[];
  externalStatus?: string; 
}

type SortKey = "numero_pedido" | "fecha" | "monto_total" | "estado_pedido" | "";

export default function TablaPedidos({ data, externalStatus }: TablaPedidosProps) {
  // --- Estados Básicos ---
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Pedido | null>(null);

  // --- Estados de Filtros ---
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false); // Toggle avanzado
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [minMonto, setMinMonto] = useState<number | "">("");
  const [maxMonto, setMaxMonto] = useState<number | "">("");
  const [platilloFilter, setPlatilloFilter] = useState(""); // <-- NUEVO ESTADO PARA PLATILLO

  // --- Ordenamiento ---
  const [sortKey, setSortKey] = useState<SortKey>("numero_pedido");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sincronizar filtro externo (Cards)
  useEffect(() => {
    if (externalStatus !== undefined) {
        setStatusFilter(externalStatus);
    }
  }, [externalStatus]);

  // Formateador de Moneda Local
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(amount);
  };

  // Formateador de Fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Agrupación de datos
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

  // --- LÓGICA PRINCIPAL DE FILTRADO ---
  const processedRows = useMemo(() => {
    let result = rows.filter((row) => {
      const resumen = row.resumen;
      
      // 1. Búsqueda Rápida (Texto)
      const quickSearch = search.toLowerCase();
      const matchQuick =
        resumen.cliente?.nombre_cliente.toLowerCase().includes(quickSearch) ||
        resumen.estado_pedido.toLowerCase().includes(quickSearch) ||
        row.numero_pedido.toString().includes(quickSearch);

      // 2. Filtro de Estado
      let matchStatus = true;
      if (statusFilter) {
          matchStatus = resumen.estado_pedido.toLowerCase() === statusFilter.toLowerCase();
      }

      // 3. Filtro de Fechas
      let matchFecha = true;
      if (fechaInicio) {
          matchFecha = matchFecha && new Date(resumen.fecha) >= new Date(fechaInicio);
      }
      if (fechaFin) {
          const endOfDay = new Date(fechaFin);
          endOfDay.setHours(23, 59, 59);
          matchFecha = matchFecha && new Date(resumen.fecha) <= endOfDay;
      }

      // 4. Filtro de Montos
      let matchMonto = true;
      if (minMonto !== "") matchMonto = matchMonto && row.montoCalculado >= minMonto;
      if (maxMonto !== "") matchMonto = matchMonto && row.montoCalculado <= maxMonto;

      // 5. Filtro por Platillo (NUEVO)
      let matchPlatillo = true;
      if (platilloFilter) {
          // Buscamos si ALGUNO de los detalles del pedido contiene el nombre del platillo
          matchPlatillo = row.detalles.some(detalle => 
              detalle.nombre_platillo.toLowerCase().includes(platilloFilter.toLowerCase())
          );
      }

      return matchQuick && matchStatus && matchFecha && matchMonto && matchPlatillo;
    });

    // Ordenamiento
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
  }, [rows, search, statusFilter, fechaInicio, fechaFin, minMonto, maxMonto, platilloFilter, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
      if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      else { setSortKey(key); setSortOrder("desc"); }
  };

  const handleSave = () => { setSelected(null); window.location.reload(); };

  const getStatusColor = (status: string) => {
      switch(status.toUpperCase()) {
          case 'ENTREGADO': return 'bg-purple-50 text-purple-700 border-purple-200';
          case 'ANULADO': return 'bg-red-900/50 text-red-300 border-red-700';
          case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-200';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  };

  const HeaderCell = ({ label, sKey }: { label: string, sKey?: SortKey }) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-sky-50/50 transition-colors" onClick={() => sKey && handleSort(sKey)}>
        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking wider">
            {label}
            {sKey && sortKey === sKey ? (sortOrder === "asc" ? <IconSortUp /> : <IconSortDown />) : (sKey && <IconSort />)}
        </div>
    </th>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      
      {/* --- BARRA DE CONTROL --- */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-sky-100/80">
        
        {/* Fila 1: Búsqueda y Botones */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                {/* Buscador de Texto */}
                <input 
                    type="text" 
                    placeholder="🔍 Buscar pedido, cliente..." 
                    className="w-full sm:w-72 bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 focus:bg-white transition-all placeholder-slate-400" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
                
                {/* Select de Estado */}
                <select 
                    className="w-full sm:w-auto bg-slate-50/80 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 focus:bg-white cursor-pointer transition-all"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Todos los Estados</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="ENTREGADO">Entregados</option>
                    <option value="ANULADO">Anulados</option>
                </select>
            </div>

            {/* Botón Filtros Avanzados */}
            <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    showAdvanced ? "bg-sky-50 border-sky-300 text-sky-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
                <IconFilter /> Filtros Avanzados
            </button>
        </div>

        {/* Fila 2: Panel de Filtros Avanzados */}
        {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-sky-100 animate-in slide-in-from-top-2 duration-300">
                
                {/* Filtro Platillo (NUEVO) */}
                <div className="lg:col-span-1">
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-extrabold">Contiene Platillo</label>
                    <input 
                        type="text" 
                        placeholder="Ej: Lomo Saltado" 
                        className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white transition-all" 
                        value={platilloFilter} 
                        onChange={e => setPlatilloFilter(e.target.value)} 
                    />
                </div>

                {/* Fecha Inicio */}
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-extrabold">Fecha Desde</label>
                    <input type="date" className="w-full bg-slate-50/80 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500 focus:bg-white transition-all" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                </div>
                {/* Fecha Fin */}
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-extrabold">Fecha Hasta</label>
                    <input type="date" className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500 focus:bg-white transition-all" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
                {/* Precio Min */}
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-extrabold">Monto Mín ($)</label>
                    <input type="number" placeholder=" C$ 0" className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500 focus:bg-white transition-all" value={minMonto} onChange={e => setMinMonto(e.target.value ? Number(e.target.value) : "")} />
                </div>
                {/* Precio Max */}
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-extrabold">Monto Máx ($)</label>
                    <input type="number" placeholder="C$ Max" className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500 focus:bg-white transition-all" value={maxMonto} onChange={e => setMaxMonto(e.target.value ? Number(e.target.value) : "")} />
                </div>
            </div>
        )}
      </div>

      {/* --- TABLA --- */}
      <div className="relative overflow-hidden shadow-md rounded-2xl border border-sky-100 bg-white">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/70 border-b border-sky-100">
                <tr>
                    <HeaderCell label="Nº Pedido" sKey="numero_pedido" />
                    <HeaderCell label="Fecha" sKey="fecha" />
                    <HeaderCell label="Total" sKey="monto_total" />
                    <HeaderCell label="Estado" sKey="estado_pedido" />
                    <HeaderCell label="Cliente" />
                    <th className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {processedRows.length > 0 ? (
                    processedRows.map((row) => (
                    <tr key={row.id_unico} className="hover:bg-sky-50/30 transition-colors group">
                        <td className="px-6 py-4 font-black font-mono text-slate-400 text-xs">#{row.numero_pedido}</td>
                        <td className="px-6 py-4 font-mono text-xs">{formatDate(row.resumen.fecha)}</td>
                        <td className="px-6 py-4 font-mono font-extrabold text-blue-600 text-sm">{formatMoney(row.montoCalculado)}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${getStatusColor(row.resumen.estado_pedido)}`}>
                                {row.resumen.estado_pedido}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-800 text-sm">{row.resumen.cliente?.nombre_cliente || "Cliente General"}</td>
                        <td className="px-6 py-4 text-center">
                            <button 
                                className="text-sky-600 hover:text-white border border-sky-100 hover:border-sky-600 bg-sky-50/50 hover:bg-sky-600 px-4 py-1.5 rounded-xl transition-all text-xs font-bold active:scale-95 shadow-sm" 
                                onClick={() => setSelected(row.resumen)}
                            >
                                Ver Detalles
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400 font-medium italic">
                            No se encontraron pedidos con los filtros seleccionados.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      {selected && <FormularioNuevoPedido onClose={() => setSelected(null)} onSave={handleSave} />}
    </div>
  );
}