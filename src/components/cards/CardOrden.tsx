//import { useState } from "react";
import { Hash, Calendar, ChevronRight } from "lucide-react";
import ModalPedido from "../modals/ModalPedido";

interface CardPedidoProps {
    idOrden: number;
    cliente: string;
    mesa: string;
    fecha: string;
    total: number;
    items: any[]; // Detalle de platillos
    onClick?: () => void;
}

export default function CardPedido({ idOrden, cliente, mesa, fecha, total, items, onClick }: CardPedidoProps) {
    return (
        <div 
            onClick={onClick}
            className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg transition-all hover:border-green-500/50 hover:shadow-green-900/10 cursor-pointer"
        >
            {/* Header de la Card */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">
                    <Hash size={14} className="text-green-500" />
                    <span className="text-xs font-bold text-green-400">{idOrden}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Calendar size={14} />
                    <span>{fecha}</span>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="space-y-3">
                <div>
                    <h5 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors truncate">
                        {cliente}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                            Mesa {mesa}
                        </span>
                    </div>
                </div>

                {/* Vista previa de items (máximo 2) */}
                <div className="bg-black/20 rounded-lg p-3 space-y-1">
                    {items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-400">
                            <span className="truncate flex-1">
                                {item.cantidad}x {item.nombre_platillo}
                            </span>
                        </div>
                    ))}
                    {items.length > 2 && (
                        <p className="text-[10px] text-gray-600 italic">
                            + {items.length - 2} productos más...
                        </p>
                    )}
                </div>
            </div>

            {/* Footer de la Card */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Total a pagar</p>
                    <p className="text-2xl font-black text-white">${total.toFixed(2)}</p>
                </div>
                
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                    Gestionar
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Decoración lateral estilo ticket */}
            <div className="absolute top-1/2 -left-1 w-2 h-8 bg-green-500 rounded-r-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}