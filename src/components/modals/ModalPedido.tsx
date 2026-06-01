//import { ChartNoAxesColumnIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import type { OrdenVisualizar, DetalleOrdenLista, CrearOrden, CrearDetalleOrden } from "../../interfaces/Ordenes";
//import type { cliente } from "../../interfaces/Clientes";
//import { useCliente } from "../Hooks/hookClientes";
import type { Platillo } from "../../interfaces/Platillos";
import { useOrdenes } from "../Hooks/hookOrdenes";

interface ModalPedidoProps {
    Orden: OrdenVisualizar;
    listaPlatillos: Platillo[];
    onClose: () => void;
    onSave: (resultado: any) => void;
}

export default function ModalOrden({ Orden, listaPlatillos, onClose, onSave }: ModalPedidoProps) {
    const [idCliente, setIdCliente] = useState<number>(0);
    const [NombreCliente, setNombreCliente]= useState("")
    const {actualizarOrden, guardarOrden, loading, error:ApiError}= useOrdenes();
    const [estado, setEstado] = useState(Orden.estado_pedido);
    const isEditModal= !!(Orden && Orden.idOrden)
    const [detalles, setDetalles] = useState<DetalleOrdenLista[]>(Orden.detalles || []);
    //const [platillos, setPlatillos] = useState<string[]>([]);
    const isAnulado = estado === "ANULADO";


    const handleAddDetalle = () => {
        if (isAnulado) return; 
        setDetalles([
            ...detalles,
            {
                id_orden: Orden?.idOrden || 0,
                nombre_platillo: "",
                cantidad: 1,
                precio_unitario: 0,
            },
        ]);
    };

    useEffect(() => {
        if (isEditModal && Orden) {
            setIdCliente(Orden.cliente?.idCliente || 0);
            setNombreCliente(Orden.cliente?.nombre_cliente || "");
            setEstado(Orden.estado_pedido || "PENDIENTE");
            setDetalles(Orden.detalles || []);
        } else {
            setIdCliente(0);
            setNombreCliente("");
            setEstado("PENDIENTE");
            setDetalles([]);
        }
    }, [Orden, isEditModal]);
    const handleDetalleChange = (index: number, field: keyof DetalleOrdenLista, value: string | number) => {
    if (isAnulado) return;
    const newDetalles = [...detalles];
        
        if (field === "nombre_platillo") {
            // Buscar el platillo seleccionado para extraer y autoasignar su precio unitario original
            const platilloSeleccionado = listaPlatillos.find(p => p.nombre_platillo === value);
            newDetalles[index].nombre_platillo = String(value);
            newDetalles[index].precio_unitario = platilloSeleccionado?.precio ? Number(platilloSeleccionado.precio): 0;
        } else if (field === "cantidad" || field === "precio_unitario") {
            (newDetalles[index] as any)[field] = Number(value);
        } else {
            (newDetalles[index] as any)[field] = value;
        }
    setDetalles(newDetalles);
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
        if (!NombreCliente.trim()) {
            alert("Por favor, ingrese el nombre del cliente.");
            return;
        }
        if (detalles.length === 0) {
            alert("Debe añadir al menos un platillo al pedido.");
            return;
        }
        if (detalles.some(d => !d.nombre_platillo)) {
            alert("Asegúrese de haber seleccionado un platillo en cada fila.");
            return;
        }
        const detallesFormateados: CrearDetalleOrden[] = [];
        
        for (const det of detalles) {
            const platilloBase = listaPlatillos.find(p => p.nombre_platillo === det.nombre_platillo);
            if (!platilloBase || !platilloBase.id_platillo) {
                alert(`El platillo "${det.nombre_platillo}" no es válido o carece de ID.`);
                return;
            }
            detallesFormateados.push({
                IdPlatillo: platilloBase.id_platillo,
                CantidadPlatillo: det.cantidad,
                PrecioUnico: det.precio_unitario
            });
        }

        const payload: CrearOrden = {
            IdCliente: idCliente, 
            Estado: estado,       
            MONTOTOTAL: totalOrden, 
            detalles: detallesFormateados
        };

        let resultado = null;
        if (isEditModal && Orden) {
            resultado = await actualizarOrden(Orden.idOrden, payload as any);
        } else {
            resultado = await guardarOrden(payload);
        }

        if (resultado) {
            onSave(resultado);
            onClose();
        }
}

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 overflow-auto animate-in fade-in duration-300">
            <div className="bg-gray-800 p-4 rounded-lg text-white max-w-3xl w-full min-w-[300px] max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
                
                {/* CABECERA */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <div>
                        <h2 className="text-xl font-bold">
                            {isEditModal ? `Editar Pedido #${Orden.idOrden}` : "Registrar Pedido"}
                        </h2>
                        {isEditModal && <span className="text-sm text-gray-400">ID Interno: {Orden.idOrden}</span>}
                    </div>
                    {isAnulado && (
                        <span className="bg-red-600 text-xs font-bold px-2 py-1 rounded uppercase animate-pulse">
                            Estado Anulado
                        </span>
                    )}
                </div>

                {ApiError && (
                    <div className="bg-red-950 border border-red-500 text-red-200 p-2 rounded text-sm mb-3">
                        ⚠️ {ApiError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* CLIENTE */}
                    <div>
                        <label className="block text-gray-200">Cliente:</label>
                        {isEditModal ? (
                            <p className="p-1 bg-gray-700 rounded font-medium">{NombreCliente}</p>
                        ) : (
                            <input
                                type="text"
                                className="w-full px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white outline-none"
                                value={NombreCliente}
                                onChange={e => setNombreCliente(e.target.value)}
                            />
                        )}
                    </div>

                    {/* DIRECCION */}
                    <div>
                        <label className="block text-gray-200">Dirección (Solo lectura):</label>
                        <input
                            type="text"
                            className="w-full px-2 py-1 rounded bg-gray-300 text-gray-800 cursor-not-allowed font-medium"
                            value={Orden.cliente?.direccion_cliente || "No especificada"}
                            readOnly 
                        />
                    </div>
                    
                    {/* ESTADO */}
                    <div>
                        <label className="block text-gray-200">Estado:</label>
                        <select
                            className={`w-full px-2 py-1 rounded bg-white font-bold ${
                                estado === "ANULADO" ? "text-red-600" : 
                                estado === "ENTREGADO" ? "text-green-600" : "text-yellow-600"
                            }`}
                            value={estado}
                            onChange={e => setEstado(e.target.value)}
                            disabled={isAnulado && isEditModal}
                        >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="ANULADO">ANULADO</option>
                        </select>
                    </div>

                    {/* FECHA */}
                    <div>
                        <label className="block text-gray-200">Fecha:</label>
                        <input 
                            type="text" 
                            value={Orden.fecha || "Hoy"} 
                            disabled 
                            className="w-full px-2 py-1 rounded bg-gray-600 text-white cursor-not-allowed"
                        />
                    </div>
                </div>

                <h3 className="text-lg mb-2 mt-6 border-t border-gray-600 pt-2">Detalles del Pedido</h3>

                {/* FILAS DE DETALLES */}
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
                                {listaPlatillos.map((p, i) => (
                                    <option key={i} value={p.nombre_platillo}>
                                        {p.nombre_platillo}
                                    </option>
                                ))}
                            </select>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm">Cantidad:</label>
                                    <input
                                        type="number"
                                        min="1"
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
                                
                                <div className="flex items-end justify-between w-full">
                                    <span className="text-sm text-slate-400">
                                        Subtotal:{" "}
                                        <strong className="text-green-400">C$ {(det.cantidad * det.precio_unitario).toFixed(2)}</strong>
                                    </span>
                                    {!isAnulado && (
                                        <button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded h-8 transition-colors text-sm"
                                            onClick={() => handleRemoveDetalle(index)}
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isAnulado && (
                    <button 
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 w-full md:w-auto transition-colors" 
                        onClick={handleAddDetalle}
                    >
                        + Añadir Platillo
                    </button>
                )}

                {/* TOTAL */}
                <div className="mt-4 p-2 bg-gray-900 rounded flex justify-between items-center border border-gray-700">
                    <span className="text-gray-400 text-xs font-bold uppercase">Total General:</span>
                    <span className="text-lg font-bold text-green-400">C$ {totalOrden.toFixed(2)}</span>
                </div>

                {/* BOTONES ACCION */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-600">
                    <button type="button" className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className={`px-6 py-2 rounded font-bold transition-colors ${loading ? "bg-gray-500 cursor-wait text-gray-300" : "bg-green-600 hover:bg-green-500 text-white"}`}
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
