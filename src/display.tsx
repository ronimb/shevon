import React from 'react';
import { DEFAULT_FORMAT, formatForDisplay, type DisplayFormat } from './format.ts';

/**
 * Shared template table — the single source of truth for turning evaluator IR
 * stems (`sqrt(`, `sin(`, `frac(`, …) into what the hardware paints.
 *
 * Both the LCD (`formatMath`, HTML) and the History pane (`toLaTeX`, LaTeX) walk
 * THIS list so the two renderers cannot drift: every stem here has a `html` and a
 * `latex` painter. An IR stem must never survive onto the screen as literal
 * ASCII — closed OR open. See `docs/prompts/now-visual-slice.md` (vis-no-literal /
 * ir-leak) and `docs/principles.md`.
 */

const CURSOR = '‸';

const isEmpty = (text: string) => {
  if (!text) return true;
  const clean = text.replace(/[‸⬚]/g, '');
  return clean.trim() === '';
};

/** LCD slot: keep the caret, otherwise show an empty ⬚ box for a missing arg. */
const slot = (text: unknown): string => {
  if (typeof text !== 'string') return '<span class="empty-slot">⬚</span>';
  if (text.includes(CURSOR)) return text;
  if (isEmpty(text)) return '<span class="empty-slot">⬚</span>';
  return text;
};

/** Find the `)` that balances the `(` at `startIdx`; null when it is unclosed. */
const getBalanced = (s: string, startIdx: number): { content: string; endIdx: number } | null => {
  let count = 0;
  for (let i = startIdx; i < s.length; i++) {
    if (s[i] === '(') count++;
    else if (s[i] === ')') {
      count--;
      if (count === 0) return { content: s.substring(startIdx + 1, i), endIdx: i };
    }
  }
  return null;
};

const splitTopLevelArgs = (s: string): string[] => {
  const args: string[] = [];
  let current = '';
  let pCount = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') pCount++;
    else if (s[i] === ')') pCount--;
    if (s[i] === ',' && pCount === 0) {
      args.push(current);
      current = '';
    } else {
      current += s[i];
    }
  }
  args.push(current);
  return args;
};

interface TemplateSpec {
  stem: string;
  html: (a: string[], closed: boolean) => string;
  latex: (a: string[], closed: boolean) => string;
}

/** Only paint `)` when the IR actually has one — user types the closer. */
const parenBody = (inner: string, closed: boolean) => `(${inner}${closed ? ')' : ''}`;

/** LCD function-name glyph (sin, ln, Abs, Pol, …) — never the raw `name(` stem. */
const namedFn = (label: string) => (a: string[], closed: boolean) =>
  `<span class="trig-fun">${label}</span>${parenBody(slot(a[0]), closed)}`;
const lx = (v: string | undefined) => v ?? '';

/**
 * Every `PATS` function stem, longest-first so the earliest/greediest match
 * wins. Trig / hyp / `ln` are here too: on the LCD they paint a styled function
 * name, never the ASCII stem.
 */
const TEMPLATE_SPECS: TemplateSpec[] = [
  { stem: 'sinh⁻¹', html: namedFn('sinh⁻¹'), latex: a => `\\sinh^{-1}(${lx(a[0])})` },
  { stem: 'cosh⁻¹', html: namedFn('cosh⁻¹'), latex: a => `\\cosh^{-1}(${lx(a[0])})` },
  { stem: 'tanh⁻¹', html: namedFn('tanh⁻¹'), latex: a => `\\tanh^{-1}(${lx(a[0])})` },
  { stem: 'sin⁻¹', html: namedFn('sin⁻¹'), latex: a => `\\arcsin(${lx(a[0])})` },
  { stem: 'cos⁻¹', html: namedFn('cos⁻¹'), latex: a => `\\arccos(${lx(a[0])})` },
  { stem: 'tan⁻¹', html: namedFn('tan⁻¹'), latex: a => `\\arctan(${lx(a[0])})` },
  { stem: 'sinh', html: namedFn('sinh'), latex: a => `\\sinh(${lx(a[0])})` },
  { stem: 'cosh', html: namedFn('cosh'), latex: a => `\\cosh(${lx(a[0])})` },
  { stem: 'tanh', html: namedFn('tanh'), latex: a => `\\tanh(${lx(a[0])})` },
  { stem: 'sin', html: namedFn('sin'), latex: a => `\\sin(${lx(a[0])})` },
  { stem: 'cos', html: namedFn('cos'), latex: a => `\\cos(${lx(a[0])})` },
  { stem: 'tan', html: namedFn('tan'), latex: a => `\\tan(${lx(a[0])})` },
  { stem: 'ln', html: namedFn('ln'), latex: a => `\\ln(${lx(a[0])})` },
  {
    stem: 'nCr',
    html: a => `<span class="comb-perm">${slot(a[0])}<span class="comb-perm-sym">C</span>${slot(a[1] || '')}</span>`,
    latex: a => `{\\textstyle \\binom{${lx(a[0])}}{${lx(a[1])}}}`,
  },
  {
    stem: 'nPr',
    html: a => `<span class="comb-perm">${slot(a[0])}<span class="comb-perm-sym">P</span>${slot(a[1] || '')}</span>`,
    latex: a => `{}^{${lx(a[0])}}P_{${lx(a[1])}}`,
  },
  {
    stem: 'pol',
    html: (a, closed) => `<span class="trig-fun">Pol</span>${parenBody(`${slot(a[0])},${slot(a[1] || '')}`, closed)}`,
    latex: a => `\\operatorname{Pol}(${lx(a[0])},${lx(a[1])})`,
  },
  {
    stem: 'rec',
    html: (a, closed) => `<span class="trig-fun">Rec</span>${parenBody(`${slot(a[0])},${slot(a[1] || '')}`, closed)}`,
    latex: a => `\\operatorname{Rec}(${lx(a[0])},${lx(a[1])})`,
  },
  {
    stem: 'mix',
    html: a => `<div class="mix-container"><span class="mix-whole">${slot(a[0])}</span><div class="frac-container"><span class="frac-num">${slot(a[1] || '')}</span><span class="frac-den">${slot(a[2] || '')}</span></div></div>`,
    latex: a => `${lx(a[0])}\\frac{${lx(a[1])}}{${lx(a[2])}}`,
  },
  {
    stem: 'frac',
    html: a => `<div class="frac-container"><span class="frac-num">${slot(a[0])}</span><span class="frac-den">${slot(a[1] || '')}</span></div>`,
    latex: a => `\\frac{${lx(a[0])}}{${lx(a[1])}}`,
  },
  {
    stem: 'int',
    html: a => `<div class="int-container"><div class="int-bounds"><span>${slot(a[2])}</span><span>${slot(a[1])}</span></div><span class="int-symbol">∫</span><div class="int-body">${slot(a[0])} d${slot(a[3] || 'x')}</div></div>`,
    latex: a => `\\int_{${lx(a[1])}}^{${lx(a[2])}} ${lx(a[0])} \\, d${a[3] || 'x'}`,
  },
  {
    stem: 'diff',
    html: a => {
      const varName = a[1] || 'x';
      const varSilent = varName.replace(CURSOR, '');
      return `<div class="diff-container"><div class="diff-frac"><span class="diff-top">d</span><span>d${slot(varName)}</span></div>(${slot(a[0])})<div class="diff-at">${varSilent}=${slot(a[2])}</div></div>`;
    },
    latex: a => `\\frac{d}{d${a[1] || 'x'}}\\left(${lx(a[0])}\\right)\\bigg|_{${a[1] || 'x'}=${lx(a[2])}}`,
  },
  {
    stem: 'root',
    html: a => `<span class="root"><span class="sup">${slot(a[0])}</span><span class="root-symbol">√</span><span class="root-body">${slot(a[1] || '')}</span></span>`,
    latex: a => `\\sqrt[${lx(a[0])}]{${lx(a[1])}}`,
  },
  {
    stem: 'sqrt',
    html: a => `<span class="root"><span class="root-symbol">√</span><span class="root-body">${slot(a[0])}</span></span>`,
    latex: a => `\\sqrt{${lx(a[0])}}`,
  },
  { stem: 'sqr', html: a => `${slot(a[0])}<span class="sup">2</span>`, latex: a => `{${lx(a[0])}}^2` },
  { stem: 'cube', html: a => `${slot(a[0])}<span class="sup">3</span>`, latex: a => `{${lx(a[0])}}^3` },
  {
    stem: 'log_b',
    html: (a, closed) => `log<span class="sub">${slot(a[0])}</span>${parenBody(slot(a[1] || ''), closed)}`,
    latex: a => `\\log_{${lx(a[0])}}(${lx(a[1])})`,
  },
  { stem: 'log10', html: (a, closed) => `log${parenBody(slot(a[0]), closed)}`, latex: a => `\\log_{10}(${lx(a[0])})` },
  { stem: 'e^', html: a => `e<span class="sup">${slot(a[0])}</span>`, latex: a => `e^{${lx(a[0])}}` },
  { stem: '10^', html: a => `10<span class="sup">${slot(a[0])}</span>`, latex: a => `10^{${lx(a[0])}}` },
  { stem: 'pwr', html: a => `${slot(a[0])}<span class="sup">${slot(a[1] || '')}</span>`, latex: a => `{${lx(a[0])}}^{${lx(a[1])}}` },
  {
    stem: 'Σ',
    html: a => `<div class="sum-container"><div class="sum-bounds"><span>${slot(a[3])}</span><span>${slot(a[1] || 'x')}=${slot(a[2])}</span></div><span class="sum-symbol">Σ</span><div class="sum-body">${slot(a[0])}</div></div>`,
    latex: a => `\\sum_{${a[1] || 'x'}=${lx(a[2])}}^{${lx(a[3])}} ${lx(a[0])}`,
  },
  {
    stem: 'RanInt',
    html: (a, closed) => `<span class="trig-fun">RanInt#</span>${parenBody(`${slot(a[0])},${slot(a[1] || '')}`, closed)}`,
    latex: a => `\\operatorname{RanInt}(${lx(a[0])},${lx(a[1])})`,
  },
  { stem: 'Rnd', html: (a, closed) => `<span class="trig-fun">Rnd</span>${parenBody(slot(a[0]), closed)}`, latex: a => `\\operatorname{Rnd}(${lx(a[0])})` },
  { stem: 'abs', html: (a, closed) => `<span class="trig-fun">Abs</span>${parenBody(slot(a[0]), closed)}`, latex: a => `|${lx(a[0])}|` },
  // Legacy IR aliases still emitted by `toLaTeX` history; harmless on the LCD.
  { stem: 'factorial', html: a => `${slot(a[0])}!`, latex: a => `{${lx(a[0])}}!` },
  { stem: 'exp', html: a => `e<span class="sup">${slot(a[0])}</span>`, latex: a => `e^{${lx(a[0])}}` },
  { stem: 'pow', html: a => `${slot(a[0])}<span class="sup">${slot(a[1] || '')}</span>`, latex: a => `{${lx(a[0])}}^{${lx(a[1])}}` },
];

/**
 * Walk the string replacing every template stem with its painted form. Shared by
 * the LCD and the History pane via the `paint` selector.
 *
 * Closed `name( … )` → glyph with the balanced contents as the body. Open
 * `name( …` with no matching `)` → the SAME glyph, with the rest of the string as
 * the body (mirrors how `^(` already paints an open superscript). We never
 * `break` on an unclosed stem: the open template is painted and the walk
 * continues into its body, so a nested open `^(` (or another template) inside an
 * open radical still renders. This is what keeps IR stems like `sqrt` off screen
 * while you are mid-type.
 */
const paintTemplates = (input: string, paint: (spec: TemplateSpec, args: string[], closed: boolean) => string): string => {
  let out = '';
  let rest = input;
  // Left-to-right: append painted output to `out` and keep scanning only the
  // unprocessed tail. Painted output is never re-scanned, so a painter that
  // emits its own name (e.g. LaTeX `\sin(`) can't re-match its stem.
  while (rest.length > 0) {
    let earliestIdx = Infinity;
    let bestSpec: TemplateSpec | null = null;
    for (const spec of TEMPLATE_SPECS) {
      const idx = rest.indexOf(spec.stem + '(');
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        bestSpec = spec;
      }
    }

    if (!bestSpec) {
      out += rest;
      break;
    }

    const openIdx = earliestIdx + bestSpec.stem.length; // index of the '('
    const bal = getBalanced(rest, openIdx);
    out += rest.substring(0, earliestIdx); // text before the stem is stem-free
    let content: string;
    let after: string;
    if (bal) {
      content = rest.substring(openIdx + 1, bal.endIdx);
      after = rest.substring(bal.endIdx + 1);
    } else {
      // Unclosed template: the body is everything the user has typed so far.
      content = rest.substring(openIdx + 1);
      after = '';
    }
    const innerProcessed = paintTemplates(content, paint);
    const args = splitTopLevelArgs(innerProcessed);
    out += paint(bestSpec, args, !!bal);
    rest = after;
  }
  return out;
};

export const toLaTeX = (expr: string): string => {
  const proc = expr.replace(/[‸⬚]/g, '');
  let s = paintTemplates(proc, (spec, args, closed) => spec.latex(args, closed));

  // Basic replacements for symbols outside templates
  s = s.replace(/×/g, '\\times ')
       .replace(/÷/g, '\\div ')
       .replace(/π/g, '\\pi ')
       .replace(/×10\^/g, '\\times 10^');

  return s;
};

export const formatMath = (input: string): string => {
  let h = input;

  // Replace factorial internal representation back to symbol for display
  h = h.replace(/factorial\(([^)]*)\)/g, '$1!');

  // Protect equals signs temporarily to avoid interference with tag replacements
  h = h.replace(/=/g, '___EQUALS___');

  h = paintTemplates(h, (spec, args, closed) => spec.html(args, closed));

  h = h.replace(/Ran#/g, '<span class="trig-fun">Ran#</span>');

  h = h.replace(/→([A-M X-Y])/g, '<span style="font-size: 0.8em; margin: 0 4px;">→</span>$1')
       .replace(/\^\(([^)]*)\)/g, (_m, p1) => `<span class="sup">${slot(p1)}</span>`)
       .replace(/\^\(([^)]*)$/g, (_m, p1) => `<span class="sup">${slot(p1)}</span>`)
       .replace(/\^-1/g, '<span class="sup">-1</span>')
       // x² / x³ keys insert unicode; paint them like `^(2)` / `^(3)` so they
       // match the x^y superscript (same .sup metrics, not a raw glyph).
       .replace(/²/g, '<span class="sup">2</span>')
       .replace(/³/g, '<span class="sup">3</span>')
       .replace(/‸/g, '<span class="cursor"></span>');

  // Restore equals signs with proper styling
  h = h.replace(/___EQUALS___/g, '<span class="equal-symbol mx-1">=</span>');

  h = h.replace(/<span class="empty-slot">⬚<\/span><span class="cursor"><\/span>/g, '<span class="cursor"></span>')
       .replace(/<span class="cursor"><\/span><span class="empty-slot">⬚<\/span>/g, '<span class="cursor"></span>');

  // Custom absolute-positioned HTML spans for rendering overbars and hats beautifully inside monospace fonts
  h = h
    .replace(/(x\u0304|x̄|x̅|X\u0304|X̄|X̅)/g, '<span class="relative inline-block" style="line-height: 1em;">x<span class="absolute left-[0.025em] right-[0.025em] -top-[0.08em] border-t-[1.5px] border-current"></span></span>')
    .replace(/(y\u0304|ȳ|y̅|Y\u0304|Ȳ|Y̅)/g, '<span class="relative inline-block" style="line-height: 1em;">y<span class="absolute left-[0.025em] right-[0.025em] -top-[0.08em] border-t-[1.5px] border-current"></span></span>')
    .replace(/(x\u03021|x̂1|X\u03021|X̂1)/g, '<span class="inline-flex items-baseline" style="line-height: 1em;"><span class="relative inline-block">x<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span><sub class="text-[0.6em] ml-[0.05em] align-sub">1</sub></span>')
    .replace(/(x\u03022|x̂2|X\u03022|X̂2)/g, '<span class="inline-flex items-baseline" style="line-height: 1em;"><span class="relative inline-block">x<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span><sub class="text-[0.6em] ml-[0.05em] align-sub">2</sub></span>')
    .replace(/(x\u0302|x̂|X\u0302|X̂)/g, '<span class="relative inline-block" style="line-height: 1em;">x<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span>')
    .replace(/(y\u0302|ŷ|Y\u0302|Ŷ)/g, '<span class="relative inline-block" style="line-height: 1em;">y<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span>');

  return h;
};

export const renderMathSymbol = (sym: string): React.ReactNode => {
  const norm = sym.normalize('NFD');
  if (norm.startsWith('x') && (norm.includes('\u0304') || norm.includes('\u0305') || norm.includes('̄') || norm.includes('̅'))) {
    return (
      <span className="relative inline-block" style={{ lineHeight: '1em' }}>
        x<span className="absolute left-[0.025em] right-[0.025em] -top-[0.05em] border-t-[1.5px] border-current" />
      </span>
    );
  }
  if (norm.startsWith('y') && (norm.includes('\u0304') || norm.includes('\u0305') || norm.includes('̄') || norm.includes('̅'))) {
    return (
      <span className="relative inline-block" style={{ lineHeight: '1em' }}>
        y<span className="absolute left-[0.025em] right-[0.025em] -top-[0.05em] border-t-[1.5px] border-current" />
      </span>
    );
  }
  if (norm.startsWith('x') && (norm.includes('\u0302') || norm.includes('̂'))) {
    const has1 = norm.includes('1');
    const has2 = norm.includes('2');
    return (
      <span className="inline-flex items-baseline" style={{ lineHeight: '1em' }}>
        <span className="relative inline-block">
          x<span className="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span>
        </span>
        {has1 && <sub className="text-[0.6em] ml-[0.05em] align-sub">1</sub>}
        {has2 && <sub className="text-[0.6em] ml-[0.05em] align-sub">2</sub>}
      </span>
    );
  }
  if (norm.startsWith('y') && (norm.includes('\u0302') || norm.includes('̂'))) {
    return (
      <span className="relative inline-block" style={{ lineHeight: '1em' }}>
        y<span className="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span>
      </span>
    );
  }
  return <span>{sym}</span>;
};

/** Blinking COMP-style caret in EQN/STAT editor cells. */
export const EditorCaret: React.FC<{ value: string; active: boolean }> = ({ value, active }) => (
  <>
    {value}
    {active ? <span className="cursor" /> : null}
  </>
);

export const SciNotation: React.FC<{ mantissa: string; exponent: number }> = ({ mantissa, exponent }) => (
  <span className="inline-flex items-center font-mono select-all">
    <span>{mantissa}</span>
    <span className="text-[0.6em] font-sans mx-0.5 self-center translate-y-[0.05em]">×10</span>
    <span className="text-[0.8em] self-start relative -top-[0.25em] font-bold">{exponent}</span>
  </span>
);

/** Casio-style a+bi for EQN complex roots (E-28). */
export function formatComplexPair(real: number, imag: number): string {
  const near0 = (n: number) => Math.abs(n) < 1e-12;
  const near1 = (n: number) => Math.abs(Math.abs(n) - 1) < 1e-12;
  const trim = (n: number) => {
    const s = n.toPrecision(10);
    return String(Number(s));
  };
  if (near0(imag)) return trim(real);
  const unit = near1(imag);
  const imagAbs = unit ? 'i' : `${trim(Math.abs(imag))}i`;
  if (near0(real)) return imag < 0 ? `-${imagAbs}` : imagAbs;
  return `${trim(real)}${imag < 0 ? '-' : '+'}${imagAbs}`;
}

export const formatResultNumber = (
  n: number | undefined | null,
  fmt: DisplayFormat = DEFAULT_FORMAT,
): React.ReactNode => {
    if (n === undefined || n === null || isNaN(n)) return "Error";
    if (!isFinite(n)) return "Error";

    const shown = formatForDisplay(n, fmt);
    if (shown.type === 'sci') {
      return <SciNotation mantissa={shown.mantissa} exponent={shown.exponent} />;
    }
    return <span className="font-mono select-all">{shown.text}</span>;
};
