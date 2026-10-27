import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { Platillo, categoriaPlatillo } from "../../../context/Interfaces/Platillos";
import { crearPlatillo } from "../../../context/Services/platillos";
import { useCrearIngredientes } from "../../../context/Hooks/hookIngredientes";
import { crearRelacionPlatilloIngrediente } from "../../../context/Services/ingredientes";

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

    const { ingredientes, loading: cargando }= useCrearIngredientes()
    const [ingredientesSeleccionado, setIngredientesSeleccionado]= useState<number[]>([])

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

    const handleToggleIngrediente = (id: number) => {
        setIngredientesSeleccionado((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
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
            const idNuevoPlatillo = platilloData.id_platillo;

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
            if (ingredientesSeleccionado.length > 0 && idNuevoPlatillo) {
                await crearRelacionPlatilloIngrediente(
                    ingredientesSeleccionado,
                    idNuevoPlatillo
                );
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

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
            <div role="dialog" aria-modal="true" aria-labelledby="nuevo-platillo-titulo" className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-sky-200 bg-[#e6eef2] text-slate-800 shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)]">

                <button
                    onClick={onClose}
                    type="button"
                    aria-label="Cerrar formulario"
                    className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="shrink-0 border-b border-slate-300/80 bg-[#dbe8ed] px-5 py-5 pr-14 sm:px-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Catálogo de comidas</p>
                    <h2 id="nuevo-platillo-titulo" className="text-2xl font-extrabold tracking-tight text-slate-800">Nuevo platillo</h2>
                    <p className="mt-1 text-sm text-slate-600">Ingresa los datos para registrar un nuevo platillo.</p>
                </div>

                <form onSubmit={handleSubmit} className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7">

                    <div>
                        {/* SECCIÓN DE FOTO */}
                        <div className="flex min-h-32 flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-[#edf3f5] hover:bg-slate-100 transition-colors group relative">
                            {imagePreview ? (
                                <div className="relative w-full h-32">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-lg hover:bg-rose-500"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-cyan-800 transition-colors"
                                >
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-xs font-bold uppercase tracking-wider">Agregar foto</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={CambioImagen} accept="image/*" className="hidden" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del platillo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-700/30 focus:border-cyan-700 outline-none transition-all placeholder-slate-400"
                            placeholder="Ej: Lomo Saltado"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2.5 rounded-xl bg-[#f3f7f8] border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-700/30 focus:border-cyan-700 outline-none transition-all appearance-none cursor-pointer"
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
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>


                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Ingredientes de la receta <span className="text-slate-500 font-normal">(opcional)</span>
                        </label>
                        {cargando ? (
                            <p className="text-xs text-slate-500 italic py-2">Cargando catálogo de ingredientes...</p>
                        ) : (
                            <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 border border-slate-300 p-2 rounded-xl bg-[#dce7eb] custom-scrollbar">
                                {ingredientes.map((ing) => {
                                    const isChecked = ingredientesSeleccionado.includes(ing.IdIngredeintes);
                                    return (
                                        <label
                                            key={ing.IdIngredeintes}
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs cursor-pointer transition-all
                                                ${isChecked 
                                                    ? "bg-cyan-100 border-cyan-300 text-cyan-950" 
                                                    : "bg-[#edf3f5] border-slate-200 text-slate-700 hover:bg-white/70"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-cyan-700 bg-white border-slate-300 focus:ring-cyan-600 focus:ring-offset-slate-100"
                                                checked={isChecked}
                                                onChange={() => handleToggleIngrediente(ing.IdIngredeintes)}
                                            />
                                            <span className="flex-1 font-medium">{ing.nombreIngrediente}</span>
                                        </label>
                                    );
                                })}
                                {ingredientes.length === 0 && <p className="px-2 py-3 text-xs text-slate-500">No hay ingredientes disponibles.</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all shadow-md flex justify-center items-center
                                ${loading
                                    ? "bg-slate-500 cursor-wait"
                                    : "bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-900/15"
                                }`}
                        >
                            {loading ? "Guardando..." : "Crear Platillo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
