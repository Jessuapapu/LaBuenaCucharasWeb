
import { useCallback, useState, useEffect, useMemo } from "react";
//import type { OrdenVisualizar, ClienteOrden } from "../../interfaces/Ordenes";
//import type { Contrato } from "../../interfaces/Contratos";
//import { getContratosByCliente } from "../../services/contratos";

import { getFacturas, getFacturasPag, crearFactura, actualizarFactura } from "../Services/facturas";
import type { Factura, PayloadFactura  } from "../Interfaces/Factura";
import { obtenerOrdenporNombre } from "../Services/ordenes";
//import { useSoloClientes, useCliente } from "./hookClientes";


export function useFacturaPaginacion(initialPage = 1, initialRows = 10) {
    const [data, setData] = useState<Factura[]>([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(initialPage);
    const [rows, setRows] = useState(initialRows);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Record<string, any>>({});

    // Convertimos a string para usarlo como dependencia segura y evitar loops infinitos
    const stringificadoFilter = JSON.stringify(filtros);

    const fetchFacturas = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            // Parseamos los filtros de vuelta a objeto de forma segura
            const currentFiltros = JSON.parse(stringificadoFilter);
            const respuesta = await getFacturasPag(pagina, rows, currentFiltros, signal);
            
            // CORRECCIÓN CRÍTICA: Validamos si la respuesta es un array directo (FastAPI) o un objeto { data, total }
            const datosSeguros = Array.isArray(respuesta) ? respuesta : (respuesta?.data || []);
            
            setData(datosSeguros);
            
            // Fallback para el total si el backend no lo envía
            setTotal(respuesta?.total !== undefined ? respuesta.total : datosSeguros.length);
            
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setError(err.message || "Error al cargar facturas");
                setData([]); // Limpieza segura en caso de error
            }
        } finally {
            setLoading(false);
        }
    }, [pagina, rows, stringificadoFilter]);

    useEffect(() => {
        const controller = new AbortController();
        fetchFacturas(controller.signal);
        return () => controller.abort();
    }, [fetchFacturas]);

    // CORRECCIÓN: Memorizamos estas funciones para evitar bucles infinitos en los useEffects hijos
    const cambiarPagina = useCallback((nuevaPagina: number) => setPagina(nuevaPagina), []);
    
    const cambiarRows = useCallback((nuevasRows: number) => { 
        setRows(nuevasRows); 
        setPagina(1); 
    }, []);
    
    const aplicarFiltros = useCallback((nuevosFiltros: Record<string, any>) => { 
        setFiltros(nuevosFiltros); 
        setPagina(1); 
    }, []);

    const refetch = useCallback(() => {
        fetchFacturas();
    }, [fetchFacturas]);

    // Sincronización de KPIs en base al set paginado visible o filtrado
    const stats = useMemo(() => {
        if (!data || data.length === 0) return { total: 0, pagadas: 0, pendiente: 0 };
        
        return {
            total: data.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0),
            pagadas: data
                .filter((f: Factura) => f.estado_factura?.toString().toUpperCase() === 'PAGADA')
                .reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0),
            pendiente: data.filter((f: Factura) => {
                const est = f.estado_factura?.toString().toUpperCase();
                return est === 'GENERADA' || est === 'PENDIENTE';
            }).length
        };
    }, [data]);

    return {
        data,
        total,
        pagina,
        rows,
        loading,
        error,
        stats, 
        cambiarPagina,
        cambiarRows,
        aplicarFiltros,
        refetch
    };
} 

// Crear y editar
export function useFactura(idFactura?: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Orquestador de persistencia hacia Services (Post/Put)
  const guardarFactura = useCallback(async (
    payloadListo: PayloadFactura, 
    onSuccessCallback: (data: any) => void) => {
        
    if (loading) return; 

    setLoading(true);
    setError(null);
    try {
      let respuesta;
      if (idFactura) {
        respuesta = await actualizarFactura(idFactura, payloadListo);
      } else {
        respuesta = await crearFactura(payloadListo);
      }
      onSuccessCallback(respuesta);
    } catch (err: any) {
      console.error("Error en proceso de facturación:", err);
      setError(err.message || "No se pudo procesar la factura en el servidor de base de datos.");
    } finally {
      setLoading(false);
    }
  }, [idFactura, loading]);

  return { guardarFactura, loading, error };
}

export function useFacturaModal(BusquedaNombre: string, id_factura?: number) {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const { guardarFactura, loading: loadingApi, error: errorApi } = useFactura(id_factura);

  const [formulario, setFormulario] = useState({
    idCliente: 0,
    MetodoPago: "EFECTIVO",
    CondicionPago: "CONTADO",
    OrdenesSeleccion: [] as number[],
    tipoDocumentoOrigen: "Orden",
    idContrato: null as number | null,
    Fecha: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (!BusquedaNombre.trim()) { 
      setPedidosPendientes([]); 
      return;
    }

    const cargarOrdenes = async () => {
      setFetching(true);
      setError(null);
      try {
        const datos = await obtenerOrdenporNombre(BusquedaNombre);
        const datosNormalizados = datos.map((orden: any) => ({
          IdOrden: orden.IdOrdenes ?? orden.IdOrden ?? orden.id_orden ?? 0,
          MontoTotal: Number(orden.CostoTotal ?? orden.MontoTotal ?? orden.monto_total ?? 0),
          IdCliente: orden.IdCliente ?? orden.id_cliente ?? 0
        }));

        setPedidosPendientes(datosNormalizados);
        if (datosNormalizados.length > 0) {
          setFormulario(prev => { 
            if (prev.idCliente === datosNormalizados[0].IdCliente) return prev;
             return{ ...prev, idCliente: datosNormalizados[0].IdCliente }});
        }
      } catch (err) {
        setError("No hay órdenes activas para este cliente");
        setPedidosPendientes([]);
      } finally {
        setFetching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      cargarOrdenes();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [BusquedaNombre]);

  const alternarSeleccionOrden = useCallback((idOrden: number) => {
    setFormulario(prev => {
      const yaExiste = prev.OrdenesSeleccion.includes(idOrden);
      const nuevas = yaExiste
        ? prev.OrdenesSeleccion.filter(id => id !== idOrden)
        : [...prev.OrdenesSeleccion, idOrden];
      return { ...prev, OrdenesSeleccion: nuevas };
    });
  }, []);

  const subTotalVisual = useMemo(() => {
    return pedidosPendientes
      .filter(p => formulario.OrdenesSeleccion.includes(p.IdOrden))
      .reduce((acc, curr) => acc + curr.MontoTotal, 0);
  }, [pedidosPendientes, formulario.OrdenesSeleccion]);

  const enviarFactura = useCallback(async (onSuccess: (res: any) => void) => {
    if (formulario.OrdenesSeleccion.length === 0 && !formulario.idContrato) {
      setError("Debe seleccionar al menos una orden para facturar.");
      return;
    }

    const estadoFacturaReal = formulario.CondicionPago === "CONTADO" ? "PAGADA" : "PENDIENTE";
    const payloadListo: PayloadFactura = {
      IdCliente: formulario.idCliente,
      fecha: formulario.Fecha || new Date().toISOString().split("T")[0],
      MetodoPago: formulario.MetodoPago,
      Estado: estadoFacturaReal,
      tipoDocumentoOrigen: formulario.tipoDocumentoOrigen,
      idContrato: formulario.idContrato,
      detalles: formulario.OrdenesSeleccion.map(id => ({ IdOrden: id }))
    };

    await guardarFactura(payloadListo, onSuccess);
  }, [formulario, guardarFactura]);

  return {
    formulario,
    setFormulario,
    pedidosPendientes,
    ordenesSeleccionadas: formulario.OrdenesSeleccion,
    alternarSeleccionOrden,
    subTotalVisual,
    enviarFactura,
    loading: fetching || loadingApi,
    error: errorApi || error
  }; 
}

export function useFacturasPage() {
  const [data, setData] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturas = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const facturas = await getFacturas(signal);
      setData(facturas);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || "Error al cargar facturas");
      setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFacturas(controller.signal);
    return()=> controller.abort()
  }, [fetchFacturas]);

  // Sincronizado estricto con las propiedades mapeadas por tu backend corporativo
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, pagadas: 0, pendiente: 0 };
    
    return {
      total: data.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0),
      pagadas: data
        .filter((f: Factura) => f.estado_factura?.toString().toUpperCase() === 'PAGADA')
        .reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0),
      pendiente: data.filter((f: Factura) => {
        const est = f.estado_factura?.toString().toUpperCase();
        return est === 'GENERADA' || est === 'PENDIENTE';
      }).length
    };
  }, [data]);

  return { 
    data, 
    stats, 
    loading, 
    error, 
    refetch: fetchFacturas 
  };
}
