import { useState, useMemo, useEffect } from "react";
import type { Menu_dario } from "../../interfaces/Platillos";

const API_URL = import.meta.env.VITE_API_URL;
interface PlatilloOption {
    nombre_platillo: string;
}
export function useMenu_diario(dataInicial: any[]){
    const diaHoy = new Date();
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
            setDatos(data);
        } catch (error) {
            console.error("Error al cargar menús:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarMenus();
    }, [fecha]);

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

    const obtenerPlatilloDia = (dia: number): Menu_dario[] => {
        if (!dia) return [];
        const fechaStr = `${Anio}-${String(meses + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return datos.filter(item => item.day === fechaStr);
    };

    const manejarClickDia = (dia: number) => {
        const fechaStr = `${Anio}-${String(meses + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        setmodalDta({
            day: fechaStr,
            nombre_platillo: "",
            precio_unitario: 0
        });
    };

    // Guardar o editar
    const guardarOEditarMenu = async (menu: Menu_dario) => {
        try {
            if (menu.id_menu) {
                // Modo Edición (Esquema MenuUpdate)
                const response = await fetch(`${API_URL}/menu/${menu.id_menu}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre_platillo: menu.nombre_platillo })
                });
                if (!response.ok) throw new Error("Error al editar");
            } else {
                // Modo Creación (Esquema MenuIn)
                const response = await fetch(`${API_URL}/menu/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        day: menu.day,
                        nombre_platillo: menu.nombre_platillo,
                        monto: menu.precio_unitario
                    })
                });
                if (!response.ok) throw new Error("Error al crear");
            }

            await cargarMenus(); // Recarga los datos del calendario desde FastAPI
            setmodalDta(null);  // Cierra el modal
        } catch (error) {
            console.error("Error al procesar el menú:", error);
        }
    };

    const AsignarPlatilloRapido = async (dia: string, nombrePlatillo: string)=>{
        if(!nombrePlatillo) return;
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