import { useEffect, useState } from "react";
import TablaMenus from "../components/table/TableMenu";

export default function MenusPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8001/menu/");
      if (!response.ok) throw new Error("Error cargando menús");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <h1 className="text-3xl font-bold text-white tracking-tight">Calendario de Menús</h1>
        <p className="text-gray-400 mt-1 text-sm">Gestiona qué platillos se servirán cada día.</p>
      </div>

      {loading ? (
        <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-blue-400">
            Cargando calendario...
        </div>
      ) : (
        <TablaMenus data={data} />
      )}
    </div>
  );
}