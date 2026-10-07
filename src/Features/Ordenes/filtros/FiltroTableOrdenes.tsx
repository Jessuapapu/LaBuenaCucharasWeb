import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';

interface FiltrosProps {
    alBuscar: (query: string) => void;
    alCrearNuevo: () => void;
}

export function FiltrosOrdenes({ alBuscar, alCrearNuevo }: FiltrosProps) {
    const [busquedaLocal, setBusquedaLocal] = useState("");

    const manejarSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Disparamos la búsqueda hacia el componente padre
        alBuscar(busquedaLocal);
    };

    return (
        <div className="bg-[#0F172A] border border-white/5 p-4 md:p-5 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <Filter size={20} />
                </div>
                <span className="text-sm font-bold text-slate-300 uppercase tracking-widest hidden sm:block">
                    Filtros de Búsqueda
                </span>
            </div>

            <div className="flex w-full md:w-auto items-center gap-3">
                <form onSubmit={manejarSubmit} className="relative flex-1 md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre de cliente..."
                        value={busquedaLocal}
                        onChange={(e) => setBusquedaLocal(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
                    />
                </form>
                
                <button 
                    onClick={alCrearNuevo} 
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">Nueva Orden</span>
                </button>
            </div>
        </div>
    );
}