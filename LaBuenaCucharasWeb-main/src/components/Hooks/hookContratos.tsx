import { useState, useEffect, useMemo, useCallback } from "react";
import type { NuevoContrato } from "../../context/Interfaces/Contratos";
import { getClientes } from "../../context/Services/clientes";
import { crearContrato, getContratos } from "../../context/Services/contratos";
import type { cliente } from "../../context/Interfaces/Clientes";

export function useNuevoContrato() {
    const [listaClientes, setListaClientes] = useState<cliente[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar Clientes al montar el componente (Optimizando la limpieza de useEffect)
    useEffect(() => {
        let isMounted = true;
        
        const fetchClientes = async () => {
            try {
                const data = await getClientes();
                if (isMounted) {
                    setListaClientes(data || []);
                }
            } catch (err) {
                console.error("Error cargando clientes:", err);
                if (isMounted) {
                    setError("Error de conexión al cargar catálogo de clientes");
                }
            }
        };

        fetchClientes();

        // Cleanup function profesional para evitar memory leaks si el componente se desmonta antes de que la promesa termine
        return () => { 
            isMounted = false; 
        };
    }, []);

    // Crear el contrato
    const crear = async (datos: NuevoContrato): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        try {
            await crearContrato(datos);
            return true; // Éxito
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error interno al conectar con el servidor";
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

    // --- CÁLCULO DE MÉTRICAS (KPIs) ---
    const stats = useMemo(() => {
        if (!contratos.length) return { total: 0, activos: 0, presupuesto: 0 };
        
        return {
            total: contratos.length,
            // Validación robusta a mayúsculas/minúsculas para evitar errores si la API cambia la capitalización
            activos: contratos.filter((c: any) => c.Estado?.toUpperCase() === "ACTIVO" || c.estado?.toUpperCase() === "ACTIVO").length,
            presupuesto: contratos.reduce((acc: number, curr: any) => acc + (Number(curr.Presupuesto || curr.presupuesto) || 0), 0)
        };
    }, [contratos]);

    return { contratos, stats, loading, error, refetch: fetchContratos };
}



// En src/Hooks/hookContratos.ts
export function useEditarContrato() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const actualizarEstado = async (numero_contrato: number, nuevo_estado: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("access_token");
            const UrlApi = import.meta.env.VITE_URL_API || 'http://127.0.0.1:8001';
            
            const res = await fetch(`${UrlApi}/clientes/contratos/${numero_contrato}/estado`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ nuevo_estado })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al actualizar el estado");
            }
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error interno del servidor";
            console.error(errorMessage);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { actualizarEstado, loading, error };
}