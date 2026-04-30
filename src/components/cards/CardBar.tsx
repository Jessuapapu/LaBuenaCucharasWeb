import { ResponsiveBar } from "@nivo/bar";

interface CardbarProps {
  nombre: string;
  tipo: "Prioridad" | "Ingredientes";
  stockactual: boolean | number;
  stockmin: number;
}

export const Cardstockmin =({ nombre, tipo, stockactual, stockmin=50 }: CardbarProps)=>{

    // Adaptador de datos
  const isBooleano = typeof stockactual === "boolean";
  const cantidadGrafica = isBooleano ? (stockactual ? 100 : 15) : (stockactual as number);
  const minimoGrafica = isBooleano ? 50 : (stockmin as number);
  
  const esCritico = isBooleano ? !stockactual : (stockactual as number) <= (stockmin as number);

  const data = [{ id: nombre, value: cantidadGrafica }];

    return(
        <div className="
            flex flex-col
            w-[300px] 
            h-[400px] 
            overflow-hidden 
            rounded-2xl 
            border border-[var(--border)] 
            bg-[var(--bg)] 
            transition-all duration-300 ease-in-out 
            hover:-translate-y-2 
            hover:shadow-[var(--shadow)]
            group
            ">
               <div className="p-5">
                    <div className="flex justify-between items-start">
                    <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipo === 'Prioridad' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                        {tipo}
                        </span>
                        <h3 className="text-white text-lg font-bold mt-2 truncate w-[180px]">{nombre}</h3>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${esCritico ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    </div>
                </div>

                <div className="flex-1 px-4 relative">
                    <ResponsiveBar
                    data={data}
                    keys={["value"]}
                    indexBy="id"
                    margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
                    padding={0.6}
                    valueScale={{ type: "linear", min: 0, max: isBooleano ? 110 : Math.max(cantidadGrafica, minimoGrafica) * 1.2 }}
                    colors={esCritico ? "#ef4444" : "#10b981"}
                    borderRadius={8}
                    enableGridY={false}
                    axisLeft={null}
                    axisBottom={null}
                    // Si es booleano, ocultamos el número dentro de la barra para no confundir
                    enableLabel={!isBooleano}
                    labelTextColor="#ffffff"
                    markers={[
                        {
                        axis: "y",
                        value: minimoGrafica,
                        lineStyle: { stroke: "#6366f1", strokeWidth: 2, strokeDasharray: "4 4" },
                        legend: isBooleano ? "" : `Mín: ${minimoGrafica}`,
                        textStyle: { fill: "#818cf8", fontSize: 10 }
                        },
                    ]}
                    />
                    {/* Overlay para Booleanos */}
                    {isBooleano && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className={`text-xl font-black uppercase tracking-widest ${esCritico ? 'text-red-500/50' : 'text-green-500/50'}`}>
                        {stockactual ? "Suficiente" : "Agotado"}
                        </span>
                    </div>
                    )}
                </div>

                <div className="p-4 bg-gray-800/20 text-center">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                    {isBooleano ? "Disponibilidad" : `Stock Actual: ${stockactual}`}
                    </p>
                </div>

        </div>
    );
}