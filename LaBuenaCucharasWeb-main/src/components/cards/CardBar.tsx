import { ResponsiveBar } from "@nivo/bar";
//import { bodegaService } from "../../services/proveedor";
//import { useinsumoseIngredientes } from "../Hooks/hookBodega";

interface CardbarProps {
  nombre: string;
  tipo: "Insumo" | "Ingredientes";
  stockactual: boolean | number;
  stockmin?: number;
}

//const {}= 
export const Cardstockmin =({ nombre, tipo, stockactual, stockmin=50 }: CardbarProps)=>{

    // Adaptador de datos
  const isInsumo= tipo === "Insumo"
  //mapeamos
  const cantidadGrafica = (() => {
    if (isInsumo) {
      const estado = String(stockactual).toUpperCase();
      if (estado === "ALTA") return 100;
      if (estado === "MEDIA") return 50;
      return 15; // BAJA
    }
    return Number(stockactual);
  })();
  const minimoGrafica= isInsumo? 40 : Number(stockmin)

  const esCritico = isInsumo ? String(stockactual).toUpperCase() === "Alta" : Number(stockactual) <= Number(stockmin);
  const textoDescriptivoStock = isInsumo ? `Disponibilidad: ${stockactual}`: `Stock Actual: ${stockactual}`;

  const data = [{ id: nombre, value: cantidadGrafica }];

    return(
        <div className="flex flex-col w-[300px] h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 group">
      
      {/* HEADER DE LA CARD */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isInsumo ? 'bg-purple-950 text-purple-400 border border-purple-800/30' : 'bg-blue-950 text-blue-400 border border-blue-800/30'
            }`}>
              {tipo}
            </span>
            <h3 className="text-white text-lg font-bold mt-2 truncate w-[200px]" title={nombre}>
              {nombre}
            </h3>
          </div>
          <div className={`w-3 h-3 rounded-full mt-1.5 ${esCritico ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-emerald-500 shadow-lg shadow-emerald-500/40'}`} />
        </div>
      </div>

      {/* ÁREA DEL GRÁFICO (NIVO BAR) */}
      <div className="flex-1 px-4 relative min-h-[220px]">
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="id"
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          padding={0.55}
          valueScale={{ 
            type: "linear", 
            min: 0, 
            max: isInsumo ? 110 : Math.max(cantidadGrafica, minimoGrafica) * 1.2 
          }}
          colors={esCritico ? "#ef4444" : "#10b981"}
          borderRadius={8}
          theme={{
            // Evita fallos de contraste ocultando labels nativos de ejes
            axis: { ticks: { text: { fill: "transparent" } } },
            grid: { line: { stroke: "transparent" } }
          }}
          enableGridY={false}
          axisLeft={null}
          axisBottom={null}
          enableLabel={!isInsumo} // Solo muestra el número si es contable numérico
          labelTextColor="#ffffff"
          markers={[
            {
              axis: "y",
              value: minimoGrafica,
              lineStyle: { stroke: "#6366f1", strokeWidth: 2, strokeDasharray: "4 4" },
              legend: isInsumo ? "" : `Mín: ${minimoGrafica}`,
              textStyle: { fill: "#818cf8", fontSize: 10, fontWeight: "bold" },
              legendPosition: "top-left"
            },
          ]}
        />

        {/* OVERLAY PARA INSUMOS (MUESTRA TEXTO EN LUGAR DE BARRAS NUMÉRICAS) */}
        {isInsumo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className={`text-xl font-black uppercase tracking-widest ${
              esCritico ? 'text-red-500/30' : String(stockactual).toUpperCase() === 'MEDIA' ? 'text-amber-500/30' : 'text-emerald-500/30'
            }`}>
              {stockactual}
            </span>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-900 text-center">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          {textoDescriptivoStock}
        </p>
      </div>

    </div>
    );
}