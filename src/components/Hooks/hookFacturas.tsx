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
}

export interface Factura {
    idFactura: number;
    MontoTotal: number;
    Fecha: Date;
    CantidadTotal: number;
}

export interface FacturaOrdenes {
    idFactura: number;
    idOrdenes: number;
}

export interface Pedidos {
    idPedido: number;
    Estado: "Pendiente" | "Entregado" | "Anulado";
    TipodePedidos: "Evento" | "Contrato" | "Buffet";
}

// Interfaz para el estado del formulario de facturación
export interface FacturaForm {
    MontoTotal: number | "";
    CantidadTotal: number | "";
    nombreCliente: string;
    Fecha: string;
}

type TipoRegistro = "Orden" | "Contrato";


// Agregamos 'idFacturaEditar' como parámetro opcional
export function useFactura(id: number | "", tipo: TipoRegistro, idFacturaEditar?: number | null) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    
    const [facturaData, setFacturaData] = useState<FacturaForm>({
        MontoTotal: "",
        CantidadTotal: "",
        nombreCliente: "",
        Fecha: new Date().toISOString().split("T")[0]
    });

    // Buscar datos (Solo si estamos CREANDO, si estamos editando solo se cargan los datos de la factura existente)
    useEffect(() => {
        if (idFacturaEditar) return; // Si estamos editando, no disparamos la búsqueda de pedidos nuevos
        
        if (!id || String(id).trim() === "") {
            setFacturaData(prev => ({ ...prev, MontoTotal: "", CantidadTotal: "", nombreCliente: "" }));
            return;
        }

        const buscarDatos = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const endpoint = tipo === "Orden"
                    ? `http://127.0.0.1:8001/pedidos/${id}`
                    : `http://127.0.0.1:8001/clientes/contratos/${id}`; 

                const response = await fetch(endpoint);
                if (!response.ok) throw new Error("Registro no encontrado");

                const resJson = await response.json();
                
                if (tipo === "Orden") {
                    const listaDetalles = resJson.data;
                    if (listaDetalles && listaDetalles.length > 0) {
                        const primerRegistro = listaDetalles[0];
                        const totalMonto = listaDetalles.reduce((acc: number, item: any) => acc + (item.MontoTotal || item.Precio || 0), 0);
                        const totalCantidad = listaDetalles.reduce((acc: number, item: any) => acc + (item.CantidadTotal || item.Cantidad || 0), 0);

                        setFacturaData(prev => ({
                            ...prev,
                            nombreCliente: primerRegistro.NombreCliente || primerRegistro.cliente || "Cliente de la Orden",
                            MontoTotal: totalMonto || 0,
                            CantidadTotal: totalCantidad || 1
                        }));
                    }
                } else {
                    setFacturaData(prev => ({
                        ...prev,
                        nombreCliente: resJson.nombrecliente || resJson.cliente || "",
                        MontoTotal: resJson.MontoTotal || 0,
                        CantidadTotal: resJson.CantidadTotal || 1
                    }));
                }
            } catch (err) {
                setError("No se encontraron datos para ese ID");
                setFacturaData(prev => ({ ...prev, MontoTotal: "", CantidadTotal: "", nombreCliente: "" }));
            } finally {
                setIsFetching(false);
            }
        };

        const timeoutId = setTimeout(buscarDatos, 500);
        return () => clearTimeout(timeoutId);
    }, [id, tipo, idFacturaEditar]);

    // Guardar o Editar (Decide dinámicamente según le proceso)
    const guardarFactura = useCallback(async (onSuccess: (data: any) => void) => {
        setLoading(true);
        setError(null);

        const payload = {
            tipo_registro: tipo,
            idContrato: tipo === "Contrato" ? Number(id) : null,
            idPedido: tipo === "Orden" ? Number(id) : null,
            MontoTotal: Number(facturaData.MontoTotal),
            CantidadTotal: Number(facturaData.CantidadTotal),
            Fecha: facturaData.Fecha,
            nombreCliente: facturaData.nombreCliente
        };

        // Si hay idFacturaEditar, cambiamos la URL a la de actualizar con PUT
        const url = idFacturaEditar 
            ? `http://127.0.0.1:8001/factura/${idFacturaEditar}`
            : "http://127.0.0.1:8001/factura/";

        const method = idFacturaEditar ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Error al ${idFacturaEditar ? "actualizar" : "guardar"} la factura`);
            
            const data = await response.json();
            onSuccess(data);
        } catch (err: any) {
            setError(err.message || "Error al procesar");
        } finally {
            setLoading(false);
        }
    }, [id, tipo, facturaData, idFacturaEditar]);

    return {
        facturaData,
        setFacturaData,
        loading,
        isFetching,
        error,
        guardarFactura
    };
}