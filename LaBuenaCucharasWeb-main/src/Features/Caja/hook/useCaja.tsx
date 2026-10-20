import { useState, useEffect, useCallback } from 'react';
import { apiCaja } from '../../../context/Services/caja';
import { socket } from '../../../context/Services/websocket';

export function useCaja() {
    const [estadoCaja, setEstadoCaja] = useState(false);
    const [datosCaja, setDatosCaja] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    const cargarCaja = useCallback(async () => {
        try {
            const resEstado = await apiCaja.obtenerEstado();
            setEstadoCaja(resEstado.status);
            
            if (resEstado.status) {
                const data = await apiCaja.obtenerCaja();
                setDatosCaja(data);
            } else {
                setDatosCaja(null);
            }
        } catch (error) {
            console.error("Error al cargar la caja:", error);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarCaja();

        // Escuchar los WebSockets que configuramos en tu backend
        socket.on('actualizar_caja', (data) => {
            if (data && data.HoraApertura) setDatosCaja(data); // Payload completo
            else cargarCaja(); // Si llega un payload parcial, recargamos
        });
        
        socket.on('estado_caja', (data) => {
            setEstadoCaja(data.estado);
            if (!data.estado) setDatosCaja(null);
        });

        return () => {
            socket.off('actualizar_caja');
            socket.off('estado_caja');
        };
    }, [cargarCaja]);

    const abrirCaja = async () => {
        const res = await apiCaja.abrirCaja();
        if (res.status) cargarCaja();
        return res.status;
    };

    const cerrarCaja = async () => {
        const res = await apiCaja.cerrarCaja();
        if (res.status) cargarCaja();
        return res.status;
    };

    return { estadoCaja, datosCaja, cargando, abrirCaja, cerrarCaja, refetch: cargarCaja };
}