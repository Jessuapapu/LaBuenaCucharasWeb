import { useEffect, useState } from "react";
import { imagenesService } from "../../services/imagenes"; 

const UrlApi = import.meta.env.VITE_URL_API || "http://127.0.0.1:8001";


export function useImagenesPlatillo(IdPlatillo: number) {
  const [Urlimagen, setImagen] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay id de platillo, terminamos la carga rápido y no hacemos la petición
    if (!IdPlatillo) {
      setCargando(false);
      return;
    }

    const obtenerImagen = async () => {
      setCargando(true); // Reiniciamos el estado de carga por si el platillo cambia
      try {
        const url = await imagenesService.obtenerUrlPorIdPlatillo(IdPlatillo);
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
  }, [IdPlatillo]); // si IdPlatillo cambia

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