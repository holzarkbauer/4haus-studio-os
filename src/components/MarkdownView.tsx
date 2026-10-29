import React from 'react';

// Muestra Markdown sencillo (títulos, listas, tablas, negritas, enlaces, citas) con el estilo de
// 4haus Studio. Construye elementos de React: nunca inserta HTML, así que un documento con
// etiquetas raras no puede ejecutar nada en la página.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // **negrita**, *cursiva*, `código`, [texto](url)
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[2]) nodes.push(<strong key={key} className="font-semibold">{m[2]}</strong>);
    else if (m[3]) nodes.push(<em key={key}>{m[3]}</em>);
    else if (m[4]) nodes.push(<code key={key} className="px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/10 text-[0.9em]">{m[4]}</code>);
    else if (m[5] && m[6])
      nodes.push(
        <a key={key} href={m[6]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70">
          {m[5]}
        </a>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function isTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitRow(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

export function MarkdownView({ content, isDark = false }: { content: string; isDark?: boolean }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  const text = isDark ? 'text-zinc-100' : 'text-[#1D1D1F]';
  const muted = isDark ? 'text-zinc-400' : 'text-[#6E6E73]';
  const border = isDark ? 'border-white/10' : 'border-black/[0.08]';
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Títulos
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls =
        level === 1
          ? 'text-2xl font-bold tracking-tight mt-2 mb-3'
          : level === 2
          ? 'text-lg font-semibold tracking-tight mt-6 mb-2'
          : 'text-base font-semibold mt-4 mb-1.5';
      blocks.push(
        <div key={key++} className={`${cls} ${text}`} role="heading" aria-level={level}>
          {renderInline(h[2], `h${key}`)}
        </div>
      );
      i++;
      continue;
    }

    // Separador
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(<hr key={key++} className={`my-5 ${border}`} />);
      i++;
      continue;
    }

    // Tabla
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className={`my-4 overflow-x-auto rounded-xl border ${border}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={isDark ? 'bg-white/[0.04]' : 'bg-[#F5F5F7]'}>
                {header.map((c, ci) => (
                  <th key={ci} className={`text-left font-semibold px-3 py-2 ${text}`}>{renderInline(c, `th${key}-${ci}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className={`border-t ${border}`}>
                  {r.map((c, ci) => (
                    <td key={ci} className={`px-3 py-2 align-top ${text}`}>{renderInline(c, `td${key}-${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Listas
    const isBullet = /^[-*•]\s+/.test(trimmed);
    const isNumbered = /^\d+[.)]\s+/.test(trimmed);
    if (isBullet || isNumbered) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (isBullet && /^[-*•]\s+/.test(t)) items.push(t.replace(/^[-*•]\s+/, ''));
        else if (isNumbered && /^\d+[.)]\s+/.test(t)) items.push(t.replace(/^\d+[.)]\s+/, ''));
        else break;
        i++;
      }
      const ListTag = isNumbered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={key++} className={`my-3 pl-5 space-y-1.5 ${isNumbered ? 'list-decimal' : 'list-disc'} ${text} text-[15px] leading-relaxed`}>
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it, `li${key}-${ii}`)}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    // Cita
    if (trimmed.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className={`my-4 pl-4 border-l-2 ${border} ${muted} text-[15px] leading-relaxed`}>
          {renderInline(quote.join(' '), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    // Párrafo (une líneas seguidas)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|[-*•]\s|\d+[.)]\s|>|\|)/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length === 0) {
      para.push(trimmed);
      i++;
    }
    blocks.push(
      <p key={key++} className={`my-3 text-[15px] leading-relaxed ${text}`}>
        {renderInline(para.join(' '), `p${key}`)}
      </p>
    );
  }

  return <div className="max-w-none">{blocks}</div>;
}
