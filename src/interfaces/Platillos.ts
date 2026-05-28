export interface Platillo {
  id_platillo?: number;
  nombre_platillo: string;
  nombre_categoria: string;
  precio: number;
  //imagen_url?: string;
}

export interface Menu_dario{
    id_menu?: number;
    //idPlatillo?: number;
    nombre_platillo: string;
    day: string;
    precio_unitario: number;
    //detalle: DetalleMenu[];
}

export interface Imagenes{
    IdImagen: number;
    IdPlatillo: number;
    url_imagen: string;
}

export interface FoodCardProps {
  platillo: Platillo;
  onUpdate?: (updated: Platillo) => void;
  ventas?: boolean;
}

export interface ModalPlatilloProps {
  platillos: Platillo[];
  onClose: () => void;
  onSave: (updatedPlatillos: Platillo[]) => void; 
}

export interface Ingredientes{
    IdIngredeintes: number;
    stock_ingredientes: number;
    nombreIngrediente: string;
}

export interface DetalleIngredientes{
    IdRegistroAbastecimiento: number;
    IdIngredientes: number;
    TotalIngresado: number;
    costoIndividual: number;
}

export interface categoriaPlatillo{
    idPlatillo: number;
    nombre_categoria: string;
}