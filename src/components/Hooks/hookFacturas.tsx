
import { useCallback, useState, useEffect, useMemo } from "react";
//import type { OrdenVisualizar, ClienteOrden } from "../../interfaces/Ordenes";
import type { Contrato } from "../../interfaces/Contratos";
import { getContratosByCliente } from "../../services/contratos";
//import { getClienteById } from "../../services/clientes";
//import { pedidosService } from "../../services/pedidos";
import { getFacturas, getFacturasPag, crearFactura, actualizarFactura } from "../../services/facturas";
import type { Factura, PayloadFactura  } from "../../interfaces/Factura";
import { getOrdenesByCliente } from "../../services/ordenes";
import { useClientes } from "./hookClientes";


interface EstadoFormularioFactura extends Omit<PayloadFactura, "IdCliente" | "MONTOTOTAL"> {
  nombreCliente: string;
}

const estadoInicial: EstadoFormularioFactura = {
  Cantidad: 1,
  Fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD para el input type="date"
  MetodoPago: "EFECTIVO",
  CondicionPago: "CONTADO",
  tipoDocumentoOrigen: "ORDEN",
  idOrdenes: [],
  idContrato: null,
  nombreCliente: ""
};

export function useFactura(busquedaNombre: string | "", idFacturaExistente?: number) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
    
    
    const [facturaData, setFacturaData] = useState<EstadoFormularioFactura>(estadoInicial);
     // Estado derivado para el Subtotal (calculado en tiempo real en el cliente)
    //const [subTotalVisual, setSubTotalVisual] = useState<number>(0);
    const { clientes, loading: loadingClientes, error: errorClientes } = useClientes();
    const clienteEncontrado = useMemo(() => {
    if (!busquedaNombre.trim()) return null;
    return clientes.find(c => 
      c.NombreCliente.toLowerCase() === busquedaNombre.toLowerCase()
    );
  }, [busquedaNombre, clientes]);

    // Busca las ordenes (las carga)
    useEffect(() => {
    if (!clienteEncontrado) {
      setPedidosPendientes([]);
      setContratosActivos([])
      setFacturaData(prev => ({ ...prev, nombreCliente: busquedaNombre, idOrdenes: [], idContrato: null, Cantidad: 1 }));
      return;
    }

    const cargarDatos = async () => {
      setIsFetching(true);
      setError(null);
      const idCliente = clienteEncontrado.IdCliente;
      try {
        setFacturaData(prev => ({
          ...prev,
          nombreCliente: clienteEncontrado.NombreCliente
        }));
        const [ordenesData, contratosData] = await Promise.all([
          getOrdenesByCliente(idCliente).catch(() => []), // Si falla uno, no tumba al otro
          getContratosByCliente(idCliente).catch(() => [])
        ]);

        setPedidosPendientes(ordenesData);
        setContratosActivos(contratosData);
        setError(null);
      } catch (err) {
        setError("Error al cargar las órdenes del cliente seleccionado");
      } finally {
        setIsFetching(false);
      }
    };

    cargarDatos();
  }, [clienteEncontrado, busquedaNombre]);

  //const seleccionarCliente = useCallback((cliente: ClienteOrden) => {
   // setFacturaData(prev => ({
    //  ...prev,
     // nombreCliente: cliente.nombre_cliente,
     // idOrdenes: [], // Limpiamos órdenes previas de forma segura
     // Cantidad: 1
    //}));
  //}, []);

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
    setFacturaData(prev => {
      const yaExiste = prev.idOrdenes.includes(pedido.idOrden);
      const nuevasOrdenes = yaExiste
        ? prev.idOrdenes.filter(id => id !== pedido.idOrden)
        : [...prev.idOrdenes, pedido.idOrden];

      return {...prev, idOrdenes: nuevasOrdenes,
        // Sincronización interna directa: Protege contra bucles de renders infinitos
        Cantidad: nuevasOrdenes.length > 0 ? nuevasOrdenes.length : 1};
    });
  }, []);

  const limpiarSeleccionDocumentos = useCallback(() => {
    setFacturaData(prev => ({...prev, idOrdenes: [], Cantidad: 1}));
  }, []);

  const pedidosSeleccionados = useMemo(() => {
    return pedidosPendientes.filter(pedido => 
      facturaData.idOrdenes.includes(pedido.idOrden));
  }, [pedidosPendientes, facturaData.idOrdenes]);

  const contratoSeleccionadoData = useMemo(() => {
    return contratosActivos.find(c => c.idContrato === facturaData.idContrato) || null;
  }, [contratosActivos, facturaData.idContrato]);

  const subTotalVisual = useMemo(() => {
    if (facturaData.tipoDocumentoOrigen === "CONTRATO") {
      return Number(contratoSeleccionadoData?.presupuesto || 0);
    }
    return pedidosSeleccionados.reduce((acc, pedido) => 
      acc + Number(pedido.monto_total || 0), 0);
  }, [pedidosSeleccionados, facturaData.tipoDocumentoOrigen, contratoSeleccionadoData]);

  const guardarFactura = useCallback(async (
    payloadListo: PayloadFactura, 
    onSuccessCallback: (data: any) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      let respuesta;
      if (idFacturaExistente) {
        // Ejecuta actualización vía PUT
        respuesta = await actualizarFactura(idFacturaExistente, payloadListo);
      } else {
        // Ejecuta inserción vía POST
        respuesta = await crearFactura(payloadListo);
      }

      // Si todo sale bien, ejecutamos el callback que refresca la UI padre y cierra el modal
      onSuccessCallback(respuesta);
    } catch (err: any) {
      console.error("Fallo crítico al guardar comprobante:", err);
      setError(err.message || "Ocurrió un error inesperado al procesar la factura.");
    } finally {
      setLoading(false);
    }
  }, [idFacturaExistente]);

  return {
    facturaData,
    setFacturaData,
    subTotalVisual,
    //seleccionarCliente,
    contratosActivos,
    cambiarTipoDocumentoOrigen,
    contratoSeleccionadoData,
    seleccionarContrato,
    pedidosPendientes,
    setPedidosPendientes, // Permite alimentar las órdenes externas si el modal las recibe por props
    alternarSeleccionPedido,
    limpiarSeleccionDocumentos,
    pedidosSeleccionados,
    loading,
    isFetching: isFetching || loadingClientes,
    error: error || errorClientes,
    guardarFactura,
    clientesCatalogo: clientes,
    idClienteDetectado: clienteEncontrado?.IdCliente
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