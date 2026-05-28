import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, UtensilsCrossed, Edit2, Plus } from "lucide-react";
//import ModalEditarMenu from "../modals/ModalEditarMenu"; ya mo se utiliza
import ModalNuevoMenu from "../modals/ModalNuevoMenu";
import type { Menu_dario } from "../../interfaces/Platillos";
import { useMenu_diario } from "../Hooks/hookMenu_diario";

// Agregamos la interfaz de Props para recibir los datos de MenusPage
interface CalendarioProps {
    dataInicial: any[];
}

export default function CalendarioPlatillo({ dataInicial }: CalendarioProps) {
    const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const colores = ['#a2ea25', '#68f3ad', '#55a7d6', '#f36868', '#d068f3', '#41d693', '#e9538a'];

    const { 
        datos: menuSemanal,       // Menús guardados en la BD
        listaPlatillos,           // Lista de platillos base para los selectores
        modalDta,                 // Controla qué datos tiene el modal (o si está cerrado)
        setmodalDta,              // Abre/Cierra el modal
        guardarOEditarMenu,       // La función asíncrona masiva (POST/PUT)
        AsignarPlatilloRapido     // Función del selector rápido conectada al hook
    } = useMenu_diario(dataInicial); // Le puedes pasar la dataInicial si tu hook la procesa al arrancar

    

    return (
        <div className="p-4 space-y-6">
            {/* Encabezado */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <CalendarIcon className="text-blue-500 w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Menú de la Semana</h2>
                        <p className="text-gray-400 text-sm">Gestiona los platos disponibles por día.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setmodalDta({day: new Date().toISOString().split("T")[0],
                            nombre_platillo: "",
                            precio_unitario: 0})} 
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center gap-2"
                    >
                        <Plus size={18}/> Nuevo
                    </button>
                </div>
            </div>

            {/* Grid de Días */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                {dias.map((dia, index) => (
                    <div key={dia} className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col min-h-[400px] overflow-hidden">
                        <div className="py-2 text-center font-bold text-black uppercase text-[11px] tracking-widest" style={{ backgroundColor: colores[index] }}>
                            {dia}
                        </div>

                        {/* Selector Rápido */}
                        <div className="p-3">
                            <select 
                                className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-blue-500"
                                onChange={(e) => AsignarPlatilloRapido(dia, e.target.value)}
                                value=""
                            >
                                <option value="" disabled>+ Rápido</option>
                                {listaPlatillos.map((p) => (
                                    <option key={p.nombre_platillo} value={p.nombre_platillo}>{p.nombre_platillo}</option>
                                ))}
                            </select>
                        </div>

                        {/* Lista de platos en el día */}
                        <div className="px-3 pb-3 space-y-2 flex-1">
                            {menuSemanal.filter(m => m.day === dia).map((m, idx) => (
                                <div key={idx} className="group bg-gray-800/50 border border-gray-700 p-3 rounded-xl flex justify-between items-start hover:bg-gray-800 transition-colors">
                                    <span className="text-xs text-gray-200 font-medium leading-tight">{m.nombre_platillo}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setmodalDta(m)} //pasa los datos que ya existen para editar
                                        className="text-gray-400 hover:text-blue-400 p-0.5">
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Empty State por día */}
                            {menuSemanal.filter(m => m.day === dia).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-32 opacity-10">
                                    <UtensilsCrossed size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ahora solo se utiliza un modal en el que si es null */}
            {modalDta !== null && (
                <ModalNuevoMenu MenuData={modalDta} onClose={() => setmodalDta(null)} onSave={() => {guardarOEditarMenu}} />
            )}

        </div>
    );
}