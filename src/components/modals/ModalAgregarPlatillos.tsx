import { useState, useEffect, useRef } from "react";

import type { Platillo, categoriaPlatillo } from "../../interfaces/Platillos";
import { crearPlatillo } from "../../services/platillos";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("access_token");

interface ModalNuevoPlatilloProps {
    onClose: () => void;
    // Restauramos onSave para que el padre pueda actualizar la tabla
    onSave: (nuevo: Platillo) => void;
}

export default function ModalNuevoPlatillo({ onClose, onSave }: ModalNuevoPlatilloProps) {
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    //const [precio, setprecio]= useState<string>("");

    // Estados para la imagen
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [listaCategorias, setListaCategorias] = useState<categoriaPlatillo[]>([]);
    const [loading, setLoading] = useState(false);

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

    // Manejador de cambio de imagen
    const CambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim() || !categoria.trim()) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        setLoading(true);

        try {
            // Crear el platillo
            const platilloData = await crearPlatillo({
                nombre_platillo: nombre,
                nombre_categoria: categoria,
            })

            //const platilloData = await platilloRes.json();

            // Subir la imagen si existe
            if (imageFile) {
                const imageFormData = new FormData();
                // lo que espera
                imageFormData.append("file", imageFile);

                // Usamos el nombre que el usuario escribió (ya validado por el backend)
                const imgRes = await fetch(`${API_URL}/imagenes/${encodeURIComponent(nombre)}`, {
                    method: "POST",
                    body: imageFormData,
                    headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }

                });

                if (!imgRes.ok) {
                    alert("Platillo creado, pero la imagen no se pudo subir. Podrás editarla más tarde.");
                }
            }

            onSave(platilloData);
            onClose();

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Hubo un error al procesar el registro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 p-6 rounded-xl text-white max-w-md w-full shadow-2xl border border-gray-700 relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-1 text-blue-400">Nuevo Platillo</h2>
                <p className="text-gray-400 text-sm mb-6">Ingresa los datos para registrar un nuevo platillo.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        {/* SECCIÓN DE FOTO */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors group relative">
                            {imagePreview ? (
                                <div className="relative w-full h-32">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg hover:bg-red-400"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-400 transition-colors"
                                >
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-xs font-bold uppercase tracking-wider">Agregar Foto</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={CambioImagen} accept="image/*" className="hidden" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Platillo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                            placeholder="Ej: Lomo Saltado"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccionar Categoría --</option>
                                {listaCategorias.map((cat, index) => (
                                    <option key={index} value={cat.nombre_categoria}>
                                        {cat.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>


                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
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
                                    : "bg-green-600 hover:bg-green-500 shadow-green-900/20"
                                }`}
                        >
                            {loading ? "Guardando..." : "Crear Platillo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}