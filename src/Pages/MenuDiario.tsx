//import { useEffect, useState } from "react";
import TablaMenus from "../Menu/tables/TableMenu";
//import CalendarioPlatillo from "../components/Calendar/Calendarioplatillo";
import Calendario from "../components/Calendar/CalendarioMenu";
import { useMenu_diario } from "../components/Hooks/hookMenu_diario";

export default function MenusPage() {
  const {
    datos,
    cargando,
    modalDta,
    setmodalDta,
    guardarOEditarMenu,
    listaPlatillos
  } = useMenu_diario();
  //const [data, setData] = useState<any[]>([]);
  //const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <h1 className="text-3xl font-bold text-white tracking-tight">Calendario de Menús</h1>
        <p className="text-gray-400 mt-1 text-sm">Gestiona qué platillos se servirán cada día.</p>
      </div>

      <div>
        <Calendario></Calendario>
      </div>

      {cargando ? (
        <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-blue-400">
            Cargando calendario...
        </div>
      ) : (
        <TablaMenus data={datos}
          modalDta={modalDta}
          setmodalDta={setmodalDta}
          guardarOEditarMenu={guardarOEditarMenu}
          listaPlatillos={listaPlatillos}/>
      )}

      
    </div>
  );
}