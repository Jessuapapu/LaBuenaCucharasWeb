import { useState, useEffect, useCallback } from 'react';
import { cocinaService } from '../Services/cocina';
import type { OrdenCocina } from '../Interfaces/Comedor';
import { socket } from '../Services/websocket';

export function useCocina() {
  const [ordenes, setOrdenes] = useState<OrdenCocina[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para la notificación visual en pantalla
  const [notificacion, setNotificacion] = useState<{ visible: boolean, msj: string, tipo: 'nueva' | 'modificada' } | null>(null);

  const reproducirAlerta = (tipo: 'nueva' | 'modificada') => {
    // Vibración (solo funciona en dispositivos móviles soportados)
    if (navigator.vibrate) {
      tipo === 'nueva' ? navigator.vibrate([200, 100, 200]) : navigator.vibrate([100, 50, 100]);
    }

    // Ruta corregida: se usa el mismo sonido para ambos casos
    const audioSrc = '/sounds/notificacion.mp3';
    
    const audio = new Audio(audioSrc);
    // Se fuerza el volumen al máximo por si acaso
    audio.volume = 1.0; 
    
    audio.play().catch(e => {
      console.warn("El navegador bloqueó el sonido automático. Haz clic en cualquier parte de la pantalla primero.", e);
    });
  };

  const mostrarNotificacion = (msj: string, tipo: 'nueva' | 'modificada') => {
    reproducirAlerta(tipo);
    setNotificacion({ visible: true, msj, tipo });
    
    // Ocultar notificación después de 4 segundos
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  const cargarOrdenes = async () => {
    try {
      const data = await cocinaService.obtenerOrdenesActivas();
      setOrdenes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();

    const handleNuevaOrden = (data: any) => {
      mostrarNotificacion(`¡NUEVA ORDEN EN MESA ${data.IdMesa}!`, 'nueva');
      cargarOrdenes();
    };

    const handleOrdenActualizada = (data: any) => {
      mostrarNotificacion(`¡ORDEN MODIFICADA EN MESA ${data.IdMesa}!`, 'modificada');
      cargarOrdenes();
    };

    socket.on("orden_generada", handleNuevaOrden);
    socket.on("orden_actualizada", handleOrdenActualizada);

    return () => {
      socket.off("orden_generada", handleNuevaOrden);
      socket.off("orden_actualizada", handleOrdenActualizada);
    };
  }, []);

  const marcarOrdenLista = useCallback((idMesa: number, idOrden: number) => {
    socket.emit("actualizar_cocina", { id_mesa: idMesa, id_orden: idOrden });
    setOrdenes(prev => prev.filter(o => o.IdOrden !== idOrden));
  }, []);

  return { ordenes, cargando, notificacion, marcarOrdenLista };
}