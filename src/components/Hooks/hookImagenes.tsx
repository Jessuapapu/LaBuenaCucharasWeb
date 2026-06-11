import { useEffect, useState } from "react";
import { imagenesService } from "../../services/imagenes"; // Ajusta la ruta según tu proyecto

const UrlApi = import.meta.env.VITE_URL_API || "http://127.0.0.1:8001";


export function useImagenesPlatillo(NombrePlatillo: string | null) {
  const [Urlimagen, setImagen] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay nombre de platillo, terminamos la carga rápido y no hacemos la petición
    if (!NombrePlatillo) {
      setCargando(false);
      return;
    }

    const obtenerImagen = async () => {
      setCargando(true); // Reiniciamos el estado de carga por si el platillo cambia
      try {
        const url = await imagenesService.obtenerUrlPorPlatillo(NombrePlatillo);
        setImagen(url);
        setError(null);
      } catch (err) {
        // Validamos el tipo de error en lugar de usar 'any'
        const errorMessage = err instanceof Error ? err.message : "Error desconocido al obtener la imagen";
        console.error("Error al obtener la imagen:", errorMessage);
        setError(errorMessage);
      } finally {
        setCargando(false);
      }
    };

    obtenerImagen();
  }, [NombrePlatillo]); // <-- Corregido: Ahora el efecto se vuelve a ejecutar si NombrePlatillo cambia

  return { Urlimagen, cargando, error };
}

export function useImagenPlatillo( NombrePlatillo: string | null = null) {
  const [Urlimagen, setImagen] = useState("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerImagen = async () => {
      try {
       
        const respuesta = await fetch(`${UrlApi}/imagenes/?NombrePlatillo=${NombrePlatillo}&NumeroImagen=0`);

        if (!respuesta.ok) {
          throw new Error(`HTTP error! status: ${respuesta.status}`);
        }

        const data = await respuesta.json();
        setImagen(data);

      } catch (err: any) {
        console.error("Error al obtener el menú:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerImagen();
  }, []);

  return { Urlimagen, cargando, error };
}