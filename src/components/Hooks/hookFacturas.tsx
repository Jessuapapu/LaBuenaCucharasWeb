
import { useCallback, useState, useEffect, useMemo } from "react";
//import type { OrdenVisualizar, ClienteOrden } from "../../interfaces/Ordenes";

import { getFacturas, getFacturasPag, crearFactura, actualizarFactura, obtenerDetalleFactura } from "../../services/facturas";
import type { Factura, PayloadFactura  } from "../../interfaces/Factura";
import type { ClienteOrden } from "../../interfaces/Ordenes";


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

export function useFactura(idCliente: number | "", idFacturaExistente?: number) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
    
    
    const [facturaData, setFacturaData] = useState<EstadoFormularioFactura>(estadoInicial);
     // Estado derivado para el Subtotal (calculado en tiempo real en el cliente)
    //const [subTotalVisual, setSubTotalVisual] = useState<number>(0);

    // Buscar datos (Solo si estamos CREANDO
    useEffect(() => {
    if (!idCliente) {
      setPedidosPendientes([]);
      return;
    }

    const cargarDatos = async () => {
      setIsFetching(true);
      setError(null);
      try {
        if (idFacturaExistente) {
          // MODO EDICIÓN: Consultamos al Service las líneas asociadas al SP de la factura
          const detallesLineas = await obtenerDetalleFactura(idFacturaExistente);
          
          // Simulamos la lista de pedidos pendientes en base a lo que ya está facturado
          const ordenesMapeadas = detallesLineas.map(linea => ({
            idOrden: linea.IdOrden,
            monto_total: linea.CostoTotalOrden
          }));

          setPedidosPendientes(ordenesMapeadas);

          // Inicializamos los arreglos de selección del formulario
          setFacturaData(prev => ({
            ...prev,
            idOrdenes: ordenesMapeadas.map(o => o.idOrden),
            Cantidad: ordenesMapeadas.length > 0 ? ordenesMapeadas.length : 1
          }));
        } else {
          // MODO CREACIÓN: Aquí harías el fetch real a tu endpoint de órdenes pendientes por cliente,
          // por ejemplo: const ordenes = await getOrdenesPendientesByCliente(clienteSeleccionadoId);
          // Por ahora simularemos que se limpia o se alimenta dinámicamente.
          setFacturaData(prev => ({ ...prev, idOrdenes: [], Cantidad: 1 }));
        }
      } catch (err: any) {
        console.error("Error en inicialización del hook useFactura:", err);
        setError(err.message || "Error al sincronizar los registros del cliente.");
      } finally {
        setIsFetching(false);
      }
    };

    cargarDatos();
  }, [idCliente, idFacturaExistente]);

  /**
   * 2. ACCIÓN: SELECCIONAR CLIENTE
   * Actualiza el nombre en el estado para el renderizado del ticket de previsualización
   */
  const seleccionarCliente = useCallback((cliente: ClienteOrden) => {
    setFacturaData(prev => ({
      ...prev,
      nombreCliente: cliente.nombre_cliente,
      idOrdenes: [], // Limpiamos órdenes previas de forma segura
      Cantidad: 1
    }));
  }, []);

  /**
   * 3. ACCIÓN: SELECCIONAR / DESELECCIONAR ÓRDENES
   * Controla de forma unidireccional y reactiva la lista de IDs de órdenes y calcula la Cantidad de forma interna
   */
  const alternarSeleccionPedido = useCallback((pedido: { idOrden: number; monto_total: number }) => {
    setFacturaData(prev => {
      const yaExiste = prev.idOrdenes.includes(pedido.idOrden);
      const nuevasOrdenes = yaExiste
        ? prev.idOrdenes.filter(id => id !== pedido.idOrden)
        : [...prev.idOrdenes, pedido.idOrden];

      return {
        ...prev,
        idOrdenes: nuevasOrdenes,
        // Sincronización interna directa: Protege contra bucles de renders infinitos
        Cantidad: nuevasOrdenes.length > 0 ? nuevasOrdenes.length : 1
      };
    });
  }, []);

  /**
   * 4. ACCIÓN: LIMPIAR SELECCIÓN
   */
  const limpiarSeleccionDocumentos = useCallback(() => {
    setFacturaData(prev => ({
      ...prev,
      idOrdenes: [],
      Cantidad: 1
    }));
  }, []);

  /**
   * 5. DERIVACIÓN DE DATOS (useMemo)
   * Filtra los objetos de órdenes completos que están seleccionados actualmente para dibujar la lista del ticket
   */
  const pedidosSeleccionados = useMemo(() => {
    return pedidosPendientes.filter(pedido => 
      facturaData.idOrdenes.includes(pedido.idOrden)
    );
  }, [pedidosPendientes, facturaData.idOrdenes]);

  /**
   * 6. CÁLCULO DEL MONTO TOTAL VISUAL
   * Suma aritmética en tiempo real de los montos de las órdenes seleccionadas
   */
  const subTotalVisual = useMemo(() => {
    return pedidosSeleccionados.reduce((acc, pedido) => 
      acc + Number(pedido.monto_total || 0), 0
    );
  }, [pedidosSeleccionados]);

  /**
   * 7. ACCIÓN: GUARDAR / PERSISTIR (POST o PUT)
   * Consume de forma transparente la capa de Services, abstrayendo al Modal de los mapeos complejos del Backend
   */
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
    seleccionarCliente,
    pedidosPendientes,
    setPedidosPendientes, // Permite alimentar las órdenes externas si el modal las recibe por props
    alternarSeleccionPedido,
    limpiarSeleccionDocumentos,
    pedidosSeleccionados,
    loading,
    isFetching,
    error,
    guardarFactura
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