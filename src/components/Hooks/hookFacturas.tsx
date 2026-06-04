
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
//import type { OrdenVisualizar, ClienteOrden } from "../../interfaces/Ordenes";
import type { Contrato } from "../../interfaces/Contratos";
import { getContratosByCliente } from "../../services/contratos";

import { getFacturas, getFacturasPag, crearFactura, actualizarFactura } from "../../services/facturas";
import type { Factura, PayloadFactura  } from "../../interfaces/Factura";
import { obtenerOrdenporNombre } from "../../services/ordenes";
import { useSoloClientes } from "./hookClientes";

//se utiliza porque typescript necesita saber que contenia el prev xd
interface EstadoFacturaForm {
  IdCliente: number | null;
  nombreCliente: string;
  idOrdenes: number[];
  idContrato: number | null;
  Cantidad: number;
  Fecha: string;
  tipoDocumentoOrigen: "ORDEN" | "CONTRATO";
  MetodoPago: string;
  CondicionPago: string;
}

/**
 * HOOK MAESTRO: useFactura
 * Controla la lógica de facturación de órdenes/contratos eliminando ciclos infinitos.
 */
export function useFactura(busquedaNombre: string, idFactura?: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [contratosActivos, setContratosActivos] = useState<Contrato[]>([]);
  
  // Catálogo de clientes global
  const { clientes, loading: loadingClientes, error: errorClientes } = useSoloClientes();

  // Control Semáforo: Evita que efectos asíncronos concurrentes pisen el estado de forma cíclica
  const cargandoRef = useRef<string>("");

  // Estado del formulario unificado bajo la interfaz rigurosa de datos
  const [facturaData, setFacturaData] = useState<EstadoFacturaForm>({
    IdCliente: null,
    nombreCliente: "",
    idOrdenes: [],
    idContrato: null,
    Cantidad: 1,
    Fecha: new Date().toISOString().split("T")[0], // YYYY-MM-DD estándar
    tipoDocumentoOrigen: "ORDEN",
    MetodoPago: "Efectivo",
    CondicionPago: "Contado"
  });

  // 1. Localización exacta del cliente en caché local (Evita disparar peticiones por cada tecla escrita)
  const clienteEncontrado = useMemo(() => {
    const query = busquedaNombre?.trim().toLowerCase();
    if (!query) return null;
    return clientes.find(c => c.NombreCliente?.toLowerCase() === query) || null;
  }, [busquedaNombre, clientes]);

  // 2. Cargador controlado de documentos financieros por Cliente
  useEffect(() => {
    // Si la caja de texto está vacía o el cliente no existe en catálogo, reseteamos con seguridad
    if (!clienteEncontrado) {
      setPedidosPendientes([]);
      setContratosActivos([]);
      cargandoRef.current = "";
      setFacturaData(prev => ({
        ...prev,
        IdCliente: null,
        nombreCliente: busquedaNombre,
        idOrdenes: [],
        idContrato: null,
        Cantidad: 1
      }));
      return;
    }

    // [CANDADO ANTI-BUCLE]: Si ya cargamos o estamos cargando este cliente, romper el flujo de renders
    if (cargandoRef.current === clienteEncontrado.NombreCliente) {
      return;
    }

    const abortController = new AbortController();

    const ejecutarCargaDatos = async () => {
      const nombreClienteAProcesar = clienteEncontrado.NombreCliente;
      cargandoRef.current = nombreClienteAProcesar;
      
      setIsFetching(true);
      setError(null);

      try {
        // Ejecución paralela tolerante a fallos
        const [ordenesRes, contratosRes] = await Promise.all([
          obtenerOrdenporNombre(nombreClienteAProcesar).catch(() => []),
          getContratosByCliente(clienteEncontrado.IdCliente).catch(() => [])
        ]);

        if (abortController.signal.aborted) return;

        setPedidosPendientes(ordenesRes || []);
        setContratosActivos(contratosRes || []);

        // Sincronizar el estado del formulario en un único lote (Single state batch update)
        setFacturaData(prev => {
          // Si el cliente cambió drásticamente, limpiamos las órdenes del cliente anterior
          const elClienteEsElMismo = prev.IdCliente === clienteEncontrado.IdCliente;
          return {
            ...prev,
            IdCliente: clienteEncontrado.IdCliente,
            nombreCliente: nombreClienteAProcesar,
            idOrdenes: elClienteEsElMismo ? prev.idOrdenes : [],
            idContrato: elClienteEsElMismo ? prev.idContrato : null
          };
        });

      } catch (err) {
        if (!abortController.signal.aborted) {
          setError("Ocurrió un problema al mapear los saldos del cliente seleccionado.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsFetching(false);
        }
      }
    };

    ejecutarCargaDatos();

    return () => {
      abortController.abort(); // Limpieza ante desmontajes rápidos de UI
    };
  }, [clienteEncontrado]);

  // 3. Manejadores de Estado Memorizados (No recrean referencias en renders hijos)
  const cambiarTipoDocumentoOrigen = useCallback((tipo: "ORDEN" | "CONTRATO") => {
    setFacturaData(prev => ({
      ...prev,
      tipoDocumentoOrigen: tipo,
      idOrdenes: [],
      idContrato: null,
      Cantidad: 1
    }));
  }, []);

  const seleccionarContrato = useCallback((id: number | null) => {
    setFacturaData(prev => ({
      ...prev,
      idContrato: id,
      Cantidad: id ? 1 : 1
    }));
  }, []);

  const alternarSeleccionPedido = useCallback((pedido: any) => {
    if (!pedido || !pedido.idOrden) return;
    setFacturaData(prev => {
      const existe = prev.idOrdenes.includes(pedido.idOrden);
      const ordenesActualizadas = existe
        ? prev.idOrdenes.filter(id => id !== pedido.idOrden)
        : [...prev.idOrdenes, pedido.idOrden];

      return {
        ...prev,
        idOrdenes: ordenesActualizadas,
        Cantidad: ordenesActualizadas.length > 0 ? ordenesActualizadas.length : 1
      };
    });
  }, []);

  const limpiarSeleccionDocumentos = useCallback(() => {
    setFacturaData(prev => ({ ...prev, idOrdenes: [], Cantidad: 1 }));
  }, []);

  // 4. Cálculos Derivados con Garantía de Tipado (Sin efectos secundarios)
  const pedidosSeleccionados = useMemo(() => {
    if (!facturaData.idOrdenes.length) return [];
    return pedidosPendientes.filter(pedido => 
      facturaData.idOrdenes.includes(pedido.idOrden)
    );
  }, [pedidosPendientes, facturaData.idOrdenes]);

  const contratoSeleccionadoData = useMemo(() => {
    if (!facturaData.idContrato) return null;
    return contratosActivos.find(c => c.idContrato === facturaData.idContrato) || null;
  }, [contratosActivos, facturaData.idContrato]);

  const subTotalVisual = useMemo(() => {
    if (facturaData.tipoDocumentoOrigen === "CONTRATO") {
      return Number(contratoSeleccionadoData?.presupuesto || 0);
    }
    return pedidosSeleccionados.reduce((sum, item) => sum + (Number(item.monto_total) || 0), 0);
  }, [pedidosSeleccionados, facturaData.tipoDocumentoOrigen, contratoSeleccionadoData]);

  // 5. Orquestador de persistencia hacia Services (Post/Put)
  const guardarFactura = useCallback(async (
    payloadListo: PayloadFactura, 
    onSuccessCallback: (data: any) => void
  ) => {
    // Protección estricta contra múltiples envíos por doble click
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

  return {
    facturaData,
    setFacturaData,
    subTotalVisual,
    contratosActivos,
    cambiarTipoDocumentoOrigen,
    contratoSeleccionadoData,
    seleccionarContrato,
    pedidosPendientes,
    setPedidosPendientes,
    alternarSeleccionPedido,
    limpiarSeleccionDocumentos,
    pedidosSeleccionados,
    loading,
    isFetching: isFetching || loadingClientes,
    error: error || errorClientes,
    guardarFactura,
    clientesCatalogo: clientes,
    idClienteDetectado: facturaData.IdCliente
  };
}
export function useFacturasPage() {
  const [data, setData] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const facturas = await getFacturas();
      setData(facturas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar facturas";
      console.error(errorMessage);
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
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

export function useFacturaPaginacion(initialPage = 1, initialRows = 10) {
    const [data, setData] = useState<Factura[]>([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(initialPage);
    const [rows, setRows] = useState(initialRows);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Record<string, any>>({});

    const fetchFacturas = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const respuesta = await getFacturasPag(pagina, rows, filtros, signal);
            setData(respuesta.data);
            setTotal(respuesta.total);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setError(err.message || "Error al cargar facturas");
            }
        } finally {
            setLoading(false);
        }
    }, [pagina, rows, filtros]);

    useEffect(() => {
        const controller = new AbortController();
        fetchFacturas(controller.signal);
        return () => controller.abort();
    }, [fetchFacturas]);

    const cambiarPagina = (nuevaPagina: number) => setPagina(nuevaPagina);
    const cambiarRows = (nuevasRows: number) => { setRows(nuevasRows); setPagina(1); };
    const aplicarFiltros = (nuevosFiltros: Record<string, any>) => { setFiltros(nuevosFiltros); setPagina(1); };

    // Sincronización de KPIs en base al set paginado visible o filtrado
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
        total,
        pagina,
        rows,
        loading,
        error,
        stats, 
        cambiarPagina,
        cambiarRows,
        aplicarFiltros,
        refetch: fetchFacturas
    };
}