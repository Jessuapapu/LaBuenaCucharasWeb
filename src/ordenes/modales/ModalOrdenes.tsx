import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Save, ChefHat } from 'lucide-react';
import type { DetalleOrden, OrdenHistorial } from '../hooks/hookOrdenes';
import { useMutarOrden } from '../hooks/hookOrdenes';

// Importa tus nuevos hooks (ajusta la ruta según donde los guardaste)
import { useClientes } from '../../components/Hooks/hookClientes';
import { usePlatillos } from '../../components/Hooks/hookPlatillos';

interface ModalProps {
    abierto: boolean;
    alCerrar: () => void;
    alCompletar: () => void;
    ordenEdicion?: OrdenHistorial | null;
}

export function ModalEditorOrden({ abierto, alCerrar, alCompletar, ordenEdicion }: ModalProps) {
    const { crearOrden, actualizarOrden, procesando } = useMutarOrden();
    
    // Consumimos los catálogos del sistema
    const { clientes, loading: cargandoClientes } = useClientes();
    const { platillos, destacados, loadingPlatillos } = usePlatillos();
    
    const [nombreCliente, setNombreCliente] = useState("");
    const [estado, setEstado] = useState("PENDIENTE");
    const [detalles, setDetalles] = useState<DetalleOrden[]>([]);

    // Cargar datos iniciales si es edición
    useEffect(() => {
        if (ordenEdicion) {
            setNombreCliente(ordenEdicion.cliente?.nombre_cliente || "");
            setEstado(ordenEdicion.estado_pedido || "PENDIENTE");
            setDetalles(ordenEdicion.detalles || []);
        } else {
            setNombreCliente("");
            setEstado("PENDIENTE");
            setDetalles([]);
        }
    }, [ordenEdicion, abierto]);

    if (!abierto) return null;

    const handleAgregarPlatillo = (nombrePredeterminado: string = "") => {
        // Agregamos el platillo con precio 0, para que el admin lo digite
        setDetalles([...detalles, { nombre_platillo: nombrePredeterminado, cantidad: 1, precio_unitario: 0 }]);
    };

    const handleActualizarPlatillo = (index: number, campo: keyof DetalleOrden, valor: any) => {
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index] = { ...nuevosDetalles[index], [campo]: valor };
        setDetalles(nuevosDetalles);
    };

    const handleQuitarPlatillo = (index: number) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombreCliente.trim() || detalles.length === 0) {
            alert("Debe seleccionar un cliente y al menos un platillo.");
            return;
        }

        // Validación extra para asegurar que el admin no deje precios en 0 por error
        const precioInvalido = detalles.some(d => d.precio_unitario <= 0);
        if (precioInvalido) {
            alert("Por favor, asigne un precio válido a todos los platillos.");
            return;
        }

        let exito = false;
        if (ordenEdicion) {
            exito = await actualizarOrden(ordenEdicion.id_pedido, nombreCliente, estado, detalles);
        } else {
            exito = await crearOrden(nombreCliente, detalles);
        }

        if (exito) {
            alCompletar();
            alCerrar();
        }
    };

    const totalCalculado = detalles.reduce((acc, d) => acc + (d.cantidad * (d.precio_unitario || 0)), 0);

    return (
        <div className="fixed inset-0 bg-[#090D1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal más grande: max-w-4xl */}
            <div className="bg-[#0F172A] border border-slate-800 w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center p-6 lg:p-8 border-b border-white/5 bg-slate-900/30 rounded-t-[2rem]">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {ordenEdicion ? `Gestión de Orden #${ordenEdicion.id_pedido}` : "Nueva Orden de Consumo"}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Control Operativo
                        </p>
                    </div>
                    <button onClick={alCerrar} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-red-500/20 p-2.5 rounded-xl border border-white/5 active:scale-95">
                        <X size={20} />
                    </button>
                </div>

                {/* CUERPO DEL MODAL */}
                <div className="p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form id="orden-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* SECCIÓN 1: DATOS GENERALES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente Registrado</label>
                                <div className="relative">
                                    <select 
                                        required 
                                        value={nombreCliente} 
                                        onChange={(e) => setNombreCliente(e.target.value)}
                                        className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
                                    >
                                        <option value="" disabled>Seleccione un cliente...</option>
                                        <option value="Consumidor Final" className="font-bold text-blue-400">Consumidor Final</option>
                                        {clientes.map(cli => (
                                            <option key={cli.IdCliente} value={cli.NombreCliente}>
                                                {cli.NombreCliente}
                                            </option>
                                        ))}
                                    </select>
                                    {cargandoClientes && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={16}/>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado Operativo</label>
                                <select 
                                    value={estado} onChange={(e) => setEstado(e.target.value)}
                                    className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
                                >
                                    <option value="PENDIENTE">⏳ Pendiente</option>
                                    <option value="ENTREGADO">✅ Entregado / Pagado</option>
                                    <option value="ANULADO">🚫 Anulado</option>
                                </select>
                            </div>
                        </div>

                        {/* SECCIÓN 2: DETALLES DE PLATILLOS */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <label className="text-sm font-black text-slate-300 uppercase tracking-widest">Platillos de la Orden</label>
                                <button type="button" onClick={() => handleAgregarPlatillo()} className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                                    <Plus size={16}/> Añadir Fila
                                </button>
                            </div>

                            <div className="space-y-3">
                                {detalles.map((det, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                                        
                                        {/* Selector de Platillo */}
                                        <div className="w-full sm:flex-1">
                                            <select 
                                                required 
                                                value={det.nombre_platillo} 
                                                onChange={(e) => handleActualizarPlatillo(index, "nombre_platillo", e.target.value)}
                                                className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                                <option value="" disabled>Elegir del catálogo...</option>
                                                {platillos.map(p => (
                                                    <option key={p.id_platillo || p.nombre_platillo} value={p.nombre_platillo}>
                                                        {p.nombre_platillo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-3 w-full sm:w-auto">
                                            {/* Input Cantidad */}
                                            <div className="flex-1 sm:w-24 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">Cant:</span>
                                                <input 
                                                    type="number" required min="1" 
                                                    value={det.cantidad || ''} 
                                                    onChange={(e) => handleActualizarPlatillo(index, "cantidad", parseInt(e.target.value) || 0)}
                                                    className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl py-2.5 pl-12 pr-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                                                />
                                            </div>

                                            {/* Input Precio Manual */}
                                            <div className="flex-1 sm:w-32 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">C$</span>
                                                <input 
                                                    type="number" required min="0" step="0.01" 
                                                    value={det.precio_unitario || ''} 
                                                    onChange={(e) => handleActualizarPlatillo(index, "precio_unitario", parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                                                />
                                            </div>

                                            {/* Botón Borrar */}
                                            <button type="button" onClick={() => handleQuitarPlatillo(index)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 shrink-0">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {detalles.length === 0 && (
                                    <div className="text-center py-8 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                        <p className="text-sm text-slate-500 font-medium">Inicia añadiendo una fila o selecciona una sugerencia abajo.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECCIÓN 3: SUGERENCIAS / MENÚ DEL DÍA */}
                        {!loadingPlatillos && destacados && destacados.length > 0 && (
                            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <ChefHat size={16} className="text-blue-400" />
                                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Sugerencias (Menú del Día)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {destacados.map((p: any, i: number) => (
                                        <button 
                                            key={i} 
                                            type="button"
                                            onClick={() => handleAgregarPlatillo(p.nombre_platillo)}
                                            className="bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 hover:border-blue-500 transition-colors active:scale-95"
                                        >
                                            + {p.nombre_platillo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* FOOTER DEL MODAL */}
                <div className="p-6 lg:p-8 border-t border-white/5 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-center rounded-b-[2rem] gap-4">
                    <div className="w-full sm:w-auto text-center sm:text-left bg-[#0A0F1D] px-6 py-3 rounded-2xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Total a Cobrar</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">C${totalCalculado.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button type="button" onClick={alCerrar} className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                            Cancelar
                        </button>
                        <button type="submit" form="orden-form" disabled={procesando} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 border border-emerald-500/50">
                            {procesando ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>}
                            Confirmar Orden
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}