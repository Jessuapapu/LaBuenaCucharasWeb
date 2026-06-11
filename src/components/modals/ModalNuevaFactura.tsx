import { useState, useMemo, useRef } from "react";
import { Check, User, Search, Calendar, Trash2, Download,
   Layers, Loader2, ShieldAlert, FileText, ArrowRight, X, CreditCard} from "lucide-react";
import { useFacturaModal} from "../Hooks/hookFacturas";
//import { useClientes } from "../Hooks/hookClientes";
import type { ModalNuevaFacturaProps } from "../../interfaces/Ordenes";
import type { PayloadFactura } from "../../interfaces/Factura";
import jsPDF from "jspdf";
import html2canvas  from "html2canvas"

interface ModalFacturaExtendidoProps extends ModalNuevaFacturaProps {
  idFactura?: number; // Opcional, para activar el modo edición automáticamente
}

export default function ModalNuevaFactura({ 
  //Ordenes = [], 
  onClose, 
  onSave,
  idFactura 
}: ModalFacturaExtendidoProps) {
  
  const [BusquedaCliente, setBusquedaCliente] = useState(""); 
  //const [mostarSelector, setmostarselector] = useState(false);
  const [Exportapdf, setExportapdf]= useState(false);
  const ticketpreviwe= useRef<HTMLDivElement>(null);
//const [clienteSeleccionado, setclienteSeleccionado] = useState<number | "">("");
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
  } = useFacturaModal(BusquedaCliente, idFactura);

const NoFacturable = useMemo(() => {
    if (!BusquedaCliente) return false;
    
    // revisa si hay mayusculas o minusculas
    const nombreNormalizado = BusquedaCliente.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const esComedorOExporaneo = nombreNormalizado.includes("EXPORANEO") || nombreNormalizado.includes("comedor");
    return esComedorOExporaneo;
  }, [BusquedaCliente]);
  // Filtrado predictivo de clientes en tiempo real
  const pedidosSeleccionadosVisual = useMemo(() => {
    return pedidosPendientes.filter(p => 
      ordenesSeleccionadas.includes(p.idOrden ?? p.IdOrden)
    );
  }, [pedidosPendientes, ordenesSeleccionadas]);

  // 4. Costo promedio real por comanda vinculada
  const precioUnitario = useMemo(() => {
    const total = Number(subTotalVisual || 0);
    const cantidad = Number(ordenesSeleccionadas.length || 0);
    return cantidad > 0 ? total / cantidad : total;
  }, [subTotalVisual, ordenesSeleccionadas.length]);

  const limpiarSeleccionDocumentos = () => {
    setFormulario(prev => ({ ...prev, OrdenesSeleccion: [] }));
  };
  const handleDescargarPDF = async () => {
    if (!ticketpreviwe.current || Exportapdf) return;

    try {
      setExportapdf(true);

      const elemento = ticketpreviwe.current;
      
      // Capturamos el elemento con alta densidad de píxeles (escala 2x para evitar textos borrosos)
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF", // Forzamos fondo limpio
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Dimensiones proporcionales basadas en formato de ticket alto
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150] // Formato estandarizado de ticket térmico de 80mm
      });

      const widthPDF = pdf.internal.pageSize.getWidth();
      const heightPDF = (canvas.height * widthPDF) / canvas.width;

      // Inyectamos la captura procesada dentro del documento
      pdf.addImage(imgData, "PNG", 0, 0, widthPDF, heightPDF);
      
      // Generación de nombre descriptivo dinámico
      const nombreArchivo = `Ticket_${BusquedaCliente.replace(/\s+/g, "_") || "Consumidor_Final" || "emision"}.pdf`;
      pdf.save(nombreArchivo);

    } catch (err) {
      console.error("Error al procesar la exportación del comprobante:", err);
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

  // Botón deshabilitado si está cargando, si no hay ID de cliente válido, si no hay órdenes marcadas o si es "Comedor"
  const botonDeshabilitado = 
    loading || 
    formulario.idCliente === 0 || 
    ordenesSeleccionadas.length === 0 || 
    NoFacturable;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-slate-900 rounded-3xl text-white max-w-5xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row z-30 relative">
        
        {/* Botón de cierre */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-40"
        >
          <X size={18} />
        </button>
  
        {/* FORMULARIO DE EMISIÓN */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <header>
              <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase bg-blue-900/20 px-2.5 py-1 rounded-md font-bold">
                {idFactura ? "Modo Edición" : "Módulo de Facturación"}
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mt-2 flex items-center gap-2">
                {idFactura ? `Modificar Factura #${idFactura}` : "Emisión de Factura"}
              </h2>
            </header>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl text-center font-semibold">
                {error}
              </div>
            )}

            {/* BÚSQUEDA DEL CLIENTE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-blue-500" /> Buscar órdenes por Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-colors text-white font-medium"
                  placeholder="Escriba el nombre exacto del cliente registrado..."
                  value={BusquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={16} />
                )}
              </div>
            </div>

            {/* ALERTA CLIENTE NO FACTURABLE */}
            {NoFacturable && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl flex items-center gap-3 font-medium animate-in fade-in">
                <ShieldAlert size={20} className="shrink-0 text-amber-500" />
                <span>Este registro está catalogado como <strong>No Facturable (Comedor/Exporáneo)</strong>. Use los módulos de control interno.</span>
              </div>
            )}

            {/* TABLA DE ÓRDENES TRAÍDAS POR EL HOOK */}
            {formulario.idCliente !== 0 && !NoFacturable ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Layers size={12}/> Comandas pendientes encontradas
                  </span>
                  {ordenesSeleccionadas.length > 0 && (
                    <button
                      type="button"
                      onClick={limpiarSeleccionDocumentos}
                      className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      <Trash2 size={12} /> Limpiar Selección
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-slate-900 rounded-xl max-h-44 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
                        <th className="p-3 text-center w-12">Cobrar</th>
                        <th className="p-3 font-mono">N° Orden</th>
                        <th className="p-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                      {pedidosPendientes.map((pedido) => {
                        const idActual = pedido.idOrden ?? pedido.IdOrden;
                        const seleccionado = ordenesSeleccionadas.includes(idActual);
                        return (
                          <tr 
                            key={idActual}
                            onClick={() => alternarSeleccionOrden(idActual)}
                            className={`cursor-pointer transition-colors ${
                              seleccionado ? "bg-blue-600/10 text-white font-semibold" : "hover:bg-slate-800/50 text-slate-300"
                            }`}
                          >
                            <td className="p-3 text-center">
                              <div className={`w-4 h-4 mx-auto rounded flex items-center justify-center border transition-all ${
                                seleccionado ? "bg-blue-500 border-blue-400" : "border-slate-700 bg-slate-900"
                              }`}>
                                {seleccionado && <Check size={10} className="text-slate-950 font-black" />}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-400">
                              <span className={seleccionado ? "text-blue-400 font-bold" : ""}>Orden #{idActual}</span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              C$ {Number(pedido.monto_total ?? pedido.MontoTotal ?? 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !NoFacturable && (
                <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs space-y-2">
                  <FileText className="mx-auto text-slate-600" size={24} />
                  <p>Ingrese el nombre de un cliente válido arriba para cargar sus comandas.</p>
                </div>
              )
            )}

            {/* METADATOS FISCALES */}
            {formulario.idCliente !== 0 && !NoFacturable && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="text-blue-500" size={12} /> Emisión
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-blue-500 outline-none"
                    style={{ colorScheme: "dark" }}
                    value={formulario.Fecha || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormulario(prev => ({ ...prev, Fecha: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <CreditCard className="text-blue-500" size={12} /> Método Pago
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
                    value={formulario.MetodoPago}
                    onChange={(e) => setFormulario(prev => ({ ...prev, MetodoPago: e.target.value }))}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <FileText className="text-blue-500" size={12} /> Condición
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
                    value={formulario.CondicionPago}
                    onChange={(e) => setFormulario(prev => ({ ...prev, CondicionPago: e.target.value }))}
                  >
                    <option value="CONTADO">Contado</option>
                    <option value="CREDITO">Crédito</option>
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
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={botonDeshabilitado}
              className={`flex-[2] py-3 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg
                ${botonDeshabilitado
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-blue-500 hover:bg-blue-400 active:scale-[0.99]"}`}
            >
              {loading ? "PROCESANDO..." : idFactura ? "ACTUALIZAR REGISTRO" : "CONFIRMAR Y GUARDAR"}
            </button>
          </div>
        </form>

        {/* SECCIÓN DERECHA: PREVIEW TICKET DE CONSUMO */}
        <div className="bg-slate-950 p-6 md:p-8 w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 border-slate-800 transition-all">
          {ordenesSeleccionadas.length > 0 && formulario.idCliente !== 0 && !NoFacturable ? (
            <div className="space-y-4 h-full flex flex-col justify-between animate-in zoom-in-95 duration-200">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Vista Previa</h3>
                  <button
                    type="button"
                    onClick={handleDescargarPDF}
                    disabled={Exportapdf}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-blue-900/50 bg-blue-950/40 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300"
                  >
                    {Exportapdf ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} 
                    {Exportapdf ? "PROCESANDO..." : "PDF"}
                  </button>
                </div>

                {/* VISTA DEL TICKET TÉRMICO */}
                <div ref={ticketpreviwe} className="bg-white rounded-xl p-5 text-slate-900 shadow-xl flex flex-col justify-between min-h-[390px]">
                  <div>
                    <div className="text-[10px] font-black text-slate-800 text-center tracking-tight">BUFFET LA BUENA CUCHARA</div>
                    <div className="text-[8px] text-slate-400 text-center mb-2 leading-normal italic">
                      RUC: 0012308820012M <br /> Tel: 8452-8941
                    </div>
                    
                    <div className="space-y-1 text-[9px] font-medium text-slate-700 mt-4">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 uppercase font-bold text-[7px]">Cliente:</span>
                        <span className="font-bold text-right text-slate-900 max-w-[130px] truncate">{BusquedaCliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold text-[7px]">Fecha:</span>
                        <span className="font-mono text-slate-900 font-bold">{formulario.Fecha || new Date().toISOString().split("T")[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold text-[7px]">Condición:</span>
                        <span className="text-slate-900 font-bold">{formulario.CondicionPago} / {formulario.MetodoPago}</span>
                      </div>
                      
                      <div className="border-b border-dashed border-slate-200 my-2" />
                      
                      <span className="text-slate-400 uppercase font-bold text-[7px] block mb-1">Detalle de Cuentas:</span>
                      <div className="max-h-24 overflow-y-auto pr-0.5 space-y-1 custom-scrollbar">
                        {pedidosSeleccionadosVisual.map((pedido) => {
                          const idPed = pedido.idOrden ?? pedido.IdOrden;
                          return (
                            <div className="flex justify-between text-[9px] text-slate-800 bg-slate-50 p-1 rounded" key={idPed}>
                              <span className="font-bold">Comanda #{idPed}</span>
                              <span className="font-mono font-semibold">C$ {Number(pedido.monto_total ?? pedido.MontoTotal ?? 0).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                
                    <div className="border-b border-dashed border-slate-200 my-2" />
                    
                    <div className="text-[9px] space-y-0.5 text-slate-600 bg-slate-100/70 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Órdenes Unidas:</span>
                        <span className="font-bold text-slate-900">{ordenesSeleccionadas.length} U</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Costo Promedio:</span>
                        <span className="font-mono text-slate-950 font-bold">C$ {precioUnitario.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border-b border-dashed border-slate-200 my-2" />
                    <div className="text-center py-1">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Monto Total Neto</div>
                      <div className="text-2xl font-black text-slate-950 tracking-tight">
                        C$ {Number(subTotalVisual).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-700 p-4 space-y-3">
              <div className="p-4 rounded-full bg-slate-900 text-slate-600 border border-slate-800">
                <ArrowRight size={24} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vista Previa del Ticket</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  {NoFacturable 
                    ? "Bloqueado: Registro Comedor/Exporáneo exento de IVA." 
                    : "Selecciona al menos una orden para armar el ticket de caja."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}