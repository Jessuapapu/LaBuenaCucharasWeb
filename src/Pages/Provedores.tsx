import { Link } from "react-router-dom";
import TablaProveedores from "../components/table/TablaProvedor";
import { Truck, ArrowLeft, Users, ShieldCheck, RefreshCw } from "lucide-react"; 
import { useProveedores } from "../components/Hooks/hookProveedor";
import ModalNuevoIngrediente from "../components/modals/ModalNuevoIngrediente";

export default function ProveedoresPage() {
  // Solo llamamos a tu nuevo hook y extraemos lo que necesitamos
  const { data, loading } = useProveedores();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="bg-slate-900/30 backdrop-blur-md p-6 rounded-2xl border border-slate-800/50 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Título, Icono y Botón de Retorno */}
            <div className="flex items-center gap-3">
                {/* Botón para regresar a Inventario */}
                <Link 
                    to="/Inventario" 
                    className="p-2.5 bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800/80 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5 group"
                    title="Volver a Inventario"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>

                <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                    <Truck className="w-6 h-6" />
                </div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Proveedores</h1>
                    <p className="text-gray-400 mt-1 text-sm">Gestión de socios comerciales y suministros.</p>
                </div>
            </div>
            {/* Zona Central / Derecha: Integración del Modal u acciones adicionales */}
        <div className="flex items-center gap-4 self-end lg:self-auto">
          <ModalNuevoIngrediente onClose={() => {}} />
        </div>

        {/* Lado Derecho: Bloque de Mini KPIs optimizados */}
        {!loading && data && (
          <div className="flex gap-8 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-8 w-full lg:w-auto justify-between sm:justify-start">
            
            {/* KPI 1: Proveedores Totales */}
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-slate-950/50 text-slate-400 rounded-lg border border-slate-800/40 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total</span>
                <p className="text-xl font-black text-white tracking-tight">{data.length}</p>
              </div>
            </div>

            {/* KPI 2: Proveedores con Contrato Fijo */}
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-slate-950/50 text-sky-400 rounded-lg border border-slate-800/40 group-hover:bg-sky-950/30 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fijos</span>
                <p className="text-xl font-black text-sky-400 tracking-tight">
                  {data.filter((p: any) => p.Tipo?.toUpperCase() === 'FIJO' || p.tipo?.toUpperCase() === 'FIJO').length}
                </p>
              </div>
            </div>

          </div>
        )} 
        </div>

      {loading ? (
        <div className="h-64 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center text-sky-500 gap-3 shadow-inner">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Cargando directorio de socios...</span>
        </div>
      ) : (
        <div className="bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl p-1">
          <TablaProveedores data={data} />
        </div>
      )}
    </div>
  );
}