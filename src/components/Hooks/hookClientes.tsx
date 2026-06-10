import { useEffect, useState, useCallback  } from "react";
import { getContratosByCliente } from "../../services/contratos";
import { getClienteById, crearCliente, actualizarCliente, getClientes} from "../../services/clientes";
import type { cliente, NuevoCliente} from "../../interfaces/Clientes";
import type { Contrato } from "../../interfaces/Contratos";
import { mapClientes } from "../../map/clientes";
//import { mapContratos } from "../../map/contratos";

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
//prueba
export function useSoloClientes() {
  const [clientes, setClientes] = useState<cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getClientes();
      
      //para normalizar la respuesta de la API
      const clientesNormalizados = mapClientes(data);
      
      setClientes(clientesNormalizados);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar los clientes";
      console.error(errorMessage);
      setError(errorMessage);
      setClientes([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return { 
    clientes, 
    loading, 
    error, 
    refetch: fetchClientes 
  };
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

export function useClientes() {
  const [clientes, setClientes] = useState<cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar los clientes";
      console.error(errorMessage);
      setError(errorMessage);
      setClientes([]); // Fallback seguro
    } finally {
      setLoading(false);
    }
  }, []);

  // Se ejecuta automáticamente al montar la vista
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return { 
    clientes, 
    loading, 
    error, 
    refetch: fetchClientes 
  };
}