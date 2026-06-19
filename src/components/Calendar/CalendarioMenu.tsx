import React from "react";
//import { useState, useMemo } from "react";
//import ModalEditarMenu from "../modals/ModalEditarMenu";
import ModalNuevoMenu from "../../Menu/modals/ModalNuevoMenu";
import { Utensils, Edit2, ChevronLeft, ChevronRight} from "lucide-react";
import type { Menu_dario } from "../../interfaces/Platillos";
//import type { DetalleOrdenLista } from "../../interfaces/Ordenes";
import { useMenu_diario } from "../Hooks/hookMenu_diario";

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
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-2 shadow-2xl">
            {/* Cabecera del Calendario */}
            <div className="flex justify-center items-center mb-6">
                <button 
                    onClick={() => cambiarMes(-1)}
                    className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-white capitalize">
                    {MesTexto}
                </h2>
                <button onClick={()=> cambiarMes(1)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>
            {/*Dias de semana*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-2 text-sm">
                {diasSemanas.map(d=> (<div key={d} className="text-center text-gray-500 text-xs font-bold uppercase tracking-wider py-2">
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
                            className={`min-h-[100px] rounded-xl border p-2 transition-all flex flex-col justify-between group relative
                                ${!dia ? 'bg-transparent border-transparent' : 'bg-gray-800/40 border-gray-800 hover:border-gray-600'}
                                ${esHoy ? 'ring-2 ring-blue-500/50 border-blue-500/50' : ''}
                            `}
                        >
                            {dia && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm font-medium ${esHoy ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {dia}
                                        </span>
                                            {/*Para agregar*/}
                                            <button 
                                                onClick={(e) =>{ e.stopPropagation(); manejarClickDia(dia)}}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-500"
                                            >
                                                <Plus size={16}/>
                                            </button>
                                    </div>

                                    <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 custom-scrollbar max-h-[85px] scrollbar-thin">
                                        {infoMenu.length > 0 ? (
                                            infoMenu.map((platillo: Menu_dario) => (
                                                <div 
                                                    key={platillo.id ?? `${platillo.Fecha}-${platillo.NombrePlatillo}`} 
                                                    className="bg-blue-600/20 border border-blue-500/30 p-1 px-2 rounded-md relative group/item flex items-center justify-between"
                                                >
                                                    <p className="text-[10px] text-blue-200 font-medium leading-tight truncate pr-4">
                                                        {platillo.NombrePlatillo}
                                                    </p>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setmodalDta(platillo); 
                                                        }}
                                                        className="absolute right-1 opacity-0 group-hover/item:opacity-100 bg-blue-600 p-0.5 rounded shadow-lg transition-opacity"
                                                    >
                                                        <Edit2 size={12} className="text-white" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex items-center justify-center opacity-5 mt-2">
                                                <Utensils size={16} className="text-white" />
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