import { useState, useEffect, useCallback } from "react";
import { horariosService } from "../../context/Services/config";
import type { CambioDeHoraModel, CambioDeHoraModelEditar } from "../../context/Interfaces/cambiosdehora";

export const useHorarios = () => {
  const [horarios, setHorarios] = useState<CambioDeHoraModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await horariosService.obtenerTodos();
      setHorarios(data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los horarios. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  const agregarHorario = async (data: CambioDeHoraModel): Promise<boolean> => {
    try {
      await horariosService.crear(data);
      await fetchHorarios();
      return true;
    } catch (err) {
      setError("Hubo un error al crear el horario.");
      return false;
    }
  };

  const actualizarHorario = async (data: CambioDeHoraModelEditar): Promise<boolean> => {
    try {
      await horariosService.editar(data);
      await fetchHorarios();
      return true;
    } catch (err) {
      setError("Hubo un error al editar el horario.");
      return false;
    }
  };

  const eliminarHorario = async (nombre: string): Promise<boolean> => {
    try {
      await horariosService.eliminar(nombre);
      await fetchHorarios();
      return true;
    } catch (err) {
      setError("Hubo un error al eliminar el horario.");
      return false;
    }
  };

  return {
    horarios,
    loading,
    error,
    agregarHorario,
    actualizarHorario,
    eliminarHorario,
    refrescar: fetchHorarios
  };
};