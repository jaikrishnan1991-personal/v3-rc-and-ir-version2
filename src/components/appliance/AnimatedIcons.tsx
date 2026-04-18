/**
 * V2 — smooth monochrome SVG icons with subtle CSS animations.
 * All icons inherit currentColor (LCD pixel color).
 * Designed at 64x64 viewBox so they scale crisply on the LCD.
 */
import { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number; animate?: boolean };

const Wrap = ({
  size = 48,
  animate = true,
  className = "",
  children,
  ...rest
}: Props & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${animate ? "" : "[&_*]:!animate-none"} ${className}`}
    {...rest}
  >
    {children}
  </svg>
);

/* ---------- EvoChef logo (boot screen) ---------- */
export const EvoChefLogo = ({ size = 120, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size * 2.4}
    height={size}
    viewBox="0 0 240 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chef hat */}
    <g stroke="currentColor" strokeWidth="3" fill="none">
      <ellipse cx="40" cy="42" rx="22" ry="14" />
      <ellipse cx="55" cy="35" rx="18" ry="14" />
      <ellipse cx="25" cy="38" rx="16" ry="13" />
      <path d="M20 50 L60 50 L60 62 L20 62 Z" fill="currentColor" />
      <path d="M20 56 L60 56" stroke="hsl(var(--lcd-bg))" strokeWidth="2" />
    </g>
    {/* Wordmark */}
    <text
      x="80"
      y="58"
      fontFamily="VT323, monospace"
      fontSize="48"
      fill="currentColor"
      letterSpacing="2"
    >
      EvoChef
    </text>
    <text x="222" y="38" fontFamily="VT323, monospace" fontSize="14" fill="currentColor">
      ®
    </text>
    <text
      x="80"
      y="78"
      fontFamily="VT323, monospace"
      fontSize="14"
      fill="currentColor"
      opacity="0.75"
      letterSpacing="3"
    >
      MODULAR COOKING SYSTEM
    </text>
  </svg>
);

/* ---------- Food icons w/ animations ---------- */

// Steam plumes used by several icons
const Steam = ({ y = 8 }: { y?: number }) => (
  <g className="anim-steam" opacity={0.85}>
    <path d="M22 18 q-3 -6 0 -10 q3 -4 0 -8" transform={`translate(0 ${y - 8})`} />
    <path d="M32 16 q-3 -6 0 -10 q3 -4 0 -8" transform={`translate(0 ${y - 8})`} />
    <path d="M42 18 q-3 -6 0 -10 q3 -4 0 -8" transform={`translate(0 ${y - 8})`} />
  </g>
);

export const DosaIcon = (p: Props) => (
  <Wrap {...p}>
    {/* rolled dosa cylinder + plate */}
    <ellipse cx="32" cy="46" rx="26" ry="4" />
    <path d="M8 40 Q 32 30 56 40 L 56 44 Q 32 48 8 44 Z" fill="currentColor" stroke="none" />
    <path d="M14 38 L 50 38" opacity="0.4" />
    <Steam y={28} />
  </Wrap>
);

export const CrepeIcon = (p: Props) => (
  <Wrap {...p}>
    {/* folded triangle crepe */}
    <path d="M10 50 L 54 50 L 32 16 Z" fill="currentColor" stroke="currentColor" />
    <circle cx="26" cy="42" r="2" fill="hsl(var(--lcd-bg))" stroke="none" />
    <circle cx="36" cy="40" r="2" fill="hsl(var(--lcd-bg))" stroke="none" />
    <Steam y={14} />
  </Wrap>
);

export const SteakIcon = (p: Props) => (
  <Wrap {...p}>
    {/* sizzling steak */}
    <path
      d="M14 32 Q 12 22 24 20 Q 36 18 48 22 Q 56 26 52 38 Q 50 46 38 46 Q 22 46 16 40 Q 12 36 14 32 Z"
      fill="currentColor"
      stroke="currentColor"
    />
    {/* bone notch */}
    <path d="M18 30 Q 14 28 14 32" stroke="hsl(var(--lcd-bg))" strokeWidth="2" fill="none" />
    {/* sizzle marks */}
    <g className="anim-sizzle">
      <path d="M22 14 L 22 10" />
      <path d="M32 12 L 32 6" />
      <path d="M42 14 L 42 10" />
    </g>
  </Wrap>
);

export const ChickenIcon = (p: Props) => (
  <Wrap {...p}>
    {/* drumstick */}
    <ellipse cx="24" cy="30" rx="14" ry="13" fill="currentColor" stroke="currentColor" />
    <rect x="32" y="34" width="20" height="6" rx="3" fill="currentColor" stroke="currentColor" />
    <circle cx="52" cy="32" r="5" fill="currentColor" stroke="currentColor" />
    <circle cx="52" cy="42" r="5" fill="currentColor" stroke="currentColor" />
    <Steam y={18} />
  </Wrap>
);

export const BurgerIcon = (p: Props) => (
  <Wrap {...p}>
    {/* top bun */}
    <path d="M8 28 Q 32 8 56 28 Z" fill="currentColor" stroke="currentColor" />
    <circle cx="22" cy="22" r="1.4" fill="hsl(var(--lcd-bg))" stroke="none" />
    <circle cx="32" cy="18" r="1.4" fill="hsl(var(--lcd-bg))" stroke="none" />
    <circle cx="42" cy="22" r="1.4" fill="hsl(var(--lcd-bg))" stroke="none" />
    {/* lettuce */}
    <path d="M8 32 Q 14 28 20 32 Q 26 28 32 32 Q 38 28 44 32 Q 50 28 56 32 L 56 36 L 8 36 Z" fill="currentColor" stroke="currentColor" />
    {/* patty */}
    <rect x="8" y="38" width="48" height="6" fill="currentColor" stroke="currentColor" />
    {/* bottom bun */}
    <path d="M8 46 L 56 46 Q 56 56 32 56 Q 8 56 8 46 Z" fill="currentColor" stroke="currentColor" />
  </Wrap>
);

export const FishIcon = (p: Props) => (
  <Wrap {...p}>
    {/* swimming fish — tail wags */}
    <g className="anim-swim">
      <path
        d="M10 32 Q 18 18 36 18 Q 50 18 54 32 Q 50 46 36 46 Q 18 46 10 32 Z"
        fill="currentColor"
        stroke="currentColor"
      />
      <path d="M54 32 L 62 22 L 60 32 L 62 42 Z" fill="currentColor" stroke="currentColor" />
      <circle cx="20" cy="28" r="2" fill="hsl(var(--lcd-bg))" stroke="none" />
      <path d="M28 32 L 40 32" stroke="hsl(var(--lcd-bg))" strokeWidth="1.5" />
    </g>
  </Wrap>
);

export const SandwichIcon = (p: Props) => (
  <Wrap {...p}>
    {/* toasting sandwich */}
    <path d="M10 22 L 54 22 L 50 28 L 14 28 Z" fill="currentColor" stroke="currentColor" />
    <path d="M14 30 Q 20 26 26 30 Q 32 26 38 30 Q 44 26 50 30 L 50 34 L 14 34 Z" fill="currentColor" stroke="currentColor" />
    <rect x="14" y="36" width="36" height="4" fill="currentColor" stroke="currentColor" />
    <path d="M14 42 L 50 42 L 54 48 L 10 48 Z" fill="currentColor" stroke="currentColor" />
    <Steam y={18} />
  </Wrap>
);

export const HotdogIcon = (p: Props) => (
  <Wrap {...p}>
    {/* bun */}
    <rect x="6" y="26" width="52" height="18" rx="9" fill="currentColor" stroke="currentColor" />
    {/* sausage */}
    <rect
      x="10"
      y="30"
      width="44"
      height="10"
      rx="5"
      fill="hsl(var(--lcd-bg))"
      stroke="currentColor"
    />
    {/* mustard */}
    <path
      d="M12 35 Q 18 32 24 35 Q 30 38 36 35 Q 42 32 48 35 Q 52 37 54 35"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <Steam y={22} />
  </Wrap>
);

/* ---------- Map ---------- */
export const ANIMATED_ICON_MAP: Record<string, (p: Props) => JSX.Element> = {
  dosa: DosaIcon,
  crepe: CrepeIcon,
  steak: SteakIcon,
  chicken: ChickenIcon,
  burger: BurgerIcon,
  fish: FishIcon,
  sandwich: SandwichIcon,
  hotdog: HotdogIcon,
};
