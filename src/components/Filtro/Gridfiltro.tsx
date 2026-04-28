import { useState, useMemo } from "react";
import { Search, UtensilsCrossed } from "lucide-react";
import { FoodCard } from "../cards/FoodCard"; // Ajusta la ruta a tu FoodCard de Tailwind
import { FiltroPlatillos } from "./Filtroplatillos"; // Ajusta la ruta

interface Props {
  data: any[];
}

export default function TablaPlatillosNuevo({ data }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  // 1. Obtenemos las categorías de forma dinámica desde los datos de la API
  const listaCategorias = useMemo(() => {
    const unicas = Array.from(new Set(data.map((p) => p.nombre_categoria)));
    return ["Todos", ...unicas];
  }, [data]);

  // 2. Lógica de filtrado combinada (Buscador + Filtro de Botones)
  const platillosFiltrados = useMemo(() => {
    return data.filter((p) => {
      const cumpleBusqueda = p.nombre_platillo.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleCategoria = categoria === "Todos" || p.nombre_categoria === categoria;
      return cumpleBusqueda && cumpleCategoria;
    });
  }, [data, busqueda, categoria]);

  return (
    <div className="space-y-6">
      {/* --- PANEL DE CONTROL (FILTROS Y BÚSQUEDA) --- */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-inner">
        
        {/* Buscador Estilo Dashboard */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre del platillo..."
            className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Componente de Filtro Dinámico */}
        <FiltroPlatillos 
          categorias={listaCategorias} 
          categoriaActiva={categoria} 
          onSeleccionar={setCategoria} 
        />
      </div>

      {/* --- GRID DE FOODCARDS --- */}
      <div className="min-h-[400px]">
        {platillosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {platillosFiltrados.map((item) => (
              <FoodCard
                key={item.id}
                titulo={item.nombre_platillo}
                icon_img={item.imagen_url}
                precio={item.precio}
              />
            ))}
          </div>
        ) : (
          /* Estado Vacío */
          <div className="flex flex-col items-center justify-center py-20 bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800">
            <UtensilsCrossed className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron platillos con esos filtros.</p>
            <button 
              onClick={() => { setBusqueda(""); setCategoria("Todos"); }}
              className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-bold underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}