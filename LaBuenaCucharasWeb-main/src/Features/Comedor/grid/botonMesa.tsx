import { useNavigate } from 'react-router-dom';

interface BotonMesaProps {
    id: number | string;
    estado?: 'libre' | 'ocupada'; 
}

export function BotonMesa({ id, estado = 'libre' }: BotonMesaProps) {
    const navigate = useNavigate();

    const colorMesa = estado === 'libre' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-red-500 shadow-red-500/40';
    const colorSilla = estado === 'libre' ? 'bg-emerald-200' : 'bg-red-200';

    return (
        <button 
            onClick={() => navigate(`/mesa/${id}`)}
            title={`Ir a la mesa ${id}`}
            className="relative w-24 h-24 m-4 flex items-center justify-center group focus:outline-none rounded-full transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-105"
        >
            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full ${colorSilla} transition-transform duration-300 group-hover:-translate-y-1`}></div>
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full ${colorSilla} transition-transform duration-300 group-hover:translate-y-1`}></div>
            <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-8 rounded-full ${colorSilla} transition-transform duration-300 group-hover:-translate-x-1`}></div>
            <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-8 rounded-full ${colorSilla} transition-transform duration-300 group-hover:translate-x-1`}></div>
            
            <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${colorMesa}`}>
                {estado === 'libre' && <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>}
                <span className="text-white font-extrabold text-2xl drop-shadow-md z-20">{id}</span>
            </div>
        </button>
    );
}