import { useMemo } from "react";
import { Link } from "react-router-dom";
import TablaRegistros from "../components/Table/TableRegistro";
import { ArrowDownCircle, Truck, ArrowRight, DollarSign, RefreshCw, Leaf } from "lucide-react";
import { useBodega } from "../context/Hooks/hookBodega";

export default function RegistrosPage() {
  const { data, loading } = useBodega();
  const totalCosto = useMemo(() => data.reduce((acc, curr) => acc + (Number(curr.CostoTotal) || 0), 0), [data]);
  const formatMoney = (amount: number) => new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-3.5 text-white shadow-lg shadow-cyan-900/15">
            <ArrowDownCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Abastecimiento y control</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Inventario de bodega</h1>
            <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">Historial de entradas y costos de abastecimiento.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="flex items-center justify-between rounded-3xl border border-sky-200/80 bg-[#dce8ed]/90 p-5 shadow-sm md:col-span-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Inversión total en insumos</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">{loading ? "…" : formatMoney(totalCosto)}</h2>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-3 text-emerald-800"><DollarSign className="h-6 w-6" /></div>
        </section>

        <Link to="/Inventario/Proveedores" className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-cyan-700 bg-gradient-to-br from-cyan-800 via-cyan-700 to-blue-800 p-5 text-white shadow-lg shadow-cyan-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-900/25 focus:outline-none focus:ring-4 focus:ring-cyan-700/25">
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-125" />
          <div className="relative z-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">Abastecimiento externo</p>
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">Proveedores <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></h2>
            <p className="mt-1 text-sm text-cyan-50/90">Gestiona contactos y acuerdos.</p>
          </div>
          <div className="relative z-10 ml-3 rounded-2xl border border-white/20 bg-white/15 p-3 text-white shadow-inner transition-transform group-hover:scale-105"><Truck className="h-6 w-6" /></div>
        </Link>

        <Link to="/Inventario/Ingrediente" className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-emerald-700 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/25 focus:outline-none focus:ring-4 focus:ring-emerald-700/25">
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-125" />
          <div className="relative z-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">Materia prima</p>
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">Ingredientes <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></h2>
            <p className="mt-1 text-sm text-emerald-50/90">Administra ingredientes y recetas.</p>
          </div>
          <div className="relative z-10 ml-3 rounded-2xl border border-white/20 bg-white/15 p-3 text-white shadow-inner transition-transform group-hover:scale-105"><Leaf className="h-6 w-6" /></div>
        </Link>
      </div>

      <section className="rounded-3xl border border-sky-200/80 bg-[#e3edf2]/85 p-3 shadow-lg shadow-slate-900/5 sm:p-5">
        {loading ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-sky-200 bg-[#dce8ed] text-slate-600">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-800" />
            <span className="animate-pulse text-xs font-bold uppercase tracking-widest">Cargando registros...</span>
          </div>
        ) : <TablaRegistros data={data} />}
      </section>
    </div>
  );
}
