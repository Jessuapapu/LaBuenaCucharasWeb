
import { useCallback, useState, useEffect, useMemo } from "react";
import type { FacturaForm, OrdenVisualizar, ClienteOrden } from "../../interfaces/Ordenes";
import type { Contrato } from "../../interfaces/Contratos";
import { getContratosByCliente } from "../../services/contratos";
import { getClienteById } from "../../services/clientes";
import { pedidosService } from "../../services/pedidos";

const API_URL = import.meta.env.VITE_API_URL;

export function useFactura(idCliente: number | "") {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [pedidosPendientes, setPedidosPendientes] = useState<OrdenVisualizar[]>([]);
    const [contratosActivos, setContratosActivos] = useState<Contrato[]>([]);
    
    const [facturaData, setFacturaData] = useState<FacturaForm>({
        idCliente: "",
        Cantidad: "",
        nombreCliente: "",
        Fecha: new Date().toISOString().split("T")[0],
        Direccion: "",
        MetodoPago: "Efectivo",
        CondicionPago: "Contado",
        tipoDocumentoOrigen: null,
        idOrdenes: [],
        idContrato: null
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
                  setFacturaData(prev => ({...prev, idCliente,
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

    const seleccionarCliente = useCallback((cliente: ClienteOrden) => {
        setFacturaData(prev => ({
            ...prev,
            idCliente: cliente.idCliente,
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
            return pedidosPendientes.filter(pedido =>facturaData.idOrdenes.includes(pedido.id_pedido));
        }, [pedidosPendientes, facturaData.idOrdenes]);

    const alternarSeleccionPedido = useCallback((pedido: OrdenVisualizar) => {
        setFacturaData(prev => {
            // Si estaba usando contrato,
            // limpiar selección previa
            const cambiarModoPedido =prev.tipoDocumentoOrigen !== "Pedido";
            const ordenesActuales = cambiarModoPedido? []: prev.idOrdenes;
            const yaExiste = ordenesActuales.includes(pedido.id_pedido);
            const nuevasOrdenes= yaExiste? ordenesActuales.filter(id => id !== pedido.id_pedido): [...ordenesActuales, pedido.id_pedido];

            // Calcular subtotal acumulado de los pedidos seleccionados
            const calculoSubtotal = pedidosPendientes
                .filter(p => nuevasOrdenes.includes(p.id_pedido))
                .reduce((acc, p) => acc + Number(p.monto_total || 0), 0);

            setSubTotalVisual(Number(calculoSubtotal.toFixed(2)));
            
            return {...prev, tipoDocumentoOrigen:nuevasOrdenes.length > 0? "Pedido": null,
                idOrdenes: nuevasOrdenes,
                idContrato: null,
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
        if (!facturaData.idCliente) { setError("Debe seleccionar un cliente");
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
            IdCliente: Number(facturaData.idCliente),
            Cantidad: facturaData.Cantidad || 1,
            Fecha: facturaData.Fecha,
            MetodoPago: facturaData.MetodoPago,
            CondicionPago: facturaData.CondicionPago,
            tipoDocumentoOrigen: facturaData.tipoDocumentoOrigen,
            MONTOTOTAL: subTotalVisual, // Tu backend procesa la suma total aquí
            idOrdenes: facturaData.idOrdenes,
            idContrato: facturaData.idContrato
        };
            const response = await fetch(`${API_URL}/factura/`,
                {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadEnvio)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(`Errr al facturar`);
            onSuccess(data);
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