import TablaPlatillos from "../Features/Platillos/tables/TablePlatillos";
import GraficoPlatillosVendidos from "../components/Graficos/GraficoPlatillosVendidos";
import { Utensils, TrendingUp, Layers, Sparkles, RefreshCw } from "lucide-react";
import { FoodCard } from "../components/cards/FoodCard";
import { usePlatillos, useVentasPlatillos } from "../context/Hooks/hookPlatillos";

export default function ComidasPage() {
  const { platillos, destacados, loadingPlatillos, errorPlatillos } = usePlatillos();
  const { ventas, loadingVentas, errorVentas } = useVentasPlatillos();

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {(errorPlatillos || errorVentas) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-100/90 p-4 text-rose-800">
          ⚠️ Hubo problemas al sincronizar algunos datos con el servidor.
        </div>
      )}

      <header className="flex flex-col justify-between gap-5 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-3.5 text-white shadow-lg shadow-cyan-900/15">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Catálogo y rendimiento</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Gestión de Comidas</h1>
            <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">Administra el catálogo y descubre los platillos favoritos.</p>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 rounded-2xl border border-sky-200 bg-[#d7e8ef]/80 px-5 py-4 lg:w-auto">
          <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-800"><Layers className="h-5 w-5" /></div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Total en menú</span>
            <p className="mt-0.5 text-2xl font-black leading-none text-slate-800">
              {loadingPlatillos ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-sky-200" /> : platillos.length}
            </p>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-sky-200/80 bg-[#e5eef2]/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-300/70 pb-4">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-700"><Sparkles className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">Platillos destacados</h2>
            <p className="text-sm text-slate-600">Los favoritos que más se mueven en tu menú.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loadingPlatillos ? (
            [1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl border border-sky-200 bg-slate-200/70" />)
          ) : destacados.length ? (
            destacados.map((item) => <div key={item.id} className="transition-transform duration-200 hover:-translate-y-0.5"><FoodCard platillo={item} ventas /></div>)
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-5 py-8 text-center text-sm text-slate-600">
              Aún no hay platillos destacados.
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 shadow-lg shadow-slate-900/5 backdrop-blur-md">
        <div className="flex flex-col gap-1 border-b border-slate-300/70 bg-[#d7e6ec]/80 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Inventario de platillos</h2>
          <p className="text-sm text-slate-600">Busca, filtra y actualiza los platillos disponibles.</p>
        </div>
        <div className="p-3 sm:p-5">
          {loadingPlatillos ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-cyan-800">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-600">Sincronizando catálogo...</span>
            </div>
          ) : <TablaPlatillos data={platillos} />}
        </div>
      </section>

      <section className="rounded-3xl border border-sky-200/80 bg-[#e3edf2]/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2.5 text-blue-800"><TrendingUp className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Ranking de ventas</h2>
            <p className="text-sm text-slate-600">Distribución de los platillos más vendidos este mes.</p>
          </div>
        </div>
        <div className="relative flex min-h-[360px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-[#dce8ed]/75 p-4 sm:min-h-[400px]">
          {loadingVentas ? (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <RefreshCw className="h-5 w-5 animate-spin text-cyan-700" />
              <span className="text-sm">Cargando gráfica...</span>
            </div>
          ) : <GraficoPlatillosVendidos data={ventas} />}
        </div>
      </section>
    </div>
  );
}
