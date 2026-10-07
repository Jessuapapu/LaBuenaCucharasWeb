
import { useImagenPlatillo } from "../../context/Hooks/hookImagenes";

export interface Detalles {
    nombre_platillo: string;
    cantidad: number;
    precio_unitario: number;
}

export interface ModalDetalleOrdenProps {
    abierto: boolean;
    cargando: boolean;
    detalles: Detalles[];
    alCerrar: () => void;
    esActiva?: boolean; 
    alAgregarPlatillos?: () => void; 
}

export interface ComedorOrdenIN {
    IdMesa: number;
    Detalles: Detalles[];
}

export function ModalDetalleOrden({ 
    abierto, 
    cargando, 
    detalles, 
    alCerrar, 
    esActiva = false, 
    alAgregarPlatillos 
}: ModalDetalleOrdenProps) {
    if (!abierto) return null;

    const granTotal = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

    return (
        <div className="fixed inset-0 bg-slate-800/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity">
            {/* Hacemos el modal más ancho (max-w-2xl) para que las imágenes respiren */}
            <div className="bg-slate-50 rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 transform transition-all flex flex-col max-h-[90vh]">
                
                {/* Cabecera */}
                <div className="bg-white px-6 md:px-8 py-5 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Cuenta de Consumo</h3>
                        {esActiva && (
                            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Orden en curso
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={alCerrar}
                        className="text-slate-400 hover:text-white bg-slate-100 hover:bg-red-500 rounded-full w-10 h-10 flex items-center justify-center transition-all focus:ring-2 focus:ring-red-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Cuerpo (Lista de Platillos con Imágenes) */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    {cargando ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <span className="text-slate-500 font-semibold animate-pulse">Cargando platillos...</span>
                        </div>
                    ) : detalles.length > 0 ? (
                        <div className="space-y-4">
                            {detalles.map((item, index) => (
                                <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    
                                    {/* Imagen del platillo consumiendo tu endpoint */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                                        <img 
                                            src={useImagenPlatillo(item.nombre_platillo).Urlimagen} 
                                            alt={item.nombre_platillo}
                                            className="w-full h-full object-cover"
                                            // Fallback por si la imagen no existe
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/150?text=Sin+Foto';
                                            }}
                                        />
                                    </div>

                                    {/* Información del platillo */}
                                    <div className="flex-1">
                                        <p className="font-extrabold text-slate-800 text-lg md:text-xl leading-tight mb-1">
                                            {item.nombre_platillo}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md mb-2">
                                            C${item.precio_unitario} c/u
                                        </p>
                                    </div>

                                    {/* Cantidad y Subtotal */}
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-400 mb-1">x{item.cantidad}</div>
                                        <div className="font-black text-slate-700 text-xl md:text-2xl">
                                            C${(item.cantidad * item.precio_unitario).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="font-semibold text-lg">El pedido no tiene platillos registrados.</p>
                        </div>
                    )}
                </div>
                
                {/* Pie (Totales y Botones de Acción) */}
                <div className="bg-white px-6 md:px-8 py-6 border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
                    
                    {!cargando && detalles.length > 0 && (
                        <div className="flex justify-between items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="text-slate-500 font-extrabold uppercase tracking-widest text-sm">Total a Pagar</span>
                            <span className="font-black text-4xl text-blue-600 tracking-tight">C${granTotal.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Contenedor de botones dinámico */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Botón para añadir más (SOLO SI ES ACTIVA) */}
                        {esActiva && (
                            <button 
                                onClick={alAgregarPlatillos}
                                className="flex-1 bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Añadir Platillos
                            </button>
                        )}
                        
                        <button 
                            onClick={alCerrar}
                            className={`font-bold py-4 rounded-xl transition-colors shadow-md ${
                                esActiva 
                                ? "flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200" 
                                : "w-full bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                        >
                            {esActiva ? "Cerrar Vista" : "Entendido"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}