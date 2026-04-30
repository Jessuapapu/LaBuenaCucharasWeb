import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TablaRegistros from "../components/table/TableRegistro";
import { ArrowDownCircle, Truck, ArrowRight, DollarSign } from "lucide-react";
import { Cardstockmin } from "../components/cards/CardBar";

export default function RegistrosPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]); // Para el grid de cards
  
  useEffect(() => {
    //Ejecuta paralelamente
    Promise.all([
      fetch("http://127.0.0.1:8001/bodega/"),
      fetch("http://127.0.0.1:8001/ingredientes"), 
      fetch("http://127.0.0.1:8001/insumos")
    ])
      .then(async ([resBodega, resIng, resPrio]) => {
        const jsonBodega = await resBodega.json();
        const jsonIng = await resIng.json();
        const jsonPrio = await resPrio.json();

        setData(jsonBodega);

        // --- NORMALIZACIÓN DE DATOS ---
        const alerts = [
          ...jsonIng.map((i: any) => ({
            id: `ing-${i.id}`,
            nombre: i.nombre_ingrediente,
            tipo: "Ingrediente",
            actual: i.cantidad,
            minimo: i.stock_minimo
          })),
          ...jsonPrio.map((p: any) => ({
            id: `prio-${p.id}`,
            nombre: p.nombreinsumo,
            tipo: "Prioridad",
            // Convertimos el string "True"/"False" a booleano real
            actual: String(p.prioridad).toLowerCase() === "true", 
            minimo: 30 // Valor base para la gráfica
          }))
        ];
        
        setStockAlerts(alerts);
      })
      .catch((err) => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));

  }, []);

  // Calculamos el total gastado para mostrar un dato útil
  const totalCosto = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.CostoTotal) || 0), 0);
  }, [data]);

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Encabezado Principal */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-green-900/20 rounded-xl text-green-400">
                <ArrowDownCircle className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Registro de Entradas</h1>
                <p className="text-gray-400 mt-1 text-sm">Historial de abastecimiento e inventario.</p>
            </div>
        </div>
      </div>

      {/* Grid de Métricas y Navegación (Estilo Clientes->Contratos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: KPI de Costos */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-center justify-between shadow-lg">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Costo Total Insumos</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-bold text-white">
                        {loading ? "..." : formatMoney(totalCosto)}
                    </h3>
                </div>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg text-green-400">
                <DollarSign className="w-8 h-8" />
            </div>
        </div>

        {/* Card 2: Acceso Directo a Proveedores */}
        <Link 
            to="/Inventario/Proveedores" 
            className="group relative bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 flex items-center justify-between cursor-pointer shadow-lg"
        >
            <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    Gestión de Proveedores
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-gray-400 text-sm mt-1">Administrar socios y contactos de abastecimiento.</p>
            </div>
            <div className="p-3 bg-gray-800 group-hover:bg-blue-900/20 rounded-xl text-gray-400 group-hover:text-blue-400 transition-colors">
                <Truck className="w-8 h-8" />
            </div>
        </Link>
      </div>

      {/*Stock minimo*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading? (// Skeleton simple para las cards mientras se carga
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-900/50 animate-pulse rounded-2xl border border-gray-800" />
            ))
          ) : (
            stockAlerts.map((alerta) => (
              <Cardstockmin 
                key={alerta.id}
                nombre={alerta.nombre}
                tipo={alerta.tipo}
                stockactual={alerta.actual}
                stockmin={alerta.minimo}
              />
            ))
          )}
      </div>

      {/* Tabla de Registros */}
      {loading ? (
        <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-blue-400 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium animate-pulse">Cargando registros...</span>
        </div>
      ) : (
        <TablaRegistros data={data} />
      )}
    </div>
  );
}