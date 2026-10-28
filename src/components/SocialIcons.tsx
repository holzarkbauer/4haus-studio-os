interface IconProps {
  className?: string;
  size?: number;
}

// Official Instagram Camera Glyph
export function InstagramIcon({ className = "w-4 h-4", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// Official Facebook 'f' Logo
export function FacebookIcon({ className = "w-4 h-4", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Official LinkedIn 'in' Logo
export function LinkedInIcon({ className = "w-4 h-4", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

// Official 𝕏 (formerly Twitter) Logo
export function XIcon({ className = "w-4 h-4", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Official Mailchimp Freddie Monkey Mascot (Based on attached image.png)
export function MailchimpFreddieIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {/* Yellow Brand Canvas */}
      <rect width="100" height="100" rx="20" fill="#FFE01B" />
      
      {/* Freddie's Head Silhouette & Cap */}
      <g fill="#000000">
        {/* Cap Crown */}
        <path d="M43 14 C56 14 62 20 62 25 C58 25 50 25 43 27 C36 29 33 34 32 40 C31 30 35 14 43 14 Z" />
        
        {/* Cap Visor with small button */}
        <path d="M45 13 C47 13 48 15 48 17 C48 19 46 20 44 20 C42 20 41 19 41 17 C41 15 42 13 45 13 Z" fill="#FFE01B" />
        <path d="M32 38 C32 26 40 16 52 14 C58 13 62 16 63 21 C64 26 58 29 48 29 C40 29 35 33 32 38 Z" />
        <path d="M45 15 C54 15 62 18 63 23 C64 26 56 28 47 28 C39 28 35 32 33 37 C34 26 40 15 45 15 Z" fill="#000000" />
        
        {/* Main Head Circle & Cheek */}
        <circle cx="50" cy="52" r="28" />
        
        {/* Left Big Ear */}
        <circle cx="38" cy="49" r="8" />
        
        {/* Face Silhouette / Muzzle protrusion */}
        <ellipse cx="58" cy="55" rx="16" ry="14" />
      </g>

      {/* Face details in brand yellow cutouts */}
      <g fill="#FFE01B" stroke="#FFE01B">
        {/* Cap Visor Outline */}
        <path d="M33 38 Q45 27 58 24 Q63 23 63 28 Q52 30 40 37 Z" fill="#FFE01B" stroke="none" />
        
        {/* Ear Inner detail */}
        <circle cx="38" cy="49" r="4.5" fill="#000000" />
        <path d="M38 46 C40 46 41 48 40 51 C39 53 37 53 36 51" stroke="#FFE01B" strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* Snout and Cheek mask */}
        <path
          d="M48 42 C51 34 58 31 61 36 C64 40 60 48 60 48 C64 47 67 49 68 53 C69 57 65 60 62 60 C64 62 66 65 64 68 C61 72 52 71 50 67 C48 62 48 52 48 42 Z"
          fill="#FFE01B"
          stroke="none"
        />

        {/* Winking Right Eye (Curved Crescent Arch) */}
        <path
          d="M50 40 C51 38 53 38 55 40"
          stroke="#000000"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Eye (Solid Looking Forward Pupil) */}
        <ellipse cx="59" cy="37" rx="1.6" ry="2.2" fill="#000000" stroke="none" />

        {/* Nostrils */}
        <ellipse cx="57" cy="42" rx="1.1" ry="1.4" fill="#000000" stroke="none" />
        <ellipse cx="61" cy="43" rx="1.1" ry="1.4" fill="#000000" stroke="none" />

        {/* Broad Happy Smile Mouth with top teeth */}
        <path
          d="M51 49 C54 48 64 47 66 52 C65 57 56 61 51 55 Z"
          fill="#000000"
          stroke="none"
        />
        {/* Teeth row highlight */}
        <path
          d="M53 50 C56 49 62 49 64 52 C60 53 56 53 53 50 Z"
          fill="#FFFFFF"
          stroke="none"
        />
      </g>
    </svg>
  );
}
