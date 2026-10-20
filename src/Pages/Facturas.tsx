import TablaFacturas from "../Features/Facturas/tables/TableFacturas";
import { FileText, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { useFacturasPage } from "../context/Hooks/hookFacturas";

export default function FacturasPage() {
  const { stats, loading, error } = useFacturasPage();
  const formatMoney = (val: number) => new Intl.NumberFormat("es-NI", {
    style: "currency", currency: "NIO", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(val);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-100/80 p-4 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
          <span>No se pudieron sincronizar los indicadores: {error}</span>
        </div>
      )}

      <header className="flex flex-col justify-between gap-5 rounded-3xl border border-sky-200/80 bg-[#e3edf2]/95 p-5 shadow-[0_16px_45px_-34px_rgba(15,70,100,0.4)] backdrop-blur-sm sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#3b5bc6] to-[#5db8c3] p-3.5 text-white shadow-lg shadow-sky-900/15"><FileText className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#147e9d]">Administración financiera</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Facturación</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Emite comprobantes y consulta el estado de las cuentas.</p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div className="px-1"><h2 className="text-lg font-extrabold text-slate-800">Resumen de facturación</h2><p className="text-sm text-slate-500">Ingresos y saldos de las facturas registradas.</p></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {loading && !stats ? (
            [1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />)
          ) : stats && (
            <>
              <article className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100 to-cyan-50 p-5 shadow-sm shadow-sky-900/5">
                <div><p className="text-xs font-extrabold uppercase tracking-widest text-slate-600">Total facturado</p><h3 className="mt-1 text-xl font-black tracking-tight text-sky-950">{formatMoney(stats.total)}</h3></div>
                <span className="rounded-xl border border-sky-200 bg-sky-200/70 p-3 text-[#147e9d]"><DollarSign className="h-5 w-5" /></span>
              </article>
              <article className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-teal-50 p-5 shadow-sm shadow-emerald-900/5">
                <div><p className="text-xs font-extrabold uppercase tracking-widest text-slate-600">Ingresos cobrados</p><h3 className="mt-1 text-xl font-black tracking-tight text-emerald-950">{formatMoney(stats.pagadas)}</h3></div>
                <span className="rounded-xl border border-emerald-200 bg-emerald-200/70 p-3 text-emerald-800"><CreditCard className="h-5 w-5" /></span>
              </article>
              <article className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-100 to-yellow-50 p-5 shadow-sm shadow-amber-900/5">
                <div><p className="text-xs font-extrabold uppercase tracking-widest text-slate-600">Facturas pendientes</p><h3 className="mt-1 text-2xl font-black tracking-tight text-amber-950">{stats.pendiente}</h3></div>
                <span className="rounded-xl border border-amber-200 bg-amber-200/70 p-3 text-amber-800"><AlertCircle className="h-5 w-5" /></span>
              </article>
            </>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[#e2ebf0]/95 p-3 shadow-[0_20px_55px_-40px_rgba(15,55,80,0.5)] backdrop-blur-sm sm:p-5">
        <div className="mb-3 px-1"><h2 className="text-xl font-extrabold text-slate-800">Facturas emitidas</h2><p className="mt-1 text-sm text-slate-500">Busca, revisa y administra los comprobantes.</p></div>
        <TablaFacturas />
      </section>
    </div>
  );
}
