import { useState } from "react";
import { useNuevoContrato } from "../Hooks/hookContratos";
import type { Contrato } from "../../interfaces/Contratos";

interface ModalNuevoContratoProps {
    contrato: Contrato & { idContrato?: number; IdContrato?: number };
    onClose: () => void;
}


export default function ModalNuevoContrato({ onClose }: ModalNuevoContratoProps) {
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split("T")[0]);
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [nombreCliente, setNombreCliente] = useState(""); 
    const [presupuesto, setPresupuesto] = useState<number | "">("");
    const [numeroContrato, setNumeroContrato] = useState<number | "">("");

    // Extraemos todo del hook
    const { listaClientes, crear, loading, error } = useNuevoContrato();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombreCliente || !presupuesto || !fechaVencimiento || !numeroContrato) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const payload = {
            numero_contrato: Number(numeroContrato),
            fecha_inicio: new Date(fechaInicio).toISOString(),
            nombre_cliente: nombreCliente, 
            presupuesto: Number(presupuesto),
            fecha_fin: new Date(fechaVencimiento).toISOString()
        };

        // Delegamos al hook
        const exito = await crear(payload);

        if (exito) {
            window.location.reload();
        } else {
            alert("Error al guardar. Verifica la conexión y los datos.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-2xl w-full shadow-2xl border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                
                <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Contrato</h2>
                <p className="text-gray-400 text-sm mb-6">Registra un nuevo acuerdo comercial.</p>

                {/* Mensaje de error visual si la API falla */}
                {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Numero Contrato */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Nº Contrato</label>
                        <input type="number" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500" 
                            value={numeroContrato} onChange={e => setNumeroContrato(Number(e.target.value))} required placeholder="Ej: 1001" />
                    </div>

                    {/* Selector de Cliente */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Cliente</label>
                        <div className="relative">
                            <select 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                value={nombreCliente} 
                                onChange={(e) => setNombreCliente(e.target.value)} 
                                required
                            >
                                <option value="">-- Seleccionar Cliente --</option>
                                {listaClientes.map((c, i) => (
                                    <option key={i} value={c.nombre}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Fecha Inicio</label>
                        <input type="date" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500"
                            value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Fecha Vencimiento</label>
                        <input type="date" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500"
                            value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} required />
                    </div>

                    {/* Presupuesto */}
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-300 mb-1">Presupuesto ($)</label>
                        <input type="number" step="0.01" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500"
                            value={presupuesto} onChange={e => setPresupuesto(Number(e.target.value))} required placeholder="0.00" />
                    </div>

                    <div className="md:col-span-2 flex gap-3 pt-4 mt-2 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">Cancelar</button>
                        <button type="submit" disabled={loading} className={`flex-1 py-2 rounded-lg font-bold text-white shadow-lg ${loading ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-500 shadow-green-900/20"}`}>
                            {loading ? "Guardando..." : "Crear Contrato"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}