import { useState } from 'react';
import { X, Sparkles, DollarSign, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { Language } from '../types';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenBooking: () => void;
}

export function CalculatorModal({ isOpen, onClose, lang, onOpenBooking }: CalculatorModalProps) {
  // Mode: 'roi' or 'keypad'
  const [mode, setMode] = useState<'roi' | 'keypad'>('roi');

  // ROI Calculator states
  const [leadsPerMonth, setLeadsPerMonth] = useState(150);
  const [dealValue, setDealValue] = useState(1200);
  const [hourlyWage, setHourlyWage] = useState(30);

  // Keypad calculator states
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  if (!isOpen) return null;

  // Business calculations
  // Without automation: 78% lost if >5 min, avg human responds in 4 hours
  // With 4haus: <60s response captures ~35% more deals
  const capturedDeals = Math.round(leadsPerMonth * 0.08); // additional closed deals
  const recoveredRevenue = capturedDeals * dealValue;
  const hoursSavedWeekly = Math.round(leadsPerMonth * 0.35); // hours saved from manual CRM entry & follow-up
  const laborCostSavings = Math.round(hoursSavedWeekly * 4 * hourlyWage);

  // Calculator keypad functions
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const current = prevValue || 0;
      let result = 0;
      if (operation === '+') result = current + inputValue;
      else if (operation === '-') result = current - inputValue;
      else if (operation === '×') result = current * inputValue;
      else if (operation === '÷') result = inputValue !== 0 ? current / inputValue : 0;

      setPrevValue(result);
      setDisplay(String(Number(result.toFixed(6))));
    }

    setWaitingForOperand(true);
    setOperation(nextOp === '=' ? null : nextOp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121215] border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <IOSAppIcon type="calculator" size="sm" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {lang === 'en' ? 'Automation ROI Calculator' : 'Calculadora de Retorno (ROI)'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {lang === 'en' ? 'Measure hours and revenue recovered' : 'Mide horas y capital recuperados'}
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

        {/* Mode Toggle Tabs */}
        <div className="flex items-center justify-center bg-black/50 p-1 rounded-xl border border-white/10 mb-6">
          <button
            onClick={() => setMode('roi')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'roi' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'Automation ROI' : 'Calculadora ROI'}
          </button>
          <button
            onClick={() => setMode('keypad')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'keypad' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'iOS Keypad' : 'Teclado iOS'}
          </button>
        </div>

        {mode === 'roi' ? (
          <div className="space-y-5">
            
            {/* Sliders Form */}
            <div className="space-y-4 bg-zinc-950/80 p-4 rounded-2xl border border-white/10">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">
                    {lang === 'en' ? 'Monthly Inbound Leads' : 'Leads Entrantes por Mes'}
                  </span>
                  <span className="font-mono text-white font-bold">{leadsPerMonth}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={leadsPerMonth}
                  onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">
                    {lang === 'en' ? 'Average Deal Value (USD)' : 'Ticket Promedio de Venta (USD)'}
                  </span>
                  <span className="font-mono text-white font-bold">${dealValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">
                    {lang === 'en' ? 'Human Team Hourly Cost' : 'Costo por Hora de Equipo'}
                  </span>
                  <span className="font-mono text-white font-bold">${hourlyWage}/hr</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-left">
                <div className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'en' ? 'Recovered Revenue' : 'Ingreso Recuperado'}</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                  +${recoveredRevenue.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {lang === 'en' ? 'From <60s instant lead response' : 'Por respuesta en <60s a leads'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-left">
                <div className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>{lang === 'en' ? 'Time Saved Weekly' : 'Tiempo Semanal Libre'}</span>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {hoursSavedWeekly} hrs
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  ${laborCostSavings.toLocaleString()}/mo labor efficiency
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenBooking();
              }}
              className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>{lang === 'en' ? 'Book Diagnostic to Capture These Gains' : 'Agendar Diagnóstico para Capturar estas Ganancias'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>
        ) : (
          /* Real iOS Style Keypad */
          <div className="bg-black p-4 rounded-2xl border border-white/10 max-w-xs mx-auto">
            {/* Display screen */}
            <div className="h-16 flex items-end justify-end px-3 pb-2 text-3xl font-light text-white font-mono truncate">
              {display}
            </div>

            {/* iOS Circle Buttons Keypad */}
            <div className="grid grid-cols-4 gap-2.5 pt-2">
              <button onClick={clearDisplay} className="w-12 h-12 rounded-full bg-[#A5A5A5] text-black font-bold text-sm hover:opacity-90">C</button>
              <button onClick={() => setDisplay(String(-parseFloat(display)))} className="w-12 h-12 rounded-full bg-[#A5A5A5] text-black font-bold text-sm hover:opacity-90">±</button>
              <button onClick={() => setDisplay(String(parseFloat(display) / 100))} className="w-12 h-12 rounded-full bg-[#A5A5A5] text-black font-bold text-sm hover:opacity-90">%</button>
              <button onClick={() => performOperation('÷')} className="w-12 h-12 rounded-full bg-[#FF9F0A] text-white font-bold text-lg hover:opacity-90">÷</button>

              <button onClick={() => inputDigit('7')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">7</button>
              <button onClick={() => inputDigit('8')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">8</button>
              <button onClick={() => inputDigit('9')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">9</button>
              <button onClick={() => performOperation('×')} className="w-12 h-12 rounded-full bg-[#FF9F0A] text-white font-bold text-lg hover:opacity-90">×</button>

              <button onClick={() => inputDigit('4')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">4</button>
              <button onClick={() => inputDigit('5')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">5</button>
              <button onClick={() => inputDigit('6')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">6</button>
              <button onClick={() => performOperation('-')} className="w-12 h-12 rounded-full bg-[#FF9F0A] text-white font-bold text-lg hover:opacity-90">-</button>

              <button onClick={() => inputDigit('1')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">1</button>
              <button onClick={() => inputDigit('2')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">2</button>
              <button onClick={() => inputDigit('3')} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">3</button>
              <button onClick={() => performOperation('+')} className="w-12 h-12 rounded-full bg-[#FF9F0A] text-white font-bold text-lg hover:opacity-90">+</button>

              <button onClick={() => inputDigit('0')} className="col-span-2 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm pl-5 text-left hover:opacity-90">0</button>
              <button onClick={inputDot} className="w-12 h-12 rounded-full bg-[#333333] text-white font-semibold text-sm hover:opacity-90">.</button>
              <button onClick={() => performOperation('=')} className="w-12 h-12 rounded-full bg-[#FF9F0A] text-white font-bold text-lg hover:opacity-90">=</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
