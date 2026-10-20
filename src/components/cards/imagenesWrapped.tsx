import { useImagenPlatillo } from "../../context/Hooks/hookImagenes";// Ajusta la ruta a donde tengas tu hook

export interface Props {
    idPlatillo: number;
    nombrePlatillo: string;
}

export function ImagenPlatilloWrapper({ nombrePlatillo }: Props) {

    const { Urlimagen, cargando, error } = useImagenPlatillo( nombrePlatillo);

    if (cargando) {
        return (
            <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
                <span className="text-xs text-slate-400 font-bold">Cargando...</span>
            </div>
        );
    }

    if (error || !Urlimagen) {
        return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-medium text-center px-1">Sin Imagen</span>
            </div>
        );
    }

    // Retorna la imagen apuntando al string (URL de Supabase) que tu hook devolvió
    return (
        <img 
            src={Urlimagen} 
            alt={nombrePlatillo}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
            }}
        />
    );
}