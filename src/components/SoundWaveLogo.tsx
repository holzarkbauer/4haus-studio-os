import React from 'react';
import { WhaleLogo } from './WhaleLogo';

interface SoundWaveLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * 4haus Brand Logo (Frame 2 relleno negro)
 * Rendered from the user's official SVG design
 */
export function SoundWaveLogo({
  className = 'h-5 w-6',
  showText = true,
  textClassName = 'text-base font-bold tracking-tight text-zinc-950 dark:text-white',
}: SoundWaveLogoProps) {
  return (
    <WhaleLogo
      className={className}
      showText={showText}
      textClassName={textClassName}
    />
  );
}
