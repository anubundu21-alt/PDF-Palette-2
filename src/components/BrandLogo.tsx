import { cn } from "@/lib/utils";

/**
 * PDF Robin brand mark — a robin holding a PDF page.
 *
 * The navy is driven by `--brand-navy` / `--brand-navy-soft` rather than being
 * hard-coded, because the dark theme's background is near-black navy and the
 * literal brand navy all but disappears against it. The orange, the white page
 * and the red badge are fixed: they carry the brand and read on either theme.
 *
 * Keep these paths in step with `scripts/brand-assets.mjs`, which renders the
 * favicon, PWA icons and OG image from the same geometry.
 */
export const BrandMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 128 128"
    className={cn("h-9 w-9", className)}
    role="img"
    aria-label="PDF Robin"
  >
    <ellipse cx="54" cy="112" rx="28" ry="4.2" fill="#CBD5E1" opacity=".5" />
    <g
      stroke="var(--brand-navy)"
      strokeWidth="3.4"
      strokeLinecap="round"
      fill="none"
    >
      <path d="M48 95 V107" />
      <path d="M60 95 V107" />
      <path d="M42 108 H54" />
      <path d="M54 108 H66" />
    </g>
    <path d="M30 66 C21 77 12 86 5 93 C12 97 24 95 36 89 Z" fill="var(--brand-navy)" />
    <path
      d="M25 58 C25 32 42 15 62 15 C83 15 96 33 96 56 C96 79 81 99 59 99 C39 99 25 82 25 58 Z"
      fill="var(--brand-navy)"
    />
    <path
      d="M72 18 C86 22 96 37 96 56 C96 72 89 86 78 94 C64 89 54 73 55 55 C56 40 62 25 72 18 Z"
      fill="#F4511E"
    />
    <path
      d="M78 94 C72 98 66 99 59 99 C49 99 40 93 34 84 C48 92 64 94 78 94 Z"
      fill="#F8FAFC"
    />
    <path
      d="M34 50 C45 42 61 47 66 62 C62 78 44 83 36 72 C31 64 31 56 34 50 Z"
      fill="var(--brand-navy-soft)"
    />
    <path d="M94 42 L107 40.5 L94 48 Z" fill="var(--brand-navy)" />
    <path d="M94 49 L105 52 L94 54 Z" fill="var(--brand-navy)" />
    <circle cx="82" cy="40" r="4.6" fill="#0B1733" />
    <circle cx="83.6" cy="38.4" r="1.5" fill="#ffffff" />
    <path
      d="M74 62 H106 L118 74 V112 A4 4 0 0 1 114 116 H74 A4 4 0 0 1 70 112 V66 A4 4 0 0 1 74 62 Z"
      fill="#ffffff"
      stroke="var(--brand-navy)"
      strokeWidth="3.6"
      strokeLinejoin="round"
    />
    <path
      d="M106 62 L118 74 H110 A4 4 0 0 1 106 70 Z"
      fill="#E2E8F0"
      stroke="var(--brand-navy)"
      strokeWidth="3.6"
      strokeLinejoin="round"
    />
    <rect x="76" y="86" width="36" height="18" rx="3.5" fill="#D93025" />
    <text
      x="94"
      y="99.5"
      fontFamily="Arial Black, Arial, sans-serif"
      fontSize="13"
      fontWeight="900"
      fill="#ffffff"
      textAnchor="middle"
    >
      PDF
    </text>
  </svg>
);

/**
 * Full lockup: mark plus wordmark. "PDF" inherits the theme's foreground so it
 * stays legible in both themes; "Robin" keeps the brand orange and carries the
 * underline swoosh.
 */
const BrandLogo = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center gap-2", className)}>
    <BrandMark />
    <span className="text-xl font-bold leading-none text-foreground">
      PDF
      <span className="relative text-[#F4511E]">
        Robin
        <svg
          viewBox="0 0 100 10"
          aria-hidden="true"
          className="absolute -bottom-1.5 left-0 h-1.5 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M2 7 C30 2 70 2 98 6"
            stroke="#F4511E"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
    </span>
  </span>
);

export default BrandLogo;
