

export interface Orden {
  idOrden: number;
  estado: string;
  montoTotal: number;
  fecha: string;
}

export interface CrearDetalleOrden {
    IdPlatillo: number;
    CantidadPlatillo: number;
    PrecioUnico: number;     // El precio al que se le está vendiendo
}

export interface CrearOrden {
    IdCliente: number;
    //IdUsuario: number;
    Estado: string;          
    MONTOTOTAL: number; 
    detalles: CrearDetalleOrden[]; // La lista de platillos que va a consumir
}

export interface ClienteOrden {
    idCliente: number;
    nombre_cliente: string;
    direccion_cliente: string; // es direccion o dirreccion?
}
export interface DetalleOrdenLista {
    id_orden: number;
    nombre_platillo: string;
    cantidad: number;
    precio_unitario: number;
}

export interface OrdenVisualizar {
    idOrden: number;
    estado_pedido: string;
    monto_total: number;
    fecha: string;
    cliente: ClienteOrden;
    detalles: DetalleOrdenLista[];
    TipodePedidos?: "Evento" | "Contrato" | "Buffet"; 
}
export interface Pedido{
    idPedido: number;
    idOrden: number;
    TipodePedidos?: "Evento" | "Contrato" | "Buffet"; 
}
export interface PedidoDetalle{
    idPedido: number;
    idOrden: number;
    Estado?: "PENDIENTE"| "ANULADO"| "ENTREGADO";
    Fecha: string;
}

export interface ActualizarOrden{
    id_pedido: number;
    estado_pedido: string;
    monto_total: number;
    fecha: string;
    cliente: ClienteOrden;
    detalles: DetalleOrdenLista[];
    TipodePedidos?: "Evento" | "Contrato" | "Buffet"; 
}

export interface CardPedidoProps {
    onClick?: () => void;
    Actualizar?: (id_pedido: number) => void;
    Pedido: OrdenVisualizar;
}

// Para respuestas exitosas del servidor tras la creación 
export interface ApiResponseCrearOrden {
    success: boolean;
    message: string;
    id_orden_creada?: {idOrden: number};

    id_pedido: number; // Tu backend mapea IdOrdenes a id_pedido en el diccionario
  monto_total: number;
  fecha: string;
  estado_pedido: string;
  cliente: {
    nombre_cliente: string;
    direccion_cliente: string;
  };
  detalles: Array<{
    id_orden: number;
    nombre_platillo: string;
    cantidad: number;
    precio_unitario: number;
  }>;
}

export interface ModalNuevaFacturaProps {
  Ordenes?: ClienteOrden[];
  onClose: () => void;
  onSave: (nueva: any) => void;
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
    //subTotal: number;
    idOrdenes: number[];
    idContrato?: number | null;
}