import { Link } from "react-router-dom";
import TablaProveedores from "../Proveedor/tables/TablaProvedor";
import { Truck, ArrowLeft, Users, ShieldCheck, RefreshCw } from "lucide-react"; 
import { useProveedores } from "../components/Hooks/hookProveedor";
import ModalNuevoIngrediente from "../Ingredientes/modals/ModalNuevoIngrediente";

export default function ProveedoresPage() {
  // Solo llamamos a tu nuevo hook y extraemos lo que necesitamos
  const { data, loading } = useProveedores();

  //Para las KPI's
  const totalProveedores = Array.isArray(data) ? data.length : 0;
  const proveedoresFijos = Array.isArray(data) 
    ? data.filter((p: any) => p.Tipo?.toUpperCase() === 'FIJO' || p.tipo?.toUpperCase() === 'FIJO').length 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-1">
      
      {/* ENCABEZADO */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Título, Subtítulo y Navegación de Retorno */}
        <div className="flex items-center gap-4">
          {/* Botón para regresar a Inventario */}
          <Link 
            to="/Inventario" 
            className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-blue-400 hover:to-cyan-400 text-white hover:text-slate-800 rounded-xl transition-all border border-slate-200/60 hover:border-slate-200 shadow-sm hover:shadow group"
            title="Volver a Inventario"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>

          {/* Icono del Módulo */}
          <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Truck className="w-6 h-6" />
          </div>

          {/* Textos del Encabezado */}
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Proveedores</h1>
            <p className="text-slate-400 mt-0.5 text-xs font-medium">Gestión de socios comerciales y suministros de cocina.</p>
          </div>
        </div>

        {/* Lado Derecho: Acciones y Modales */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <ModalNuevoIngrediente onClose={() => {}} />
        </div>
      </div>

      {/* Los KPI's */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Proveedores Totales */}
          <div className="bg-gradient-to-r from-cyan-400/60 to-blue-500 hover:from-blue-500 hover:to-cyan-500 backdrop-blur-md p-4 rounded-xl border border-slate-200/60 shadow-sm shadow-blue-600/15 flex items-center gap-4 transition-all hover:shadow-md duration-200 group">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Proveedores</span>
              <p className="text-xl font-black text-slate-700 tracking-tight mt-0.5">{totalProveedores}</p>
            </div>
          </div>

          {/* KPI 2: Proveedores con Contrato Fijo */}
          <div className="bg-gradient-to-r from-cyan-400/60 to-blue-500 hover:from-blue-500 hover:to-cyan-500 backdrop-blur-md p-4 rounded-xl border border-slate-200/60 shadow-sm shadow-blue-600/15 flex items-center gap-4 transition-all hover:shadow-md duration-200 group">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Contratos Fijos</span>
              <p className="text-xl font-black text-slate-700 tracking-tight mt-0.5">{proveedoresFijos}</p>
            </div>
          </div>

        </div>
      )}
      {/* Tabla */}
      {loading ? (
        <div className="h-64 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center text-blue-500 gap-2 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Cargando directorio de socios...</span>
        </div>
      ) : (
        <div className="bg-white-800/50 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm p-2">
          <TablaProveedores data={data} />
        </div>
      )}

    </div>
  );
}