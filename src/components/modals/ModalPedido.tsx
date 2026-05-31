//import { ChartNoAxesColumnIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import type { OrdenVisualizar, DetalleOrdenLista } from "../../interfaces/Ordenes";
//import type { cliente } from "../../interfaces/Clientes";
//import { useCliente } from "../Hooks/hookClientes";
import { useOrdenes } from "../Hooks/hookOrdenes";

interface ModalPedidoProps {
    pedido: OrdenVisualizar;
    onClose: () => void;
    onSave: (updatedPedido: any) => void;
}

export default function ModalPedido({ pedido, onClose, onSave }: ModalPedidoProps) {
    //const [clientes, setClientes] = useState<cliente[]>([]);
    const {actualizarOrden, loading, error}= useOrdenes();
    const [estado, setEstado] = useState(pedido.estado_pedido);

    const [detalles, setDetalles] = useState<DetalleOrdenLista[]>(pedido.detalles || []);
    const [platillos, setPlatillos] = useState<string[]>([]);
    const isAnulado = estado === "ANULADO";


    const handleDetalleChange = (index: number, field: keyof DetalleOrdenLista, value: string | number) => {
        if (isAnulado) return; 
        const newDetalles = [...detalles];
        (newDetalles[index] as any)[field] = field === "cantidad" || field === "precio_unitario" ? Number(value) : value;
        setDetalles(newDetalles);
    };

    const handleAddDetalle = () => {
    if (isAnulado) return;
    setDetalles([...detalles,
      {
        id_orden: pedido.idOrden,
        nombre_platillo: "",
        cantidad: 1,
        precio_unitario: 0,
      },
    ]);
  };

    const totalOrden = useMemo(() => {
    return detalles.reduce((acc, item) => {
      return acc + (item.cantidad * item.precio_unitario);
    }, 0);
  }, [detalles]);

    const handleRemoveDetalle = (index: number) => {
        if (isAnulado) return;
        const newDetalles = [...detalles];
        newDetalles.splice(index, 1);
        setDetalles(newDetalles);
    };

    const handleSave = async () => {
        const payload = {
      nombre_cliente: pedido.cliente.nombre_cliente,
      estado,
      detalles: detalles.map((det) => ({
        nombre_platillo: det.nombre_platillo,
        cantidad: det.cantidad,
        precio_unitario: det.precio_unitario,
      })),
    };
        const resultado = await actualizarOrden(
      pedido.id_pedido,
      payload
   );

   if (resultado) {
      onSave(resultado);
      onClose();
    };
}

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 overflow-auto animate-in fade-in duration-300">
            <div className="bg-gray-800 p-4 rounded-lg text-white max-w-3xl w-full min-w-[300px] max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
                
                {/* CABECERA CON ID DE PEDIDO */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <div>
                        <h2 className="text-xl font-bold">Editar Pedido #{pedido.id_pedido}</h2>
                        <span className="text-sm text-gray-400">ID Interno: {pedido.id_pedido}</span>
                    </div>
                    {isAnulado && (
                        <span className="bg-red-600 text-xs font-bold px-2 py-1 rounded uppercase animate-pulse">
                            Estado Anulado
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* CLIENTE */}
                    <div>
                        <label className="block text-gray-200">Cliente:</label>
                        <p>Cliente: {pedido.cliente.nombre_cliente}</p>
                    </div>

                    {/* DIRECCION (READ ONLY) */}
                    <div>
                        <label className="block text-gray-200">Dirección (Solo lectura):</label>
                        <input
                            type="text"
                            className="w-full px-2 py-1 rounded bg-gray-300 text-gray-800 cursor-not-allowed font-medium"
                            value={pedido.cliente.direccion_cliente || ""}
                            readOnly 
                        />
                    </div>
                    
                    {/* ESTADO (EDITABLE) */}
                    <div>
                        <label className="block text-gray-200">Estado:</label>
                        <select
                            className={`w-full px-2 py-1 rounded bg-white text-black font-bold ${
                                estado === "ANULADO" ? "text-red-600" : 
                                estado === "ENTREGADO" ? "text-green-600" : "text-yellow-600"
                            }`}
                            value={estado}
                            onChange={e => setEstado(e.target.value)}
                        >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="ANULADO">ANULADO</option>
                        </select>
                    </div>

                    {/* FECHA (READ ONLY) */}
                    <div>
                        <label className="block text-gray-200">Fecha:</label>
                        <input 
                            type="text" 
                            value={pedido.fecha} 
                            disabled 
                            className="w-full px-2 py-1 rounded bg-gray-600 text-white cursor-not-allowed"
                        />
                    </div>
                </div>

                <h3 className="text-lg mb-2 mt-6 border-t border-gray-600 pt-2">Detalles del Pedido</h3>

                <div className="space-y-3">
                    {detalles.map((det, index) => (
                        <div key={index} className="border-b border-gray-700 pb-2 bg-gray-700/30 p-2 rounded">
                            <label className="block text-gray-300 text-sm">Platillo:</label>
                            <select
                                className={`w-full px-2 py-1 rounded bg-white text-black mb-2 ${isAnulado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                value={det.nombre_platillo}
                                onChange={e => handleDetalleChange(index, "nombre_platillo", e.target.value)}
                                disabled={isAnulado}
                            >
                                <option value="" disabled>Seleccionar platillo</option>
                                {platillos.map((p, i) => (
                                    <option key={i} value={p}>{p}</option>
                                ))}
                            </select>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm">Cantidad:</label>
                                    <input
                                        type="number"
                                        className={`px-2 py-1 rounded bg-white text-black w-full md:w-24 ${isAnulado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        value={det.cantidad}
                                        onChange={e => handleDetalleChange(index, "cantidad", e.target.value)}
                                        disabled={isAnulado}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm">Precio Unit.:</label>
                                    <input
                                        type="number"
                                        className={`px-2 py-1 rounded bg-white text-black w-full md:w-32 ${isAnulado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        value={det.precio_unitario}
                                        onChange={e => handleDetalleChange(index, "precio_unitario", e.target.value)}
                                        disabled={isAnulado}
                                    />
                                </div>
                                {!isAnulado && (
                                    <div className="flex items-end">
                                        <span className="text-sm text-slate-400">
                                            Subtotal:{" "}
                                            <strong className="text-white">C${" "}{(det.cantidad * det.precio_unitario).toFixed(2)}</strong>
                                        </span>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded h-8"
                                            onClick={() => handleRemoveDetalle(index)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!isAnulado && (
                    <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-4 w-full md:w-auto" onClick={handleAddDetalle}>
                        + Añadir Platillo
                    </button>
                )}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-600">
                    <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className={`px-6 py-2 rounded font-bold ${loading ? "bg-gray-500 cursor-wait" : "bg-green-600 hover:bg-green-500"}`}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
