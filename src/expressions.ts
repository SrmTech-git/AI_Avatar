import type { ExpressionCode, GazeCode } from './types';

// ---- Brow shapes (raw SVG markup) ----
export const brows = {
  flat: `
    <line x1="40" y1="55" x2="90" y2="55" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="55" x2="160" y2="55" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  relaxed: `
    <line x1="40" y1="57" x2="90" y2="54" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="54" x2="160" y2="57" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'inward-soft': `
    <line x1="40" y1="55" x2="90" y2="60" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="60" x2="160" y2="55" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  thoughtful: `
    <line x1="40" y1="56" x2="90" y2="58" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="50" x2="160" y2="48" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'lifted-light': `
    <line x1="40" y1="48" x2="90" y2="48" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="48" x2="160" y2="48" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  lifted: `
    <line x1="40" y1="42" x2="90" y2="42" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="42" x2="160" y2="42" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'lifted-high': `
    <line x1="40" y1="35" x2="90" y2="38" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="38" x2="160" y2="35" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'asymmetric-right-up': `
    <line x1="40" y1="55" x2="90" y2="55" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="115" y1="60" x2="160" y2="38" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  concerned: `
    <line x1="40" y1="62" x2="90" y2="48" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="48" x2="160" y2="62" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'sad-high': `
    <line x1="40" y1="65" x2="90" y2="40" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="40" x2="160" y2="65" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'furrowed-light': `
    <line x1="42" y1="58" x2="88" y2="62" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="112" y1="62" x2="158" y2="58" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'tight-down': `
    <line x1="42" y1="55" x2="90" y2="62" stroke="black" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="62" x2="158" y2="55" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  angry: `
    <line x1="28" y1="28" x2="95" y2="70" stroke="black" stroke-width="4" stroke-linecap="round" />
    <line x1="105" y1="70" x2="172" y2="28" stroke="black" stroke-width="4" stroke-linecap="round" />`,
} as const;

export type BrowKey = keyof typeof brows;

// ---- Eye renderers (each returns one eye, parameterized) ----
type EyeRenderer = (side: 'L' | 'R', px: number, py: number, fid: string) => string;

export const eyes: Record<string, EyeRenderer> = {
  open: (side, px, py) => {
    const cx = side === 'L' ? 70 : 130;
    return `
    <circle cx="${cx}" cy="100" r="25" fill="white" stroke="black" stroke-width="3" />
    <circle cx="${px}" cy="${py}" r="12" fill="black" />`;
  },
  wide: (side, px, py) => {
    const cx = side === 'L' ? 70 : 130;
    return `
    <circle cx="${cx}" cy="100" r="28" fill="white" stroke="black" stroke-width="3" />
    <circle cx="${px}" cy="${py}" r="13" fill="black" />`;
  },
  'lidded-light': (side, px, py, fid) => {
    const cx = side === 'L' ? 70 : 130;
    const left = cx - 23;
    const right = cx + 23;
    const clipId = `clip-ll-${fid}-${side}`;
    return `
    <defs><clipPath id="${clipId}"><path d="M ${left} 92 L ${right} 92 A 25 25 0 0 1 ${left} 92 Z" /></clipPath></defs>
    <path d="M ${left} 92 L ${right} 92 A 25 25 0 0 1 ${left} 92 Z" fill="white" stroke="black" stroke-width="3" />
    <circle cx="${px}" cy="${py + 2}" r="11" fill="black" clip-path="url(#${clipId})" />`;
  },
  'lidded-heavy': (side, px, py, fid) => {
    const cx = side === 'L' ? 70 : 130;
    const left = cx - 25;
    const right = cx + 25;
    const clipId = `clip-lh-${fid}-${side}`;
    return `
    <defs><clipPath id="${clipId}"><path d="M ${left} 100 L ${right} 100 A 25 25 0 0 1 ${left} 100 Z" /></clipPath></defs>
    <path d="M ${left} 100 L ${right} 100 A 25 25 0 0 1 ${left} 100 Z" fill="white" stroke="black" stroke-width="3" />
    <circle cx="${px}" cy="${py + 5}" r="12" fill="black" clip-path="url(#${clipId})" />`;
  },
  narrowed: (side, px, py, fid) => {
    const cx = side === 'L' ? 70 : 130;
    const left = cx - 24;
    const right = cx + 24;
    const clipId = `clip-nr-${fid}-${side}`;
    return `
    <defs><clipPath id="${clipId}"><path d="M ${left} 95 L ${right} 95 A 24 24 0 0 1 ${right} 108 L ${left} 108 A 24 24 0 0 1 ${left} 95 Z" /></clipPath></defs>
    <path d="M ${left} 95 L ${right} 95 A 24 24 0 0 1 ${right} 108 L ${left} 108 A 24 24 0 0 1 ${left} 95 Z" fill="white" stroke="black" stroke-width="3" />
    <circle cx="${px}" cy="${py}" r="11" fill="black" clip-path="url(#${clipId})" />`;
  },
  sad: (side, px, py, fid) => {
    const cx = side === 'L' ? 70 : 130;
    const left = cx - 25;
    const right = cx + 25;
    const clipId = `clip-sd-${fid}-${side}`;
    return `
    <defs><clipPath id="${clipId}"><circle cx="${cx}" cy="100" r="25" /></clipPath></defs>
    <circle cx="${cx}" cy="100" r="25" fill="white" stroke="black" stroke-width="3" />
    <circle cx="${px}" cy="${py - 4}" r="12" fill="black" clip-path="url(#${clipId})" />
    <path d="M ${left + 2} 108 Q ${cx} 116 ${right - 2} 108" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`;
  },
};

export type EyeKey = keyof typeof eyes;

// ---- Mouth shapes ----
export const mouths = {
  'tiny-smile': `<path d="M 86 161 Q 100 167 114 161" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'small-smile': `<path d="M 82 160 Q 100 170 118 160" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  smile: `<path d="M 65 158 Q 100 172 135 158" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  grin: `<path d="M 70 152 L 130 152 Q 100 188 70 152 Z" fill="white" stroke="black" stroke-width="3" stroke-linejoin="round" />`,
  'smirk-right': `<path d="M 78 161 Q 101 170 124 152" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'short-line': `<line x1="90" y1="160" x2="110" y2="160" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'flat-line': `<line x1="85" y1="160" x2="115" y2="160" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'flat-tight': `<line x1="88" y1="162" x2="112" y2="162" stroke="black" stroke-width="4" stroke-linecap="round" />`,
  'frown-small': `<path d="M 80 165 Q 100 155 120 165" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  frown: `<path d="M 75 168 Q 100 148 125 168" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  grimace: `<path d="M 72 162 Q 86 156 100 162 Q 114 168 128 158" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />`,
  'open-curious': `<ellipse cx="100" cy="162" rx="5" ry="6" fill="white" stroke="black" stroke-width="3" />`,
  'open-oh': `<ellipse cx="100" cy="162" rx="8" ry="11" fill="white" stroke="black" stroke-width="3" />`,
  'frown-open': `<path d="M 75 168 Q 100 148 125 168 Q 100 165 75 168 Z" fill="white" stroke="black" stroke-width="3" stroke-linejoin="round" />`,
  'angry-snarl': `<path d="M 60 160 L 132 160 L 138 172" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
} as const;

export type MouthKey = keyof typeof mouths;

// ---- Gaze offsets ----
export const gazeOffsets: Record<GazeCode, { dx: number; dy: number }> = {
  G1: { dx: 0, dy: 0 },
  G2: { dx: -3, dy: -10 },
  G3: { dx: 0, dy: 10 },
};

// ---- Expression definitions ----
export interface ExpressionDef {
  code: ExpressionCode;
  name: string;
  category: 'resting' | 'warm' | 'curious' | 'serious';
  brows: BrowKey;
  eyes: EyeKey;
  mouth: MouthKey;
  defaultGaze?: GazeCode;
}

export const expressions: ExpressionDef[] = [
  // RESTING
  { code: 'A1', name: 'neutral-attentive', category: 'resting', brows: 'flat', eyes: 'open', mouth: 'tiny-smile' },
  { code: 'A2', name: 'soft', category: 'resting', brows: 'relaxed', eyes: 'open', mouth: 'small-smile' },
  { code: 'A3', name: 'thoughtful', category: 'resting', brows: 'thoughtful', eyes: 'open', mouth: 'short-line', defaultGaze: 'G2' },
  { code: 'A4', name: 'still', category: 'resting', brows: 'flat', eyes: 'lidded-light', mouth: 'flat-line' },

  // WARM
  { code: 'A5', name: 'smile', category: 'warm', brows: 'flat', eyes: 'open', mouth: 'smile' },
  { code: 'A6', name: 'grin', category: 'warm', brows: 'lifted-light', eyes: 'open', mouth: 'grin' },
  { code: 'A7', name: 'amused', category: 'warm', brows: 'lifted-light', eyes: 'lidded-light', mouth: 'small-smile' },
  { code: 'A8', name: 'smirk', category: 'warm', brows: 'flat', eyes: 'lidded-heavy', mouth: 'smirk-right' },
  { code: 'A9', name: 'delighted', category: 'warm', brows: 'lifted', eyes: 'wide', mouth: 'smile' },

  // CURIOUS
  { code: 'A10', name: 'curious', category: 'curious', brows: 'lifted', eyes: 'open', mouth: 'open-curious' },
  { code: 'A11', name: 'surprised', category: 'curious', brows: 'lifted-high', eyes: 'wide', mouth: 'open-oh' },
  { code: 'A12', name: 'skeptical', category: 'curious', brows: 'asymmetric-right-up', eyes: 'lidded-heavy', mouth: 'flat-line' },

  // SERIOUS
  { code: 'A13', name: 'concerned', category: 'serious', brows: 'concerned', eyes: 'open', mouth: 'frown-small' },
  { code: 'A14', name: 'hesitant', category: 'serious', brows: 'furrowed-light', eyes: 'open', mouth: 'flat-line' },
  { code: 'A15', name: 'sad', category: 'serious', brows: 'sad-high', eyes: 'sad', mouth: 'frown', defaultGaze: 'G3' },
  { code: 'A16', name: 'grimace', category: 'serious', brows: 'sad-high', eyes: 'wide', mouth: 'frown-open' },
  { code: 'A17', name: 'frustrated', category: 'serious', brows: 'furrowed-light', eyes: 'narrowed', mouth: 'frown-small' },
  { code: 'A18', name: 'angry', category: 'serious', brows: 'angry', eyes: 'open', mouth: 'angry-snarl' },
];

export function getExpression(code: ExpressionCode): ExpressionDef | undefined {
  return expressions.find(e => e.code === code);
}
