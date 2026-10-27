import React from "react";
//import { useState, useMemo } from "react";
//import ModalEditarMenu from "../modals/ModalEditarMenu";
import ModalNuevoMenu from "../../Features/Menu/modals/ModalNuevoMenu";
import { Utensils, Edit2, ChevronLeft, ChevronRight} from "lucide-react";
import type { Menu_dario } from "../../context/Interfaces/Platillos";
//import type { DetalleOrdenLista } from "../../interfaces/Ordenes";
import { useMenu_diario } from "../../context/Hooks/hookMenu_diario";

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const Calendario: React.FC= ()=>{
    //para obtener el dia
    //const diaHoy= new Date();
    //const [fecha, setfecha] = useState(new Date())
    //const [showCreateModal, setShowCreateModal] = useState(false);
    //const [selectedMenu, setSelectedMenu] = useState<any | null>(null);
    //const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
    //const [modalDta, setmodalDta]= useState<Menu_dario | null>(null); //para llevar mas facil los datos y mostrar el modal, en caso si es null esta cerrado, si tiene id se edita
    const {
    MesTexto,
    celdas,
    diaHoy,
    meses,
    Anio,
    modalDta,
    setmodalDta,
    cambiarMes,
    obtenerPlatilloDia,
    listaPlatillos,
    manejarClickDia,
    guardarOEditarMenu
  } = useMenu_diario();

    //conteo de semanas, years
    const diasSemanas= ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
    const handleGuardarModal = async(data: any): Promise<void> => {
    try {
        // Se envía directo al hook; él se encargará de traducir a day/monto para el POST/PUT
        await guardarOEditarMenu(data);
    } catch (error) {
        console.error("Error al procesar el guardado desde el calendario:", error);
    }
};
    
    return(
        <div className="rounded-2xl border border-sky-200/80 bg-[#e8f0f3]/90 p-3 shadow-sm sm:p-5">
            {/* Cabecera del Calendario */}
            <div className="flex justify-center items-center mb-6">
                <button 
                    onClick={() => cambiarMes(-1)}
                    aria-label="Mes anterior"
                    className="rounded-xl border border-slate-300 bg-[#edf3f5] p-2 text-slate-600 transition-colors hover:bg-sky-100 hover:text-cyan-900"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="min-w-36 text-center text-xl font-extrabold text-slate-800 capitalize">
                    {MesTexto}
                </h2>
                <button onClick={()=> cambiarMes(1)} aria-label="Mes siguiente" className="rounded-xl border border-slate-300 bg-[#edf3f5] p-2 text-slate-600 transition-colors hover:bg-sky-100 hover:text-cyan-900">
                    <ChevronRight size={24} />
                </button>
            </div>
            {/*Dias de semana*/}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-[9px] sm:text-xs">
                {diasSemanas.map(d=> (<div key={d} className="text-center text-slate-500 font-bold uppercase tracking-wider py-2">
                    {d.substring(0,3)}</div> ))}
            </div>
            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-2">
                {celdas.map((dia, idx) => {
                    const infoMenu = dia ? obtenerPlatilloDia(dia) : [];
                    const esHoy = dia === diaHoy.getDate() && meses=== diaHoy.getMonth() && Anio=== diaHoy.getFullYear();

                    return (
                        <div 
                            key={idx}
                            onClick={(e) => {if (dia && e.target === e.currentTarget) manejarClickDia(dia)}} 
                            //el group relative respone al hover, asi se edita o se anade
                            className={`min-h-[140px] rounded-xl border p-3 transition-all flex flex-col justify-between group relative lg:h-40
                                ${!dia ? 'bg-transparent border-transparent' : 'bg-[#edf3f5]/80 border-slate-200 hover:bg-sky-50 hover:border-sky-300'}
                                ${esHoy ? 'ring-2 ring-cyan-600/35 border-cyan-500 bg-cyan-50/80' : ''}
                            `}
                        >
                            {dia && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm font-bold ${esHoy ? 'text-cyan-800' : 'text-slate-600'}`}>
                                            {dia}
                                        </span>
                                            {/*Para agregar*/}
                                            <button 
                                                onClick={(e) =>{ e.stopPropagation(); manejarClickDia(dia)}}
                                                aria-label={`Agregar platillo para el día ${dia}`}
                                                className="rounded-lg p-1 text-slate-500 opacity-0 transition-all hover:bg-cyan-100 hover:text-cyan-900 group-hover:opacity-100"
                                            >
                                                <Plus size={16}/>
                                            </button>
                                    </div>

                                    <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 custom-scrollbar max-h-[85px] scrollbar-thin">
                                        {infoMenu.length > 0 ? (
                                            infoMenu.map((platillo: Menu_dario) => (
                                                <div 
                                                    key={platillo.id ?? `${platillo.Fecha}-${platillo.NombrePlatillo}`} 
                                                    className="bg-cyan-100/80 border border-cyan-200 p-1.5 px-2 rounded-lg relative group/item flex items-center justify-between"
                                                >
                                                    <p className="text-[10px] text-cyan-950 font-semibold leading-tight truncate pr-4">
                                                        {platillo.NombrePlatillo}
                                                    </p>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setmodalDta(platillo); 
                                                        }}
                                                        aria-label={`Editar ${platillo.NombrePlatillo}`}
                                                        className="absolute right-1 opacity-0 group-hover/item:opacity-100 bg-cyan-700 text-white p-1 rounded-md shadow-sm transition-opacity"
                                                    >
                                                        <Edit2 size={12} className="text-white" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex items-center justify-center mt-2 opacity-40">
                                                <Utensils size={16} className="text-slate-400" />
                                            </div>
                                        )}   
                                    </div>
                                    
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Ahora solo tenesmos un unico modal*/}
            {modalDta && (
                <ModalNuevoMenu MenuData={modalDta} listaPlatillos={listaPlatillos as any} onClose={() => setmodalDta(null)} onSave={handleGuardarModal}/>
            )}
        </div>
            
        )
}

export default Calendario;
