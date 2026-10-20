import TablaMenus from "../Features/Menu/tables/TableMenu";
import CalendarioMenuDia from "../components/Calendar/CalendardayMenu";
import Calendario from "../components/Calendar/CalendarioMenu";
import { useMenu_diario } from "../context/Hooks/hookMenu_diario";
import { CalendarDays, ClipboardList, CalendarRange } from "lucide-react";

export default function MenusPage() {
  const { datos, cargando, modalDta, setmodalDta, guardarOEditarMenu, listaPlatillos } = useMenu_diario();

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-6">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-3.5 text-white shadow-lg shadow-cyan-900/15">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Planificación del restaurante</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Menú diario</h1>
          <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">Organiza los platillos y horarios de servicio de cada día.</p>
        </div>
      </header>

      <section className="space-y-4 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-5">
        <div className="flex items-center gap-3 px-1">
          <div className="rounded-xl bg-cyan-100 p-2 text-cyan-800"><CalendarRange className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Programación mensual</h2>
            <p className="text-sm text-slate-600">Selecciona un día para agregar o editar sus platillos.</p>
          </div>
        </div>
        <Calendario />
      </section>

      <section className="space-y-4 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-5">
        <div className="flex items-center gap-3 px-1">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-800"><ClipboardList className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Agenda del día</h2>
            <p className="text-sm text-slate-600">Consulta los horarios y detalles de cada platillo.</p>
          </div>
        </div>
        <CalendarioMenuDia />
      </section>

      <section className="space-y-4 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-5">
        <div className="px-1">
          <h2 className="text-lg font-extrabold text-slate-800">Menús programados</h2>
          <p className="text-sm text-slate-600">Filtra el historial y actualiza las asignaciones.</p>
        </div>
        {cargando ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-sky-200 bg-[#dce8ed] text-sm font-semibold text-cyan-800">
            Cargando menús...
          </div>
        ) : (
          <TablaMenus data={datos} modalDta={modalDta} setmodalDta={setmodalDta} guardarOEditarMenu={guardarOEditarMenu} listaPlatillos={listaPlatillos} />
        )}
      </section>
    </div>
  );
}
