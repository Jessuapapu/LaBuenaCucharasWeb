import { useState, useEffect, useCallback } from "react";
import { ingredientesService } from "../../services/ingredientesService";
import type { IngredienteModel, RelacionPayload } from "../../interfaces/ingredientes";

export function useIngredientes() {
  const [ingredientes, setIngredientes] = useState<IngredienteModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ingredientesService.obtenerTodos();
      
      // Validación estricta de seguridad: Forzamos a que sea un arreglo
      setIngredientes(Array.isArray(data) ? data : []);
      setError(null);
      
    } catch (err) {
      setError("No se pudo conectar con el servidor de ingredientes.");
      // Limpiamos el estado de forma segura si la petición falla
      setIngredientes([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredientes();
  }, [fetchIngredientes]);

  const agregar = async (nombre: string) => {
    try {
      await ingredientesService.crear(nombre);
      await fetchIngredientes();
      return true;
    } catch (err) {
      setError("Error al crear el ingrediente.");
      return false;
    }
  };

  const editar = async (id: number, nombre: string) => {
    try {
      await ingredientesService.actualizar(id, nombre);
      await fetchIngredientes();
      return true;
    } catch (err) {
      setError("Error al editar el ingrediente.");
      return false;
    }
  };

  const eliminar = async (id: number) => {
    try {
      await ingredientesService.eliminar(id);
      await fetchIngredientes();
      return true;
    } catch (err) {
      setError("Error al eliminar el ingrediente.");
      return false;
    }
  };

  const vincular = async (payload: RelacionPayload) => {
    try {
      await ingredientesService.vincularAPlatillo(payload);
      return true;
    } catch (err) {
      setError("Error al vincular los ingredientes al platillo.");
      return false;
    }
  };

  return { ingredientes, loading, error, agregar, editar, eliminar, vincular };
}