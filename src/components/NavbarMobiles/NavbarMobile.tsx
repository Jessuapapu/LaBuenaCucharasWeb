import { Menu } from "lucide-react";

interface NavbarMobileProps {
  setSidebarOpen: (value: boolean) => void;
}

export default function NavbarMobile({ setSidebarOpen }: NavbarMobileProps) {
  return (
    <nav className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[#0A0F1D]/80 backdrop-blur-md text-white px-4 py-4 border-b border-white/5 shadow-sm">
      
      <div className="flex items-center gap-3">
        {/* Un pequeño acento visual */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="font-black text-sm text-white">BC</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight uppercase leading-none">La Buena Cuchara</h1>
          <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-0.5">Admin</span>
        </div>
      </div>

      <button 
        onClick={() => setSidebarOpen(true)} 
        className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-white/5 transition-colors active:scale-95"
      >
        <Menu className="w-5 h-5" />
      </button>

    </nav>
  );
}