import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Save, ChefHat } from 'lucide-react';
import type { DetalleOrden, OrdenHistorial } from '../hooks/hookOrdenes';
import { useMutarOrden } from '../hooks/hookOrdenes';

// Importa tus nuevos hooks (ajusta la ruta según donde los guardaste)
import { useClientes } from '../../../context/Hooks/hookClientes';
import { usePlatillos } from '../../../context/Hooks/hookPlatillos';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            {/* Modal más grande: max-w-4xl */}
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-sky-100 bg-[#edf3f6] shadow-2xl shadow-slate-950/25">
                
                {/* HEADER MODAL */}
                <div className="flex items-center justify-between gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-100/80 to-slate-100 p-5 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3">
                        <span className="rounded-2xl bg-gradient-to-br from-[#147e9d] to-[#3b5bc6] p-3 text-white shadow-md shadow-sky-900/15"><ChefHat size={22} /></span>
                        <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            {ordenEdicion ? `Gestión de Orden #${ordenEdicion.id_pedido}` : "Nueva Orden de Consumo"}
                        </h2>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                            {ordenEdicion ? "Actualiza los datos de esta orden" : "Registra cliente y platillos"}
                        </p>
                        </div>
                    </div>
                    <button onClick={alCerrar} aria-label="Cerrar" className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95">
                        <X size={20} />
                    </button>
                </div>

                {/* CUERPO DEL MODAL */}
                <div className="p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form id="orden-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* SECCIÓN 1: DATOS GENERALES */}
                        <div className="grid grid-cols-1 gap-5 rounded-2xl border border-sky-200 bg-sky-100/50 p-4 sm:p-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">Cliente</label>
                                <div className="relative">
                                    <select 
                                        required 
                                        value={nombreCliente} 
                                        onChange={(e) => setNombreCliente(e.target.value)}
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-[#edf3f6] px-4 py-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                    >
                                        <option value="" disabled>Seleccione un cliente...</option>
                                        <option value="Consumidor Final" className="font-bold text-[#147e9d]">Consumidor Final</option>
                                        {clientes.map(cli => (
                                            <option key={cli.IdCliente} value={cli.NombreCliente}>
                                                {cli.NombreCliente}
                                            </option>
                                        ))}
                                    </select>
                                    {cargandoClientes && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#147e9d]" size={16}/>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">Estado de la orden</label>
                                <select 
                                    value={estado} onChange={(e) => setEstado(e.target.value)}
                                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-[#edf3f6] px-4 py-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                >
                                    <option value="PENDIENTE">⏳ Pendiente</option>
                                    <option value="ENTREGADO">✅ Entregado / Pagado</option>
                                    <option value="ANULADO">🚫 Anulado</option>
                                </select>
                            </div>
                        </div>

                        {/* SECCIÓN 2: DETALLES DE PLATILLOS */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <label className="text-sm font-black uppercase tracking-widest text-slate-700">Platillos de la orden</label>
                                <button type="button" onClick={() => handleAgregarPlatillo()} className="flex items-center gap-2 rounded-xl bg-[#147e9d] px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-900/15 transition-colors hover:bg-[#106c87] active:scale-95">
                                    <Plus size={16}/> Añadir Fila
                                </button>
                            </div>

                            <div className="space-y-3">
                                {detalles.map((det, index) => (
                                    <div key={index} className="flex flex-col items-start gap-3 rounded-2xl border border-slate-300 bg-slate-200/50 p-3 sm:flex-row sm:items-center">
                                        
                                        {/* Selector de Platillo */}
                                        <div className="w-full sm:flex-1">
                                            <select 
                                                required 
                                                value={det.nombre_platillo} 
                                                onChange={(e) => handleActualizarPlatillo(index, "nombre_platillo", e.target.value)}
                                                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-[#edf3f6] px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
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
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Cant:</span>
                                                <input 
                                                    type="number" required min="1" 
                                                    value={det.cantidad || ''} 
                                                    onChange={(e) => handleActualizarPlatillo(index, "cantidad", parseInt(e.target.value) || 0)}
                                                    className="w-full rounded-xl border border-slate-300 bg-[#edf3f6] py-2.5 pl-12 pr-3 font-mono text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                                />
                                            </div>

                                            {/* Input Precio Manual */}
                                            <div className="flex-1 sm:w-32 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">C$</span>
                                                <input 
                                                    type="number" required min="0" step="0.01" 
                                                    value={det.precio_unitario || ''} 
                                                    onChange={(e) => handleActualizarPlatillo(index, "precio_unitario", parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="w-full rounded-xl border border-slate-300 bg-[#edf3f6] py-2.5 pl-9 pr-3 font-mono text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                                />
                                            </div>

                                            {/* Botón Borrar */}
                                            <button type="button" onClick={() => handleQuitarPlatillo(index)} aria-label="Quitar platillo" className="shrink-0 rounded-xl border border-transparent p-2.5 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {detalles.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                                        <p className="text-sm font-medium text-slate-500">Añade un platillo o elige una sugerencia del menú.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECCIÓN 3: SUGERENCIAS / MENÚ DEL DÍA */}
                        {!loadingPlatillos && destacados && destacados.length > 0 && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <ChefHat size={16} className="text-amber-700" />
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-800">Sugerencias del menú del día</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {destacados.map((p: any, i: number) => (
                                        <button 
                                            key={i} 
                                            type="button"
                                            onClick={() => handleAgregarPlatillo(p.nombre_platillo)}
                                            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-amber-400 hover:bg-amber-100 active:scale-95"
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
                <div className="flex flex-col items-center justify-between gap-4 border-t border-sky-100 bg-slate-200/60 p-5 sm:flex-row sm:p-6 lg:p-8">
                    <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-3 text-center sm:w-auto sm:text-left">
                        <span className="mb-0.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Total a cobrar</span>
                        <span className="font-mono text-2xl font-black tracking-tighter text-emerald-700">C${totalCalculado.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button type="button" onClick={alCerrar} className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200 sm:flex-none">
                            Cancelar
                        </button>
                        <button type="submit" form="orden-form" disabled={procesando} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#147e9d] to-[#3b5bc6] px-8 py-3 font-bold text-white shadow-lg shadow-blue-900/15 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 sm:flex-none">
                            {procesando ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>}
                            Confirmar Orden
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
