
import { Menu } from "lucide-react";

interface NavbarMobileProps {
  setSidebarOpen: (value: boolean) => void;
}

export default function NavbarMobile({ setSidebarOpen }: NavbarMobileProps) {
  return (
    <nav className="lg:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3 shadow-md">
      <h1 className="text-lg font-semibold">La Buena Cuchara</h1>
      <button onClick={() => setSidebarOpen(true)} className="p-2">
        <Menu className="w-6 h-6" />
      </button>
    </nav>
  );
}
