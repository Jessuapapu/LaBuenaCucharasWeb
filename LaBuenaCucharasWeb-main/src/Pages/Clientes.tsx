import { Link, Outlet, useLocation } from "react-router-dom";
import TablaClientes from "../Features/Clientes/Tables/TableCliente";
import { Users, FileText, ArrowRight, UserRoundCheck } from "lucide-react";
import { useSoloClientes } from "../context/Hooks/hookClientes";

export default function ClientesPage() {
  const { clientes: data, loading, error } = useSoloClientes();
  const location = useLocation();
  const isRoot = location.pathname === "/Clientes" || location.pathname === "/Clientes/";

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-100/90 p-4 text-sm text-rose-800">⚠️ {error}</div>}

      <header className="flex items-center gap-4 rounded-3xl border border-sky-200/80 bg-gradient-to-r from-[#d2eaf0] via-[#e2eee4] to-[#f2e4d2] p-5 shadow-lg shadow-slate-900/5 sm:p-6">
        <div className="rounded-2xl bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 p-3.5 text-white shadow-lg shadow-cyan-900/15">
          <UserRoundCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-900">Relaciones y acuerdos</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Directorio de clientes</h1>
          <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">Administra la información de contacto y sus contratos.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="flex items-center justify-between rounded-3xl border border-amber-300/80 bg-gradient-to-br from-[#f3e8d0] to-[#f1ddd4] p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-950/80">Total de clientes</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-amber-950">
              {loading ? <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-amber-300" /> : data.length}
            </h2>
          </div>
          <div className="rounded-2xl border border-amber-300 bg-[#ecd29b] p-3.5 text-amber-950"><Users className="h-7 w-7" /></div>
        </section>

        <Link
          to="/Clientes/Contratos"
          className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-emerald-700 bg-gradient-to-br from-emerald-800 via-teal-800 to-sky-900 p-5 text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/25 focus:outline-none focus:ring-4 focus:ring-emerald-700/25 sm:p-6"
        >
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-amber-200/20 blur-2xl transition-transform group-hover:scale-125" />
          <div className="relative z-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">Acceso directo</p>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Contratos <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="mt-1 max-w-sm text-sm text-emerald-50/90">Consulta acuerdos, vigencias y presupuestos.</p>
          </div>
          <div className="relative z-10 ml-3 rounded-2xl border border-amber-100/30 bg-amber-200/15 p-3 text-amber-100 shadow-inner transition-transform group-hover:scale-105">
            <FileText className="h-7 w-7" />
          </div>
        </Link>
      </div>

      <Outlet />

      <section className="mt-2 rounded-3xl border border-teal-200/80 bg-gradient-to-br from-[#e1efea] to-[#dceaf0] p-3 shadow-lg shadow-slate-900/5 sm:p-5">
        {loading ? (
          <div className="flex h-56 items-center justify-center gap-3 rounded-2xl border border-teal-300 bg-[#d4e9df] text-teal-900">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
            <span className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-600">Cargando directorio...</span>
          </div>
        ) : isRoot ? <TablaClientes data={data} /> : null}
      </section>
    </div>
  );
}
