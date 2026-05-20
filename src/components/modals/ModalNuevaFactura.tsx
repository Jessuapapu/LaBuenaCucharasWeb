import { useState } from "react";
import { FileText, ClipboardList, DollarSign, Package } from "lucide-react";
import { useFactura } from "../Hooks/hookFacturas";

interface PedidosOrdenes{
  //id_pedidoOrden: number;
  id_Pedido: number;
  id_Orden: number;
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

type TipoRegistro = "Orden" | "Contrato";

export default function ModalNuevaFactura({ onClose, onSave }: ModalNuevaFacturaProps) {
  const [tipo, setTipo] = useState<TipoRegistro>("Orden");
  const [idPedido, setIdPedido] = useState<number | "">("");
  const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
  const [nombreCliente, setNombreCliente] = useState(""); 

  //Utilizando el hook
  const {
    facturaData,
    setFacturaData,
    loading,
    isFetching,
    error,
    guardarFactura
  } = useFactura(idPedido, tipo);

  // Limpiar el ID si el usuario cambia de pestaña para evitar jalar datos viejos
  const handleCambioTipo = (nuevoTipo: TipoRegistro) => {
    setTipo(nuevoTipo);
    setIdPedido("");
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
        <div className="p-8 flex-1 border-r border-slate-800">
          <header className="mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Facturacion</h2>
            <p className="text-slate-400 text-sm">Selecciona el tipo de facturación manual</p>
          </header>

          {/* SELECTOR DE TIPO */}
          <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl mb-8">
            <button 
              onClick={() => setTipo("Orden")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tipo === "Orden" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <ClipboardList size={18} /> Orden
            </button>
            <button 
              onClick={() => setTipo("Contrato")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tipo === "Contrato" ? "bg-blue-400 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <FileText size={18} /> Contrato
            </button>
          </div>
          {/* Alerta de error si el hook no encuentra el ID */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm text-gray-300 mb-1">Cliente</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        value={nombreCliente} 
                        onChange={(e) => setNombreCliente(e.target.value)} 
                        required
                      >
                      <option value="">-- Seleccionar Cliente --</option>
                        {listaClientes.map((c, i) => (
                          <option key={i} value={c.nombre}>
                            {c.nombre}
                          </option>
                            ))}
                      </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID {tipo}</label>
                <input type="number" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={idPedido} onChange={e => setIdPedido(e.target.value === "" ? "": Number(e.target.value))} required placeholder="000" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto Total</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input type="number" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={facturaData.MontoTotal} onChange={e => setFacturaData(prev=>({...prev, MontoTotal:e.target.value === "" ? "": Number(e.target.value)}))} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cantidad Items</label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input type="number" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={facturaData.CantidadTotal} onChange={e => setFacturaData(prev=>({...prev, CantidadTotal:e.target.value === "" ? "": Number(e.target.value)}))} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha</label>
                <div className="relative">
                  <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={facturaData.Fecha} onChange={e => setFacturaData(prev=>({...prev, Fecha:e.target.value}))} required />
                </div>
                
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold transition-colors">Cerrar</button>
              <button type="submit" disabled={loading || isFetching} className={`flex-[2] py-4 rounded-2xl font-black transition-all ${tipo === "Orden" ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-400 hover:bg-blue-300"}`}>
                {loading ? "PROCESANDO..." : `GENERAR ${tipo.toUpperCase()}`}
              </button>
            </div>
          </form>
        </div>

        {/* LADO DERECHO: PREVIEW VISUAL */}
        <div className="bg-slate-950 p-8 w-full md:w-80 flex flex-col">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-6 text-center">Vista Previa Factura</h3>
          
          <div className="bg-white rounded-lg p-6 text-slate-900 shadow-xl relative overflow-hidden flex-1">
            <div className={`absolute top-0 left-0 w-full h-1 ${tipo === "Orden" ? "bg-blue-500" : "bg-blue-300"}`} />
            
            <div className="text-[10px] font-bold text-slate-400 mb-4 italic"> BUFFETE LA BUENA CUCHARA</div>
            <div className="gap-2 mb-4">
            <p className="text-[10px] mt-1 text-slate-400 italic">Dirección: De donde fue el Cine Blanco 2 ½ c. Oeste</p>
            <p className="text-[10px] text-slate-400 italic">E-mail: BufetteLaBuenaCuchara@hotmail.com</p>
            <p className="text-[10px] text-slate-400 italic">Cel.: 7799-1489</p>
            <p className="text-[10px] text-slate-400 italic">RUC: 0012308820012M</p>
            </div>
            
            
            <div className="grid grid-cols-2">
              <div className="text-[8px] text-slate-500 uppercase">Cliente</div>
              <div className="text-[8px] font-black break-words">{facturaData.nombreCliente || "---"}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="grid grid-cols-2">
                <div className="text-[8px] text-slate-500 uppercase">Fecha</div>
                <div className="text-[8px] font-bold">{facturaData.Fecha}</div>
              </div>
              <div className="text-right grid grid-cols-2">
                <div className="text-[8px] text-slate-500 uppercase">ID {tipo}</div>
                <div className="text-[8px] font-bold">#{idPedido || "000"}</div>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 my-4 pt-4 text-center">
              <div className="text-[8px] text-slate-500 uppercase">Total a Pagar</div>
              <div className="text-2xl font-black text-slate-900">${facturaData.MontoTotal || "0.00"}</div>
              <div className="text-[9px] text-slate-400">{facturaData.CantidadTotal || 0} productos registrados</div>
            </div>

            <div className="mt-auto pt-4 flex justify-center">
               <div className={`text-[10px] font-bold px-3 py-1 rounded-full "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                 GENERADA
               </div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-600 mt-6 text-center italic">
            Esta es una representación visual antes de guardar be careful :p.
          </p>
        </div>
      </div>
    </div>
  );
}