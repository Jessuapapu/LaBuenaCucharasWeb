import { useState, useMemo } from "react";
//import { useOrdenes } from "../components/Hooks/hookOrdenes";
import CardPedido from "../components/cards/CardOrden";
export default function OrdenesPage(){
    const [data, setData] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>("");
    const filteredData = useMemo(() => {
            if (!activeFilter) return data;
            return data.filter(p => p.estado_pedido?.toUpperCase() === activeFilter.toUpperCase());
        }, [data, activeFilter]);

    return(
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h1 className="text-3xl font-bold text-white tracking-tight">Registro de pedidos</h1>
            <p className="text-gray-400 mt-1 text-sm">Gestiona los pedidos.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredData.map((Orden) =>(
                <CardPedido Pedido={Orden} 
                Actualizar={(actualizado) => {
                // Opcional: Actualizar la lista local si no quieres recargar
                console.log("Pedido actualizado:", actualizado);
                }}></CardPedido>
                ))}
             </div>
        </div>
    )
}