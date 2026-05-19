import { useState, useEffect } from "react";
import { FileText, ClipboardList, Trash2 } from "lucide-react";

// Interfaces para los datos que cargamos
interface ClienteOption {
  nombre: string;
}

interface PlatilloOption {
  nombre_platillo: string;
  precio?: number; // Opcional, por si quieres autocompletar el precio
}

interface DetalleItem {
  nombre_platillo: string;
  cantidad: number;
  precio_unitario: number;
}

interface FormularioNuevoPedidoProps {
  onClose: () => void;
  onSave: () => void; // Para recargar la tabla al guardar
}

type TipoRegistro = "Orden" | "Contrato";

//interface MesaOption { numero_mesa: string; estado: string; }

export default function FormularioNuevoPedido({ onClose, onSave }: FormularioNuevoPedidoProps) {
  // --- Estados de Datos (Listas para selects) ---
  const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
  const [listaPlatillos, setListaPlatillos] = useState<PlatilloOption[]>([]);
  //const [listaMesas, setListaMesas] = useState<MesaOption[]>([]);

  // --- Estados del Formulario ---
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // Fecha de hoy por defecto
  const [items, setItems] = useState<DetalleItem[]>([
    { nombre_platillo: "", cantidad: 1, precio_unitario: 0 },
  ]);
  
  const [loading, setLoading] = useState(false);
  //const [MesaSeleccionada, setMesaSeleccionada]= useState("")

  // 1. Cargar Clientes y Platillos al montar
  useEffect(() => {
    // Cargar Clientes
    fetch("http://127.0.0.1:8001/clientes/")
      .then((res) => res.json())
      //.then((data) => setListaClientes(data))
      //.catch(console.error);
      .then((data)=> {
        setListaClientes(Array.isArray(data) ? data: []); //Es para que no dalle la funcion map lo hacems array a como lo hicimos en ComidasPage
      })
      .catch((err) => {
        console.error("Error cliente: ", err);
        setListaClientes([]);
      })

    // Cargar Platillos
    fetch("http://127.0.0.1:8001/platillos/")
      .then((res) => res.json())
      //.then((data) => setListaPlatillos(data))
      //.catch(console.error);
      .then((data)=> {
        setListaPlatillos(Array.isArray(data) ? data: []);
      })
      .catch((err) => {
        console.error("Error platillo: ", err);
        setListaPlatillos([]);
      });
  }, []);

  

  // 2. Manejadores de Detalles (Agregar / Quitar / Cambiar)
  const handleAddItem = () => {
    setItems([...items, { nombre_platillo: "", cantidad: 1, precio_unitario: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: keyof DetalleItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  // 3. Submit (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || items.length === 0) {
      alert("Debes seleccionar un cliente y al menos un platillo.");
      return;
    }

    setLoading(true);

    const payload = {
      nombre_cliente: cliente,
      fecha: fecha,
      detalle: items.map((item) => ({ //items.map
        nombre_platillo: item.nombre_platillo,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
      })),
    };

    try {
      
      const response = await fetch("http://127.0.0.1:8001/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al crear el pedido");
      }

      alert("Pedido creado con éxito ✅");
      onSave(); // Refrescar tabla padre
      onClose(); // Cerrar modal
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar el pedido ❌");
    } finally {
      setLoading(false);
    }
  };

  // Calcular total visual
  const totalEstimado = items.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0);
  const [tipo, setTipo] = useState<TipoRegistro>("Orden");
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl text-white max-w-4xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row">
      {/*<div className="bg-gray-800 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">*/} {/*"bg-gray-800 text-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"*/}
        
      

        {/*Columna 1*/}
        <div className="p-8 flex-1 border-r border-slate-800">
         {/* Form Body - Scrollable */}
        <div className="lg:col-span-7 p-6 overflow-y-auto custom-scrollbar">
          <header className="mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Pedido</h2>
            <p className="text-slate-400 text-sm">Selecciona el tipo de pedido manual</p>
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
          <form id="form-pedido" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Fila 1: Cliente y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {listaClientes.map((c, i) => (
                    <option key={i} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>

            {/* Sección Detalles */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-lg font-medium text-gray-200">Detalles del Pedido</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1 rounded transition-colors"
                >
                  + Agregar Platillo
                </button>
              </div>

              <div className="space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                    
                    {/* Platillo */}
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-gray-500 mb-1">Platillo</label>
                      <select
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        value={item.nombre_platillo}
                        onChange={(e) => handleChangeItem(index, "nombre_platillo", e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {listaPlatillos.map((p, i) => (
                          <option key={i} value={p.nombre_platillo}>{p.nombre_platillo}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        value={item.cantidad}
                        onChange={(e) => handleChangeItem(index, "cantidad", Number(e.target.value))}
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="w-32">
                      <label className="block text-xs text-gray-500 mb-1">P. Unitario ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        value={item.precio_unitario}
                        onChange={(e) => handleChangeItem(index, "precio_unitario", Number(e.target.value))}
                      />
                    </div>  
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 rounded bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/60 transition-colors mb-[2px]"
                      title="Eliminar platillo"
                    >
                      <Trash2 size={16} />
                    </button>   
                  </div>
                ))}
              </div>
            </div>
              {/* Botón Eliminar y generar */}
              <div className="flex gap-3 pt-6">
              <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold transition-colors">Cerrar</button>
              <button type="submit" disabled={loading} className={`flex-[2] py-4 rounded-2xl font-black transition-all ${tipo === "Orden" ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-400 hover:bg-blue-300"}`}>
                {loading ? "PROCESANDO..." : `Generar ${tipo}`}
              </button>
            </div>
          </form>
        </div> 
        </div>
        
        {/*Columna 2*/}
        <div className="lg:col-span-5 bg-gray-900 p-6 border-l border-gray-700 flex flex-col justify-between">
          <div>
            <h3 className="text-center text-gray-400 uppercase tracking-widest text-sm mb-4">Resumen</h3>
            {/* Lista de productos estilo Ticket */}
            <div className="space-y-3">
              {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                 <span>{item.cantidad}x {item.nombre_platillo || '...'}</span>
                 <span>${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
              </div>
              ))}
            </div>
          </div>

          {/* Totalizador al final de la columna derecha */}
          <div className="mt-6 border-t border-dashed border-gray-600 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>TOTAL:</span>
                <span className="text-green-400">${totalEstimado.toFixed(2)}</span>
              </div>
          </div>
        </div>

      </div>
    </div>
  
  );
}