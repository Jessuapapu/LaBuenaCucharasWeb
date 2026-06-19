import { useState, useEffect, useRef } from "react";
import type { Platillo, categoriaPlatillo } from "../../interfaces/Platillos";
import { useImagenesPlatillo, useImagenPlatillo } from "../../components/Hooks/hookImagenes";

interface ModalEditPlatilloProps {
    platillo: Platillo; // El objeto original a editar
    onClose: () => void;
    onSave: (editado: Platillo) => void;
}

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

export default function ModalEditPlatillo({ platillo, onClose, onSave }: ModalEditPlatilloProps) {
    const [nombre, setNombre] = useState(platillo.nombre_platillo);
    const [categoria, setCategoria] = useState(platillo.nombre_categoria);

    // Estados para la imagen
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { Urlimagen } = useImagenPlatillo(platillo.nombre_platillo);
    const [imagePreview, setImagePreview] = useState<string | null>(Urlimagen || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fueEliminada, setFueEliminada] = useState(false); // Flag para avisar si se borró la imagen original

    const [listaCategorias, setListaCategorias] = useState<categoriaPlatillo[]>([]);
    const [loading, setLoading] = useState(false);

    // Cargar categorías al montar
    useEffect(() => {
        fetch(`${API_URL}/platillos/categoria`, {
            method: 'GET',
            headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
        })
        .then((res) => {
            if (!res.ok) throw new Error("Error al cargar categorías");
            return res.json();
        })
        .then((data) => {
            setListaCategorias(data);
        })
        .catch((err) => console.error("Error cargando categorías:", err));
    }, []);

    const CambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setFueEliminada(false);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Al presionar la 'X' de la foto
    const handleEliminarFoto = () => {
        setImagePreview(null);
        setImageFile(null);
        if (Urlimagen) {
            setFueEliminada(true); // Marcamos que el usuario eliminó una foto existente de la BD
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación básica antes de enviar
        if (!nombre.trim()) {
            alert("Datos inválidos");
            return;
        }
        
        setLoading(true);

        const formData = new FormData();
        // Enviamos los datos básicos
        formData.append("nombre_platillo", nombre.trim());
        formData.append("nombre_categoria", categoria);
        
        // Solo enviamos el archivo si realmente hay uno nuevo seleccionado
        if (imageFile) {
            formData.append("file", imageFile);
        }

        // Avisar si se eliminó la imagen actual y no se subió una nueva
        if (fueEliminada) {
            formData.append("eliminar_imagen", "true");
        }

        try {
            // Buscamos el ID real, ya sea id_platillo o simplemente id
            const idReal = platillo.id_platillo || (platillo as any).id;

            if (!idReal) {
                alert("Error interno: El platillo no tiene un ID válido para editar.");
                setLoading(false);
                return;
            }

            // Usamos el ID real encontrado para que la URL sea válida
            const response = await fetch(`${API_URL}/platillos/${idReal}`, {
                method: "PUT", 
                body: formData,
                headers: {  ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error al actualizar");
            }

            const data = await response.json();
            
            // Formateamos la data para que la tabla no se rompa al actualizar
            const platilloActualizado = {
                ...platillo,
                ...data,
                id_platillo: idReal, // Aseguramos mantener el ID correcto
                nombre_platillo: nombre.trim(),
                nombre_categoria: categoria,
            };

            onSave(platilloActualizado);
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-orange-400">Editar Platillo</h2>
                <p className="text-gray-400 text-sm mb-6">Modifica los campos necesarios para actualizar el menú.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* SECCIÓN DE FOTO */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors group relative">
                        {imagePreview ? (
                            <div className="relative w-full h-32">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                <button 
                                    type="button"
                                    onClick={handleEliminarFoto}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg hover:bg-red-400"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-orange-400 transition-colors"
                            >
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-wider">Cambiar Foto</span>
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={CambioImagen} accept="image/*" className="hidden" />
                    </div>

                    {/* NOMBRE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Platillo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    {/* CATEGORÍA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                        >
                            {listaCategorias.map((cat, index) => (
                                <option key={index} value={cat.nombre_categoria}>
                                    {cat.nombre_categoria}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center
                                ${loading 
                                    ? "bg-gray-600 cursor-wait" 
                                    : "bg-orange-600 hover:bg-orange-500 shadow-orange-900/20"
                                }`}
                        >
                            {loading ? "Actualizando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}