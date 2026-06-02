import { useState, useMemo, useEffect } from "react";
import { Check, User, Search, Calendar, Trash2, Layers, Loader2} from "lucide-react";
import { useFactura } from "../Hooks/hookFacturas";
//import { useClientes } from "../Hooks/hookClientes";
import type { ModalNuevaFacturaProps } from "../../interfaces/Ordenes";
import type { PayloadFactura } from "../../interfaces/Factura";

interface ModalFacturaExtendidoProps extends ModalNuevaFacturaProps {
  idFacturaExistente?: number; // Opcional, para activar el modo edición automáticamente
}

export default function ModalNuevaFactura({ 
  //Ordenes = [], 
  onClose, 
  onSave,
  idFacturaExistente 
}: ModalFacturaExtendidoProps) {
  
  const [BusquedaCliente, setBusquedaCliente] = useState(""); 
  const [mostarSelector, setmostarselector] = useState(false);
  const [clienteSeleccionado, setclienteSeleccionado] = useState<number | "">("");

  //const { clientes, loading: loadingClientes, error: errorClientes } = useClientes();

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
  } = useFactura(BusquedaCliente, idFacturaExistente);

  // Sincronizar dinámicamente el conteo de cubiertos/cantidad con las órdenes seleccionadas
  useEffect(() => {
    const totalOrdenes = facturaData.idOrdenes.length;
    setFacturaData(prev => ({
      ...prev,
      Cantidad: totalOrdenes > 0 ? totalOrdenes : 1
    }));
  }, [facturaData.idOrdenes.length, setFacturaData]);

  // Filtrado predictivo de clientes en tiempo real
  const clientesFiltrados = useMemo(() => {
    if (!BusquedaCliente.trim()) return clientesCatalogo;
    return clientesCatalogo.filter(cliente =>
      cliente.NombreCliente.toLowerCase().includes(BusquedaCliente.toLowerCase())
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
    //setclienteSeleccionado(c.idCliente);
    setmostarselector(false);
    //seleccionarCliente({
     // idCliente: c.idCliente,
     // nombre_cliente: c.nombre_cliente
    //});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isFetching || facturaData.idOrdenes.length === 0|| !idClienteDetectado) return; //si no hay id, nada
    //el contrato
    const payloadFiscal: PayloadFactura = {
      IdCliente: Number(idClienteDetectado),
      Cantidad: Number(facturaData.Cantidad || 1),
      Fecha: facturaData.Fecha,
      MetodoPago: facturaData.MetodoPago || "EFECTIVO",
      CondicionPago: facturaData.CondicionPago || "CONTADO",
      tipoDocumentoOrigen: facturaData.tipoDocumentoOrigen || "ORDEN",
      MONTOTOTAL: Number(subTotalVisual || 0),
      idOrdenes: facturaData.idOrdenes,
      idContrato: facturaData.idContrato || null
    };

    guardarFactura(payloadFiscal, (data) => {
      onSave(data); // Notifica el éxito a la tabla de Control de Facturación
      onClose();    // Cierra el modal de forma limpia
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-3xl text-white max-w-4xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LADO IZQUIERDO: FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div className="space-y-5">
            <header>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                {idFacturaExistente ? "Modificar Factura" : "Emisión de Factura"}
              </h2>
              <p className="text-slate-400 text-sm">
                {idFacturaExistente ? `Editando registro fiscal de la Factura #${idFacturaExistente}` : "Emisión de comprobantes y órdenes de cobro corporativo"}
              </p>
            </header>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl text-center font-semibold animate-shake">
                {error}
              </div>
            )}
              
            {/* SELECTOR BUSCADOR PERSONALIZADO DE CLIENTE */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-blue-500" /> Selector de Cliente Relacional
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-colors text-white font-medium cursor-pointer"
                  placeholder="Haga clic para buscar o seleccionar..."
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

              {/* Dropdown flotante */}
              {mostarSelector && (
                <div className="absolute z-30 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-900 custom-scrollbar">
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
                    <div className="px-4 py-3 text-xs text-slate-500 text-center italic">Ningún cliente coincide con la búsqueda</div>
                  )}
                </div>
              )}
              {mostarSelector && (
                <div className="fixed inset-0 z-20" onClick={() => setmostarselector(false)} />
              )}
            </div>

            {/* CONTENEDOR DE DOCUMENTOS PENDIENTES */}
            {idClienteDetectado && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative z-10 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Layers size={12}/> Órdenes Activas en Sistema
                  </span>
                  {facturaData.idOrdenes.length > 0 && (
                    <button
                      type="button"
                      onClick={limpiarSeleccionDocumentos}
                      className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      <Trash2 size={12} /> Limpiar Todo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {isFetching ? (
                    <div className="col-span-2 text-center py-4 text-xs text-slate-500 font-medium">Buscando órdenes en tiempo real...</div>
                  ) : pedidosPendientes.length > 0 ? (
                    pedidosPendientes.map((pedido) => {
                      const activo = facturaData.idOrdenes.includes(pedido.idOrden);
                      return (
                        <button
                          key={pedido.idOrden}
                          type="button"
                          onClick={() => alternarSeleccionPedido(pedido)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            activo
                              ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-950/40"
                              : "border-slate-800 bg-slate-900 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-mono text-xs font-black text-slate-300">N° {pedido.idOrden}</span>
                            {activo && <Check size={14} className="text-blue-400 font-black" />}
                          </div>
                          <div className="text-sm mt-2 text-emerald-400 font-extrabold font-mono">
                            C$ {Number(pedido.monto_total).toFixed(2)}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-4 text-xs text-slate-500 italic">El cliente no registra órdenes pendientes</div>
                  )}
                </div>
              </div>
            )}

            {/* FILA DE PARÁMETROS: FECHA DE EMISIÓN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="text-blue-500" size={12} /> Fecha de Emisión Fiscal
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 text-slate-500 pointer-events-none" size={16} />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-colors text-slate-200 font-mono"
                  style={{ colorScheme: "dark" }}
                  value={facturaData.Fecha}
                  onChange={(e) => setFacturaData(prev => ({ ...prev, Fecha: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* BOTONES DE FLUJO */}
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
              disabled={loading || isFetching || !idClienteDetectado || facturaData.idOrdenes.length === 0}
              className={`flex-[2] py-3 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg
                ${loading || isFetching || facturaData.idOrdenes.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-blue-500 hover:bg-blue-400 shadow-blue-950/20 active:scale-[0.99]"}`}
            >
              {loading ? "PROCESANDO..." : idFacturaExistente ? "ACTUALIZAR REGISTRO" : "CONFIRMAR FACTURA"}
            </button>
          </div>
        </form>

        {/* PREVIEW TICKET DE FACTURA */}
        <div className="bg-slate-950 p-6 md:p-8 w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 border-slate-800">
          <div>
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 text-center">Vista Previa Factura</h3>
            
            <div className="bg-white rounded-xl p-5 text-slate-900 shadow-xl flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="text-[10px] font-black text-slate-800 text-center tracking-tight">BUFFET LA BUENA CUCHARA</div>
                <div className="text-[8px] text-slate-400 text-center mb-4 leading-normal italic">
                  RUC: 0012308820012M <br /> Tel: 7799-1489
                </div>
                
                <div className="space-y-1 text-[9px] font-medium text-slate-700">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400 uppercase font-bold text-[7px]">Cliente:</span>
                    <span className="font-bold text-right text-slate-900 max-w-[130px] truncate">
                      {facturaData.nombreCliente || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[7px]">Fecha Fiscal:</span>
                    <span className="font-mono text-slate-900 font-bold">{facturaData.Fecha || "AAAA-MM-DD"}</span>
                  </div>
                  
                  <div className="border-b border-dashed border-slate-200 my-2" />
                  
                  <span className="text-slate-400 uppercase font-bold text-[7px] block mb-1">Órdenes Vinculadas:</span>
                  <div className="max-h-24 overflow-y-auto pr-0.5 space-y-1 custom-scrollbar">
                    {pedidosSeleccionados.length > 0 ? (
                      pedidosSeleccionados.map((pedido) => (
                        <div className="flex justify-between text-[9px] text-slate-800 bg-slate-50 p-1 rounded animate-fade-in" key={pedido.idOrden}>
                          <span className="font-bold">N° {pedido.idOrden}</span>
                          <span className="font-mono font-semibold">C$ {Number(pedido.monto_total).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[8px] text-slate-400 italic text-center py-2">Ninguna orden seleccionada</div>
                    )}
                  </div>
                </div>
                
                <div className="border-b border-dashed border-slate-200 my-2" />
                
                {/* Desglose Unitario Real */}
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
                    {idFacturaExistente ? "EDITANDO" : "GENERADA"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[9px] text-slate-600 mt-4 text-center italic leading-tight">
            Verifique las órdenes cargadas antes de autorizar el cobro fiscal en el sistema.
          </p>
        </div>

      </div>
    </div>
  );
}