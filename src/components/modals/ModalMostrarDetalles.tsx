
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
    Mesero: string
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
            <div className="bg-[#e3efec] rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-sky-200 transform transition-all flex flex-col max-h-[90vh]">
                
                {/* Cabecera */}
                <div className="bg-gradient-to-r from-[#cde7ed] to-[#dcebdc] px-6 md:px-8 py-5 flex justify-between items-center shadow-sm z-10 border-b border-sky-200">
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
                        className="text-sky-900 hover:text-white bg-[#bcdfe5] hover:bg-rose-600 rounded-full w-10 h-10 flex items-center justify-center transition-all focus:ring-2 focus:ring-rose-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Cuerpo (Lista de Platillos con Imágenes) */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-[#e8f1ed]">
                    {cargando ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <span className="text-slate-500 font-semibold animate-pulse">Cargando platillos...</span>
                        </div>
                    ) : detalles.length > 0 ? (
                        <div className="space-y-4">
                            {detalles.map((item, index) => (
                                <div key={index} className="bg-gradient-to-r from-[#f0f3df] to-[#e0eff0] p-4 rounded-2xl shadow-sm border border-emerald-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    
                                    {/* Imagen del platillo consumiendo tu endpoint */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-[#d5e7e2] rounded-xl overflow-hidden shadow-inner border border-teal-200">
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
                                        <p className="text-sm font-semibold text-sky-950 bg-[#d4e8e9] inline-block px-2 py-0.5 rounded-md mb-2">
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
                        <div className="text-center text-slate-700 py-12 bg-[#e2ece6] rounded-2xl border-2 border-dashed border-emerald-300">
                            <p className="font-semibold text-lg">El pedido no tiene platillos registrados.</p>
                        </div>
                    )}
                </div>
                
                {/* Pie (Totales y Botones de Acción) */}
                <div className="bg-gradient-to-r from-[#d7e9e8] to-[#e4eedc] px-6 md:px-8 py-6 border-t border-sky-200 z-10">
                    
                    {!cargando && detalles.length > 0 && (
                        <div className="flex justify-between items-end mb-6 bg-[#d0e8dc] p-4 rounded-xl border border-emerald-300">
                            <span className="text-emerald-950/80 font-extrabold uppercase tracking-widest text-sm">Total a Pagar</span>
                            <span className="font-black text-4xl text-emerald-800 tracking-tight">C${granTotal.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Contenedor de botones dinámico */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Botón para añadir más (SOLO SI ES ACTIVA) */}
                        {esActiva && (
                            <button 
                                onClick={alAgregarPlatillos}
                                className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Añadir Platillos
                            </button>
                        )}
                        
                        <button 
                            onClick={alCerrar}
                            className={`font-bold py-4 rounded-xl transition-colors shadow-md ${
                                esActiva 
                                ? "flex-1 bg-[#d5e6e8] text-sky-950 hover:bg-[#c4dfe1]" 
                                : "w-full bg-gradient-to-r from-sky-800 to-teal-800 text-white hover:from-sky-700 hover:to-teal-700"
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
