import { useState, useEffect } from "react";

interface Contrato {
    NumeroContrato: number;
    IdContrato: number; // Obligatorio para editar
    FechaInicio: string;
    Estado: string;
    IdCliente: number;
    Presupuesto: number;
    FechaVencimiento: string;
}

interface ClienteOption {
    id_cliente: number;
    nombre: string;
}

interface ModalEditarContratoProps {
    contrato: Contrato;
    onClose: () => void;
    // Se elimina onSave
}

export default function ModalEditarContrato({ contrato, onClose }: ModalEditarContratoProps) {
    // Helper para formatear fecha ISO a YYYY-MM-DD para el input
    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        // Manejo defensivo: Asegurarse de que el string tenga el formato correcto antes de dividirlo
        try {
            return new Date(isoString).toISOString().split('T')[0];
        } catch (e) {
            console.error("Error al formatear fecha ISO:", e);
            return isoString; // Devuelve el string original si falla
        }
    };

    const [fechaInicio, setFechaInicio] = useState(formatDate(contrato.FechaInicio));
    const [fechaVencimiento, setFechaVencimiento] = useState(formatDate(contrato.FechaVencimiento));
    const [idCliente, setIdCliente] = useState(contrato.IdCliente);
    const [presupuesto, setPresupuesto] = useState(contrato.Presupuesto);
    const [estado, setEstado] = useState(contrato.Estado);
    const [numeroContrato, setNumeroContrato] = useState(contrato.NumeroContrato);

    const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("http://127.0.0.1:8001/clientes/")
            .then(res => res.json())
            .then(data => setListaClientes(data))
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            NumeroContrato: Number(numeroContrato),
            FechaInicio: new Date(fechaInicio).toISOString(),
            Estado: estado,
            IdCliente: Number(idCliente),
            Presupuesto: Number(presupuesto),
            FechaVencimiento: new Date(fechaVencimiento).toISOString()
        };

        try {
            // Endpoint: /clientes/contratos/{id}
            const response = await fetch(`http://127.0.0.1:8001/clientes/contratos/${contrato.IdContrato}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al actualizar. Estado: " + response.status);

            // Esperamos la respuesta para confirmar el guardado
            await response.json(); 
            
            // --- FORZAR RECARGA DE PÁGINA ---
            window.location.reload();
            
        } catch (error) {
            console.error(error);
            alert("Error al actualizar. Verifica la consola.");
            setLoading(false); // Solo desactivar loading si falló
        }
    };

    const clienteActual = listaClientes.find(c => c.id_cliente === idCliente);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-2xl w-full border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Editar Contrato #{contrato.NumeroContrato}</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-300 mb-1">Nº Contrato</label><input type="number" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" value={numeroContrato} onChange={e => setNumeroContrato(Number(e.target.value))} /></div>
                    
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Cliente</label>
                        <select className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" value={idCliente} onChange={e => setIdCliente(Number(e.target.value))}>
                            {/* Mostrar el cliente actual primero si está cargado, si no, usa los datos de la lista */}
                            {!clienteActual && contrato.IdCliente && (
                                <option value={contrato.IdCliente}>Cargando Cliente ID: {contrato.IdCliente}</option>
                            )}
                            {listaClientes.map((c, i) => (<option key={i} value={c.id_cliente}>{c.nombre}</option>))}
                        </select>
                    </div>

                    <div><label className="block text-sm text-gray-300 mb-1">Fecha Inicio</label><input type="date" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
                    <div><label className="block text-sm text-gray-300 mb-1">Fecha Vencimiento</label><input type="date" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} /></div>

                    <div><label className="block text-sm text-gray-300 mb-1">Presupuesto ($)</label><input type="number" step="0.01" className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" value={presupuesto} onChange={e => setPresupuesto(Number(e.target.value))} /></div>
                    
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Estado</label>
                        <select className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" value={estado} onChange={e => setEstado(e.target.value)}>
                            <option value="Activo">Activo</option><option value="Inactivo">Inactivo</option><option value="Vencido">Vencido</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex gap-3 pt-4 border-t border-gray-700 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-700 text-white">Cancelar</button>
                        <button type="submit" disabled={loading} className={`flex-1 py-2 rounded text-white font-bold ${loading ? "bg-gray-600 cursor-wait" : "bg-blue-600 hover:bg-blue-500"}`}>{loading ? "Guardando..." : "Guardar Cambios"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}