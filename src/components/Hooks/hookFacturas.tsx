
import { useCallback, useState, useEffect, useMemo } from "react";
//import type { OrdenVisualizar, ClienteOrden } from "../../interfaces/Ordenes";
import type { Contrato } from "../../interfaces/Contratos";
import { getContratosByCliente } from "../../services/contratos";
import { getClienteById } from "../../services/clientes";
import { pedidosService } from "../../services/pedidos";
import { getFacturas, getFacturasPag, crearFactura, actualizarFactura } from "../../services/facturas";
import type { Factura, PayloadFactura, DetalleFacturaLinea } from "../../interfaces/Factura";

const API_URL = import.meta.env.VITE_API_URL;
interface OrdenVisualizar {
  idOrden: number;
  monto_total: number;
  [key: string]: any;
}

interface ClienteOrden {
  idCliente: number;
  nombre_cliente: string;
  direccion_cliente: string;
}

export function useFactura(idCliente: number | "", idFacturaExistente?: number) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [pedidosPendientes, setPedidosPendientes] = useState<OrdenVisualizar[]>([]);
    const [contratosActivos, setContratosActivos] = useState<Contrato[]>([]);
    
    const [facturaData, setFacturaData] = useState<PayloadFactura & { nombreCliente: string; Direccion: string }>({
        IdCliente: idCliente ? Number(idCliente) : 0,
        Cantidad: 1,
        Fecha: new Date().toISOString().split("T")[0],
        MetodoPago: "Efectivo",
        CondicionPago: "Contado",
        tipoDocumentoOrigen: null,
        MONTOTOTAL: 0,
        idOrdenes: [],
        idContrato: null,
        nombreCliente: "",
        Direccion: ""
    });

     // Estado derivado para el Subtotal (calculado en tiempo real en el cliente)
    const [subTotalVisual, setSubTotalVisual] = useState<number>(0);

    // Buscar datos (Solo si estamos CREANDO
    useEffect(() => {
        if (!idCliente) {
            setPedidosPendientes([]);
            setContratosActivos([]);
            setSubTotalVisual(0);
            return;
        }

        const controller = new AbortController();
        const buscarDatosCliente = async () => {
            setIsFetching(true);
            setError(null);
            try{
                const [infoCliente, pedidosValidados, dataContratos]= await Promise.all([
                    getClienteById(Number(idCliente)),
                    pedidosService.getPedidosByCliente(Number(idCliente), controller.signal),
                    getContratosByCliente(Number(idCliente))
                ])
                //if (!resPedidos.ok || !resContratos.ok) throw new Error("Error en el servidor");

                //const jsonPedidos = await resPedidos.json();
                //const Contratos= await getContratosByCliente(Number(idCliente))
                //const Clientes= resCliente;

                //const pedidos: OrdenVisualizar[] = jsonPedidos?.data || [];
                //const contratos: Contrato[] = resContratos?.data || [];
                setPedidosPendientes(pedidosValidados || []);
                setContratosActivos(dataContratos || []);

                //const primerRegistro = resPedidos?.[0] ||contratos?.[0];

                if (infoCliente) {
                  setFacturaData(prev => ({...prev, IdCliente: Number(idCliente),
                        nombreCliente: infoCliente?.nombre_cliente || prev.nombreCliente,
                        Direccion: infoCliente?.direccion_cliente|| prev.Direccion
                    }));
                }
                }catch(error: any){
                   setError("No se encontro"); 
                }
                finally{
                    setIsFetching(false);
                } 
        }
        buscarDatosCliente();
        return () => controller.abort();
    }, [idCliente])
    // Nuevo useEffect para precargar datos si es una EDICIÓN
useEffect(() => {
    if (!idFacturaExistente) return;

    const cargarDetalleFactura = async () => {
        setIsFetching(true);
        try {
            // Suponiendo que tienes un servicio 'getFacturaDetalle' apuntando a tu backend
            const response = await fetch(`${API_URL}/facturas/detalle/?id_factura=${idFacturaExistente}`);
            const detalles: DetalleFacturaLinea[] = await response.json();
            
            if (detalles && detalles.length > 0) {
                const primerDetalle = detalles[0];
                const idsDeOrdenes = detalles.map(d => d.IdOrden);

                // Re-calculamos el subtotal en base a los detalles devueltos por el SP
                const totalInicial = detalles.reduce((acc, curr) => acc + Number(curr.CostoTotalOrden || 0), 0);

                setFacturaData(prev => ({
                    ...prev,
                    IdCliente: primerDetalle.IdCliente || prev.IdCliente, // Si tu SP lo devuelve
                    tipoDocumentoOrigen: "Pedido",
                    idOrdenes: idsDeOrdenes,
                    MONTOTOTAL: totalInicial
                }));
                setSubTotalVisual(totalInicial);
            }
        } catch (err) {
            console.error("Error cargando el detalle de la factura para editar", err);
            setError("No se pudieron recuperar los detalles de la factura.");
        } finally {
            setIsFetching(false);
        }
    };

    cargarDetalleFactura();
}, [idFacturaExistente]);

    const seleccionarCliente = useCallback((cliente: ClienteOrden) => {
        setFacturaData(prev => ({
            ...prev,
            IdCliente: cliente.idCliente,
            nombreCliente: cliente.nombre_cliente,
            Direccion: cliente.direccion_cliente,
            // Limpiamos selecciones anteriores si cambia de cliente
            tipoDocumentoOrigen: null,
            idOrdenes: [],
            idContrato: null,
        }));
        setSubTotalVisual(0);
    }, []);

    const pedidosSeleccionados =useMemo(() => {
            return pedidosPendientes.filter(pedido =>facturaData.idOrdenes.includes(pedido.idOrden));
        }, [pedidosPendientes, facturaData.idOrdenes]);

    const alternarSeleccionPedido = useCallback((pedido: OrdenVisualizar) => {
        setFacturaData(prev => {
            // Si estaba usando contrato,
            // limpiar selección previa
            const cambiarModoPedido =prev.tipoDocumentoOrigen !== "Pedido";
            const ordenesActuales = cambiarModoPedido? []: prev.idOrdenes;
            const yaExiste = ordenesActuales.includes(pedido.idOrden);
            const nuevasOrdenes= yaExiste? ordenesActuales.filter(id => id !== pedido.idOrden): [...ordenesActuales, pedido.idOrden];

            // Calcular subtotal acumulado de los pedidos seleccionados
            const calculoSubtotal = pedidosPendientes
                .filter(p => nuevasOrdenes.includes(p.idOrden))
                .reduce((acc, p) => acc + Number(p.monto_total || 0), 0);

            setSubTotalVisual(Number(calculoSubtotal.toFixed(2)));
            
            return {...prev, tipoDocumentoOrigen:nuevasOrdenes.length > 0? "Pedido": null,
                idOrdenes: nuevasOrdenes,
                idContrato: null,
                MONTOTOTAL: Number(calculoSubtotal.toFixed(2)),
                MetodoPago: prev.MetodoPago === "Crédito" ? "Efectivo" : prev.MetodoPago, // Resetea si estaba en crédito corporativo
                CondicionPago: "Contado"
            };
        });
    }, [pedidosPendientes]);

    const seleccionarContrato = useCallback((idContrato: number) => {
        const contrato = contratosActivos.find(c => c.idContrato === idContrato);
        if (!contrato) return;

        setFacturaData(prev => ({
            ...prev,
            tipoDocumentoOrigen: "Contrato",
            idContrato: idContrato,
            idOrdenes: [], // Limpiamos los pedidos ya que cambió al flujo corporativo
            Direccion: contrato.direccion_cliente || prev.Direccion,
            MetodoPago: "Crédito",
            CondicionPago: "Crédito", // Los contratos típicamente se manejan a crédito empresarial
        }));
        setSubTotalVisual(Number(contrato.presupuesto || 0));
    }, [contratosActivos]);

    // Función auxiliar por si el cajero quiere desmarcar todo de golpe
    const limpiarSeleccionDocumentos = useCallback(() => {
        setFacturaData(prev => ({
            ...prev,
            tipoDocumentoOrigen: null,
            idOrdenes: [],
            idContrato: null,
        }));
        setSubTotalVisual(0);
    }, []);
            

    // Guardar o Editar (Decide dinámicamente según le proceso)
    const guardarFactura = useCallback(async (onSuccess: (data: any) => void) => {
        //setLoading(true);
        setError(null);
        if (!facturaData.IdCliente) { setError("Debe seleccionar un cliente");
                return;
            }

            if (facturaData.tipoDocumentoOrigen ==="Pedido" && facturaData.idOrdenes.length === 0) {
                setError("Debe seleccionar al menos un pedido");
                return;
            }

            if (facturaData.tipoDocumentoOrigen === "Contrato" && !facturaData.idContrato) {
                setError("Debe seleccionar un contrato");
                return;
            }
            setLoading(true);
            //setError(null);

        try {
            const payloadEnvio = {
            IdCliente: Number(facturaData.IdCliente),
            Cantidad: facturaData.Cantidad || 1,
            Fecha: facturaData.Fecha,
            MetodoPago: facturaData.MetodoPago,
            CondicionPago: facturaData.CondicionPago,
            tipoDocumentoOrigen: facturaData.tipoDocumentoOrigen,
            MONTOTOTAL: subTotalVisual, // Tu backend procesa la suma total aquí
            idOrdenes: facturaData.idOrdenes,
            idContrato: facturaData.idContrato
        };
            let resultado;
            // Si el hook recibe un ID existente, ejecuta una actualización (PUT)
            if (idFacturaExistente) {
                resultado = await actualizarFactura(idFacturaExistente, payloadEnvio);
            } else {
                resultado = await crearFactura(payloadEnvio);
            }
            onSuccess(resultado);
        } catch (err: any) {
            setError(err.message || "Error al procesar");
        } finally {
            setLoading(false);
        }
    }, [facturaData, subTotalVisual]);

    return {
        facturaData,
        setFacturaData,
        seleccionarCliente,
        setSubTotalVisual,
        subTotalVisual,
        pedidosPendientes,
        setPedidosPendientes,
        contratosActivos,
        setContratosActivos,
        alternarSeleccionPedido,
        seleccionarContrato,
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