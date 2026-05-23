import { useState, useMemo } from "react";
import { Check, User, Search, Calendar, Hash } from "lucide-react";
import { useFactura } from "../Hooks/hookFacturas";

interface PedidosOrdenes{
  //id_pedidoOrden: number;
  id_Pedido: number;
  id_Orden: number;
  nombreCliente: string | "";
}
interface ClienteOption {
    nombre: string;
    [key: string]: any; 
}

interface ModalNuevaFacturaProps {
  Ordenes?: PedidosOrdenes[];
  onClose: () => void;
  onSave: (nueva: any) => void;
}

//type TipoRegistro = "Orden" | "Contrato";

export default function ModalNuevaFactura({ Ordenes= [], onClose, onSave }: ModalNuevaFacturaProps) {
  const [idPedido, setIdPedido] = useState<number | "">("");
  const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
  const [BusquedaCliente, setBusquedaCliente] = useState(""); 
  const [SugerenciaCliente, setSugerenciaCliente]= useState(true);
  const [clienteSeleccionado, setclienteSeleccionado]= useState<String | null>(null);

  //Utilizando el hook
  const {
    facturaData,
    setFacturaData,
    loading,
    isFetching,
    error,
    guardarFactura
  } = useFactura(idPedido);

  // 

  // Filtrado predictivo de clientes en tiempo real
  const clientesFiltrados = useMemo(() => {
    if (!BusquedaCliente.trim()) return listaClientes;
    return listaClientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(BusquedaCliente.toLowerCase())
    );
  }, [BusquedaCliente, listaClientes]);

  // Filtrado automático de pedidos vigentes basados en el cliente seleccionado
  const pedidosVigentesCliente = useMemo(() => {
    if (!clienteSeleccionado) return [];
    
    // Filtramos los pedidos que coincidan con el cliente seleccionado
    return Ordenes.filter(pedido => 
      pedido.nombreCliente?.toLowerCase() === clienteSeleccionado.toLowerCase() ||
      clienteSeleccionado === "Cliente General Comedor" // Si es venta general, se muestran todos los disponibles
    );
  }, [clienteSeleccionado, Ordenes]);

  // Cálculo matemático del precio unitario de los platillos consumidos
  const precioUnitario = useMemo(() => {
    const total = Number(facturaData.subTotal || 0);
    const cantidad = Number(facturaData.Cantidad || 0);
    return cantidad > 0 ? total / cantidad : 0;
  }, [facturaData.subTotal, facturaData.Cantidad]);
  const handleSeleccioncliente = (nombre: string) => {
    setBusquedaCliente(nombre);
    setSugerenciaCliente(false);
    setIdPedido(""); //se reseta cuaalquier seleccion previa para que elija un pedido nuevo
    setFacturaData(prev=> ({...prev, nombreCliente: nombre}))
  };

  // ejecuta el método del hook
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!idPedido) return;
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
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Facturacion</h2>
            <p className="text-slate-400 text-sm">Selecciona el tipo de facturación manual</p>
          </header>

          {/* Alerta de error si el hook no encuentra la orden*/}
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BUSCADOR PREDICTIVO DE CLIENTES */}
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} className="text-amber-500" /> Nombre del cliente
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none text-sm transition-colors text-white"
                    placeholder="Escriba el nombre para buscar..."
                    value={BusquedaCliente}
                    onChange={(e) => {
                      setBusquedaCliente(e.target.value);
                      setSugerenciaCliente(true);
                      setclienteSeleccionado(null); // Resetea la confirmación hasta elegir del dropdown
                      setFacturaData(prev => ({ ...prev, nombreCliente: e.target.value }));
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
                        onClick={() => handleSeleccioncliente(cliente.nombre)}
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
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2.5">
                    Pedidos pendientes de {clienteSeleccionado}
                  </span>
                  
                  {pedidosVigentesCliente.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {pedidosVigentesCliente.map((pedido) => (
                        <button
                          key={pedido.id_Pedido}
                          type="button"
                          onClick={() => setIdPedido(pedido.id_Pedido)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-16 ${
                            idPedido === pedido.id_Pedido
                              ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow"
                              : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-mono font-bold">Pedido: #{pedido.id_Pedido}</span>
                            {idPedido === pedido.id_Pedido && <Check size={14} className="text-amber-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">Orden Ref: {pedido.id_Orden}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">
                      No hay pedidos de buffet pendientes de facturar para este cliente.
                    </p>
                  )}
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
                  value={facturaData.Fecha || ""} 
                  onChange={e => setFacturaData(prev => ({ ...prev, Fecha: e.target.value }))} 
                  required 
                />
              </div>

            </form>

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
              disabled={loading || isFetching || !idPedido} 
              className={`flex-[2] py-3 rounded-xl font-black text-sm text-slate-950 tracking-wide transition-all uppercase shadow-lg
                ${loading || isFetching || !idPedido
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none" 
                  : "bg-amber-400 hover:bg-amber-300 shadow-amber-950/20 active:scale-[0.99]"}`}
            >
              {loading ? "PROCESANDO..." : "CONFIRMAR FACTURA"}
            </button>
          </div>
          </div>
          </div>
        </div>


        {/* LADO DERECHO: PREVIEW VISUAL */}
        <div className="bg-slate-950 p-8 w-full md:w-80 flex flex-col">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-6 text-center">Vista Previa Factura</h3>
          
          <div className="bg-white rounded-lg p-6 text-slate-900 shadow-xl relative overflow-hidden flex-1">
            
            <div className="text-[10px] font-bold text-slate-400 mb-4 italic"> BUFFETE LA BUENA CUCHARA</div>
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
                    {facturaData.nombreCliente || "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[7px]">Fecha:</span>
                  <span className="font-mono text-slate-900">{facturaData.Fecha || "AAAA-MM-DD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[7px]">Orden Ref:</span>
                  <span className="font-bold text-slate-900">#{idPedido || "000"}</span>
                </div>
              </div>
              <div className="border-b border-dashed border-slate-200 my-3" />

              {/* Detalle Unitario en Ticket */}
              <div className="text-[9px] space-y-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <div className="flex justify-between">
                  <span>Cant. Platos:</span>
                  <span className="font-bold text-slate-900">{facturaData.subTotal || 0} U</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio/U:</span>
                  <span className="font-mono text-slate-950 font-bold">C$ {precioUnitario.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-200 my-2" />

              {/* Bloque Total Neto Único */}
              <div className="my-auto py-1.5 text-center">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Monto Total</div>
                <div className="text-2xl font-black text-slate-950 tracking-tight">
                  C$ {Number(facturaData.subTotal || 0).toFixed(2)}
                </div>
                <div className="text-[7px] text-slate-400 uppercase font-bold mt-0.5">Moneda: Córdobas</div>
              </div>

            <div className="mt-auto pt-4 flex justify-center">
               <div className={`text-[10px] font-bold px-3 py-1 rounded-full "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                 GENERADA
               </div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-600 mt-6 text-center italic">
            Esta es una representación visual antes de guardar.
          </p>
        </div>
      </div>
  );
}