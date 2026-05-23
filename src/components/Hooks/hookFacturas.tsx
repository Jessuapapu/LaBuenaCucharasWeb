import { useCallback, useState, useEffect } from "react";

export interface Cliente {
    idCliente: number;
    nombrecliente: string;
}

export interface Contrato {
    idContrato: number;
    numeroContrato: number;
    idCliente: number;
    Estado: "Activo" | "Inactivo";
    FechaInicio: Date;
    FechaVencimiento: Date;
    Direccion: string;
}

export interface Factura {
    idFactura: number;
    MontoTotal: number;
    Fecha: Date;
    CantidadTotal: number;
    MetodoPago: string;
}

export interface DetallesOrdenes {
    idOrdenes: number;
    idPlatillo: number;
    platillo: string;
    Cantidad: number;
    PrecioUnico: number;
    Costototal: number;
}

export interface Pedidos {
    idPedido: number;
    Estado: "Pendiente" | "Entregado" | "Anulado";
    TipodePedidos: "Evento" | "Contrato" | "Buffet";
    MontoTotal: number;
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
    idOrigen: number | null; //SE utilizara como idReferencia
    subTotal: number;
}

//type TipoRegistro = "Orden" | "Contrato";


// Agregamos 'idFacturaEditar' como parámetro opcional
export function useFactura(id: number | "", idFacturaEditar?: number | null) {
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
        idOrigen: null,
        subTotal: 0,
    });

    // Buscar datos (Solo si estamos CREANDO, si estamos editando solo se cargan los datos de la factura existente)
    useEffect(() => {
        if (idFacturaEditar) return; // Si estamos editando, no disparamos la búsqueda de pedidos nuevos
        
        if (!id ) {
            setPedidosPendientes([]);
            setContratosActivos([]);
            return;
        }

        const buscarDatosCliente = async () => {
            setIsFetching(true);
            setError(null);
            try{
                const [resPedidos, resContratos]= await Promise.all([
                    fetch(`http://127.0.0.1:8001/clientes/${id}`),
                    fetch(`http://127.0.0.1:8001/clientes/contratos${id}`)
                ])
                if (!resPedidos.ok || !resContratos.ok) throw new Error("Error en el servidor");

                const jsonPedidos = await resPedidos.json();
                const jsonContratos = await resContratos.json();

                setPedidosPendientes(jsonPedidos.data || []);
                setContratosActivos(jsonContratos.data || []);

                if(jsonContratos.data?.length > 0 || jsonContratos.data.length > 0){
                    const info= jsonPedidos.data[0] || jsonContratos.data[0];
                    setFacturaData(prev=> ({
                        ...prev,
                        idCliente: id,
                        nombreCliente: info.nombrecliente || info.NombreCliente
                    }))
                }
                
            }catch(error){
                   setError("No se encontro"); 
                }
                finally{
                    setIsFetching(false);
                }
            
        }
        buscarDatosCliente();
    }, [id, idFacturaEditar])

    const seleccionarDocumentoAFacturar = useCallback((tipo: "Pedido" | "Contrato", id: number) => {
        if (tipo === "Pedido") {
            const pedido = pedidosPendientes.find(p => p.idPedido === id);
            if (pedido) {
                const esCorporativo = pedido.TipodePedidos === "Contrato" || pedido.TipodePedidos === "Evento";

                setFacturaData(prev => ({
                    ...prev,
                    tipoDocumentoOrigen: "Pedido",
                    idOrigen: id,
                    Direccion: "", // Reseteado/Oculto para pedidos Buffet comunes
                    CondicionPago: esCorporativo ? "Crédito" : "Contado",
                    AplicaRetencion: esCorporativo,
                    MontoTotalFinal: pedido.MontoTotal,
                }));
            }
        } else {
            const contrato = contratosActivos.find(c => c.idContrato === id);
            if (contrato) {

                setFacturaData(prev => ({
                    ...prev,
                    tipoDocumentoOrigen: "Contrato",
                    idOrigen: id,
                    Direccion: contrato.Direccion, // Condición: Aparece porque es contrato
                    CondicionPago: "Crédito",
                }));
            }
        }
    }, [pedidosPendientes, contratosActivos]);
            

    // Guardar o Editar (Decide dinámicamente según le proceso)
    const guardarFactura = useCallback(async (onSuccess: (data: any) => void) => {
        setLoading(true);
        setError(null);

        try {
            const url= idFacturaEditar? `http://127.0.0.1:8001/factura/${idFacturaEditar}` : "http://127.0.0.1:8001/factura/";
            const response = await fetch(url, {
                method: idFacturaEditar ? "PUT": "POST",
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
    }, [facturaData, idFacturaEditar]);

    return {
        facturaData,
        setFacturaData,
        pedidosPendientes,
        contratosActivos,
        seleccionarDocumentoAFacturar,
        loading,
        isFetching,
        error,
        guardarFactura
    };
}