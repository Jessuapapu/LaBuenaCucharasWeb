import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom"; // Importamos useLocation
import TablaClientes from "../components/table/TableCliente";
import { Users, FileText, ArrowRight } from "lucide-react"; // Iconos para darle vida

export default function ClientesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Para saber en qué ruta estamos

  useEffect(() => {
    fetch("http://127.0.0.1:8001/clientes/")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error cargando clientes:", err))
      .finally(() => setLoading(false));
  }, []);

  // Detectar si estamos en la sub-ruta de contratos para ocultar la tabla de clientes si es necesario
  // (Opcional: depende de si quieres ver la tabla y el outlet al mismo tiempo)
  const isRoot = location.pathname === "/Clientes" || location.pathname === "/Clientes/";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Directorio de Clientes</h1>
          <p className="text-gray-400 mt-1 text-sm">Gestiona la información de contacto y direcciones.</p>
        </div>
      </div>

      {/* 2. Grid de Resumen y Navegación (Más integrado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Métrica de Clientes (Visual) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase">Total Clientes</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                    {loading ? "..." : data.length}
                </h3>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                <Users className="w-8 h-8" />
            </div>
        </div>

        {/* Card 2: Acceso a Contratos (Interactivo) */}
        <Link 
            to="/Clientes/Contratos" 
            className="group relative bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 flex items-center justify-between cursor-pointer"
        >
            <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    Gestión de Contratos
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-gray-400 text-sm mt-1">Administrar acuerdos, vigencias y presupuestos.</p>
            </div>
            <div className="p-3 bg-gray-700/50 group-hover:bg-blue-900/30 rounded-lg text-gray-400 group-hover:text-blue-400 transition-colors">
                <FileText className="w-8 h-8" />
            </div>
        </Link>
      </div>

      {/* 3. Renderizado de Contenido */}
      
      {/* El Outlet renderiza las sub-rutas (como /Contratos) */}
      <Outlet />

      {/* 4. Tabla de Clientes (Solo se muestra si no hay sub-ruta activa, o siempre, según tu preferencia) */}
      {/* Si quieres que la tabla desaparezca cuando entras a contratos, envuélvela en: {isRoot && (...)} */}
      
      <div className="mt-6">
        {loading ? (
            <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-blue-400 gap-2">
                <span className="animate-pulse">Cargando directorio...</span>
            </div>
        ) : (
            // Renderizamos la tabla solo si estamos en la raíz de clientes (opcional)
            // Si quieres ver la tabla SIEMPRE debajo, quita la condición 'isRoot'
            isRoot && <TablaClientes data={data} />
        )}
      </div>

    </div>
  );
}