import { useEffect, useState } from "react";
import { getContratosByCliente } from "../../services/contratos";
import { getClienteById, crearCliente, actualizarCliente} from "../../services/clientes";
import type { cliente, NuevoCliente} from "../../interfaces/Clientes";
import type { Contrato } from "../../interfaces/Contratos";



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



export function useCrearCliente() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (datos: NuevoCliente): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamamos directamente a la función
      await crearCliente(datos);
      return true; // Éxito
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al crear";
      console.error(errorMessage);
      setError(errorMessage);
      return false; // Fallo
    } finally {
      setLoading(false);
    }
  };

  return { crear, loading, error };
}  


export function useEditarCliente() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editar = async (idCliente: number | string | undefined, datos: cliente): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamamos a la función individual
      await actualizarCliente(idCliente, datos);
      return true; // Retornamos true si fue exitoso
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al actualizar";
      console.error(errorMessage);
      setError(errorMessage);
      return false; // Retornamos false si falló
    } finally {
      setLoading(false);
    }
  };

  return { editar, loading, error };
}




