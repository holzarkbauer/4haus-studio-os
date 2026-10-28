import { useState } from 'react';
import { X, Star, Download, Sparkles, Check, ExternalLink } from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { Language } from '../types';

interface HaustoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenBooking: () => void;
  onOpenLivePreview: (url: string, title: string) => void;
}

export function HaustoreModal({
  isOpen,
  onClose,
  lang,
  onOpenBooking,
  onOpenLivePreview,
}: HaustoreModalProps) {
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGet = (id: string, url?: string, title?: string) => {
    if (!downloadedIds.includes(id)) {
      setDownloadedIds((prev) => [...prev, id]);
    }
    if (url && title) {
      onOpenLivePreview(url, title);
    } else {
      onOpenBooking();
    }
  };

  const systems = [
    {
      id: 'amooo',
      name: 'AMOOO Digital Storefront',
      category: lang === 'en' ? 'E-Commerce & High-Conversion' : 'Comercio Electrónico y Conversión',
      rating: '5.0',
      reviews: '24',
      description: lang === 'en'
        ? 'High-conversion interactive storefront built for boutique brands with instant edge loading.'
        : 'Tienda interactiva de alta conversión diseñada para marcas boutique con carga instantánea.',
      url: 'https://amooo-tienda.ai.studio',
      tag: 'GET LIVE',
    },
    {
      id: 'whatsapp-lead',
      name: 'WhatsApp AI Qualifier 24/7',
      category: lang === 'en' ? 'Autonomous Lead Engine' : 'Motor Autónomo de Leads',
      rating: '4.9',
      reviews: '52',
      description: lang === 'en'
        ? 'Pre-qualifies budget, timing, and interest in under 60 seconds and books directly on your calendar.'
        : 'Pre-califica presupuesto, plazos e interés en menos de 60s y agenda directo en tu calendario.',
      tag: 'INSTALL',
    },
    {
      id: 'n8n-ops',
      name: 'n8n Operations Bridge',
      category: lang === 'en' ? 'Workflow & Data Automation' : 'Automatización de Flujos y Datos',
      rating: '5.0',
      reviews: '18',
      description: lang === 'en'
        ? 'Zero manual CRM data entry. Synchronizes invoices, WhatsApp conversations, and notifications.'
        : 'Cero registro manual en CRM. Sincroniza facturas, chats de WhatsApp y notificaciones.',
      tag: 'DEPLOY',
    },
    {
      id: 'daniel-brain',
      name: 'Daniel Executive AI Brain',
      category: lang === 'en' ? 'Knowledge Core' : 'Cerebro de Conocimiento',
      rating: '4.8',
      reviews: '31',
      description: lang === 'en'
        ? 'Full context AI copilot indexing your business playbooks, client history, and KPIs.'
        : 'Copiloto de IA con contexto total que indexa manuales, clientes e indicadores clave.',
      tag: 'REQUEST',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#121215] border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-left max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <IOSAppIcon type="haustore" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">4haustore</h3>
                <span className="text-[10px] font-mono font-bold bg-blue-600/30 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full">
                  App Store
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {lang === 'en' ? 'Deployable AI systems & architecture' : 'Sistemas de IA y arquitecturas listas para implementar'}
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

        {/* Scrollable List of Systems */}
        <div className="overflow-y-auto space-y-4 pr-1 py-2 flex-1">
          {systems.map((item) => {
            const isDone = downloadedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white tracking-tight truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                    {item.category}
                  </div>
                  <p className="text-xs text-zinc-300 font-light mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-mono text-zinc-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-white font-semibold">{item.rating}</span>
                    <span>({item.reviews})</span>
                  </div>
                </div>

                {/* iOS App Store style "GET" / "OBTENER" Pill Button */}
                <button
                  onClick={() => handleGet(item.id, item.url, item.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                    isDone
                      ? 'bg-zinc-800 text-white border border-white/20'
                      : 'bg-white text-black hover:bg-zinc-200 shadow-md active:scale-95'
                  }`}
                >
                  {isDone ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{lang === 'en' ? 'OPEN' : 'ABRIR'}</span>
                    </span>
                  ) : (
                    <span>{item.tag}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0 text-xs">
          <span className="text-zinc-400 font-mono text-[11px]">
            {lang === 'en' ? 'Need custom proprietary architecture?' : '¿Necesitas arquitectura propietaria a medida?'}
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="text-white font-semibold hover:underline flex items-center gap-1"
          >
            <span>{lang === 'en' ? 'Schedule Architecture Call' : 'Agendar Llamada de Arquitectura'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
