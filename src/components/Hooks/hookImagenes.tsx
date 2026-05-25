import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function useImagenesPlatillo(NombrePlatillo: string | null){
    const [Urlimagen, setImagen] = useState("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(!NombrePlatillo) return;
    const obtenerImagen = async () => {
      try {
       
        const respuesta = await fetch(`${API_URL}/imagenes/?NombrePlatillo=${NombrePlatillo}&NumeroImagen=1`);

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