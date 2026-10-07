import { useState, useMemo, useRef } from "react";
import { User, Search, Calendar, Trash2, Download, Layers, Loader2, ShieldAlert, FileText, ArrowRight, X, CreditCard, CheckSquare, Square, Receipt } from "lucide-react";
import { useFacturaModal } from "../../../context/Hooks/hookFacturas";
import { useClientes } from "../../../context/Hooks/hookClientes";
import type { ModalNuevaFacturaProps } from "../../../context/Interfaces/Ordenes";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ModalFacturaExtendidoProps extends ModalNuevaFacturaProps {
  id_factura?: number; 
}

// 🛡️ PATRÓN ADAPTADOR: Blinda la UI contra cambios de nombres en el Backend
const normalizarPedido = (raw: any) => {
  return {
    id: raw?.id_pedido ?? raw?.IdOrden ?? raw?.idOrden ?? raw?.Id_pedido ?? 0,
    monto: raw?.monto_total ?? raw?.MontoTotal ?? raw?.CostoTotal ?? raw?.MONTO_TOTAL ?? 0,
    fecha: raw?.fecha ?? raw?.Fecha ?? new Date().toISOString(),
    detalles: Array.isArray(raw?.detalles) ? raw.detalles : (Array.isArray(raw?.Detalles) ? raw.Detalles : [])
  };
};

const normalizarDetalle = (d: any) => ({
  cantidad: d?.cantidad ?? d?.Cantidad ?? 1,
  nombre: d?.nombre_platillo ?? d?.NombrePlatillo ?? d?.nombre ?? "Platillo Genérico"
});

export default function ModalNuevaFactura({ 
  onClose, 
  onSave,
  id_factura 
}: ModalFacturaExtendidoProps) {
  
  const [BusquedaCliente, setBusquedaCliente] = useState(""); 
  const [mostrarAutocompletado, setMostrarAutocompletado] = useState(false);
  const [Exportapdf, setExportapdf] = useState(false);
  
  const ticketpreviwe = useRef<HTMLDivElement>(null);
  
  const { clientes: clientesData, loading: cargandoClientes } = useClientes(); 
  const clientes = Array.isArray(clientesData) ? clientesData : [];

  const {
    formulario,
    setFormulario,
    pedidosPendientes,
    ordenesSeleccionadas,
    alternarSeleccionOrden,
    subTotalVisual,
    enviarFactura,
    loading,
    error
  } = useFacturaModal(BusquedaCliente, id_factura);

  const NoFacturable = useMemo(() => {
    if (!BusquedaCliente) return false;
    const nombreNormalizado = BusquedaCliente.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nombreNormalizado.includes("exporaneo") || nombreNormalizado.includes("comedor");
  }, [BusquedaCliente]);

  // Aplicamos el adaptador visualmente para evitar crasheos
  const pedidosSeleccionadosVisual = useMemo(() => {
    if (!Array.isArray(pedidosPendientes)) return [];
    return pedidosPendientes
      .map(normalizarPedido)
      .filter(p => ordenesSeleccionadas.includes(p.id));
  }, [pedidosPendientes, ordenesSeleccionadas]);

  const clientesSugeridos = useMemo(() => {
    if (!BusquedaCliente) return [];
    return clientes.filter((c: any) => 
      c.NombreCliente?.toLowerCase().includes(BusquedaCliente.toLowerCase()) && 
      c.IdCliente !== 1 && 
      c.NombreCliente?.toUpperCase() !== 'EXPORANEO/COMEDOR'
    ).slice(0, 5);
  }, [BusquedaCliente, clientes]);

  const seleccionarCliente = (nombre: string) => {
    setBusquedaCliente(nombre);
    setMostrarAutocompletado(false); 
  };

  const limpiarSeleccionDocumentos = () => {
    setFormulario(prev => ({ ...prev, OrdenesSeleccion: [] }));
  };

  const handleDescargarPDF = async () => {
    if (!ticketpreviwe.current || Exportapdf) return;
    try {
      setExportapdf(true);
      const elemento = ticketpreviwe.current;
      const canvas = await html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: "#FFFFFF", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 150] });
      const widthPDF = pdf.internal.pageSize.getWidth();
      const heightPDF = (canvas.height * widthPDF) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, widthPDF, heightPDF);
      
      const clienteLimpio = BusquedaCliente.trim().replace(/\s+/g, "_");
      pdf.save(`Ticket_${clienteLimpio || "Consumidor_Final"}.pdf`);
    } catch (err) {
      console.error("Error al exportar:", err);
    } finally {
      setExportapdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviarFactura((respuesta) => {
      onSave(respuesta); 
      onClose();    
    });
  };

  const botonDeshabilitado = loading || formulario.idCliente === 0 || ordenesSeleccionadas.length === 0 || NoFacturable;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl text-white max-w-6xl w-full border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col md:flex-row z-30 relative">
        
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors z-40">
          <X size={20} />
        </button>
  
        {/* LADO IZQUIERDO: FORMULARIO DE EMISIÓN */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800/60 flex flex-col justify-between max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <header>
              <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md font-bold">
                {id_factura ? "Modo Edición" : "Módulo de Facturación"}
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mt-2 flex items-center gap-2">
                {id_factura ? `Modificar Factura #${id_factura}` : "Emisión de Factura"}
              </h2>
            </header>

            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/50 text-rose-400 text-xs rounded-xl text-center font-semibold">
                {error}
              </div>
            )}

            {/* BUSCADOR DE CLIENTE */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-sky-500" /> Buscar Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-slate-800/60 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-colors text-white font-medium shadow-inner placeholder:text-slate-600"
                  placeholder="Escriba el nombre del cliente..."
                  value={BusquedaCliente}
                  onFocus={() => setMostrarAutocompletado(true)}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setMostrarAutocompletado(true);
                  }}
                />
                {cargandoClientes && <Loader2 className="absolute right-4 top-3.5 animate-spin text-sky-500" size={16}/>}
              </div>

              {mostrarAutocompletado && BusquedaCliente.trim().length > 0 && clientesSugeridos.length > 0 && (
                <div className="absolute left-0 right-0 top-[full+4px] mt-1 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
                  {clientesSugeridos.map((cliente: any) => (
                    <div
                      key={cliente.IdCliente}
                      onClick={() => seleccionarCliente(cliente.NombreCliente)}
                      className="p-3 cursor-pointer text-sm hover:bg-slate-800 transition-colors text-slate-300 font-medium flex items-center gap-2"
                    >
                      <User size={14} className="text-slate-500" />
                      {cliente.NombreCliente}
                    </div>
                  ))}
                  <div
                    onClick={() => seleccionarCliente("Consumidor Final")}
                    className="p-3 cursor-pointer text-sm hover:bg-slate-800 transition-colors text-sky-400 font-bold flex items-center gap-2 bg-sky-500/5"
                  >
                    <User size={14} /> Consumidor Final
                  </div>
                </div>
              )}
            </div>

            {NoFacturable && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl flex items-center gap-3 font-medium animate-in fade-in">
                <ShieldAlert size={20} className="shrink-0 text-amber-500" />
                <span>Este registro está catalogado como <strong>No Facturable (Comedor/Exporáneo)</strong>. Use los módulos de control interno.</span>
              </div>
            )}

            {/* GRILLA DE COMANDAS PENDIENTES */}
            {BusquedaCliente.trim() !== "" && !NoFacturable && (
               <div className="space-y-2 mt-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} className="text-sky-500" /> Comandas del Cliente
                  </label>
                  
                  <div className="bg-slate-950/20 border border-slate-800/50 rounded-xl p-3 max-h-72 overflow-y-auto custom-scrollbar shadow-inner space-y-3">
                      {loading ? (
                          <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-sky-500" /></div>
                      ) : Array.isArray(pedidosPendientes) && pedidosPendientes.length > 0 ? (
                          pedidosPendientes.map((rawPedido) => {
                              // Extraemos los datos usando el adaptador seguro
                              const pedido = normalizarPedido(rawPedido);
                              const seleccionado = ordenesSeleccionadas.includes(pedido.id);
                              
                              return (
                                  <div 
                                      key={pedido.id} 
                                      onClick={() => alternarSeleccionOrden(pedido.id)}
                                      className={`p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer rounded-2xl border transition-all duration-200 shadow-sm ${
                                          seleccionado 
                                          ? 'bg-sky-500/10 border-sky-500/50 hover:bg-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                                          : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700/50'
                                      }`}
                                  >
                                      <div className="flex items-center gap-4 shrink-0">
                                          <div className={`transition-colors ${seleccionado ? "text-sky-500" : "text-slate-600"}`}>
                                              {seleccionado ? <CheckSquare size={24}/> : <Square size={24}/>}
                                          </div>
                                          <div>
                                              <span className="font-mono font-black text-white text-lg block leading-none">Ord #{pedido.id}</span>
                                              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                                                  {new Date(pedido.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short'})}
                                              </span>
                                          </div>
                                      </div>
                                      
                                      <div className="flex-1 min-w-0 px-0 sm:px-2">
                                          <div className="flex items-start gap-2 text-xs text-slate-300">
                                              <Receipt size={16} className="shrink-0 mt-0.5 text-slate-500" />
                                              <span className="line-clamp-2">
                                                  {
                                                  pedido.detalles.length > 0 
                                                      ? pedido.detalles.map((rawDetalle: any) => {
                                                          const d = normalizarDetalle(rawDetalle);
                                                          return `${d.cantidad}x ${d.nombre}`;
                                                        }).join(', ')
                                                      : <span className="italic text-slate-500">Sin desglose disponible</span>}
                                              </span>
                                          </div>
                                      </div>

                                      <div className="font-mono font-black text-sky-400 text-lg shrink-0">
                                          C${Number(pedido.monto).toFixed(2)}
                                      </div>
                                  </div>
                              );
                          })
                      ) : (
                          <div className="text-center text-xs text-slate-500 italic py-6">
                            No se encontraron comandas pendientes para este cliente.
                          </div>
                      )}
                  </div>
               </div>
            )}

            {/* RESUMEN DE VINCULADAS */}
            {formulario.idCliente !== 0 && !NoFacturable && (
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-3 animate-in fade-in shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                  <Layers size={12}/> Resumen vinculadas ({ordenesSeleccionadas.length})
                </span>
                {ordenesSeleccionadas.length > 0 && (
                  <button
                    type="button"
                    onClick={limpiarSeleccionDocumentos}
                    className="text-xs flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                  >
                    <Trash2 size={12} /> Desvincular todas
                  </button>
                )}
              </div>

              {pedidosSeleccionadosVisual.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {pedidosSeleccionadosVisual.map((pedido) => (
                    <div 
                      key={pedido.id}
                      className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between group hover:border-slate-600 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold text-slate-300">Orden #{pedido.id}</div>
                        <div className="text-[11px] font-mono font-bold text-emerald-400">C$ {Number(pedido.monto).toFixed(2)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alternarSeleccionOrden(pedido.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/20 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-500 text-xs">
                  Selecciona órdenes de la lista superior.
                </div>
              )}
            </div>
            )}

            {/* METADATOS FISCALES */}
            {formulario.idCliente !== 0 && !NoFacturable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="text-sky-500" size={12} /> Emisión
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs font-mono text-white focus:border-sky-500 outline-none shadow-inner"
                    style={{ colorScheme: "dark" }}
                    value={formulario.Fecha || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormulario(prev => ({ ...prev, Fecha: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <CreditCard className="text-sky-500" size={12} /> Método Pago
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-white focus:border-sky-500 outline-none shadow-inner"
                    value={formulario.MetodoPago}
                    onChange={(e) => setFormulario(prev => ({ ...prev, MetodoPago: e.target.value }))}
                  >
                    <option value="EFECTIVO" className="bg-slate-900">Efectivo</option>
                    <option value="TRANSFERENCIA" className="bg-slate-900">Transferencia</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES ACCIÓN */}
          <div className="flex gap-3 pt-6 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-900/40 border border-slate-700/50 hover:bg-slate-800/60 text-slate-300 font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={botonDeshabilitado}
              className={`flex-[2] py-3 rounded-xl font-black text-sm tracking-wide transition-all uppercase shadow-lg
                ${botonDeshabilitado
                  ? "bg-slate-800/50 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.99] shadow-sky-500/20"}`}
            >
              {loading ? "PROCESANDO..." : id_factura ? "ACTUALIZAR REGISTRO" : "CONFIRMAR Y GUARDAR"}
            </button>
          </div>
        </form>

        {/* LADO DERECHO: PREVIEW TICKET DE CONSUMO */}
        <div className="bg-slate-950/40 p-6 md:p-8 w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/60 transition-all shadow-inner">
          {ordenesSeleccionadas.length > 0 && formulario.idCliente !== 0 && !NoFacturable ? (
            <div className="space-y-4 h-full flex flex-col justify-between animate-in zoom-in-95 duration-200">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Vista Previa</h3>
                  <button
                    type="button"
                    onClick={handleDescargarPDF}
                    disabled={Exportapdf}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-sky-900/50 bg-sky-950/40 text-sky-400 hover:bg-sky-900/50 hover:text-sky-300 transition-colors"
                  >
                    {Exportapdf ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} 
                    {Exportapdf ? "PROCESANDO..." : "PDF"}
                  </button>
                </div>

                <div ref={ticketpreviwe} className="bg-white rounded-xl p-5 text-slate-900 shadow-xl flex flex-col justify-between min-h-[390px]">
                  <div>
                    <div className="text-[10px] font-black text-slate-800 text-center tracking-tight">BUFFET LA BUENA CUCHARA</div>
                    <div className="text-[8px] text-slate-500 text-center mb-2 leading-normal italic">
                      RUC: 0012308820012M <br /> Tel: 8452-8941
                    </div>
                    
                    <div className="space-y-1 text-[9px] font-medium text-slate-700 mt-4">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500 uppercase font-bold text-[7px]">Cliente:</span>
                        <span className="font-bold text-right text-slate-900 max-w-[130px] truncate">{BusquedaCliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 uppercase font-bold text-[7px]">Fecha:</span>
                        <span className="font-mono text-slate-900 font-bold">{formulario.Fecha || new Date().toISOString().split("T")[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 uppercase font-bold text-[7px]">Metodo pago:</span>
                        <span className="text-slate-900 font-bold">{formulario.MetodoPago}</span>
                      </div>
                      
                      <div className="border-b border-dashed border-slate-300 my-2" />
                      
                      <span className="text-slate-500 uppercase font-bold text-[7px] block mb-1">Detalle Cuentas:</span>
                      <div className="max-h-24 overflow-y-auto pr-0.5 space-y-1 custom-scrollbar">
                        {pedidosSeleccionadosVisual.map((pedido) => {
                          return (
                            <div className="flex justify-between text-[9px] text-slate-800 bg-slate-100 p-1 rounded" key={pedido.id}>
                              <span className="font-bold">Comanda #{pedido.id}</span>
                              <span className="font-mono font-semibold">C$ {Number(pedido.monto).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                
                    <div className="border-b border-dashed border-slate-300 my-2" />
                    
                    <div className="text-[9px] space-y-0.5 text-slate-700 bg-slate-100 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Órdenes Unidas:</span>
                        <span className="font-bold text-slate-900">{ordenesSeleccionadas.length} U</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border-b border-dashed border-slate-300 my-2" />
                    <div className="text-center py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Monto Total Neto</div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        C$ {Number(subTotalVisual).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4 space-y-3">
              <div className="p-4 rounded-full bg-slate-900/40 text-slate-600 border border-slate-800/60">
                <ArrowRight size={24} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vista Previa</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  {NoFacturable 
                    ? "Bloqueado: Registro Comedor/Exporáneo exento de IVA." 
                    : "Selecciona al menos una orden para armar el ticket."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}