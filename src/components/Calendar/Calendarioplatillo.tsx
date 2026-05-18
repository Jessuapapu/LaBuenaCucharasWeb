import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, UtensilsCrossed, Edit2, Plus } from "lucide-react";
import ModalEditarMenu from "../modals/ModalEditarMenu";
import ModalNuevoMenu from "../modals/ModalNuevoMenu";

interface Platillo {
    nombre_platillo: string;
    nombre_categoria: string;
    precio: number;
}

interface MenuDia {
    id?: number; // Importante para la edición
    dia: string;
    nombre_platillo: string;
}

// Agregamos la interfaz de Props para recibir los datos de MenusPage
interface CalendarioProps {
    dataInicial: any[];
}

export default function CalendarioPlatillo({ dataInicial }: CalendarioProps) {
    const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const colores = ['#a2ea25', '#68f3ad', '#55a7d6', '#f36868', '#d068f3', '#41d693', '#e9538a'];

    const [misPlatillos, setMisPlatillos] = useState<Platillo[]>([]);
    const [menuSemanal, setMenuSemanal] = useState<MenuDia[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuDia | null>(null);

    //Sincronizar data de la API con el estado visual del calendario
    useEffect(() => {
        if (dataInicial && dataInicial.length > 0) {
            const mapeado = dataInicial.map(item => ({
                id: item.id, 
                dia: item.Fecha,
                nombre_platillo: item.NombrePlatillo
            }));
            setMenuSemanal(mapeado);
        }
    }, [dataInicial]);

    //Cargar catálogo de platillos para el selector rápido
    useEffect(() => {
        fetch("http://127.0.0.1:8001/platillos/")
            .then(res => res.json())
            .then(data => setMisPlatillos(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error cargando platillos:", err));
    }, []);

    //Función para asignar rápido (puedes convertirla a POST si quieres que guarde al instante)
    const asignarPlatilloRapido = async (dia: string, nombrePlatillo: string) => {
        if (!nombrePlatillo) return;
        
        // Payload 
        const payload = { day: dia, nombre_platillo: nombrePlatillo };

        try {
            const res = await fetch("http://127.0.0.1:8001/menu/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) window.location.reload(); // Recargamos para ver el cambio
        } catch (error) {
            console.error("Error en asignación rápida:", error);
        }
    };

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
                        onClick={() => setShowCreateModal(true)}
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
                                onChange={(e) => asignarPlatilloRapido(dia, e.target.value)}
                                value=""
                            >
                                <option value="" disabled>+ Rápido</option>
                                {misPlatillos.map((p) => (
                                    <option key={p.nombre_platillo} value={p.nombre_platillo}>{p.nombre_platillo}</option>
                                ))}
                            </select>
                        </div>

                        {/* Lista de platos en el día */}
                        <div className="px-3 pb-3 space-y-2 flex-1">
                            {menuSemanal.filter(m => m.dia === dia).map((m, idx) => (
                                <div key={idx} className="group bg-gray-800/50 border border-gray-700 p-3 rounded-xl flex justify-between items-start hover:bg-gray-800 transition-colors">
                                    <span className="text-xs text-gray-200 font-medium leading-tight">{m.nombre_platillo}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setSelectedMenu(m)} className="text-gray-400 hover:text-blue-400 p-0.5">
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Empty State por día */}
                            {menuSemanal.filter(m => m.dia === dia).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-32 opacity-10">
                                    <UtensilsCrossed size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALES */}
            {showCreateModal && (
                <ModalNuevoMenu onClose={() => setShowCreateModal(false)} />
            )}

            {selectedMenu && (
                <ModalEditarMenu 
                    menu={{
                        id: selectedMenu.id || 0,
                        Fecha: selectedMenu.dia, 
                        NombrePlatillo: selectedMenu.nombre_platillo
                    }} 
                    onClose={() => setSelectedMenu(null)}
                />
            )}
        </div>
    );
}