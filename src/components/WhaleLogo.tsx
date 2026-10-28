import React from 'react';

interface WhaleLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * 4haus Studio Official Brand Logo (Frame 3)
 * Exact optical kinetic design with light-gray facet and black pill bars.
 */
export function WhaleLogo({
  className = "h-8 w-8",
  showText = false,
  textClassName = "text-base font-bold tracking-tight text-zinc-950 dark:text-white"
}: WhaleLogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none shrink-0 group cursor-pointer" title="4haus Studio">
      <svg
        viewBox="0 0 1025 1000"
        className={`${className} transition-transform duration-200 group-hover:scale-105 shrink-0`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        {/* Gray inner pill facet */}
        <g className="fill-[#D4D4D8] stroke-[#18181B] dark:fill-zinc-700 dark:stroke-zinc-300" strokeWidth="2.5">
          <rect x="0" y="285" width="50" height="200" rx="25" />
          <rect x="0" y="555" width="50" height="195" rx="25" />
          <rect x="68" y="212" width="50" height="328" rx="25" />
          <rect x="68" y="565" width="50" height="235" rx="25" />
          <rect x="136" y="365" width="50" height="235" rx="25" />
          <rect x="204" y="335" width="50" height="80" rx="25" />
          <rect x="204" y="452" width="50" height="236" rx="25" />
          <rect x="272" y="272" width="50" height="176" rx="25" />
          <rect x="272" y="502" width="50" height="234" rx="25" />
          <rect x="340" y="205" width="50" height="220" rx="25" />
          <rect x="340" y="578" width="50" height="196" rx="25" />
          <rect x="408" y="135" width="50" height="217" rx="25" />
          <rect x="476" y="138" width="50" height="117" rx="25" />
        </g>

        {/* Black outer/interlocking pill bars */}
        <g className="fill-black dark:fill-white transition-colors">
          <rect x="0" y="175" width="50" height="80" rx="25" />
          <rect x="68" y="90" width="50" height="105" rx="25" />
          <rect x="68" y="818" width="50" height="74" rx="25" />
          <rect x="136" y="35" width="50" height="140" rx="25" />
          <rect x="136" y="835" width="50" height="115" rx="25" />
          <rect x="204" y="0" width="50" height="155" rx="25" />
          <rect x="204" y="852" width="50" height="136" rx="25" />
          <rect x="272" y="0" width="50" height="140" rx="25" />
          <rect x="272" y="848" width="50" height="152" rx="25" />
          <rect x="340" y="2" width="50" height="113" rx="25" />
          <rect x="340" y="815" width="50" height="145" rx="25" />
          <rect x="408" y="28" width="50" height="78" rx="25" />
          <rect x="408" y="762" width="50" height="198" rx="25" />
          <rect x="476" y="78" width="50" height="67" rx="25" />
          <rect x="476" y="702" width="50" height="236" rx="25" />
          <rect x="544" y="36" width="50" height="110" rx="25" />
          <rect x="544" y="198" width="50" height="97" rx="25" />
          <rect x="544" y="638" width="50" height="232" rx="25" />
          <rect x="544" y="895" width="50" height="50" rx="25" />
          <rect x="612" y="18" width="50" height="112" rx="25" />
          <rect x="612" y="205" width="50" height="170" rx="25" />
          <rect x="612" y="580" width="50" height="235" rx="25" />
          <rect x="612" y="902" width="50" height="60" rx="25" />
          <rect x="680" y="15" width="50" height="111" rx="25" />
          <rect x="680" y="244" width="50" height="211" rx="25" />
          <rect x="680" y="515" width="50" height="233" rx="25" />
          <rect x="680" y="905" width="50" height="65" rx="25" />
          <rect x="748" y="30" width="50" height="146" rx="25" />
          <rect x="748" y="290" width="50" height="210" rx="25" />
          <rect x="748" y="515" width="50" height="167" rx="25" />
          <rect x="748" y="852" width="50" height="116" rx="25" />
          <rect x="816" y="55" width="50" height="197" rx="25" />
          <rect x="816" y="365" width="50" height="207" rx="25" />
          <rect x="816" y="726" width="50" height="212" rx="25" />
          <rect x="884" y="104" width="50" height="286" rx="25" />
          <rect x="884" y="435" width="50" height="433" rx="25" />
          <rect x="952" y="226" width="50" height="196" rx="25" />
          <rect x="952" y="564" width="50" height="218" rx="25" />
        </g>
      </svg>
      {showText && (
        <span className={textClassName}>
          4haus
        </span>
      )}
    </div>
  );
}

export { WhaleLogo as FourHausLogo, WhaleLogo as BrandLogo };
