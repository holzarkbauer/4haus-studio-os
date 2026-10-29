// Estilo común de 4haus Studio: los mismos tipos de texto, colores y formas en todas las
// herramientas y en Daniel. Si una pantalla necesita un estilo nuevo, se añade aquí y no
// se inventa en el componente.
//
// Paleta: texto #1D1D1F · texto secundario #6E6E73 · texto terciario #86868B ·
// fondo #F5F5F7 · tarjetas blancas con borde negro al 8 % · acción principal negra.
// Tipografía: la de la app (Plus Jakarta Sans / DM Sans), sin colores de acento extra.

export function ui(isDark: boolean) {
  return {
    // Texto
    title: `text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`,
    heading: `text-base font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`,
    body: `text-[15px] leading-relaxed ${isDark ? 'text-zinc-100' : 'text-[#1D1D1F]'}`,
    muted: isDark ? 'text-zinc-400' : 'text-[#6E6E73]',
    faint: isDark ? 'text-zinc-500' : 'text-[#86868B]',
    label: `block text-sm font-medium mb-1.5 ${isDark ? 'text-zinc-200' : 'text-[#1D1D1F]'}`,

    // Superficies
    page: isDark ? 'bg-black' : 'bg-[#F5F5F7]',
    surface: isDark ? 'bg-zinc-950' : 'bg-white',
    card: `rounded-2xl border ${isDark ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-black/[0.08]'}`,
    soft: isDark ? 'bg-white/[0.06]' : 'bg-[#F5F5F7]',
    divider: isDark ? 'border-white/10' : 'border-black/[0.08]',

    // Controles
    input: `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
      isDark
        ? 'bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30'
        : 'bg-white border-black/[0.1] text-[#1D1D1F] placeholder:text-[#86868B] focus:border-black/30'
    }`,
    primaryButton: `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
      isDark ? 'bg-white text-black' : 'bg-[#1D1D1F] text-white'
    }`,
    secondaryButton: `inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
      isDark ? 'border-white/15 text-zinc-200 hover:bg-white/5' : 'border-black/[0.1] text-[#1D1D1F] hover:bg-black/[0.03]'
    }`,
    ghostButton: `inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-[#1D1D1F]'} hover:underline`,
    iconButton: `p-1.5 rounded-lg cursor-pointer transition-colors ${
      isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
    }`,
    chip: (active: boolean) =>
      `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
        active
          ? isDark
            ? 'bg-white text-black border-white'
            : 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
          : isDark
          ? 'border-white/15 text-zinc-300 hover:bg-white/5'
          : 'border-black/[0.1] text-[#1D1D1F] bg-white hover:bg-black/[0.03]'
      }`,
  };
}
