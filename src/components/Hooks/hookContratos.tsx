import { useState, useEffect } from "react";
import type { NuevoContrato } from "../../interfaces/Contratos";
import { getClientes } from "../../services/clientes";
import { crearContrato } from "../../services/contratos";

interface ClienteOption {
  nombre: string;
  [key: string]: any; 
}


export function useNuevoContrato() {
  const [listaClientes, setListaClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar Clientes al montar el componente
  useEffect(() => {
    // Usamos la función de tu servicio de clientes!
    getClientes()
      .then((data) => {
        setListaClientes(data);
      })
      .catch((err) => {
        console.error("Error cargando clientes:", err);
      });
  }, []);

  // 2. Función para crear el contrato
  const crear = async (datos: NuevoContrato): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await crearContrato(datos);
      return true; // Éxito
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error(errorMessage);
      setError(errorMessage);
      return false; // Fallo
    } finally {
      setLoading(false);
    }
  };

  return { listaClientes, crear, loading, error };
}