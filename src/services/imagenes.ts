const API_URL = import.meta.env.VITE_API_URL;

export const imagenesService = {
  /**
   * Obtiene la URL de la imagen de un platillo específico.
   * Se asume que el backend retorna directamente el string de la URL o un JSON plano.
   */
  obtenerUrlPorPlatillo: async (nombrePlatillo: string): Promise<string> => {
    const respuesta = await fetch(
      `${API_URL}/imagenes/?NombrePlatillo=${nombrePlatillo}&NumeroImagen=1`
    );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP! status: ${respuesta.status}`);
    }

    const data = await respuesta.json();
    return data;
  },

  obtenerUrlPorIdPlatillo: async(IdPlatillo: number) =>{
    const respuesta = await fetch(`${API_URL}/imagenes/?IdPlatillo=${IdPlatillo}&NumeroImagen=0`)
    
    if(!respuesta.ok) throw new Error(`Error HTTP! status: ${respuesta.status}`)
      const data= await respuesta.json()
    return data;
  }
};