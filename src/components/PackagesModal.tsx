import React, { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Language } from '../types';
import { ui } from '../ui/tokens';

// Paquetes para empresas + extras a elección. La empresa elige y deja sus datos para
// agendar una llamada: los precios finales se cierran en la conversación.

export const PACKAGES = [
  {
    id: 'landing-3d',
    price: 500,
    name: { es: 'Landing 3D', en: '3D landing' },
    items: { es: ['Una página con portada 3D', 'Formulario de contacto', 'Publicada en tu dominio'], en: ['One page with a 3D hero', 'Contact form', 'Published on your domain'] },
  },
  {
    id: 'web-profesional',
    price: 1000,
    name: { es: 'Web profesional', en: 'Professional website' },
    items: { es: ['Web de varias páginas', 'Chatbot que responde preguntas', 'Todo lo de Landing 3D'], en: ['Multi-page website', 'Chatbot that answers questions', 'Everything in 3D landing'] },
  },
  {
    id: 'web-ventas',
    price: 2000,
    name: { es: 'Web + ventas', en: 'Website + sales' },
    items: { es: ['Agente de IA: citas y seguimiento', 'Captar clientes (prospectos y mensajes)', 'Todo lo de Web profesional'], en: ['AI agent: bookings and follow-up', 'Lead generation (prospects and messages)', 'Everything in Professional'] },
  },
  {
    id: 'sistema-completo',
    price: 3000,
    name: { es: 'Sistema completo', en: 'Complete system' },
    items: { es: ['Backoffice: pedidos, clientes e inventario', 'Todo lo de Web + ventas'], en: ['Back office: orders, customers, inventory', 'Everything in Website + sales'] },
  },
] as const;

export const UPGRADES = [
  { id: 'plantilla-premium', name: { es: 'Plantilla premium para la portada', en: 'Premium hero template' } },
  { id: 'chatbot', name: { es: 'Chatbot', en: 'Chatbot' } },
  { id: 'agente-ia', name: { es: 'Agente de IA', en: 'AI agent' } },
  { id: 'backoffice', name: { es: 'Backoffice (sistema de gestión)', en: 'Back office' } },
  { id: 'mantenimiento', name: { es: 'Mantenimiento mensual', en: 'Monthly maintenance' } },
  { id: 'dominio-hosting', name: { es: 'Dominio y hosting', en: 'Domain and hosting' } },
  { id: 'idioma-extra', name: { es: 'Versión en otro idioma', en: 'Extra language version' } },
] as const;

interface PackagesModalProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  siteId?: string;
  isOpen: boolean;
  onClose: () => void;
  /** Para creadores: abre el registro con Google. */
  onCreatorSignIn?: () => void;
}

export function PackagesModal({ lang, themeMode = 'light', siteId, isOpen, onClose, onCreatorSignIn }: PackagesModalProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const L = isEn ? 'en' : 'es';

  const [pkg, setPkg] = useState<string>('landing-3d');
  const [upgrades, setUpgrades] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', contact: '', business: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const toggle = (id: string) => setUpgrades((u) => (u.includes(id) ? u.filter((x) => x !== id) : [...u, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/studio/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, packageId: pkg, upgrades, siteId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('No pude enviar tus datos.', 'Could not send your details.'));
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-label={t('Paquetes y llamada', 'Packages and call')}>
      <div className={`${s.card} w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative`}>
        <button type="button" onClick={onClose} aria-label={t('Cerrar', 'Close')} className={`${s.iconButton} absolute top-4 right-4`}>
          <X className="w-4 h-4" />
        </button>

        {sent ? (
          <div className="py-10 text-center space-y-3">
            <Check className={`w-8 h-8 mx-auto ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`} />
            <h2 className={s.title}>{t('¡Listo! Recibimos tus datos', 'Done! We got your details')}</h2>
            <p className={s.muted}>{t('Te contactaremos para coordinar la llamada y llevar tu web a producción.', 'We will contact you to schedule the call and take your website live.')}</p>
            <button type="button" onClick={onClose} className={s.primaryButton}>
              {t('Volver a mi web', 'Back to my website')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <h2 className={s.title}>{t('Haz realidad tu web', 'Make your website real')}</h2>
              <p className={`mt-1 ${s.muted}`}>
                {t('Elige un paquete y los extras que te interesan. Agendamos una llamada para cerrar los detalles.', 'Pick a package and the extras you want. We schedule a call to finalize details.')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PACKAGES.map((p) => {
                const active = pkg === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPkg(p.id)}
                    aria-pressed={active}
                    className={`text-left rounded-2xl border p-4 transition-colors cursor-pointer ${
                      active
                        ? isDark
                          ? 'border-white bg-white/[0.06]'
                          : 'border-[#1D1D1F] bg-[#F5F5F7]'
                        : isDark
                        ? 'border-white/10 hover:bg-white/[0.03]'
                        : 'border-black/[0.08] hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={s.heading}>{p.name[L]}</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                        {t('desde', 'from')} {p.price.toLocaleString('en-US')} USD
                      </span>
                    </div>
                    <ul className={`mt-2 space-y-1 text-xs ${s.muted}`}>
                      {p.items[L].map((it) => (
                        <li key={it} className="flex gap-1.5">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-px" /> {it}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <h3 className={s.heading}>{t('Extras a elección', 'Optional extras')}</h3>
              <div className="flex flex-wrap gap-2">
                {UPGRADES.map((u) => (
                  <button key={u.id} type="button" onClick={() => toggle(u.id)} aria-pressed={upgrades.includes(u.id)} className={s.chip(upgrades.includes(u.id))}>
                    {upgrades.includes(u.id) && <Check className="w-3 h-3" />} {u.name[L]}
                  </button>
                ))}
              </div>
              <p className={`text-xs ${s.faint}`}>{t('El precio de los extras se define en la llamada.', 'Extras are priced on the call.')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pk-name" className={s.label}>{t('Tu nombre', 'Your name')}</label>
                <input id="pk-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={s.input} />
              </div>
              <div>
                <label htmlFor="pk-contact" className={s.label}>{t('WhatsApp o correo', 'WhatsApp or email')}</label>
                <input id="pk-contact" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={s.input} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pk-business" className={s.label}>{t('Nombre del negocio', 'Business name')}</label>
                <input id="pk-business" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className={s.input} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pk-message" className={s.label}>{t('¿Algo más que debamos saber? (opcional)', 'Anything else? (optional)')}</label>
                <textarea id="pk-message" rows={2} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${s.input} resize-none`} />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {onCreatorSignIn ? (
                <button type="button" onClick={onCreatorSignIn} className={s.ghostButton}>
                  {t('¿Eres creador con código de referido? Regístrate', 'Creator with a referral code? Sign up')}
                </button>
              ) : (
                <span />
              )}
              <button type="submit" disabled={busy} className={s.primaryButton}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t('Agendar llamada', 'Book a call')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
