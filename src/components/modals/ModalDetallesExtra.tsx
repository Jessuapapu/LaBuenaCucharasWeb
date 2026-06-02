import { useState, useEffect } from "react";

import { usePlatillosExtra } from "../Hooks/hookComedor";

export interface ModalPlatilloExtraProps {
    abierto: boolean;
    alCerrar: () => void;
    alConfirmar: (nombre: string, precio: number, cantidad: number) => void;
}


export function ModalPlatilloExtra({ abierto, alCerrar, alConfirmar }: ModalPlatilloExtraProps) {
    const [busqueda, setBusqueda] = useState("");
    const [precio, setPrecio] = useState<number | "">("");
    const [cantidad, setCantidad] = useState<number>(1);
    
    const { platillosDb, cargandoDb } = usePlatillosExtra(abierto);

    useEffect(() => {
        if (!abierto) {
            setBusqueda(""); 
            setPrecio(""); 
            setCantidad(1);
        }
    }, [abierto]);

    if (!abierto) return null;

    const manejarSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!busqueda || precio === "") return;
        
        alConfirmar(busqueda, Number(precio), cantidad);
        alCerrar();
    };

    return (
        // 1. Overlay (Fondo oscuro): Más nítido y con blur mejorado
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 transition-all duration-300">
            
            {/* 2. Contenedor Principal: Diseño de "App Flotante" */}
            <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden flex flex-col animate-[fade-in-up_0.3s_ease-out]">
                
                {/* 3. Cabecera (Header): Limpia, con un ícono para contexto visual */}
                <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <h3 className="font-black text-2xl text-slate-800 tracking-tight">Agregar Extra</h3>
                    </div>
                    
                    <button 
                        onClick={alCerrar} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                        aria-label="Cerrar modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* 4. Formulario (Cuerpo): Espaciados amplios para pantallas táctiles (Tablets) */}
                <form onSubmit={manejarSubmit} className="p-8 flex flex-col gap-6">
                    
                    {/* Campo de Búsqueda */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                            Nombre del Platillo
                        </label>
                        <div className="relative">
                            <input 
                                type="text"
                                list="lista-platillos"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder={cargandoDb ? "Sincronizando menú..." : "Ej. Porción de arroz..."}
                                disabled={cargandoDb}
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 text-lg font-bold rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                            />
                            {/* Ícono de búsqueda posicionado absolutamente dentro del input */}
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        
                        <datalist id="lista-platillos">
                            {platillosDb.map((p, i) => (
                                <option key={i} value={p.nombre_platillo}>{p.nombre_categoria}</option>
                            ))}
                        </datalist>
                    </div>

                    {/* Fila de Precio y Cantidad */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Campo Precio */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Precio Base
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">C$</span>
                                <input 
                                    type="number" 
                                    min="0" 
                                    step="any"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 text-xl font-black rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Campo Cantidad */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Cantidad
                            </label>
                            <div className="relative flex items-center">
                                {/* Botón Menos (Opcional visualmente, el mesero puede escribir o tocar) */}
                                <button type="button" onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="absolute left-2 w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-500 hover:text-blue-600 border border-slate-100 focus:outline-none active:scale-95 transition-transform">-</button>
                                
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={cantidad}
                                    onChange={(e) => setCantidad(Number(e.target.value))}
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 text-xl font-black rounded-2xl text-center px-14 py-4 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />

                                {/* Botón Más */}
                                <button type="button" onClick={() => setCantidad(cantidad + 1)} className="absolute right-2 w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-500 hover:text-blue-600 border border-slate-100 focus:outline-none active:scale-95 transition-transform">+</button>
                            </div>
                        </div>
                    </div>

                    {/* Resumen Visual del Total (Opcional pero útil) */}
                    {precio !== "" && (
                        <div className="mt-2 flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <span className="text-blue-800/60 font-bold text-sm">Subtotal de este extra</span>
                            <span className="text-blue-700 font-black text-xl">C${(Number(precio) * cantidad).toFixed(2)}</span>
                        </div>
                    )}

                    {/* 5. Footer (Botón de Acción): Grande, fácil de presionar */}
                    <button 
                        type="submit" 
                        disabled={cargandoDb || !busqueda || precio === ""}
                        className="w-full mt-4 bg-blue-600 text-white font-black text-xl py-5 rounded-2xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        <span>Añadir a la Orden</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>

                </form>
            </div>
        </div>
    );
}