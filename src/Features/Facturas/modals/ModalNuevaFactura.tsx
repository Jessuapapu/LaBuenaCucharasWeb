import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative z-30 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-y-auto rounded-3xl border border-sky-200 bg-[#e8f0f4] text-slate-800 shadow-2xl shadow-slate-950/30 md:flex-row">
        
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 z-40 rounded-xl border border-slate-300 bg-slate-100 p-1.5 text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
          <X size={20} />
        </button>
  
        {/* LADO IZQUIERDO: FORMULARIO DE EMISIÓN */}
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-1 flex-col justify-between overflow-y-auto border-b border-sky-200 p-5 custom-scrollbar sm:p-6 md:border-b-0 md:border-r md:p-8">
          <div className="space-y-6">
            <header>
              <span className="rounded-md border border-sky-200 bg-sky-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#147e9d]">
                {id_factura ? "Modo Edición" : "Módulo de Facturación"}
              </span>
              <h2 className="mt-2 flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-slate-900">
                {id_factura ? `Modificar Factura #${id_factura}` : "Emisión de Factura"}
              </h2>
            </header>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-100 p-3 text-center text-xs font-semibold text-rose-800">
                {error}
              </div>
            )}

            {/* BUSCADOR DE CLIENTE */}
            <div className="space-y-2 relative">
              <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                <User size={12} className="text-[#147e9d]" /> Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 bg-[#f3f7f9] py-3 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/30"
                  placeholder="Escriba el nombre del cliente..."
                  value={BusquedaCliente}
                  onFocus={() => setMostrarAutocompletado(true)}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setMostrarAutocompletado(true);
                  }}
                />
                {cargandoClientes && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#147e9d]" size={16}/>}
              </div>

              {mostrarAutocompletado && BusquedaCliente.trim().length > 0 && clientesSugeridos.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-[#edf3f6] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  {clientesSugeridos.map((cliente: any) => (
                    <div
                      key={cliente.IdCliente}
                      onClick={() => seleccionarCliente(cliente.NombreCliente)}
                      className="flex cursor-pointer items-center gap-2 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-100"
                    >
                      <User size={14} className="text-slate-500" />
                      {cliente.NombreCliente}
                    </div>
                  ))}
                  <div
                    onClick={() => seleccionarCliente("Consumidor Final")}
                    className="flex cursor-pointer items-center gap-2 bg-sky-100 p-3 text-sm font-bold text-[#147e9d] transition-colors hover:bg-sky-200"
                  >
                    <User size={14} /> Consumidor Final
                  </div>
                </div>
              )}
            </div>

            {NoFacturable && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-100 p-4 text-xs font-medium text-amber-900 animate-in fade-in">
                <ShieldAlert size={20} className="shrink-0 text-amber-700" />
                <span>Este registro está catalogado como <strong>No Facturable (Comedor/Exporáneo)</strong>. Use los módulos de control interno.</span>
              </div>
            )}

            {/* GRILLA DE COMANDAS PENDIENTES */}
            {BusquedaCliente.trim() !== "" && !NoFacturable && (
               <div className="space-y-2 mt-4">
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <FileText size={12} className="text-[#147e9d]" /> Órdenes disponibles
                  </label>
                  
                  <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-slate-300 bg-slate-200/50 p-3 shadow-inner custom-scrollbar">
                      {loading ? (
                          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#147e9d]" /></div>
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
                                          ? 'border-sky-400 bg-sky-100 shadow-sm shadow-sky-900/10' 
                                          : 'border-slate-300 bg-slate-100 hover:border-sky-200 hover:bg-slate-50'
                                      }`}
                                  >
                                      <div className="flex items-center gap-4 shrink-0">
                                          <div className={`transition-colors ${seleccionado ? "text-[#147e9d]" : "text-slate-400"}`}>
                                              {seleccionado ? <CheckSquare size={24}/> : <Square size={24}/>}
                                          </div>
                                          <div>
                                              <span className="block font-mono text-lg font-black leading-none text-slate-900">Orden #{pedido.id}</span>
                                              <span className="mt-1 block text-[10px] font-medium text-slate-600">
                                                  {new Date(pedido.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short'})}
                                              </span>
                                          </div>
                                      </div>
                                      
                                      <div className="flex-1 min-w-0 px-0 sm:px-2">
                                          <div className="flex items-start gap-2 text-xs text-slate-700">
                                              <Receipt size={16} className="mt-0.5 shrink-0 text-slate-500" />
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

                                      <div className="shrink-0 font-mono text-lg font-black text-[#147e9d]">
                                          C${Number(pedido.monto).toFixed(2)}
                                      </div>
                                  </div>
                              );
                          })
                      ) : (
                          <div className="py-6 text-center text-xs italic text-slate-600">
                            No se encontraron comandas pendientes para este cliente.
                          </div>
                      )}
                  </div>
               </div>
            )}

            {/* RESUMEN DE VINCULADAS */}
            {formulario.idCliente !== 0 && !NoFacturable && (
            <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-100/50 p-4 shadow-inner animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#147e9d]">
                  <Layers size={12}/> Resumen vinculadas ({ordenesSeleccionadas.length})
                </span>
                {ordenesSeleccionadas.length > 0 && (
                  <button
                    type="button"
                    onClick={limpiarSeleccionDocumentos}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-700 transition-colors hover:text-rose-900"
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
                      className="group flex items-center justify-between rounded-xl border border-slate-300 bg-slate-100 p-3 transition-colors hover:border-sky-200"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono text-xs font-bold text-slate-700">Orden #{pedido.id}</div>
                        <div className="font-mono text-[11px] font-bold text-emerald-800">C$ {Number(pedido.monto).toFixed(2)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alternarSeleccionOrden(pedido.id)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-600">
                  Selecciona órdenes de la lista superior.
                </div>
              )}
            </div>
            )}

            {/* METADATOS FISCALES */}
            {formulario.idCliente !== 0 && !NoFacturable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-600">
                    <Calendar className="text-[#147e9d]" size={12} /> Fecha de emisión
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-300 bg-[#f3f7f9] px-3 py-2.5 font-mono text-xs text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-500/30"
                    style={{ colorScheme: "light" }}
                    value={formulario.Fecha || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormulario(prev => ({ ...prev, Fecha: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-600">
                    <CreditCard className="text-[#147e9d]" size={12} /> Método de pago
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-[#f3f7f9] px-3 py-2.5 text-xs text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-500/30"
                    value={formulario.MetodoPago}
                    onChange={(e) => setFormulario(prev => ({ ...prev, MetodoPago: e.target.value }))}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES ACCIÓN */}
          <div className="mt-6 flex gap-3 border-t border-slate-300 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-200/70 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={botonDeshabilitado}
              className={`flex-[2] py-3 rounded-xl font-black text-sm tracking-wide transition-all uppercase shadow-lg
                ${botonDeshabilitado
                  ? "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
                  : "bg-gradient-to-r from-[#147e9d] to-[#3b5bc6] text-white shadow-blue-900/15 hover:brightness-105 active:scale-[0.99]"}`}
            >
              {loading ? "PROCESANDO..." : id_factura ? "ACTUALIZAR REGISTRO" : "CONFIRMAR Y GUARDAR"}
            </button>
          </div>
        </form>

        {/* LADO DERECHO: PREVIEW TICKET DE CONSUMO */}
        <div className="flex w-full flex-col justify-between border-t border-sky-200 bg-[#dfeaf0] p-5 shadow-inner transition-all sm:p-6 md:w-80 md:border-l md:border-t-0 md:p-8">
          {ordenesSeleccionadas.length > 0 && formulario.idCliente !== 0 && !NoFacturable ? (
            <div className="space-y-4 h-full flex flex-col justify-between animate-in zoom-in-95 duration-200">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Vista previa del comprobante</h3>
                  <button
                    type="button"
                    onClick={handleDescargarPDF}
                    disabled={Exportapdf}
                    className="flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-[#147e9d] transition-colors hover:bg-sky-200"
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
            <div className="flex h-full flex-col items-center justify-center space-y-3 p-4 text-center text-slate-600">
              <div className="rounded-full border border-slate-300 bg-slate-200 p-4 text-slate-600">
                <ArrowRight size={24} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Vista previa</h4>
                <p className="mt-1 text-[11px] text-slate-600">
                  {NoFacturable 
                    ? "Bloqueado: Registro Comedor/Exporáneo exento de IVA." 
                    : "Selecciona al menos una orden para armar el ticket."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
