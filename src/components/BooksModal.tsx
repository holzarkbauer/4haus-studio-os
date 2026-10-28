import { X, ExternalLink, Bookmark, Sparkles, BookOpen } from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { Language } from '../types';

interface BooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function BooksModal({ isOpen, onClose, lang }: BooksModalProps) {
  if (!isOpen) return null;

  const books = [
    {
      title: "The Goal: A Process of Ongoing Improvement",
      author: "Eliyahu M. Goldratt",
      takeaway: lang === 'en'
        ? "Identify the primary bottleneck in your business pipeline. Any optimization outside the bottleneck is an illusion."
        : "Identifica la restricción principal en tu pipeline. Cualquier optimización fuera del cuello de botella es una ilusión.",
      category: "Operations & Constraints",
    },
    {
      title: "High Output Management",
      author: "Andy Grove",
      takeaway: lang === 'en'
        ? "Managerial leverage: activities that generate high output with minimal human friction through automation."
        : "Apalancamiento de gestión: actividades que generan alto rendimiento con mínima fricción mediante sistemas.",
      category: "Systems Leadership",
    },
    {
      title: "Thinking in Systems: A Primer",
      author: "Donella H. Meadows",
      takeaway: lang === 'en'
        ? "How feedback loops, delays, and stocks govern all real-world commercial operations."
        : "Cómo los bucles de retroalimentación y las demoras gobiernan todas las operaciones comerciales reales.",
      category: "System Dynamics",
    },
    {
      title: "The Almanack of Naval Ravikant",
      author: "Eric Jorgenson",
      takeaway: lang === 'en'
        ? "Code and media are permissionless leverage. Building systems that work while you sleep."
        : "El código y los medios son apalancamiento sin permiso. Construye sistemas que trabajen mientras duermes.",
      category: "Modern Leverage",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121215] border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-left max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <IOSAppIcon type="books" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'en' ? 'Books & Architecture Library' : 'Biblioteca de Libros & Sistemas'}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {lang === 'en' ? 'Foundational blueprints for high-agency founders' : 'Lecturas fundamentales para fundadores de alta agencia'}
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

        {/* Book list */}
        <div className="overflow-y-auto space-y-3.5 pr-1 py-1 flex-1">
          {books.map((b, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                <span>{b.category}</span>
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white tracking-tight">{b.title}</div>
              <div className="text-xs text-zinc-400 font-medium mb-2">{b.author}</div>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                {b.takeaway}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0 text-xs">
          <span className="text-zinc-400 font-mono text-[11px]">
            {lang === 'en' ? 'Included in 4haus Client Playbooks' : 'Incluido en los Playbooks para Clientes'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors text-xs"
          >
            {lang === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>

      </div>
    </div>
  );
}
