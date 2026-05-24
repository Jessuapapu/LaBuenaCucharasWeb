
import { useCallback, useState, useEffect, useMemo } from "react";

export interface Contrato {
    idContrato: number;
    numeroContrato: number;
    idCliente: number;
    Estado: "Activo" | "Inactivo";
    FechaInicio: string;
    FechaVencimiento: string;
    Direccion: string;
    Presupuesto: number
}

//A como lo espera el backend (ya llevo 5 veces cambiando por letras y por equivocacion)
export interface DetallesOrdenes {
    id_orden: number;
    nombre_platillo: string;
    cantidad: number;
    precio_unitario: number;
}

export interface Pedidos {
    id_pedido: number;
    estado_pedido: string; //el backend manda
    TipodePedidos?: "Evento" | "Contrato" | "Buffet"; //por si acaso
    monto_total: number;
    fecha: string;
    cliente: {
        nombre_cliente: string;
        direccion_cliente: string;
    }
    Detalles?: DetallesOrdenes[];
}

// Interfaz para el estado del formulario de facturación
export interface FacturaForm {
    idCliente: number | "";
    Cantidad: number | "";
    nombreCliente: string;
    Fecha: string;
    Direccion?: string;
    MetodoPago: "Efectivo" | "Transferencia" | "Tarjeta" | "Crédito";
    CondicionPago: "Contado" | "Crédito";
    tipoDocumentoOrigen: "Pedido" | "Contrato" | null;
    subTotal: number;
    idOrdenes: number[];
    idContrato?: number | null;
}
    const API_URL = import.meta.env.VITE_API_URL;
// Agregamos 'idFacturaEditar' como parámetro opcional
export function useFactura(idCliente: number | "") {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [pedidosPendientes, setPedidosPendientes] = useState<Pedidos[]>([]);
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
        subTotal: 0,
        idOrdenes: []
    });

    // Buscar datos (Solo si estamos CREANDO
    useEffect(() => {
        if (!idCliente) {
            setPedidosPendientes([]);
            setContratosActivos([]);
            return;
        }

        const controller = new AbortController();
        const buscarDatosCliente = async () => {
            setIsFetching(true);
            setError(null);
            try{
                const [resPedidos, resContratos]= await Promise.all([
                    fetch(`${API_URL}/clientes/${idCliente}`,
                        {
                            signal: controller.signal
                        }
                    ),
                    fetch(`${API_URL}/clientes/contratos/${idCliente}`,
                        {
                            signal: controller.signal
                        }
                    )
                ])
                if (!resPedidos.ok || !resContratos.ok) throw new Error("Error en el servidor");

                const jsonPedidos = await resPedidos.json();
                const jsonContratos = await resContratos.json();

                const pedidos =
                    jsonPedidos?.data || [];

                const contratos =
                    jsonContratos?.data || [];

                setPedidosPendientes(pedidos);
                setContratosActivos(contratos);

                const primerRegistro =
                    pedidos?.[0] ||
                    contratos?.[0];

                if (primerRegistro) {

                    setFacturaData(prev => ({
                        ...prev,

                        idCliente,

                        nombreCliente:
                            primerRegistro
                                ?.cliente
                                ?.nombre_cliente ||

                            primerRegistro
                                ?.NombreCliente ||

                            prev.nombreCliente,

                        direccion:
                            primerRegistro
                                ?.cliente
                                ?.direccion_cliente ||

                            primerRegistro
                                ?.Direccion ||

                            prev.Direccion
                    }));

                }
                
            }catch(error){
                   setError("No se encontro"); 
                }
                finally{
                    setIsFetching(false);
                }
            
        }
        buscarDatosCliente();
        return () => controller.abort();
    }, [idCliente])

    const seleccionarCliente = useCallback((id: number, nombre: string, direccion: string) => {
        setFacturaData(prev => ({
            ...prev,
            idCliente: id,
            nombreCliente: nombre,
            Direccion: direccion,
            // Limpiamos selecciones anteriores si cambia de cliente
            tipoDocumentoOrigen: null,
            idOrdenes: [],
            idContrato: null,
            subTotal:  0
        }));
    }, []);

    const pedidosSeleccionados =useMemo(() => {
            return pedidosPendientes.filter(pedido =>facturaData.idOrdenes.includes(pedido.id_pedido));
        }, [
            pedidosPendientes,
            facturaData.idOrdenes
        ]);

    const alternarSeleccionPedido = useCallback((pedido: Pedidos
    ) => {
        setFacturaData(prev => {
            // Si estaba usando contrato,
            // limpiar selección previa
            const cambiarModoPedido =prev.tipoDocumentoOrigen !== "Pedido";

            const ordenesActuales =
                cambiarModoPedido? []: prev.idOrdenes;

            const yaExiste =
                ordenesActuales.includes(pedido.id_pedido);

            let nuevasOrdenes: number[] = [];

            if (yaExiste) {
                nuevasOrdenes =
                    ordenesActuales.filter(id => id !== pedido.id_pedido);
            } else {
                nuevasOrdenes = [...ordenesActuales, pedido.id_pedido
                ];
            }
            // calcular subtotal dinámicamente
            const pedidosSeleccionados =
                pedidosPendientes.filter(p => nuevasOrdenes.includes(p.id_pedido));

            const subtotal =
                pedidosSeleccionados.reduce((acc, pedido) =>acc + Number(pedido.monto_total || 0),0);
            return {...prev, tipoDocumentoOrigen:nuevasOrdenes.length > 0? "Pedido": null,
                idOrdenes: nuevasOrdenes,
                idContrato: null,
                subTotal: Number(subtotal.toFixed(2)),
                condicionPago: "Contado"
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
            Direccion: contrato.Direccion || prev.Direccion,
            CondicionPago: "Crédito", // Los contratos típicamente se manejan a crédito empresarial
            subTotal: Number(contrato.Presupuesto || 0) 
        }));
    }, [contratosActivos]);

    // Función auxiliar por si el cajero quiere desmarcar todo de golpe
    const limpiarSeleccionDocumentos = useCallback(() => {
        setFacturaData(prev => ({
            ...prev,
            tipoDocumentoOrigen: null,
            idOrdenes: [],
            idContrato: null,
            subTotal: 0
        }));
    }, []);
            

    // Guardar o Editar (Decide dinámicamente según le proceso)
    const guardarFactura = useCallback(async (onSuccess: (data: any) => void) => {
        setLoading(true);
        setError(null);
        if (
                !facturaData.idCliente
            ) { setError("Debe seleccionar un cliente");
                return;
            }

            if (facturaData.tipoDocumentoOrigen ==="Pedido" && facturaData.idOrdenes.length === 0
            ) {
                setError("Debe seleccionar al menos un pedido");
                return;
            }

            if (facturaData.tipoDocumentoOrigen === "Contrato" && !facturaData.idContrato
            ) {
                setError("Debe seleccionar un contrato");
                return;
            }
            setLoading(true);
            setError(null);

        try {
            const response = await fetch(`${API_URL}/factura/`,
                {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(facturaData)
            });

            if (!response.ok) throw new Error(`Errr al facturar`);
            
            const data = await response.json();
            onSuccess(data);
        } catch (err: any) {
            setError(err.message || "Error al procesar");
        } finally {
            setLoading(false);
        }
    }, [facturaData]);

    return {
        facturaData,
        setFacturaData,
        seleccionarCliente,
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