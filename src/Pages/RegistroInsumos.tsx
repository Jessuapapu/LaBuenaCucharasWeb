import { useMemo } from "react";
import { Link } from "react-router-dom";
import TablaRegistros from "../components/Table/TableRegistro";
import { ArrowDownCircle, Truck, ArrowRight, DollarSign,/* AlertTriangle,*/ RefreshCw } from "lucide-react";
import { useBodega/*, useinsumoseIngredientes */} from "../context/Hooks/hookBodega";
//import { Cardstockmin } from "../components/cards/CardBar";

export default function RegistrosPage() {
  // Ya solo consumimos data y loading del hook
  const { data, loading } = useBodega();
  //const { inventarioGeneral, evaluarEstadoAlerta } = useinsumoseIngredientes();

  const totalCosto = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.CostoTotal) || 0), 0);
  }, [data]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Encabezado Principal */}
      <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">Registro de Entradas</h1>
            <p className="text-slate-700 mt-0.5 text-xl">Historial de abastecimiento e inventario.</p>
          </div>
        </div>
      </div>

      {/* Grid de Métricas y Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex items-center justify-between shadow-lg relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-sky-500 rounded-full blur-2xl opacity-10" />
          <div className="z-10">
            <p className="text-black text-lg font-bold uppercase tracking-widest">Inversion Total Insumos</p>
            <h3 className="text-slate-700 text-4xl font-bold">
              {loading ? "..." : formatMoney(totalCosto)}
            </h3>
          </div>
          <div className="p-3 bg-slate-50 border border-sky-800/30 rounded-xl text-sky-400 shadow-inner z-10">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <Link
          to="/Inventario/Proveedores"
          className="group relative bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex items-center justify-between shadow-lg overflow-hidden"
        >
          {/* Brillo dinámico en hover, es opcional, se puede eliminar sin problemas */}
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <div className="z-10">
            <h3 className="text-2xl font-bold text-black group-hover:text-sky-400 transition-colors flex items-center gap-2">
              Gestión de Proveedores
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-sky-400" />
            </h3>
            <p className="text-slate-500 text-lg mt-0.5 font-medium">Administrar socios y contactos de abastecimiento.</p>
          </div>
          <div className="p-3 bg-slate-50 group-hover:bg-blue-50 border border-slate-800/40 group-hover:border-blue-800/40 rounded-xl text-sky-400 group-hover:text-blue-400 transition-colors">
            <Truck className="w-6 h-6" />
          </div>
        </Link>
      </div>
      <div className=" gap-4 p-6">
        {
        /*inventarioGeneral && inventarioGeneral.length > 0 && (
          <div className="bg-slate-900/10 border border-slate-800/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800/60 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500/80" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider">Monitor de Niveles de Reserva (Mínimos)</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {inventarioGeneral.map((item) => {
                const alerta = evaluarEstadoAlerta(item);
                return (
                  <div key={item.idRegistro} className="transition-transform duration-200 hover:scale-[1.01]">
                    <Cardstockmin
                      key={item.idRegistro}
                      nombre={item.nombre}
                      tipo={item.tipo === "INGREDIENTE" ? "Ingredientes" : "Insumo" as "Insumo" | "Ingredientes"}
                      stockactual={item.cantidad_actual || 0}
                      stockmin={typeof item.stock_minimo === "number" ? item.stock_minimo : 0}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )*/}

        {/* Tabla de Registros */}
        {loading ? (
          <div className="h-64 bg-slate-800/50 flex flex-col items-center justify-center text-sky-500 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400/60" />
            <span className="text-4xl font-bold text-slate-700 uppercase tracking-widest animate-pulse">Cargando registros...</span>
          </div>
        ) : (
          <div className="bg-white-800/50 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm p-2">
            <TablaRegistros data={data} />
          </div>
        )}
      </div>
    </div>
  );
}