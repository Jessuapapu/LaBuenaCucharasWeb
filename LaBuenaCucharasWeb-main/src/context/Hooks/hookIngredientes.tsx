import { obtenerIngredientes, crearIngrediente, crearRelacionPlatilloIngrediente, actualizarIngrediente } from "../Services/ingredientes";
import { useState, useCallback, useEffect } from "react";
import type { Ingredientes } from "../Interfaces/Platillos";

export function useCrearIngredientes(){
    const [ingredientes, setIngredientes] = useState<Ingredientes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarIngredientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Utilizamos el mapper: IngredientesMapper.toList
      const datosMapeados = await obtenerIngredientes();
      setIngredientes(datosMapeados);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el catálogo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto inicial al montar el componente/pantalla
  useEffect(() => {
    cargarIngredientes();
  }, [cargarIngredientes]);

  // limpiar (Modales, alertas)
  const limpiarError = useCallback(() => setError(null), []);
//
  const ejecutarCrear = useCallback(async (nombre: string): Promise<boolean> => {
    if (!nombre || !nombre.trim()) {
      setError("El nombre del ingrediente es obligatorio.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const exito = await crearIngrediente(nombre);
      if (exito) {
        await cargarIngredientes(); 
        return true;
      }
      setError("El backend rechazó la creación del ingrediente.");
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la creación.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarIngredientes]);

  const ejecutarActualizar = useCallback(async (id: number, nombre: string, stock: number): Promise<boolean> => {
    if (!id || !nombre || !nombre.trim()) {
      setError("Datos insuficientes para actualizar el ingrediente.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const exito = await actualizarIngrediente(id, nombre, stock);
      if (exito) {
        await cargarIngredientes();
        return true;
      }
      setError(`No se pudo actualizar el ingrediente #${id}.`);
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la actualización.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarIngredientes]);

  return {
    ingredientes,
    loading,
    error,
    limpiarError,
    crearIngrediente: ejecutarCrear,
    actualizarIngrediente: ejecutarActualizar,
    refetchIngredientes: cargarIngredientes // Permite forzar una recarga manual si se necesita
  };
}