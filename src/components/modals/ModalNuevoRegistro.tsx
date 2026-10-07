import { useState } from "react";
import { useNuevoRegistroBodega } from "../../context/Hooks/hookProveedor";

interface ModalNuevoRegistroProps {
    onClose: () => void;
}

export default function ModalNuevoRegistro({ onClose }: ModalNuevoRegistroProps) {
    const [idProveedor, setIdProveedor] = useState<number | "">("");
    const [totalIngresado, setTotalIngresado] = useState<number | "">("");
    const [costoTotal, setCostoTotal] = useState<number | "">("");

    // Consumimos el hook que ya nos trae la lista y la función de guardar
    const { proveedores, registrar, loading, error } = useNuevoRegistroBodega();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!idProveedor || totalIngresado === "" || costoTotal === "") {
            alert("Por favor completa todos los campos.");
            return;
        }

        const exito = await registrar(Number(costoTotal), Number(idProveedor), Number(totalIngresado));

        if (exito) {
            window.location.reload();
        } else {
            alert("Error al guardar. Revisa la consola para más detalles.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-lg w-full shadow-2xl border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                
                <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Registro de Bodega</h2>
                <p className="text-gray-400 text-sm mb-6">Ingresa los detalles de la compra o abastecimiento.</p>

                {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Proveedor */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Proveedor **(ID a enviar)**</label>
                        <div className="relative">
                            <select 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                value={idProveedor} 
                                onChange={(e) => setIdProveedor(Number(e.target.value))} 
                                required
                            >
                                <option value="">-- Seleccionar Proveedor --</option>
                                {proveedores.map((p) => (
                                    <option key={p.IdProveedor} value={p.IdProveedor}>
                                        {p.NombreProveedor}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Cantidad (Total Ingresado) */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Total Ingresado (Cant.)</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500"
                                placeholder="0" 
                                value={totalIngresado} 
                                onChange={(e) => setTotalIngresado(Number(e.target.value))} 
                                required 
                            />
                        </div>

                        {/* Costo */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Costo Total ($)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500"
                                placeholder="0.00" 
                                value={costoTotal} 
                                onChange={(e) => setCostoTotal(Number(e.target.value))} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`flex-1 py-2 rounded-lg font-bold text-white shadow-lg transition-all ${loading ? "bg-gray-600 cursor-wait" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}
                        >
                            {loading ? "Guardando..." : "Registrar Entrada"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}