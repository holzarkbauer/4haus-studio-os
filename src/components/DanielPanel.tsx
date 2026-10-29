import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowUp, FileText, Copy, Check, Download, Search, Plus, ExternalLink, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { WhaleLogo } from './WhaleLogo';
import { MarkdownView } from './MarkdownView';
import { getWorkspaceId } from '../utils/workspaceId';
import { ui } from '../ui/tokens';

// Daniel con el mismo modo de trabajo que Claude: chat sobrio a la izquierda y los entregables
// (documentos) abiertos en un panel a la derecha. Las respuestas del chat son cortas; el detalle
// vive en los documentos, que se pueden copiar o descargar.

interface Deliverable {
  id: string;
  title: string;
  kind: string;
  content: string;
}

interface Source {
  url: string;
  title: string;
}

interface ThreadMessage {
  role: 'user' | 'assistant';
  content: string;
  deliverables?: Deliverable[];
  sources?: Source[];
  mode?: 'normal' | 'research';
}

interface DanielPanelProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  activeSection?: string;
  userId?: string | null;
}

const STORAGE_PREFIX = '4haus_daniel_thread_v2_';

function loadThread(workspaceId: string): ThreadMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + workspaceId);
    return raw ? (JSON.parse(raw) as ThreadMessage[]) : [];
  } catch {
    return [];
  }
}

function saveThread(workspaceId: string, thread: ThreadMessage[]) {
  try {
    // Se guardan los últimos 30 mensajes para no llenar el almacenamiento del navegador.
    localStorage.setItem(STORAGE_PREFIX + workspaceId, JSON.stringify(thread.slice(-30)));
  } catch {
    // sin almacenamiento disponible: la conversación vive solo en memoria
  }
}

function slug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'documento';
}

export function DanielPanel({ lang, themeMode = 'light', activeSection = 'inicio', userId }: DanielPanelProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const t = ui(isDark);
  const workspaceId = getWorkspaceId(userId);

  const [isOpen, setIsOpen] = useState(false);
  const [thread, setThread] = useState<ThreadMessage[]>(() => loadThread(workspaceId));
  const [input, setInput] = useState('');
  const [research, setResearch] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMode, setThinkingMode] = useState<'normal' | 'research'>('normal');
  const [openDoc, setOpenDoc] = useState<{ doc: Deliverable; sources: Source[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    setThread(loadThread(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    saveThread(workspaceId, thread);
    setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [thread, workspaceId]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || isThinking) return;
    const mode: 'normal' | 'research' = research ? 'research' : 'normal';
    setThinkingMode(mode);
    const next: ThreadMessage[] = [...thread, { role: 'user', content: clean, mode }];
    setThread(next);
    setInput('');
    setIsThinking(true);
    // La investigación profunda cuesta más y tarda más: se activa solo para este mensaje.
    setResearch(false);
    try {
      const res = await fetch('/api/studio/daniel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': workspaceId },
        body: JSON.stringify({
          mode,
          section: activeSection,
          // Al servidor solo va el texto: los documentos se resumen por su título.
          messages: next.map((m) => ({
            role: m.role,
            content:
              m.role === 'assistant' && m.deliverables?.length
                ? `${m.content}\n\n[Entregables enviados: ${m.deliverables.map((d) => d.title).join('; ')}]`
                : m.content,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply: ThreadMessage = {
        role: 'assistant',
        content: data.reply || (isEn ? 'I could not answer this time.' : 'No pude responder esta vez.'),
        deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
        mode,
      };
      setThread((prev) => [...prev, reply]);
      if (reply.deliverables && reply.deliverables.length > 0) {
        setOpenDoc({ doc: reply.deliverables[0], sources: reply.sources || [] });
      }
    } catch {
      setThread((prev) => [
        ...prev,
        { role: 'assistant', content: isEn ? 'Connection error. Try again.' : 'Error de conexión. Inténtalo de nuevo.' },
      ]);
    } finally {
      setIsThinking(false);
    }
  }
  sendRef.current = send;

  // Cualquier pantalla puede abrir a Daniel con una pregunta:
  // window.dispatchEvent(new CustomEvent('daniel:ask', { detail: { text, research } }))
  useEffect(() => {
    const onAsk = (event: Event) => {
      const detail = (event as CustomEvent<{ text?: string; research?: boolean }>).detail || {};
      setIsOpen(true);
      if (typeof detail.research === 'boolean') setResearch(detail.research);
      if (detail.text) setTimeout(() => sendRef.current(detail.text as string), 0);
    };
    window.addEventListener('daniel:ask', onAsk);
    return () => window.removeEventListener('daniel:ask', onAsk);
  }, []);

  function downloadDoc(doc: Deliverable, sources: Source[]) {
    const extra =
      sources.length && !/##\s*Fuentes/i.test(doc.content)
        ? `\n\n## ${isEn ? 'Sources' : 'Fuentes'}\n\n${sources.map((s) => `- [${s.title}](${s.url})`).join('\n')}\n`
        : '';
    const blob = new Blob([`# ${doc.title}\n\n${doc.content}${extra}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug(doc.title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const suggestions = isEn
    ? ['Write the brief for my client\'s website', 'Plan to get my first 3 clients', 'Research the market for my niche']
    : ['Escribe el brief de la web de mi cliente', 'Plan para conseguir mis 3 primeros clientes', 'Investiga el mercado de mi nicho'];

  // Botón flotante (siempre visible)
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl border flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer ${
          isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/[0.08]'
        }`}
        aria-label={isEn ? 'Open Daniel' : 'Abrir a Daniel'}
        title="Daniel"
      >
        <WhaleLogo className={`w-8 h-8 ${isDark ? 'text-white' : 'text-black'}`} showText={false} />
      </button>
    );
  }

  return (
    <div
      className={`fixed top-14 right-0 bottom-0 z-50 flex border-l shadow-2xl transition-[width] duration-200 ${t.surface} ${t.divider} ${
        openDoc ? 'w-full lg:w-[min(1120px,94vw)]' : 'w-full sm:w-[420px]'
      }`}
      role="dialog"
      aria-label="Daniel"
    >
      {/* Columna del chat */}
      <section className={`flex flex-col min-w-0 ${openDoc ? 'hidden lg:flex lg:w-[400px] lg:shrink-0 border-r' : 'w-full'} ${t.divider}`}>
        <header className={`h-14 px-4 flex items-center justify-between border-b ${t.divider}`}>
          <div className="flex items-center gap-2.5">
            <WhaleLogo className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} showText={false} />
            <span className={t.heading}>Daniel</span>
          </div>
          <div className="flex items-center gap-1">
            {thread.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setThread([]);
                  setOpenDoc(null);
                }}
                className={t.iconButton}
                title={isEn ? 'New conversation' : 'Nueva conversación'}
                aria-label={isEn ? 'New conversation' : 'Nueva conversación'}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button type="button" onClick={() => setIsOpen(false)} className={t.iconButton} aria-label={isEn ? 'Close' : 'Cerrar'}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {thread.length === 0 && (
            <div className="pt-6 space-y-5">
              <div>
                <div className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                  {isEn ? 'How can I help?' : '¿En qué te ayudo?'}
                </div>
                <p className={`text-sm mt-1.5 ${t.muted}`}>
                  {isEn
                    ? 'I answer briefly and give you the work as documents you can open, copy and download.'
                    : 'Respondo breve y te entrego el trabajo en documentos que puedes abrir, copiar y descargar.'}
                </p>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (idx === 2) setResearch(true);
                      setInput(s);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm cursor-pointer transition-colors ${t.divider} ${
                      isDark ? 'text-zinc-200 hover:bg-white/5' : 'text-[#1D1D1F] hover:bg-black/[0.03]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {thread.map((m, idx) =>
            m.role === 'user' ? (
              <div key={idx} className="flex justify-end">
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed ${t.soft} ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                  {m.mode === 'research' && (
                    <div className={`flex items-center gap-1 text-[11px] font-medium mb-1 ${t.faint}`}>
                      <Search className="w-3 h-3" />
                      {isEn ? 'Deep research' : 'Investigación profunda'}
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={idx} className="space-y-3">
                <p className={t.body}>{m.content}</p>
                {m.deliverables && m.deliverables.length > 0 && (
                  <div className="space-y-2">
                    {m.deliverables.map((d) => {
                      const isActive = openDoc?.doc.id === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setOpenDoc({ doc: d, sources: m.sources || [] })}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left cursor-pointer transition-colors ${
                            isActive
                              ? isDark
                                ? 'border-white/40 bg-white/5'
                                : 'border-black/40 bg-black/[0.02]'
                              : `${t.divider} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'}`
                          }`}
                        >
                          <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${t.soft}`}>
                            <FileText className={`w-4 h-4 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm font-medium truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{d.title}</span>
                            <span className={`block text-xs ${t.faint}`}>{d.kind}</span>
                          </span>
                          <ChevronRight className={`w-4 h-4 shrink-0 ${t.faint}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
                {m.sources && m.sources.length > 0 && (
                  <div className={`text-xs ${t.faint}`}>
                    {isEn ? `${m.sources.length} sources consulted` : `${m.sources.length} fuentes consultadas`}
                  </div>
                )}
              </div>
            )
          )}

          {isThinking && (
            <div className={`text-sm ${t.muted} flex items-center gap-2`}>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
              </span>
              {thinkingMode === 'research'
                ? isEn
                  ? 'Researching the web. This can take one or two minutes.'
                  : 'Investigando en la web. Puede tardar uno o dos minutos.'
                : isEn
                ? 'Daniel is thinking...'
                : 'Daniel está pensando...'}
            </div>
          )}
          <div ref={feedEndRef} />
        </div>

        {/* Caja de escritura */}
        <div className={`p-4 border-t ${t.divider}`}>
          <div className={`rounded-2xl border p-3 ${t.divider} ${isDark ? 'bg-zinc-900' : 'bg-white'} focus-within:border-black/25 dark:focus-within:border-white/30`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              placeholder={isEn ? 'Ask Daniel...' : 'Escríbele a Daniel...'}
              className={`w-full bg-transparent resize-none text-[15px] focus:outline-none ${
                isDark ? 'text-white placeholder:text-zinc-500' : 'text-[#1D1D1F] placeholder:text-[#86868B]'
              }`}
              aria-label={isEn ? 'Message for Daniel' : 'Mensaje para Daniel'}
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setResearch(!research)}
                className={t.chip(research)}
                aria-pressed={research}
                title={
                  isEn
                    ? 'Daniel searches the web, compares sources and writes a detailed report'
                    : 'Daniel busca en la web, contrasta fuentes y escribe un informe detallado'
                }
              >
                <Search className="w-3.5 h-3.5" />
                {isEn ? 'Deep research' : 'Investigación profunda'}
              </button>
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim() || isThinking}
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30 ${
                  isDark ? 'bg-white text-black' : 'bg-[#1D1D1F] text-white'
                }`}
                aria-label={isEn ? 'Send' : 'Enviar'}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Panel derecho: el documento abierto */}
      {openDoc && (
        <section className="flex-1 min-w-0 flex flex-col">
          <header className={`h-14 px-5 flex items-center justify-between gap-3 border-b ${t.divider}`}>
            <div className="min-w-0">
              <div className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{openDoc.doc.title}</div>
              <div className={`text-xs ${t.faint}`}>{openDoc.doc.kind}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(openDoc.doc.content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className={t.iconButton}
                title={isEn ? 'Copy' : 'Copiar'}
                aria-label={isEn ? 'Copy' : 'Copiar'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => downloadDoc(openDoc.doc, openDoc.sources)}
                className={t.iconButton}
                title={isEn ? 'Download (.md)' : 'Descargar (.md)'}
                aria-label={isEn ? 'Download' : 'Descargar'}
              >
                <Download className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setOpenDoc(null)} className={t.iconButton} aria-label={isEn ? 'Close document' : 'Cerrar documento'}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <article className="max-w-[720px] mx-auto px-6 sm:px-10 py-8">
              <MarkdownView content={openDoc.doc.content} isDark={isDark} />
              {openDoc.sources.length > 0 && !/##\s*Fuentes/i.test(openDoc.doc.content) && (
                <div className={`mt-8 pt-6 border-t ${t.divider}`}>
                  <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{isEn ? 'Sources' : 'Fuentes'}</div>
                  <ul className="space-y-2">
                    {openDoc.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className={`text-sm inline-flex items-start gap-1.5 hover:underline ${t.muted}`}>
                          <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{s.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </div>
        </section>
      )}
    </div>
  );
}
