import React, { useEffect, useRef, useState } from 'react';
import { FileArchive, FileText, ImagePlus, Loader2, MapPin, Paperclip, Sparkles, X } from 'lucide-react';
import { ui } from '../../ui/tokens';
import {
  ImageAttachment,
  TextAttachment,
  LONG_PASTE_CHARS,
  MAX_IMAGES,
  compressImage,
  describeSize,
  isTextFile,
  isZip,
  newId,
  readTextFile,
  readZip,
} from '../../utils/attachments';

// Casilla para pedir una web, al estilo de Claude:
// - Los adjuntos aparecen como fichas encima del texto (fotos, zip, textos largos, datos del negocio).
// - Si pegas un texto de más de media página, se convierte solo en un adjunto.
// - Se elige el nivel (créditos) y, si quieres, una plantilla de la biblioteca.

export type SiteLevel = 'basica' | 'completa' | 'avanzada';

export interface StudioTemplateCard {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
}

export interface ComposerPayload {
  brief: string;
  level: SiteLevel;
  templateId?: string;
  attachments: { kind: TextAttachment['kind']; name: string; text: string }[];
  images: { name: string; dataUrl: string }[];
}

interface Props {
  isDark: boolean;
  isEn: boolean;
  guest: boolean;
  busy: boolean;
  disabled?: boolean;
  /** Créditos que le quedan (null = sin límite, p. ej. administrador). */
  creditsLeft: number | null;
  templates: StudioTemplateCard[];
  initialTemplateId?: string | null;
  prefill?: string | null;
  onSubmit: (p: ComposerPayload) => void;
}

const LEVELS: { id: SiteLevel; credits: number; es: [string, string]; en: [string, string] }[] = [
  { id: 'basica', credits: 1, es: ['Básica', 'Landing de una página'], en: ['Basic', 'One-page landing'] },
  { id: 'completa', credits: 2, es: ['Completa', 'Web con todas sus secciones'], en: ['Complete', 'Full website'] },
  { id: 'avanzada', credits: 3, es: ['Avanzada', 'Larga, con efectos y plantillas'], en: ['Advanced', 'Long, with effects and templates'] },
];

export function WebComposer({ isDark, isEn, guest, busy, disabled, creditsLeft, templates, initialTemplateId, prefill, onSubmit }: Props) {
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const [brief, setBrief] = useState('');
  const [texts, setTexts] = useState<TextAttachment[]>([]);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [level, setLevel] = useState<SiteLevel>(guest ? 'basica' : 'completa');
  const [templateId, setTemplateId] = useState<string | null>(initialTemplateId || null);
  const [reading, setReading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);
  const [dataText, setDataText] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefill) setBrief(prefill);
  }, [prefill]);
  useEffect(() => {
    if (initialTemplateId) setTemplateId(initialTemplateId);
  }, [initialTemplateId]);
  useEffect(() => {
    if (guest) setLevel('basica');
  }, [guest]);

  const selectedTemplate = templates.find((x) => x.id === templateId) || null;
  const canSend = !busy && !disabled && !reading && (brief.trim().length >= 15 || texts.length > 0);

  async function addFiles(files: FileList | File[]) {
    setProblem(null);
    setReading(true);
    try {
      let imgCount = images.length;
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          if (imgCount >= MAX_IMAGES) {
            setProblem(t(`Puedes adjuntar hasta ${MAX_IMAGES} imágenes.`, `You can attach up to ${MAX_IMAGES} images.`));
            continue;
          }
          const img = await compressImage(file, file.name);
          imgCount += 1;
          setImages((prev) => [...prev, img].slice(0, MAX_IMAGES));
        } else if (isZip(file)) {
          if (texts.some((x) => x.kind === 'zip')) {
            setProblem(t('Solo se puede adjuntar 1 zip. Quita el anterior para cambiarlo.', 'Only 1 zip can be attached. Remove the previous one first.'));
            continue;
          }
          const z = await readZip(file);
          setTexts((prev) => [...prev, z]);
        } else if (isTextFile(file)) {
          const tx = await readTextFile(file);
          setTexts((prev) => [...prev, tx]);
        } else {
          setProblem(t(`No puedo leer "${file.name}". Usa imágenes, un .zip o archivos de texto.`, `I can't read "${file.name}". Use images, a .zip or text files.`));
        }
      }
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.files || []) as File[];
    if (files.length) {
      e.preventDefault();
      addFiles(files);
      return;
    }
    const pasted = e.clipboardData.getData('text');
    if (pasted.length > LONG_PASTE_CHARS) {
      e.preventDefault();
      setTexts((prev) => [...prev, { id: newId(), kind: 'texto', name: t('Texto pegado', 'Pasted text'), text: pasted.slice(0, 60000) }]);
    }
  }

  function saveBusinessData() {
    const clean = dataText.trim();
    if (clean.length < 5) return setShowData(false);
    setTexts((prev) => [...prev.filter((x) => x.kind !== 'datos'), { id: newId(), kind: 'datos', name: t('Datos del negocio', 'Business details'), text: clean.slice(0, 20000) }]);
    setDataText('');
    setShowData(false);
  }

  function submit() {
    if (!canSend) return;
    onSubmit({
      brief: brief.trim(),
      level,
      templateId: templateId || undefined,
      attachments: texts.map(({ kind, name, text }) => ({ kind, name, text })),
      images: images.map(({ name, dataUrl }) => ({ name, dataUrl })),
    });
  }

  const chip = `inline-flex items-center gap-2 max-w-[220px] rounded-xl border px-2.5 py-1.5 text-xs ${isDark ? 'border-white/15 bg-white/5 text-white' : 'border-black/10 bg-black/[0.03] text-[#1D1D1F]'}`;

  return (
    <div className="space-y-4">
      <div
        className={`${s.card} p-3 space-y-3 transition-shadow ${dragging ? 'ring-2 ring-offset-2 ring-[#0071E3]' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
      >
        {(texts.length > 0 || images.length > 0 || selectedTemplate) && (
          <div className="flex flex-wrap gap-2" aria-label={t('Adjuntos', 'Attachments')}>
            {selectedTemplate && (
              <span className={chip}>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('Plantilla: ', 'Template: ')}{selectedTemplate.name}</span>
                <button type="button" aria-label={t('Quitar plantilla', 'Remove template')} onClick={() => setTemplateId(null)} className="cursor-pointer opacity-60 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {images.map((img) => (
              <span key={img.id} className={`${chip} pl-1`}>
                <img src={img.dataUrl} alt="" className="w-7 h-7 rounded-md object-cover" />
                <span className="truncate">{img.name}</span>
                <button type="button" aria-label={t('Quitar imagen', 'Remove image')} onClick={() => setImages((p) => p.filter((x) => x.id !== img.id))} className="cursor-pointer opacity-60 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {texts.map((tx) => (
              <span key={tx.id} className={chip} title={tx.text.slice(0, 300)}>
                {tx.kind === 'zip' ? <FileArchive className="w-3.5 h-3.5 shrink-0" /> : tx.kind === 'datos' ? <MapPin className="w-3.5 h-3.5 shrink-0" /> : <FileText className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{tx.name}</span>
                <span className={`shrink-0 ${s.faint}`}>{describeSize(tx.text, isEn)}</span>
                <button type="button" aria-label={t('Quitar adjunto', 'Remove attachment')} onClick={() => setTexts((p) => p.filter((x) => x.id !== tx.id))} className="cursor-pointer opacity-60 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <label htmlFor="ws-brief" className="sr-only">{t('Describe tu web', 'Describe your website')}</label>
        <textarea
          id="ws-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onPaste={onPaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={4}
          placeholder={t(
            'Ej. Web para Z Roofing, empresa de techos en Miami. Portada oscura con un techo 3D que se arma al hacer scroll, servicios, zonas que atienden y botón para pedir inspección gratis.',
            'E.g. Website for Z Roofing, a roofing company in Miami. Dark hero with a 3D roof that assembles on scroll, services, service areas and a free inspection button.'
          )}
          className={`${s.input} resize-none border-0 px-1 focus:border-0`}
        />

        {showData && (
          <div className={`rounded-xl p-3 space-y-2 ${s.soft}`}>
            <label htmlFor="ws-data" className={`block text-xs font-medium ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
              {t('Pega aquí los datos del negocio (de Google Maps o su web): nombre, dirección, teléfono, horario, servicios, reseñas destacadas.', 'Paste the business details (from Google Maps or its site): name, address, phone, hours, services, top reviews.')}
            </label>
            <textarea id="ws-data" value={dataText} onChange={(e) => setDataText(e.target.value)} rows={5} className={`${s.input} resize-none`} />
            <p className={`text-[11px] ${s.faint}`}>
              {t('La IA no abre enlaces: copia el texto de la ficha de Google Maps y pégalo aquí.', 'The AI does not open links: copy the text from the Google Maps listing and paste it here.')}
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowData(false)} className={s.ghostButton}>{t('Cancelar', 'Cancel')}</button>
              <button type="button" onClick={saveBusinessData} className={s.secondaryButton}>{t('Adjuntar datos', 'Attach details')}</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.zip,.txt,.md,.html,.htm,.css,.tsx,.ts,.jsx,.js,.json"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className={s.secondaryButton} disabled={reading}>
              {reading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
              {t('Adjuntar', 'Attach')}
            </button>
            <button type="button" onClick={() => setShowData((v) => !v)} className={s.secondaryButton}>
              <MapPin className="w-3.5 h-3.5" /> {t('Datos del negocio', 'Business details')}
            </button>
            <span className={`hidden sm:inline text-[11px] ${s.faint}`}>
              <ImagePlus className="inline w-3 h-3 mr-1" />
              {t(`Hasta ${MAX_IMAGES} fotos y 1 zip`, `Up to ${MAX_IMAGES} photos and 1 zip`)}
            </span>
          </div>
          <button type="button" onClick={submit} disabled={!canSend} className={s.primaryButton}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t('Crear maqueta', 'Create mockup')}
          </button>
        </div>
        {problem && <p className="text-xs text-red-600">{problem}</p>}
      </div>

      {!guest && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className={s.heading}>{t('Nivel de la web', 'Website level')}</h3>
            <span className={`text-xs ${s.faint}`}>
              {creditsLeft === null ? t('Sin límite de créditos (administrador)', 'No credit limit (admin)') : t(`Te quedan ${creditsLeft} crédito(s)`, `${creditsLeft} credit(s) left`)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={t('Nivel de la web', 'Website level')}>
            {LEVELS.map((lv) => {
              const active = level === lv.id;
              const tooMany = creditsLeft !== null && lv.credits > creditsLeft;
              return (
                <button
                  key={lv.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLevel(lv.id)}
                  className={`text-left rounded-2xl border p-3 transition-colors cursor-pointer ${
                    active ? (isDark ? 'border-white bg-white/10' : 'border-[#1D1D1F] bg-black/[0.03]') : isDark ? 'border-white/10 hover:border-white/30' : 'border-black/10 hover:border-black/25'
                  } ${tooMany ? 'opacity-50' : ''}`}
                >
                  <span className={`block text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                    {lv[isEn ? 'en' : 'es'][0]} · {lv.credits} {lv.credits === 1 ? t('crédito', 'credit') : t('créditos', 'credits')}
                  </span>
                  <span className={`block text-xs mt-0.5 ${s.muted}`}>{lv[isEn ? 'en' : 'es'][1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {templates.length > 0 && (
        <div className="space-y-2">
          <h3 className={s.heading}>{t('Estilo de la biblioteca (opcional)', 'Library style (optional)')}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {templates.map((tp) => {
              const active = tp.id === templateId;
              return (
                <button
                  key={tp.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTemplateId(active ? null : tp.id)}
                  className={`shrink-0 w-44 text-left rounded-2xl border overflow-hidden cursor-pointer transition-colors ${active ? (isDark ? 'border-white' : 'border-[#1D1D1F]') : isDark ? 'border-white/10' : 'border-black/10'}`}
                >
                  <span className={`flex items-center justify-center aspect-[4/3] ${isDark ? 'bg-white/5' : 'bg-black/[0.04]'}`}>
                    {tp.preview ? <img src={tp.preview} alt="" className="w-full h-full object-cover" /> : <Sparkles className={`w-5 h-5 ${s.faint}`} />}
                  </span>
                  <span className="block p-2">
                    <span className={`block text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{tp.name}</span>
                    {tp.description && <span className={`block text-[11px] line-clamp-2 ${s.faint}`}>{tp.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
