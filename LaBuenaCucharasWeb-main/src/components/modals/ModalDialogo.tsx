
export interface ModalDialogoProps {
    abierto: boolean;
    tipo: 'exito' | 'peligro' | 'info';
    titulo: string;
    mensaje: string;
    textoConfirmar?: string;
    mostrarCancelar?: boolean;
    alConfirmar: () => void;
    alCancelar: () => void;
}



export function ModalDialogo({ 
    abierto, tipo, titulo, mensaje, textoConfirmar = "Aceptar", mostrarCancelar = false, alConfirmar, alCancelar 
}: ModalDialogoProps) {
    if (!abierto) return null;

    // Colores e íconos dinámicos según el tipo de alerta
    const config = {
        exito: {
            color: 'text-emerald-800', bgIcon: 'bg-[#d2ead8]', bgBtn: 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600',
            icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        },
        peligro: {
            color: 'text-rose-800', bgIcon: 'bg-[#f5ddd6]', bgBtn: 'bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600',
            icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        },
        info: {
            color: 'text-sky-900', bgIcon: 'bg-[#cde7ed]', bgBtn: 'bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600',
            icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }
    };

    const estilo = config[tipo];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity">
            <div className="bg-gradient-to-br from-[#e3eff0] to-[#e6ecdf] border border-sky-200 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-[scale-in_0.2s_ease-out] p-6 text-center">
                
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${estilo.bgIcon} ${estilo.color}`}>
                    {estilo.icon}
                </div>
                
                <h3 className="font-black text-2xl text-slate-800 mb-2">{titulo}</h3>
                <p className="text-slate-500 font-medium text-[15px] mb-8 leading-relaxed">
                    {mensaje}
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={alConfirmar}
                        className={`w-full text-white font-black text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 ${estilo.bgBtn}`}
                    >
                        {textoConfirmar}
                    </button>
                    
                    {mostrarCancelar && (
                        <button 
                            onClick={alCancelar}
                            className="w-full bg-[#d6e7e8] text-sky-950 hover:bg-[#c5dfe1] font-bold text-lg py-4 rounded-xl transition-colors border border-sky-200"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
