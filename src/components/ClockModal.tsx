import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Zap, Globe } from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { Language } from '../types';

interface ClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function ClockModal({ isOpen, onClose, lang }: ClockModalProps) {
  const [time, setTime] = useState(new Date());
  
  // Stopwatch state for lead response benchmark
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stopwatchRunning]);

  if (!isOpen) return null;

  const worldCities = [
    { name: 'San Francisco', tz: 'America/Los_Angeles' },
    { name: 'Mexico City', tz: 'America/Mexico_City' },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'Madrid', tz: 'Europe/Madrid' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111114] border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <IOSAppIcon type="clock" size="sm" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {lang === 'en' ? 'World Clock & Lead Speed Meter' : 'Reloj Mundial & Cronómetro de Leads'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {lang === 'en' ? '24/7 Autonomous execution' : 'Operación autónoma 24/7'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World Times List */}
        <div className="space-y-2.5 mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Global Timezones' : 'Husos Horarios Globales'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {worldCities.map((city, idx) => {
              const formattedTime = time.toLocaleTimeString('en-US', {
                timeZone: city.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              });
              return (
                <div key={idx} className="p-3 rounded-xl bg-black/60 border border-white/10">
                  <div className="text-xs text-zinc-400 font-medium">{city.name}</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">{formattedTime}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Lead Speed Stopwatch */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/10 text-center mb-4">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-1 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'Lead Response Speed Benchmark' : 'Prueba de Velocidad de Respuesta'}</span>
          </div>
          <div className="text-4xl font-extrabold font-mono text-white my-3">
            00:{secondsElapsed < 10 ? `0${secondsElapsed}` : secondsElapsed}
          </div>
          
          <div className="text-xs text-zinc-300 mb-4 max-w-xs mx-auto">
            {secondsElapsed < 60 ? (
              <span className="text-emerald-400 font-medium">
                {lang === 'en' ? '✓ In 4haus target zone: under 60 seconds!' : '✓ En zona objetivo de 4haus: menos de 60 segundos!'}
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                {lang === 'en' ? '⚠ Warning: In standard human delay zone (>1 min)' : '⚠ Alerta: En zona de demora humana (>1 min)'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setStopwatchRunning(!stopwatchRunning)}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                stopwatchRunning ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {stopwatchRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{stopwatchRunning ? (lang === 'en' ? 'Pause' : 'Pausar') : (lang === 'en' ? 'Start Test' : 'Iniciar Test')}</span>
            </button>
            <button
              onClick={() => {
                setStopwatchRunning(false);
                setSecondsElapsed(0);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-zinc-300 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Reset' : 'Reiniciar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
