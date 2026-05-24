import { useState, useMemo } from "react";
import { Check, User, Search, Calendar, Trash2} from "lucide-react";
import { useFactura } from "../Hooks/hookFacturas";

interface ClienteOption {
    idCliente: number;
    nombre: string;
    [key: string]: any; 
}

interface ModalNuevaFacturaProps {
  Ordenes?: ClienteOption[];
  onClose: () => void;
  onSave: (nueva: any) => void;
}

//type TipoRegistro = "Orden" | "Contrato";

export default function ModalNuevaFactura({ Ordenes= [], onClose, onSave }: ModalNuevaFacturaProps) {
  //const [idPedido, setIdPedido] = useState<number | "">("");
  //const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
  const [BusquedaCliente, setBusquedaCliente] = useState(""); 
  const [SugerenciaCliente, setSugerenciaCliente]= useState(true);
  const [clienteSeleccionado, setclienteSeleccionado]= useState<number | "">("");

  //Utilizando el hook
  const {
    facturaData,
        setFacturaData,
        seleccionarCliente,
        pedidosPendientes,
        setPedidosPendientes,
        contratosActivos,
        setContratosActivos,
        alternarSeleccionPedido,
        seleccionarContrato,
        limpiarSeleccionDocumentos,
        pedidosSeleccionados,
        loading,
        isFetching,
        error,
        guardarFactura
  } = useFactura(clienteSeleccionado);


  // Filtrado predictivo de clientes en tiempo real
  const clientesFiltrados = useMemo(() => {
    if (!BusquedaCliente.trim()) return Ordenes;
    return Ordenes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(BusquedaCliente.toLowerCase())
    );
  }, [BusquedaCliente, Ordenes]);

  const totalPlatillos =
      useMemo(() => {

        return pedidosSeleccionados.reduce((acc, pedido) => {
            const totalPedido = pedido.Detalles?.reduce((sum, detalle) =>sum + detalle.cantidad, 0) || 0;
            return acc + totalPedido;
          },
          0
        );
      }, [pedidosSeleccionados]);


  // Cálculo matemático del precio unitario de los platillos consumidos
  const precioUnitario = useMemo(() => {
    const total = Number(facturaData?.subTotal || 0);
    const cantidad = Number(facturaData?.Cantidad || 0);
    return cantidad > 0 ? total / cantidad : 0;
  }, [facturaData?.subTotal, facturaData?.Cantidad]);
  
  const handleSeleccioncliente = (cliente: ClienteOption) => {
    setBusquedaCliente(cliente.nombre);
    setclienteSeleccionado(cliente.idCliente);
    setSugerenciaCliente(false);
    seleccionarCliente(cliente.idCliente,
        cliente.nombre,
        cliente.direccion || "")
  };

  // ejecuta el método del hook
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    guardarFactura((data) => {
      onSave(data); // Notifica el éxito a la tabla principal
      onClose();    // Cierra el modal
    });
  };

  return (
     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl text-white max-w-4xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LADO IZQUIERDO: FORMULARIO */}
        <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <header className="mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Facturación</h2>
              <p className="text-slate-400 text-sm">Selecciona el tipo de facturación manual</p>
            </header>

            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl text-center font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* BUSCADOR PREDICTIVO DE CLIENTES */}
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} className="text-blue-500" /> Nombre del cliente
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-colors text-white"
                    placeholder="Escriba el nombre para buscar..."
                    value={BusquedaCliente}
                    onChange={(e) => {
                      setBusquedaCliente(e.target.value);
                      setSugerenciaCliente(true);
                    }}
                    onFocus={() => setSugerenciaCliente(true)}
                    required
                  />
                </div>

                {/* Dropdown flotante de sugerencias */}
                {SugerenciaCliente && clientesFiltrados.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-40 overflow-y-auto divide-y divide-slate-900">
                    {clientesFiltrados.map((cliente, i) => (
                      <div
                        key={i}
                        onClick={() => handleSeleccioncliente(cliente)}
                        className="px-4 py-2 text-sm text-slate-300 hover:bg-amber-500 hover:text-slate-950 cursor-pointer font-medium transition-colors"
                      >
                        {cliente.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECUADRO DE PEDIDOS VIGENTES ENCONTRADOS */}
              {clienteSeleccionado && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pedidos pendientes
                  </span>
                  {facturaData.idOrdenes.length > 0 && (
                    <button
                      type="button"
                      onClick={limpiarSeleccionDocumentos}
                      className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pedidosPendientes.map(pedido => {
                    const activo =facturaData.idOrdenes.includes(pedido.id_pedido);
                    return (
                      <button
                        key={pedido.id_pedido}
                        type="button"
                        onClick={() =>
                          alternarSeleccionPedido(pedido)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          activo
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-sm font-bold">#
                            {pedido.id_pedido}
                          </span>
                          {activo && (
                            <Check
                              size={14}
                              className="text-amber-400"
                            />
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          📅 {pedido.fecha}
                        </div>
                        <div className="text-xs mt-1 text-amber-400 font-bold">C$
                          {Number(pedido.monto_total).toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* FILA DE PARÁMETROS: FECHA DE EMISIÓN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} /> Fecha de Facturación
                </label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none text-sm transition-colors text-slate-200 font-mono" 
                  value={facturaData?.Fecha || ""} 
                  onChange={e => setFacturaData(prev => ({ ...prev, Fecha: e.target.value }))} 
                  required 
                />
              </div>
            </form>
          </div>

          {/* BOTONES DE FLUJO */}
          <div className="flex gap-3 pt-6 border-t border-slate-800/60 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || isFetching  || !BusquedaCliente.trim()} 
              className={`flex-[2] py-3 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg
                ${loading || isFetching
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none" 
                  : "bg-blue-500 hover:bg-blue-300 shadow-blue-950/20 active:scale-[0.99]"}`}
            >
              {loading ? "PROCESANDO..." : "CONFIRMAR FACTURA"}
            </button>
          </div>
        </div>

        {/* LADO DERECHO: PREVIEW VISUAL */}
        <div className="bg-slate-950 p-8 w-full md:w-80 flex flex-col">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-6 text-center">Vista Previa Factura</h3>
          
          <div className="bg-white rounded-lg p-6 text-slate-900 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-4 italic">BUFFET LA BUENA CUCHARA</div>
              <div className="gap-2 mb-4">
                <p className="text-[10px] mt-1 text-slate-400 italic">Dirección: De donde fue el Cine Blanco 2 ½ c. Oeste</p>
                <p className="text-[10px] text-slate-400 italic">E-mail: BufetteLaBuenaCuchara@hotmail.com</p>
                <p className="text-[10px] text-slate-400 italic">Cel.: 7799-1489</p>
                <p className="text-[10px] text-slate-400 italic">RUC: 0012308820012M</p>
              </div>
              
              {/* Info Sincronizada */}
              <div className="space-y-1.5 text-[9px] font-medium text-slate-700">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 uppercase font-bold text-[7px]">Cliente:</span>
                  <span className="font-bold text-right text-slate-900 max-w-[120px] break-words">
                    {facturaData?.nombreCliente || "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[7px]">Fecha:</span>
                  <span className="font-mono text-slate-900">{facturaData?.Fecha || "AAAA-MM-DD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[7px]">Orden Ref:</span>
                  {pedidosSeleccionados.map(
                    pedido => (
                    <div className="flex justify-between text-sm mb-2" key={pedido.id_pedido}>
                      <div>
                        <div className="font-semibold">Pedido #
                          {pedido.id_pedido}
                        </div>
                        <div className="text-xs text-slate-400">
                          {pedido.fecha}
                        </div>
                      </div>
                      <span className="font-bold">C${Number(pedido.monto_total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {facturaData.idContrato && (
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Contrato #
                        {facturaData.idContrato}
                      </span>
                      <span className="font-bold">C${Number(facturaData.subTotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
	
              <div className="border-b border-dashed border-slate-200 my-3" />
              {/* Detalle Unitario en Ticket*/}
              <div className="text-[9px] space-y-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <div className="flex justify-between">
                  <span>Cant. Platos:</span>
                  <span className="font-bold text-slate-900">{facturaData?.Cantidad || 0} U</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio/U:</span>
                  <span className="font-mono text-slate-950 font-bold">C$ {precioUnitario.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-200 my-2" />

              {/* Bloque Total Neto Único */}
              <div className="py-1.5 text-center">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Monto Total</div>
                <div className="text-2xl font-black text-slate-950 tracking-tight">
                  C$ {Number(facturaData?.subTotal || 0).toFixed(2)}
                </div>
                <div className="text-[7px] text-slate-400 uppercase font-bold mt-0.5">Moneda: Córdobas</div>
              </div>
            </div>

            {/* CORREGIDO: Sintaxis limpia del badge */}
            <div className="pt-4 flex justify-center">
              <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                GENERADA
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-600 mt-6 text-center italic">
            Esta es una representación visual antes de guardar.
          </p>
        </div>
        </div>
      </div>
  );
}