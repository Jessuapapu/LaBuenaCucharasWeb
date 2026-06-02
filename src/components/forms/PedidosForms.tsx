import { useState } from "react";
import { FileText, ClipboardList, Trash2, Plus, User, Calendar } from "lucide-react";
//import type { CrearOrden, CrearDetalleOrden } from "../../interfaces/Ordenes";
import { useNuevoContrato } from "../Hooks/hookContratos";
import { useMenu_diario } from "../Hooks/hookMenu_diario";
import type { NuevoContrato } from "../../interfaces/Contratos";
import { pedidosService } from "../../services/pedidos";

interface DetalleItem {
  NombrePlatillo: string;
  cantidad: number;
  precioUnitario: number;
}
interface DatosEdicion {
  id_pedido: number;
  nombreContrato?: number;
  nombre_cliente: string;
  fecha: string;
  tipo: "Evento" | "Contrato";
  detalle: Array<{
    nombre_platillo: string;
    cantidad: number;
    precio_unitario: number;
  }>;
}

interface FormularioNuevoPedidoProps {
  onClose: () => void;
  onSave: () => void; // Para recargar la tabla al guardar
  datosEdicion?: DatosEdicion | null;
}

type TipoRegistro = "Evento" | "Contrato";

//interface MesaOption { numero_mesa: string; estado: string; }

export default function FormularioNuevoPedido({ onClose, onSave, datosEdicion }: FormularioNuevoPedidoProps) {
  // --- Estados de Datos (Listas para selects) ---
  const {listaClientes, crear: crearContratoServicio}=useNuevoContrato()
  const {listaPlatillos}=useMenu_diario()
  //const [listaMesas, setListaMesas] = useState<MesaOption[]>([]);

  // --- Estados del Formulario ---
  const [cliente, setCliente] = useState(datosEdicion?.nombre_cliente||"");
  const [fecha, setFecha] = useState(datosEdicion? new Date(datosEdicion.fecha).toISOString().split("T")[0]: new Date().toISOString().split("T")[0]); // Fecha de hoy por defecto
  const [items, setItems] = useState<DetalleItem[]>(
    datosEdicion ? datosEdicion.detalle.map(d => ({
      NombrePlatillo: d.nombre_platillo,
      cantidad: d.cantidad,
      precioUnitario: d.precio_unitario
    })): [{ NombrePlatillo: "", cantidad: 1, precioUnitario: 0 }],
  );

  const [cargando, setCargando] = useState(false);//para no confuncir

  // Manejadores de Detalles (Agregar / Quitar / Cambiar)
  const handleAddItem = () => {
    setItems([...items, { NombrePlatillo: "", cantidad: 1, precioUnitario: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: keyof DetalleItem, value: string | number) => {
    const newItems = [...items];
    if (field === "NombrePlatillo") {
      newItems[index].NombrePlatillo = String(value);
      const platilloDelDia = listaPlatillos.find((p) => p.NombrePlatillo === value);
      
      // Si el platillo existe en el menú diario, se asigna su precio variable, si no, 0
      newItems[index].precioUnitario = platilloDelDia ? platilloDelDia.Monto : 0;
    } else if (field === "cantidad") {
      newItems[index].cantidad = Math.max(1, Number(value));
    } else if (field === "precioUnitario") {
      newItems[index].precioUnitario = Math.max(0, Number(value));
    }
    setItems(newItems);
  };
  //const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || items.length === 0) {
      alert("Debes seleccionar un cliente y al menos un platillo.");
      return;
    } setCargando(true);
    if (tipo === "Contrato") {
    
      const contratoPayload: NuevoContrato = {
        numero_contrato: datosEdicion?.nombreContrato||Math.floor(100000 + Math.random() * 900000), //codigo aleatorio
        nombre_cliente: cliente,
        fecha_inicio: fecha,
        fecha_fin: fecha,
        presupuesto: items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0),
      };

      const exito = await crearContratoServicio(contratoPayload);
      if (exito) {
        alert("Contrato creado con éxito");
        onSave();
        onClose();
      } else {
        alert("Hubo un error al guardar el contrato");
      }

    } else {
      // Si es para el pedido
      setCargando(false);
      const PedidoPayload = {
        nombre_cliente: cliente,
        fecha: fecha,
        detalle: items.map((item) => ({
          nombre_platillo: item.NombrePlatillo,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precioUnitario),
        })),
      };
// Determinar si editamos o creamos usando el servicio
    let exito = false;
    if (datosEdicion) {
      exito = await pedidosService.actualizarPedido(datosEdicion.id_pedido, PedidoPayload);
    } else {
      exito = await pedidosService.crearPedido(PedidoPayload);
    }

    setCargando(false);

    if (exito) {
      alert(datosEdicion ? "Pedido actualizado con éxito ✅" : "Pedido creado con éxito ✅");
      onSave();
      onClose();
    } else {
      alert("Hubo un error al procesar el pedido ❌");
    }
    }
  };

  // Calcular total visual
  const totalEstimado = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const [tipo, setTipo] = useState<TipoRegistro>(datosEdicion?.tipo ||"Evento");
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl text-white max-w-5xl w-full border border-slate-700 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO (Ocupa 7 de 12 columnas) */}
        <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col justify-between custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <header className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{datosEdicion ? "Editar orden" : "Registrar la orden"}</h2>
                <p className="text-slate-400 text-sm">Selecciona el tipo de registro manual</p>
              </div>
            </header>

            {/* SELECTOR DE TIPO */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl mb-6">
              <button
                type="button"
                disabled={!!datosEdicion} // Deshabilitado si estás editando para evitar romper consistencia
                onClick={() => setTipo("Evento")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  tipo === "Evento" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ClipboardList size={18} /> Pedido
              </button>
              <button
                type="button"
                disabled={!!datosEdicion}
                onClick={() => setTipo("Contrato")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  tipo === "Contrato" ? "bg-amber-300/90 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <FileText size={18} /> Contrato
              </button>
            </div>

            <form id="form-pedido" onSubmit={handleSubmit} className="space-y-5">
              {/* Fila 1: Cliente y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <User size={14} /> Cliente
                  </label>
                  <select
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                  >
                    <option value="">-- Seleccionar Cliente --</option>
                    {listaClientes.map((c, i) => (
                      <option key={i} value={c.NombreCliente}>
                        {c.NombreCliente}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar size={14} /> Fecha {tipo === "Contrato" ? "Emisión" : ""}
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
              </div>

              {/* Sección Detalles Dinámicos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    {tipo === "Contrato" ? "Presupuesto Base" : "Detalles del Pedido"}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Añadir Fila
                  </button>
                </div>

                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[35vh] overflow-y-auto custom-scrollbar">
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-end border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                      
                      {/* Platillo */}
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Platillo</label>
                        <select
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          value={item.NombrePlatillo}
                          onChange={(e) => handleChangeItem(index, "NombrePlatillo", e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {listaPlatillos.map((p, i) => (
                            <option key={i} value={p.NombrePlatillo}>
                              {p.NombrePlatillo} (${p.Monto.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cantidad */}
                      <div className="w-full md:w-20">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Cant.</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none"
                          value={item.cantidad}
                          onChange={(e) => handleChangeItem(index, "cantidad", Number(e.target.value))}
                        />
                      </div>

                      {/* Precio Unitario */}
                      <div className="w-full md:w-28">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">P. Unitario ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-right focus:ring-1 focus:ring-blue-500 outline-none text-emerald-400 font-medium"
                          value={item.precioUnitario}
                          onChange={(e) => handleChangeItem(index, "precioUnitario", Number(e.target.value))}
                        />
                      </div>  

                      {/* Botón eliminar fila */}
                      <button
                        type="button"
                        disabled={items.length === 1}
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/60 disabled:opacity-20 disabled:hover:bg-transparent transition-colors mb-[2px]"
                        title="Eliminar fila"
                      >
                        <Trash2 size={16} />
                      </button>   
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Botones de acción del formulario */}
          <div className="flex gap-3 pt-4 border-t border-slate-800 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              form="form-pedido"
              disabled={cargando} 
              className={`flex-[2] py-3 rounded-xl font-black text-sm tracking-wide transition-all ${
                tipo === "Evento" ? "bg-blue-600 hover:bg-blue-500" : "bg-amber-600 hover:bg-purple-500"
              } disabled:opacity-50`}
            >
              {cargando ? "PROCESANDO..." : `GENERAR ${tipo.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DE TICKET (Ocupa 5 de 12 columnas) */}
        <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col justify-between border-t lg:border-t-0 border-slate-800">
          <div>
            <div className="text-center">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                tipo === "Evento" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
              } mb-4`}>
                Vista Previa {tipo}
              </span>
            </div>

            {/* Listado estilo Factura / Ticket */}
            <div className="space-y-3 mt-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
              <div className="text-xs text-slate-500 border-b border-slate-800 pb-2 flex justify-between">
                <span>DESCRIPCIÓN</span>
                <span>TOTAL</span>
              </div>

              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm items-center py-0.5">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">
                      {item.NombrePlatillo || "Sin seleccionar"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.cantidad} x ${item.precioUnitario.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-mono text-slate-300">
                    ${(item.cantidad * item.precioUnitario).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bloque del Totalizador Inferior */}
          <div className="mt-6 border-t border-dashed border-slate-700 pt-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
              <span>CLIENTE:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{cliente || "Ninguno"}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium border-b border-slate-800 pb-2 mb-2">
              <span>FECHA EMISIÓN:</span>
              <span className="text-slate-200">{fecha}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400 uppercase">Total Estimado:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${totalEstimado.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}