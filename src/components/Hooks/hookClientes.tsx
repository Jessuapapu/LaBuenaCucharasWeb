import { useEffect, useState } from "react";
import { getContratosByCliente } from "../../services/contratos";
import { getClienteById } from "../../services/clientes";
import type { cliente } from "../../interfaces/Clientes";
import type { Contrato } from "../../interfaces/Contratos";

  //const API_URL = import.meta.env.VITE_API_URL;

export function useCliente(id_cliente: number | null){
    const [loading, setloading]= useState(false);
    const [error, setError]= useState<string | null>(null);
    const [cliente, setCliente] = useState<cliente | null>(null);
    const [contratos, setContratos] = useState<Contrato[]>([]);

    useEffect(() => {

        if (!id_cliente) return;

        const buscarCliente = async () => {
            setloading(true);
            try {
                const [clienteData, contratosData] = await Promise.all([
                    getClienteById(id_cliente),
                    getContratosByCliente(id_cliente)
                ]);
                setCliente(clienteData);
                setContratos(contratosData);
                setError(null);
            } catch (err) {
                setError("No se pudo cargar el cliente");
            } finally {
                setloading(false);
            }
        };
        buscarCliente();
    }, [id_cliente]);
    return { cliente, contratos, loading, error };
}

    