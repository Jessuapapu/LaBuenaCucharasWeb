import { useState, useMemo, useEffect, useRef } from "react";
import { Check, User, Search, Calendar, Trash2, Download,
   Layers, Loader2, ShieldAlert, FileText, ArrowRight, X, CreditCard} from "lucide-react";
import { useFactura } from "../Hooks/hookFacturas";
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
  const [mostarSelector, setmostarselector] = useState(false);
  const [Exportapdf, setExportapdf]= useState(false);
  const ticketpreviwe= useRef<HTMLDivElement>(null);
//const [clienteSeleccionado, setclienteSeleccionado] = useState<number | "">("");

  // Utilizando nuestro hook optimizado (Soporta creación y edición automática)
  const {
    facturaData,
    setFacturaData,
    subTotalVisual,
    //seleccionarCliente,
    pedidosPendientes,
    alternarSeleccionPedido,
    limpiarSeleccionDocumentos,
    pedidosSeleccionados,
    loading,
    isFetching,
    error,
    guardarFactura,
    clientesCatalogo,
    idClienteDetectado
  } = useFactura(BusquedaCliente, idFactura);

  // Sincronizar dinámicamente el conteo de cubiertos/cantidad con las órdenes seleccionadas
//useEffect(() => {
 // const totalOrdenes = facturaData.idOrdenes.length;
 // setFacturaData(prev => ({
  //  ...prev,
 //   Cantidad: totalOrdenes > 0 ? totalOrdenes : 1
 // }));
//}, [facturaData.idOrdenes.length, setFacturaData]);

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
  const clientesFiltrados = useMemo(() => {
    if (!BusquedaCliente.trim()) return clientesCatalogo;
    return clientesCatalogo.filter(cliente =>
      cliente.NombreCliente?.toLowerCase().includes(BusquedaCliente.toLowerCase())
    );
  }, [BusquedaCliente, clientesCatalogo]);

  // Cálculo matemático del precio promedio real por orden vinculada
  const precioUnitario = useMemo(() => {
    const total = Number(subTotalVisual || 0);
    const cantidad = Number(facturaData?.idOrdenes.length || 0);
    return cantidad > 0 ? total / cantidad : total;
  }, [subTotalVisual, facturaData?.idOrdenes.length]);
  
  const handleSeleccioncliente = (nombreCliente: string) => {
    setBusquedaCliente(nombreCliente);
    limpiarSeleccionDocumentos()
    //setclienteSeleccionado(c.idCliente);
    setmostarselector(false);
    //seleccionarCliente({
     // idCliente: c.idCliente,
     // nombre_cliente: c.nombre_cliente
    //});
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
      const nombreArchivo = `Ticket_${facturaData.nombreCliente?.replace(/\s+/g, "_") || "Consumidor_Final"}_${facturaData.Fecha || "emision"}.pdf`;
      pdf.save(nombreArchivo);

    } catch (err) {
      console.error("Error al procesar la exportación del comprobante:", err);
    } finally {
      setExportapdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idClienteDetectado || loading || isFetching) return;
    
    // Validación de documentos seleccionados según el origen
    if (facturaData.tipoDocumentoOrigen === "ORDEN" && facturaData.idOrdenes.length === 0) {
      alert("Debes seleccionar al menos una orden para facturar.");
      return;
    }
    if (facturaData.tipoDocumentoOrigen === "CONTRATO" && !facturaData.idContrato) {
      alert("Debes asociar un contrato activo.");
      return;
    }

    const payloadFiscal: PayloadFactura = {
      IdCliente: Number(idClienteDetectado),
      Cantidad: Number(facturaData.Cantidad),
      Fecha: facturaData.Fecha,
      MetodoPago: facturaData.MetodoPago,
      CondicionPago: facturaData.CondicionPago,
      tipoDocumentoOrigen: facturaData.tipoDocumentoOrigen,
      MONTOTOTAL: Number(subTotalVisual),
      idOrdenes: facturaData.idOrdenes,
      idContrato: facturaData.idContrato
    };

    guardarFactura(payloadFiscal, (respuesta) => {
      onSave(respuesta); 
      onClose();    
    });
  };
  const botonDeshabilitado = 
    loading || 
    isFetching || 
    !idClienteDetectado || 
    facturaData.idOrdenes.length === 0 || 
    NoFacturable;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Capa trasera para cerrar el selector de clientes al hacer clic fuera */}
      {mostarSelector && (
        <div className="fixed inset-0 z-20" onClick={() => setmostarselector(false)} />
      )}
      
      <div className="bg-slate-900 rounded-3xl text-white max-w-5xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row z-30 transition-all duration-500 relative">
        
        {/* Botón de cierre absoluto en la esquina superior derecha */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-40"
        >
          <X size={18} />
        </button>
  
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

            {/* SELECCIÓN DEL CLIENTE */}
            <div className="space-y-2 relative z-40">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-blue-500" /> Selección de cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-colors text-white font-medium"
                  placeholder="Escriba o haga clic para desplegar catálogo de clientes..."
                  value={BusquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setmostarselector(true);
                  }}
                  onFocus={() => setmostarselector(true)}
                />
                {isFetching && (
                  <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={16} />
                )}
              </div>

              {/* Dropdown de Clientes */}
              {mostarSelector && (
                <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-900 custom-scrollbar">
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((cliente) => (
                      <div
                        key={cliente.IdCliente}
                        onClick={() => handleSeleccioncliente(cliente.NombreCliente)}
                        className="px-4 py-3 text-sm text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer font-medium transition-colors flex justify-between items-center"
                      >
                        <span>{cliente.NombreCliente}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md font-mono">ID: {cliente.IdCliente}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500 text-center italic">Ningún cliente coincide con los registros</div>
                  )}
                </div>
              )}
            </div>

            {/* ALERTA DE BLOQUEO DE FACTURACIÓN */}
            {NoFacturable && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl flex items-center gap-3 font-medium animate-in fade-in">
                <ShieldAlert size={20} className="shrink-0 text-amber-500" />
                <span>Este cliente está marcado como <strong>No Facturable (Comedor/Exporáneo)</strong>. Use los registros de control interno para su gestión.</span>
              </div>
            )}

            {/* CONTENEDOR DE DOCUMENTOS PENDIENTES */}
            {idClienteDetectado && !NoFacturable ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Layers size={12}/> Seleccione las Órdenes a Facturar
                  </span>
                  {facturaData.idOrdenes.length > 0 && (
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
                        <th className="p-3 text-center w-12">Estado</th>
                        <th className="p-3 font-mono">N° Orden</th>
                        <th className="p-3 text-right">Monto Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                      {pedidosPendientes.length > 0 ? (
                        pedidosPendientes.map((pedido) => {
                          const seleccionado = facturaData.idOrdenes.includes(pedido.idOrden);
                          return (
                            <tr 
                              key={pedido.idOrden}
                              onClick={() => alternarSeleccionPedido(pedido)}
                              className={`cursor-pointer transition-colors ${
                                seleccionado 
                                  ? "bg-blue-600/10 text-white font-semibold" 
                                  : "hover:bg-slate-800/50 text-slate-300"
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
                                <span className={seleccionado ? "text-blue-400 font-bold" : ""}>Orden #{pedido.idOrden}</span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-400">
                                C$ {Number(pedido.monto_total).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-6 text-slate-500 italic">El cliente no registra órdenes pendientes de cobro</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !NoFacturable && (
                <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs space-y-2">
                  <FileText className="mx-auto text-slate-600" size={24} />
                  <p>Debe seleccionar un cliente del catálogo para cargar sus cuentas pendientes.</p>
                </div>
              )
            )}

            {/* DATOS COMPLEMENTARIOS FISCALES (FECHA, MÉTODO Y CONDICIÓN) */}
            {idClienteDetectado && !NoFacturable && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="text-blue-500" size={12} /> Emisión
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-blue-500 outline-none"
                    style={{ colorScheme: "dark" }}
                    value={facturaData.Fecha || ""}
                    onChange={(e) => setFacturaData(prev => ({ ...prev, Fecha: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <CreditCard className="text-blue-500" size={12} /> Método Pago
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
                    value={facturaData.MetodoPago}
                    onChange={(e) => setFacturaData(prev => ({ ...prev, MetodoPago: e.target.value }))}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <FileText className="text-blue-500" size={12} /> Condición
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
                    value={facturaData.CondicionPago}
                    onChange={(e) => setFacturaData(prev => ({ ...prev, CondicionPago: e.target.value }))}
                  >
                    <option value="Contado">Contado</option>
                    <option value="Crédito">Crédito</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
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
                  : "bg-blue-500 hover:bg-blue-400 shadow-blue-950/20 active:scale-[0.99]"}`}
            >
              {loading ? "PROCESANDO..." : idFactura ? "ACTUALIZAR REGISTRO" : "CONFIRMAR Y GUARDAR"}
            </button>
          </div>
        </form>

        {/* PREVIEW TICKET DE FACTURA */}
        <div className="bg-slate-950 p-6 md:p-8 w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 border-slate-800 transition-all">
          {facturaData.idOrdenes.length > 0 && idClienteDetectado && !NoFacturable ? (
            <div className="space-y-4 h-full flex flex-col justify-between animate-in zoom-in-95 duration-200">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Vista Previa</h3>
                  <button
                    type="button"
                    onClick={handleDescargarPDF}
                    disabled={Exportapdf}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all border border-blue-900/50 bg-blue-950/40 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300"
                  >
                    {Exportapdf ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> PROCESANDO...
                      </>
                    ) : (
                      <>
                        <Download size={12} /> IMPRIMIR PDF
                      </>
                    )}
                  </button>
                </div>

                {/* NODO DEL TICKET */}
                <div ref={ticketpreviwe} className="bg-white rounded-xl p-5 text-slate-900 shadow-xl flex flex-col justify-between min-h-[390px]">
                  <div>
                    <div className="text-[10px] font-black text-slate-800 text-center tracking-tight">BUFFET LA BUENA CUCHARA</div>
                    <div className="text-[8px] text-slate-400 text-center mb-2 leading-normal italic">
                      RUC: 0012308820012M <br /> Tel: 8452-8941
                    </div>
                    <div className="text-[7px] text-slate-400 text-center mb-1 leading-normal italic">De donde fue el cine blanco 2 1/2 c. Oeste</div>
                    <div className="text-[7px] text-slate-400 text-center mb-4 leading-normal italic">BufetteLaBuenaCuchara@hotmail.com</div>
                    
                    <div className="space-y-1 text-[9px] font-medium text-slate-700">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 uppercase font-bold text-[7px]">Cliente:</span>
                        <span className="font-bold text-right text-slate-900 max-w-[130px] truncate">
                          {facturaData.nombreCliente || BusquedaCliente || "---"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold text-[7px]">Fecha Fiscal:</span>
                        <span className="font-mono text-slate-900 font-bold">{facturaData.Fecha || "AAAA-MM-DD"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold text-[7px]">T. Pago:</span>
                        <span className="text-slate-900 font-bold">{facturaData.CondicionPago} / {facturaData.MetodoPago}</span>
                      </div>
                      
                      <div className="border-b border-dashed border-slate-200 my-2" />
                      
                      <span className="text-slate-400 uppercase font-bold text-[7px] block mb-1">Órdenes Vinculadas:</span>
                      <div className="max-h-24 overflow-y-auto pr-0.5 space-y-1 custom-scrollbar">
                        {pedidosSeleccionados.map((pedido) => (
                          <div className="flex justify-between text-[9px] text-slate-800 bg-slate-50 p-1 rounded" key={pedido.idOrden}>
                            <span className="font-bold">N° {pedido.idOrden}</span>
                            <span className="font-mono font-semibold">C$ {Number(pedido.monto_total).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                
                    <div className="border-b border-dashed border-slate-200 my-2" />
                    
                    <div className="text-[9px] space-y-0.5 text-slate-600 bg-slate-100/70 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Órdenes Unidas:</span>
                        <span className="font-bold text-slate-900">{facturaData.idOrdenes.length} U</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Costo Promedio/U:</span>
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
                      <div className="text-[6px] text-slate-400 uppercase">Córdobas (NIO)</div>
                    </div>

                    <div className="pt-3 flex justify-center">
                      <div className="text-[9px] font-black px-3 py-0.5 rounded-full bg-green-100 text-green-700 tracking-wide uppercase">
                        {idFactura ? "MODIFICACIÓN" : "LISTO PARA COBRO"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-slate-600 text-center italic leading-tight">
                Verifique las órdenes cargadas antes de autorizar el cobro fiscal en el sistema.
              </p>
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
                    ? "Bloqueado: El cliente seleccionado no permite facturación legal." 
                    : "El ticket se generará automáticamente cuando asigne una orden al cliente."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}