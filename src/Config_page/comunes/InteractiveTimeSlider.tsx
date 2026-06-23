import { useState, useEffect } from "react";

interface InteractiveTimeSliderProps {
  inicio: string;
  fin: string;
  onChange: (inicio: string, fin: string) => void;
}

export function InteractiveTimeSlider({ inicio, fin, onChange }: InteractiveTimeSliderProps) {
  const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const [startMins, setStartMins] = useState(timeToMinutes(inicio));
  const [endMins, setEndMins] = useState(timeToMinutes(fin));

  useEffect(() => {
    setStartMins(timeToMinutes(inicio));
    setEndMins(timeToMinutes(fin));
  }, [inicio, fin]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setStartMins(val);
    onChange(minutesToTime(val), minutesToTime(endMins));
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setEndMins(val);
    onChange(minutesToTime(startMins), minutesToTime(val));
  };

  const startPercent = (startMins / 1440) * 100;
  const endPercent = (endMins / 1440) * 100;
  const isOvernight = startMins > endMins;

  const thumbClasses = "appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md";

  return (
    <div className="relative mt-8 mb-6 select-none w-full">
      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-3 px-1">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
      
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full">
        {!isOvernight ? (
          <div 
            className="absolute top-0 bottom-0 bg-sky-500 rounded-full transition-all duration-75"
            style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
          />
        ) : (
          <>
            <div className="absolute top-0 bottom-0 left-0 bg-sky-500 rounded-r-full transition-all duration-75" style={{ width: `${endPercent}%` }} />
            <div className="absolute top-0 bottom-0 right-0 bg-sky-500 rounded-l-full transition-all duration-75" style={{ width: `${100 - startPercent}%` }} />
          </>
        )}
      </div>

      <input 
        type="range" min="0" max="1440" step="15"
        value={startMins} onChange={handleStartChange}
        className={`absolute top-5 left-0 w-full z-20 ${thumbClasses}`}
      />

      <input 
        type="range" min="0" max="1440" step="15"
        value={endMins} onChange={handleEndChange}
        className={`absolute top-5 left-0 w-full z-30 ${thumbClasses}`}
      />
    </div>
  );
}