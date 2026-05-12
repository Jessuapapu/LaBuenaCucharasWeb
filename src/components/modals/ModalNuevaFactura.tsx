import { useState } from "react";
import { FileText, ClipboardList, User, DollarSign, Package } from "lucide-react";

interface ModalNuevaFacturaProps {
  onClose: () => void;
  onSave: (nueva: any) => void;
}

type TipoRegistro = "Orden" | "Contrato";

export default function ModalNuevaFactura({ onClose, onSave }: ModalNuevaFacturaProps) {
  const [tipo, setTipo] = useState<TipoRegistro>("Orden");
  const [idPedido, setIdPedido] = useState<number | "">("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [monto, setMonto] = useState<number | "">("");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [estado, setEstado] = useState("Generada");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      tipo_registro: tipo,
      id_referencia: Number(idPedido),
      monto_total: Number(monto),
      cantidad_total: Number(cantidad),
      estado_factura: estado,
      fecha_factura: fecha,
      cliente: {
        nombre_cliente: nombreCliente || "Cliente General",
        direccion_cliente: "N/A"
      }
    };

    try {
      const response = await fetch("http://127.0.0.1:8001/pedidos/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al crear factura");
      
      const data = await response.json();
      onSave(data);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la factura.");
    } finally {
      setLoading(false);
    }
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} required placeholder="Ej: Juan Pérez" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID {tipo}</label>
                <input type="number" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={idPedido} onChange={e => setIdPedido(Number(e.target.value))} required placeholder="000" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto Total</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input type="number" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={monto} onChange={e => setMonto(Number(e.target.value))} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cantidad Items</label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input type="number" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha</label>
                <div className="relative">
                  <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 outline-none" value={fecha} onChange={e => setFecha(e.target.value)} required />
                </div>
                
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold transition-colors">Cerrar</button>
              <button type="submit" disabled={loading} className={`flex-[2] py-4 rounded-2xl font-black transition-all ${tipo === "Orden" ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-400 hover:bg-blue-300"}`}>
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
            
            <div className="text-[10px] font-bold text-slate-400 mb-4 italic">LA BUENA CUCHARA</div>
            
            <div className="mb-4">
              <div className="text-[8px] text-slate-500 uppercase">Cliente</div>
              <div className="text-sm font-black break-words">{nombreCliente || "---"}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <div className="text-[8px] text-slate-500 uppercase">Fecha</div>
                <div className="text-[10px] font-bold">{fecha}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-slate-500 uppercase">ID {tipo}</div>
                <div className="text-[10px] font-bold">#{idPedido || "000"}</div>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 my-4 pt-4 text-center">
              <div className="text-[8px] text-slate-500 uppercase">Total a Pagar</div>
              <div className="text-2xl font-black text-slate-900">${monto || "0.00"}</div>
              <div className="text-[9px] text-slate-400">{cantidad || 0} productos registrados</div>
            </div>

            <div className="mt-auto pt-4 flex justify-center">
               <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${estado === "Pagada" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                 {estado.toUpperCase()}
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