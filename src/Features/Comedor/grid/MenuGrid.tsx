import { ImagenPlatilloWrapper } from "../../../components/cards/imagenesWrapped";
import type { Platillos } from "../../../context/Interfaces/Platillos";

export interface MenuDiaGridProps {
    cargando: boolean;
    listaMenu: Platillos[];
    alAgregar: (nombre: string, precio: number) => void;
}


export function MenuDiaGrid({ cargando, listaMenu, alAgregar }: MenuDiaGridProps) {
    if (cargando) {
        return <div className="flex justify-center py-10"><span className="animate-pulse text-teal-800 font-bold">Cargando menú...</span></div>;
    }

    if (listaMenu.length === 0) {
        return <div className="bg-[#e3efea] border border-emerald-200 rounded-2xl p-8 text-center"><p className="text-emerald-900 font-medium">No hay platillos disponibles hoy.</p></div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listaMenu.map((platillo) => (
                <div key={platillo.id} className="bg-gradient-to-br from-[#eaf2e8] to-[#e0eff0] border border-emerald-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#d4e8e5] flex-shrink-0 relative">
                        <ImagenPlatilloWrapper 
                            idPlatillo={platillo.id} 
                            nombrePlatillo={platillo.NombrePlatillo} 
                        />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                        <div>
                            <h3 className="font-bold text-slate-800 leading-tight">{platillo.NombrePlatillo}</h3>
                            <p className="text-emerald-800 font-black mt-1">C${platillo.Monto || platillo.PrecioUnico || 0}</p>
                        </div>
                        <button 
                            onClick={() => alAgregar(platillo.NombrePlatillo, platillo.Monto || platillo.PrecioUnico || 0)}
                            className="mt-2 bg-[#cbe5e9] hover:bg-[#b6dce2] text-sky-950 border border-sky-200 font-bold py-1.5 px-3 rounded-lg text-sm transition-colors w-max self-end active:scale-95"
                        >
                            + Añadir
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
