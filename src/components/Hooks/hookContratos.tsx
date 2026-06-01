import { useState, useEffect, useMemo, useCallback } from "react";
import type { NuevoContrato } from "../../interfaces/Contratos";
import { getClientes } from "../../services/clientes";
import { crearContrato, getContratos } from "../../services/contratos";
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


export function useContratos() {
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContratos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContratos();
      setContratos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar contratos";
      console.error(errorMessage);
      setError(errorMessage);
      setContratos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  // --- CÁLCULO DE MÉTRICAS (KPIs) MOVIDO AL HOOK ---
  const stats = useMemo(() => {
    if (!contratos.length) return { total: 0, activos: 0, presupuesto: 0 };
    
    return {
      total: contratos.length,
      // Nota: Si 'Estado' viene en minúscula desde la API, asegúrate de hacer un .toLowerCase()
      activos: contratos.filter((c: any) => c.Estado === "Activo" || c.estado === "Activo").length,
      presupuesto: contratos.reduce((acc: number, curr: any) => acc + (Number(curr.Presupuesto || curr.presupuesto) || 0), 0)
    };
  }, [contratos]);

  return { contratos, stats, loading, error, refetch: fetchContratos };
}