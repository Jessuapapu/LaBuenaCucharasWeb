import { useState, useEffect } from 'react';
import type { Platillos, PlatilloExtraDB } from '../Interfaces/Platillos';
import { socket } from '../Services/websocket';

const UrlApi = import.meta.env.VITE_API_URL;
export interface mesa {
    id_mesa: number;
    Estado: boolean;
}

export interface estadoComedor {
    msj: string;
    status: boolean;
}

// ... [useMenu y usePlatillosExtra se mantienen exactamente igual] ...

export function useMenu() {
  const [menu, setMenu] = useState<Platillos[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerMenu = async () => {
      try {
        const respuesta = await fetch(`${UrlApi}/menu/hoy`);
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        const data = await respuesta.json();
        setMenu(data);
      } catch (err: any) {
        console.error("Error al obtener el menú:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerMenu();
  }, []);

  return { menu, cargando, error };
}

export function usePlatillosExtra(abierto: boolean) {
    const [platillosDb, setPlatillosDb] = useState<PlatilloExtraDB[]>([]);
    const [cargandoDb, setCargandoDb] = useState(false);

    useEffect(() => {
        if (abierto && platillosDb.length === 0) {
            const cargarPlatillos = async () => {
                setCargandoDb(true);
                try {
                    const token = localStorage.getItem("access_token");
                    const respuesta = await fetch(`${UrlApi}/platillos/`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { "Authorization": `Bearer ${token}` } : {})
                        }
                    });
                    if (respuesta.status === 401) {
                        window.location.href = "/login";
                        throw new Error("Sesión expirada o inválida");
                    }
                    if (!respuesta.ok) throw new Error("Error en el servidor al cargar platillos");
                    const data: PlatilloExtraDB[] = await respuesta.json();
                    setPlatillosDb(data);
                } catch (error) {
                    console.error("Error cargando platillos extra:", error);
                } finally {
                    setCargandoDb(false);
                }
            };
            cargarPlatillos();
        }
    }, [abierto, platillosDb.length]);

    return { platillosDb, cargandoDb };
}

// ----------------------------------------------------
// HOOK: ESTADO DEL COMEDOR (ABRIR / CERRAR)
// ----------------------------------------------------
export function useEstado() {
  const [estado, setEstado] = useState<estadoComedor>({msj: "inactivo", status: false});
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cargandoAccion, setCargandoAccion] = useState<boolean>(false);

  // 1. Carga Inicial
  useEffect(() => {
    const obtenerEstado = async () => {
      try {
        // [!] URL A CAMBIAR: Pon aquí la ruta real que devuelve el estado del comedor
        const respuesta = await fetch(`${UrlApi}/comedor/Estado`);
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        const data = await respuesta.json();
        setEstado(data);
      } catch (err: any) {
        console.error("Error al obtener el estado:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerEstado();
  }, []);

  // 2. Operación PUT Genérica con JWT
  const cambiarEstadoComedor = async (nuevoStatus: boolean) => {
    setCargandoAccion(true);
    try {
        const token = localStorage.getItem("access_token");
        
        // [!] URL A CAMBIAR: Endpoint que recibe el PUT para abrir/cerrar
        const urlEndpoint = nuevoStatus 
            ? `${UrlApi}/comedor/abrir` 
            : `${UrlApi}/comedor/cerrar`;

        const respuesta = await fetch(urlEndpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });

        if (respuesta.status === 401) throw new Error("No tienes permisos de administrador.");
        if (!respuesta.ok) throw new Error("Fallo al actualizar el estado del comedor.");

        // Actualización optimista de la UI
        setEstado({ msj: nuevoStatus ? "Comedor Abierto" : "Comedor Cerrado", status: nuevoStatus });
        alert(`Éxito: El comedor ahora está ${nuevoStatus ? 'ABIERTO' : 'CERRADO'}.`);

    } catch (err: any) {
        alert(err.message);
    } finally {
        setCargandoAccion(false);
    }
    window.location.reload()
  };

  return { 
      estado, 
      cargando, 
      error, 
      cargandoAccion,
      abrirComedor: () => cambiarEstadoComedor(true),
      cerrarComedor: () => cambiarEstadoComedor(false)
  };
}


export function useMesas() {
    const [numeroMesa, setNumeroMesa] = useState<mesa[]>([]);
    const [cargando, setCargando] = useState(true);
    const [cargandoAccion, setCargandoAccion] = useState(false);

    // 1. Cargar las mesas iniciales
    useEffect(() => {
        fetch(`${UrlApi}/comedor/NumeroMesas`) 
            .then(res => res.json())
            .then((data) => setNumeroMesa(data))
            .catch(err => console.error("Error al obtener las mesas:", err))
            .finally(() => setCargando(false));
    }, []);

    // 2. Escucha de Sockets (Mejorada para no duplicar)
    useEffect(() => {
        const manejarAumentarMesa = (data: { IdMesa: number }) => {
            setNumeroMesa(prev => {
                if (prev.some(m => m.id_mesa === data.IdMesa)) return prev;
                return [...prev, { id_mesa: data.IdMesa, Estado: false }];
            });
        };

        const manejarEliminarMesa = (data?: { IdMesa: number }) => {
            setNumeroMesa(prev => {
                if (prev.length === 0) return prev;
                // Si el socket manda qué mesa específica eliminar
                if (data?.IdMesa) {
                    return prev.filter(m => m.id_mesa !== data.IdMesa);
                }
                // Fallback: Si no manda ID, elimina la última mesa físicamente
                return prev.slice(0, -1);
            });
        };

        socket.on("aumentar_mesa", manejarAumentarMesa);
        socket.on("eliminar_mesa", manejarEliminarMesa);

        return () => {
            socket.off("aumentar_mesa", manejarAumentarMesa);
            socket.off("eliminar_mesa", manejarEliminarMesa);
        };
    }, []);

    // 3. Operación PUT Genérica para Mesas
    const operarMesasApi = async (accion: 'aumentar' | 'disminuir') => {
        setCargandoAccion(true);
        try {
            const token = localStorage.getItem("access_token");
            
            // [!] URL A CAMBIAR: Endpoints de gestión de mesas
            const urlEndpoint = accion === 'aumentar' 
                ? `${UrlApi}/comedor/mesa/agregar` 
                : `${UrlApi}/comedor/mesa/eliminar`;

            const respuesta = await fetch(urlEndpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            });

            if (respuesta.status === 401) throw new Error("No tienes permisos para editar mesas.");
            if (!respuesta.ok) throw new Error(`Error al ${accion} mesa.`);

            // Nota: No actualizamos el estado manualmente aquí porque el WebSocket ('aumentar_mesa' o 'eliminar_mesa')
            // lo hará automáticamente cuando el backend envíe la confirmación al broadcast.

        } catch (err: any) {
            alert(err.message);
        } finally {
            setCargandoAccion(false);
        }
    };

    return { 
        numeroMesa, 
        cargando, 
        cargandoAccion,
        sumarMesa: () => operarMesasApi('aumentar'),
        restarMesa: () => operarMesasApi('disminuir')
    };
}