import { Link } from "react-router-dom";
import TablaContratos from "../components/table/TableContratos";
import { 
  ArrowLeft, 
  DollarSign, 
  Activity, 
  Briefcase 
} from "lucide-react";
import { useContratos } from "../components/Hooks/hookContratos"; 

export default function ContratosPage() {
  // Consumimos el hook que ya hace todo el trabajo
  const { contratos: data, stats, loading, error } = useContratos();
  
  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Mensaje de Error (Opcional, pero recomendado) */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 1. Encabezado Mejorado */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4">
        
        {/* Botón de Retorno */}
        <Link 
          to="/Clientes" 
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-blue-500 hover:shadow-md shadow-blue-900/20 group"
          title="Volver al Directorio"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </Link>

        {/* Título y Descripción */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Gestión de Contratos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Administración centralizada de acuerdos, vigencias y presupuestos de clientes.
          </p>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen (KPIs) */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card Total */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg flex items-center justify-between group hover:border-blue-900/50 transition-colors">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Contratos</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          {/* Card Activos */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg flex items-center justify-between group hover:border-green-900/50 transition-colors">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Contratos Activos</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.activos}</h3>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg text-green-400 group-hover:bg-green-600 group-hover:text-white transition-all">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Card Presupuesto */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg flex items-center justify-between group hover:border-yellow-900/50 transition-colors">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Volumen Presupuesto</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatMoney(stats.presupuesto)}</h3>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg text-yellow-400 group-hover:bg-yellow-600 group-hover:text-white transition-all">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Tabla de Datos */}
      {loading ? (
        <div className="h-96 bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-blue-400 gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <span className="text-sm font-medium animate-pulse">Sincronizando contratos...</span>
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl">
            <TablaContratos data={data} />
        </div>
      )}
    </div>
  );
}