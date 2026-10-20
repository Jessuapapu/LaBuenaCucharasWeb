interface TimeRangeVisualizerProps {
  inicio: string;
  fin: string;
  colorIndex?: number; // <-- Nuevo prop para sincronizar colores
}

export function TimeRangeVisualizer({ inicio, fin, colorIndex = 0 }: TimeRangeVisualizerProps) {
  const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const startMins = timeToMinutes(inicio);
  const endMins = timeToMinutes(fin);
  
  const startPercent = (startMins / 1440) * 100;
  const endPercent = (endMins / 1440) * 100;
  const isOvernight = startMins > endMins;

  let durationMins = endMins - startMins;
  if (durationMins < 0) durationMins += 1440;
  const durationHours = Math.floor(durationMins / 60);
  const durationRemainingMins = durationMins % 60;
  const durationText = `${durationHours}h ${durationRemainingMins > 0 ? `${durationRemainingMins}m` : ''}`;

  // Paleta de gradientes sincronizada
  const gradients = [
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-600",
    "from-amber-400 to-orange-600",
    "from-purple-400 to-violet-600",
    "from-rose-400 to-red-600",
    "from-indigo-400 to-indigo-600"
  ];
  
  const activeGradient = gradients[colorIndex % gradients.length];

  return (
    <div className="mt-4 mb-2 select-none w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-slate-700">00:00</span>
        <span className="text-xs font-black px-3 py-1 bg-[#d5e9e7] border border-teal-200 rounded-lg text-teal-950 shadow-sm">
          Duración: {durationText}
        </span>
        <span className="text-sm font-bold text-slate-700">23:59</span>
      </div>
      
      <div className="relative h-4 bg-[#cbdedc] border border-teal-200 rounded-full overflow-hidden shadow-inner w-full">
        {!isOvernight ? (
          <div 
            className={`absolute top-0 bottom-0 bg-gradient-to-r ${activeGradient} rounded-full transition-all duration-300`}
            style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
          />
        ) : (
          <>
            <div className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${activeGradient} transition-all duration-300`} style={{ width: `${endPercent}%` }} />
            <div className={`absolute top-0 bottom-0 right-0 bg-gradient-to-r ${activeGradient} transition-all duration-300`} style={{ width: `${100 - startPercent}%` }} />
          </>
        )}
      </div>
    </div>
  );
}
