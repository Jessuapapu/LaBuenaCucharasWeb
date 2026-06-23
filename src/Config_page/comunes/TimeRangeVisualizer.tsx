interface TimeRangeVisualizerProps {
  inicio: string;
  fin: string;
}

export function TimeRangeVisualizer({ inicio, fin }: TimeRangeVisualizerProps) {
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

  return (
    <div className="mt-4 mb-2 select-none">
      <div className="flex justify-between text-xs text-slate-400 font-bold mb-2">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:59</span>
      </div>
      <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        {!isOvernight ? (
          <div 
            className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300"
            style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
          />
        ) : (
          <>
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300" style={{ width: `${endPercent}%` }} />
            <div className="absolute top-0 bottom-0 right-0 bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300" style={{ width: `${100 - startPercent}%` }} />
          </>
        )}
      </div>
    </div>
  );
}