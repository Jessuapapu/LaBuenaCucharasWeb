import { Link } from "react-router-dom";
import TablaProveedores from "../Features/Proveedor/tables/TablaProvedor";
import { Truck, ArrowLeft, Users, ShieldCheck, RefreshCw } from "lucide-react"; 
import { useProveedores } from "../context/Hooks/hookProveedor";

export default function ProveedoresPage() {
  // Solo llamamos a tu nuevo hook y extraemos lo que necesitamos
  const { data, loading } = useProveedores();

  //Para las KPI's
  const totalProveedores = Array.isArray(data) ? data.length : 0;
  const proveedoresFijos = Array.isArray(data) 
    ? data.filter((p: any) => p.Tipo?.toUpperCase() === 'FIJO' || p.tipo?.toUpperCase() === 'FIJO').length 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-1 text-slate-800">
      
      {/* ENCABEZADO */}
      <div className="bg-gradient-to-r from-[#d8edf2] via-[#dcebf0] to-[#f4e8cf] p-6 rounded-2xl border border-sky-200/80 shadow-sm shadow-sky-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Título, Subtítulo y Navegación de Retorno */}
        <div className="flex items-center gap-4">
          {/* Botón para regresar a Inventario */}
          <Link 
            to="/Inventario" 
            className="p-2.5 bg-[#c5e4ec] hover:bg-[#aed8e4] text-sky-900 rounded-xl transition-all border border-sky-300/70 shadow-sm hover:shadow group"
            title="Volver a Inventario"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>

          {/* Icono del Módulo */}
          <div className="p-3 bg-gradient-to-br from-[#b9e1ec] to-[#c8e7d7] rounded-xl text-teal-900 shadow-sm shrink-0">
            <Truck className="w-6 h-6" />
          </div>

          {/* Textos del Encabezado */}
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Proveedores</h1>
            <p className="text-slate-600 mt-0.5 text-xs font-medium">Gestión de socios comerciales y suministros de cocina.</p>
          </div>
        </div>

      </div>

      {/* Los KPI's */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Proveedores Totales */}
          <div className="bg-gradient-to-br from-[#d7edf2] to-[#c9e5ea] p-4 rounded-xl border border-sky-300/70 shadow-sm flex items-center gap-4 transition-all hover:from-[#cce8ee] hover:to-[#bfe0e7] duration-200 group">
            <div className="p-2.5 bg-[#b8dfe9] text-sky-900 rounded-lg border border-sky-300/80 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-600 uppercase font-black tracking-widest">Total Proveedores</span>
              <p className="text-xl font-black text-slate-800 tracking-tight mt-0.5">{totalProveedores}</p>
            </div>
          </div>

          {/* KPI 2: Proveedores con Contrato Fijo */}
          <div className="bg-gradient-to-br from-[#e5edda] to-[#d3e8d9] p-4 rounded-xl border border-emerald-300/70 shadow-sm flex items-center gap-4 transition-all hover:from-[#dce9ce] hover:to-[#c7e1d0] duration-200 group">
            <div className="p-2.5 bg-[#c4e0cb] text-emerald-900 rounded-lg border border-emerald-300/80 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-600 uppercase font-black tracking-widest">Contratos Fijos</span>
              <p className="text-xl font-black text-slate-800 tracking-tight mt-0.5">{proveedoresFijos}</p>
            </div>
          </div>

        </div>
      )}
      {/* Tabla */}
      {loading ? (
        <div className="h-64 bg-gradient-to-br from-[#d8edf2] to-[#e5edda] rounded-2xl border border-sky-200/80 flex flex-col items-center justify-center text-sky-800 gap-2 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Cargando directorio de socios...</span>
        </div>
      ) : (
        <div className="bg-[#d9eaf0] rounded-2xl border border-sky-200/80 overflow-hidden shadow-sm p-2">
          <TablaProveedores data={data} />
        </div>
      )}

    </div>
  );
}
