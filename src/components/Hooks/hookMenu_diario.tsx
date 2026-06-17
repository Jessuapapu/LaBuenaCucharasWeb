import { useState, useMemo, useEffect } from "react";
import type { Menu_dario } from "../../interfaces/Platillos";

const API_URL = import.meta.env.VITE_API_URL;
interface PlatilloOption {
    NombrePlatillo: string;
    Monto: number;// es el precio pero en el backend es monro (evitamos nombres mezclados y que typesciprt no coloapse)
}

const token = localStorage.getItem("access_token");

export function useMenu_diario(dataInicial: any[] = []) {
    const diaHoy = useMemo(() => new Date(), []);
    const [fecha, setfecha] = useState(new Date());
    const [datos, setDatos] = useState<Menu_dario[]>([]);
    const [cargando, setCargando] = useState(false);
    const [modalDta, setmodalDta] = useState<Menu_dario | null>(null);
    const [listaPlatillos, setListaPlatillos] = useState<PlatilloOption[]>([]);

    //Obtener menus
    const cargarMenus = async () => {
        try {
            setCargando(true);
            const response = await fetch(`${API_URL}/menu/`);
            if (!response.ok) throw new Error("Error en la petición");

            const data = await response.json();
            setDatos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar menús:", error);
            if (dataInicial) setDatos(dataInicial);
        } finally {
            setCargando(false);
        }
    };

    const cargarPlatillosBase = async () => {
        try {
            const response = await fetch(`${API_URL}/platillos/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Inyección de seguridad
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            }

            );
            if (!response.ok) throw new Error("Error al obtener platillos base");
            const data = await response.json();
            setListaPlatillos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando platillos base:", error);
        }
    };

    useEffect(() => {
        cargarMenus();
    }, [fecha]);

    useEffect(() => {
        cargarPlatillosBase();
    }, [])

    // meses y years del calendario
    const meses = fecha.getMonth();
    const Anio = fecha.getFullYear();
    const MesTexto = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    const cambiarMes = (off: number) => {
        setfecha(new Date(Anio, meses + off, 1));
    };

    const celdas = useMemo(() => {
        const primerDia = new Date(Anio, meses, 1).getDay();
        const diasEnMes = new Date(Anio, meses + 1, 0).getDate();
        return [
            ...Array(primerDia).fill(null),
            ...Array.from({ length: diasEnMes }, (_, i) => i + 1)
        ];
    }, [Anio, meses]);

    const obtenerPlatilloDia = (dia: number): any[] => {
        if (!dia) return [];
        const fechaStr = `${Anio}-${String(meses + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return datos.filter(item => {
            if (!item.Fecha) return false;

            // Si el string de la API viene como "2026-05-09T00:00:00.000Z", 
            // split('T')[0] se queda únicamente con "2026-05-09"
            const fechaApiStr = item.Fecha.includes('T') ? item.Fecha.split('T')[0] : item.Fecha.substring(0, 10);
            return fechaApiStr === fechaStr;
        });
    };

    const manejarClickDia = (dia: number) => {
        const fechaStr = `${Anio}-${String(meses + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        setmodalDta({
            id: undefined,         // Clave primaria del GET
            Fecha: fechaStr,       // Fecha del GET
            NombrePlatillo: "",    // Nombre del GET
            Monto: 0
        } as any); //Para que no este como loco buscando
    };

    // Guardar o editar
    const guardarOEditarMenu = async (platilloData: any) => {
        try {
            const isEditing = !!modalDta?.id;

            if (isEditing) {
                // Modo Edición: PUT a /menu/{id}
                const url = `${API_URL}/menu/${modalDta.id}`;
                const response = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                        , ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ nombre_platillo: platilloData.NombrePlatillo })
                });
                if (!response.ok) throw new Error("Error al actualizar");
            } else {
                // Pide un MenuIn (day, nombre_platillo, monto), esto es de creacion
                const url = `${API_URL}/menu/`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        day: platilloData.Fecha,                  // Traduce 'Fecha' a 'day'
                        nombre_platillo: platilloData.NombrePlatillo, // Traduce 'NombrePlatillo' a 'nombre_platillo'
                        monto: Number(platilloData.Monto),           // Traduce 'Monto' a 'monto'
                        hora: platilloData.Hora
                    })
                });
                if (!response.ok) throw new Error("Error al crear lote");
            }
            //Porque se tiene que mapear PORQUE Typescript se vuelve loco buscando nombres cruzados como day y luego fecha, etc
            // Refrescamos la interfaz y cerramos el modal limpiando estados
            await cargarMenus();
            setmodalDta(null);
        } catch (error) {
            console.error("Error en guardado (Hook):", error);
            throw error; // Lo lanzamos para que el modal sepa que hubo un fallo
        }
    };

    const AsignarPlatilloRapido = async (dia: string, nombrePlatillo: string) => {
        if (!nombrePlatillo) return;
        try {
            const response = await fetch(`${API_URL}/menu/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    day: dia,                  // Guardael dia
                    nombre_platillo: nombrePlatillo,
                    monto: 0                   // Precio por defecto en asignación rápida
                })
            });

            if (!response.ok) throw new Error("Error en la asignación rápida");

            // re-ejecutamos el GET
            await cargarMenus();
        } catch (error) {
            console.error("Error en asignación rápida (Hook):", error);
            alert("No se pudo asignar el platillo rápido.");
        }
    }

    return {
        MesTexto, celdas, diaHoy, meses, Anio, modalDta, cargando, datos, listaPlatillos,
        setmodalDta, cambiarMes, obtenerPlatilloDia, manejarClickDia, guardarOEditarMenu, AsignarPlatilloRapido
    };
}