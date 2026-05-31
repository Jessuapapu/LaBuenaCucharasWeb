import { useState, useEffect, useMemo, useCallback } from "react";
import type { NuevoContrato } from "../../interfaces/Contratos";
import { getClientes } from "../../services/clientes";
import { crearContrato } from "../../services/contratos";
import type { cliente } from "../../interfaces/Clientes";


export function useNuevoContrato() {
  const [listaClientes, setListaClientes] = useState<cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar Clientes al montar el componente
  useEffect(() => {
    let nose= true;
    getClientes()
      .then((data) => {
        if(nose){setListaClientes(data || []);}
        
      })
      .catch((err) => {
        console.error("Error cargando clientes:", err);
        if(nose){
          setError("No se pudo cargar");
        }
      });
      return()=> {nose=true}
  }, []);

  // crear el contrato
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