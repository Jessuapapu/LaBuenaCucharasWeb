import { useState, useCallback } from 'react';
import type { UsuarioData } from '../Interfaces/usuarios';

const API_URL = import.meta.env.VITE_API_URL;

// Helper para obtener las cabeceras con el token de portador de manera segura
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TODOS LOS USUARIOS
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al sincronizar el catálogo de usuarios");
      }

      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado de red";
      setError(msg);
      console.error("fetchUsuarios error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // NUEVO USUARIO
  const registrarUsuario = useCallback(async (username: string, password_plano: string, rol: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user: username,
          contra_plano: password_plano,
          rol: rol
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo registrar el usuario");
      }

      await fetchUsuarios(); // Refrescar lista automáticamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios]);

  // ACTUALIZAR USUARIO EXISTENTE
  const actualizarUsuario = useCallback(async (username: string, password_plano?: string, rol?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/actualizar`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user: username,
          contra_plano: password_plano || "", // Si viene vacío se pasa cadena vacía como control
          rol: rol
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo actualizar el usuario");
      }

      await fetchUsuarios(); // Refrescar lista automáticamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios]);

  // DESACTIVAR USUARIO
  const desactivarUsuario = useCallback(async (username: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/desactivar`, {
        method: "PUT", // Mantenemos tu declaración PUT del backend para desactivar
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user: username,
          contra_plano: "", 
          rol: ""
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo desactivar el usuario");
      }

      // Cambiar estado local instantáneamente para una respuesta visual veloz
      setUsuarios(prev =>
        prev.map(u => u.Username === username ? { ...u, activo: false } : u)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al desactivar");
      return false;
    }
  }, []);

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    registrarUsuario,
    actualizarUsuario,
    desactivarUsuario
  };
}