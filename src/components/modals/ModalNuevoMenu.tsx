import { useState, useEffect } from "react";
//import { Trash2 } from "lucide-react";
import type { Menu_dario } from "../../interfaces/Platillos";
//const API_URL = import.meta.env.VITE_API_URL;
// Estructura auxiliar para llenar el select de platillos
interface PlatilloOption {
    NombrePlatillo: string;
}

interface ModalNuevoMenuProps {
    MenuData?: Menu_dario | null; //si existe, se edita
    listaPlatillos: PlatilloOption[];
    onSave: (data: any)=> void;
    onClose: () => void;
}

export default function ModalNuevoMenu({ MenuData, listaPlatillos, onClose, onSave }: ModalNuevoMenuProps) {
    const isEditing= !!MenuData?.id;
    // Estado del formulario
    // Inicializamos la fecha con el día de hoy
    const [fechadia, setFecha] = useState( new Date().toISOString().split("T")[0]);
    const [nombrePlatillo, setNombrePlatillo] = useState("") 
    const [precioUnitario, setPrecioUnitario]= useState<number>(0)// se queda asi me da paja cambiar nombre deestados
    
    // Estado para datos auxiliares
    const [loading, setLoading] = useState(false);

    // Cargar la lista de Platillos disponibles para el Select
    //useEffect(() => {
      //  fetch(`${API_URL}/platillos/`)
        //    .then((res) => res.json())
          //  .then((data) => setListaPlatillos(Array.isArray(data) ? data : []))
            //.catch((err) => console.error("Error cargando platillos:", err));
    //}, []);
    useEffect(() => {
        if(MenuData){
          setFecha(MenuData.Fecha || new Date().toISOString().split("T")[0]);
          setNombrePlatillo(MenuData.NombrePlatillo || "");
          setPrecioUnitario(MenuData.Monto);
        }
    }, [MenuData]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fechadia || !nombrePlatillo) {
            alert("Por favor selecciona una fecha y un platillo.");
            return;
        }

        setLoading(true);

        // Estructura JSON
        const payload: Menu_dario = {
            id: MenuData?.id,
            Fecha: fechadia,
            NombrePlatillo: nombrePlatillo,
            Monto: Number(precioUnitario),
    
        };

        try {
            // Ahora el hook se encarga del resto
            await onSave(payload); 
            // refrescar desde el padre
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar. Verifica la conexión.");
            setLoading(false); // Desactivar loading solo si falla
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
                
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">{isEditing ? "Editar Menú" : "Asignar Menú"}</h2>
                <p className="text-gray-400 text-sm mb-6">Programa un platillo para una fecha específica.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            value={fechadia}
                            onChange={(e) => setFecha(e.target.value)}
                            disabled={isEditing}
                            required
                        />
                    </div>

                    <div className="space-y-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Platillo</label>
                            <select
                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white text-sm outline-none"
                                value={nombrePlatillo}
                                onChange={(e) => setNombrePlatillo(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {(listaPlatillos || []).map((p, i) => (
                                    <option key={i} value={p.NombrePlatillo}>
                                        {p.NombrePlatillo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Precio (C$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white text-sm disabled:opacity-40"
                                value={precioUnitario} 
                                onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                                disabled={isEditing}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                                ${loading ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-500"}`}
                        >
                            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Asignar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}