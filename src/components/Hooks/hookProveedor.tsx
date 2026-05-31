import { useState, useEffect, useCallback } from "react";
import { proveedoresServiceEditar, proveedoresServiceNuevo, bodegaService, obtenerProveedoresServices, actualizarRegistro, getProveedores} from "../../services/proveedor"; // Ajusta la ruta
import type { Proveedor, NuevoProveedor, PayloadRegistro } from "../../interfaces/Proveedor";

interface ProveedorOption {
  IdProveedor: number;
  NombreProveedor: string;
}

export function useEditarProveedor() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const actualizar = async (proveedor: Proveedor): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await proveedoresServiceEditar.actualizarProveedor(proveedor.IdProveedor, proveedor);
            return true; // Retornamos true si la operación fue exitosa
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error desconocido al actualizar";
            console.error(errorMessage);
            setError(errorMessage);
            return false; // Retornamos false si falló
        } finally {
            setLoading(false);
        }
    };

    return { actualizar, loading, error };
}


export function useCrearProveedor() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const crear = async (datos: NuevoProveedor): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await proveedoresServiceNuevo.crearProveedor(datos);
            return true; // Retorna true si todo sale bien
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error desconocido al crear";
            console.error(errorMessage);
            setError(errorMessage);
            return false; // Retorna false si falla
        } finally {
            setLoading(false);
        }
    };

    return { crear, loading, error };
}


export function useNuevoRegistroBodega() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar proveedores al inicio
    useEffect(() => {
        obtenerProveedoresServices.obtenerProveedores()
            .then(setProveedores)
            .catch(err => console.error("Error cargando proveedores:", err));
    }, []);

    const registrar = async (costoTotal: number, idProveedor: number, totalIngresado: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await bodegaService.crearRegistro(costoTotal, idProveedor, totalIngresado);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error desconocido al guardar";
            console.error(errorMessage);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { proveedores, registrar, loading, error };
}


export function useEditarRegistro() {
  const [listaProveedores, setListaProveedores] = useState<ProveedorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores al montar
  useEffect(() => {
    getProveedores()
      .then(setListaProveedores)
      .catch((err) => console.error("Error cargando proveedores:", err));
  }, []);

  const editar = async (id: number, payload: PayloadRegistro): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await actualizarRegistro(id, payload);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al actualizar";
      console.error(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { listaProveedores, editar, loading, error };
}


export function useProveedores() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProveedores = useCallback(async () => {
        setLoading(true);
        try {
            const json = await getProveedores();
            setData(json);
        } catch (error) {
            console.error("Error cargando proveedores:", error);
            setData([]); // Evitamos que la vista colapse si hay error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    // Retornamos exactamente lo que usaba tu página (data y loading) + una función para recargar
    return { data, loading, refetch: fetchProveedores };
}