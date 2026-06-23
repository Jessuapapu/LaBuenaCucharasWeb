//import { useEffect, useState } from "react";
import TablaMenus from "../Menu/tables/TableMenu";
import CalendarioMenuDia from "../components/Calendar/CalendardayMenu";
//import ModalMenuDia from "../Menu/modals/ModalCalendariodia";
//import CalendarioPlatillo from "../components/Calendar/Calendarioplatillo";
import Calendario from "../components/Calendar/CalendarioMenu";
import { useMenu_diario } from "../components/Hooks/hookMenu_diario";
import { CalendarDays } from "lucide-react";
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

      <div className="flex items-center gap-4 bg-white-800 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm shadow-slate-900/5">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl text-white-400 shadow-lg shadow-blue-500/20">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gestión de Comidas</h1>
          <p className="text-slate-500 mt-0.5 text-lg font-medium">Administra el catálogo, categorías y popularidad.</p>
        </div>
      </div>

      <div>
        <Calendario></Calendario>
      </div>

      <div>
        <CalendarioMenuDia />
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
          listaPlatillos={listaPlatillos} />
      )}


    </div>
  );
}