import type { KeyStyle } from './types.ts';

export const INITIAL_KEY_STYLES: Record<string, KeyStyle> = {
  // Sci Row 1
  calc: { top: 452, left: 55, width: 57, height: 33 },
  integral: { top: 452, left: 120, width: 57, height: 33 },
  inv: { top: 452, left: 322, width: 57, height: 33 },
  log: { top: 452, left: 388, width: 57, height: 33 },
  // Sci Row 2
  frac: { top: 512, left: 55, width: 57, height: 33 },
  sqrt: { top: 512, left: 120, width: 57, height: 33 },
  sqr: { top: 512, left: 190, width: 57, height: 33 },
  pwr: { top: 512, left: 256, width: 57, height: 33 },
  log10: { top: 512, left: 322, width: 57, height: 33 },
  ln: { top: 512, left: 388, width: 57, height: 33 },
  // Sci Row 3
  A: { top: 566, left: 56, width: 57, height: 33 },
  B: { top: 566, left: 120, width: 57, height: 33 },
  C: { top: 566, left: 190, width: 57, height: 33 },
  sin: { top: 566, left: 256, width: 57, height: 33 },
  cos: { top: 566, left: 322, width: 57, height: 33 },
  tan: { top: 566, left: 388, width: 57, height: 33 },
  // Sci Row 4
  rcl: { top: 626, left: 55, width: 57, height: 33 },
  eng: { top: 626, left: 120, width: 57, height: 33 },
  'paren-open': { top: 626, left: 190, width: 57, height: 33 },
  'paren-close': { top: 626, left: 256, width: 57, height: 35 },
  sd: { top: 626, left: 322, width: 57, height: 33 },
  mplus: { top: 626, left: 388, width: 57, height: 33 },
  // Navigation
  shift: { top: 367, left: 61, width: 41, height: 40 },
  alpha: { top: 367, left: 122, width: 43, height: 42 },
  up: { top: 363, left: 230, width: 40, height: 41 },
  down: { top: 430, left: 232, width: 37, height: 48 },
  left: { top: 404, left: 175, width: 41, height: 35 },
  right: { top: 401, left: 283, width: 43, height: 35 },
  mode: { top: 372, left: 339, width: 37, height: 38 },
  // Num Row 1
  '7': { top: 689, left: 50, width: 68, height: 46 },
  '8': { top: 690, left: 136, width: 68, height: 46 },
  '9': { top: 690, left: 216, width: 68, height: 46 },
  del: { top: 689, left: 298, width: 66, height: 46 },
  ac: { top: 690, left: 380, width: 66, height: 46 },
  // Num Row 2
  '4': { top: 760, left: 50, width: 68, height: 46 },
  '5': { top: 760, left: 135, width: 68, height: 46 },
  '6': { top: 760, left: 216, width: 68, height: 46 },
  mul: { top: 760, left: 296, width: 66, height: 46 },
  div: { top: 760, left: 380, width: 66, height: 46 },
  // Num Row 3
  '1': { top: 830, left: 50, width: 68, height: 46 },
  '2': { top: 830, left: 135, width: 68, height: 46 },
  '3': { top: 830, left: 216, width: 68, height: 46 },
  add: { top: 830, left: 298, width: 66, height: 46 },
  sub: { top: 830, left: 380, width: 66, height: 46 },
  // Num Row 4
  '0': { top: 900, left: 50, width: 68, height: 46 },
  dot: { top: 900, left: 135, width: 68, height: 46 },
  exp: { top: 900, left: 214, width: 68, height: 46 },
  ans: { top: 900, left: 298, width: 68, height: 46 },
  solve: { top: 900, left: 380, width: 66, height: 46 },
};

const NUMERIC_KEY_IDS = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'del', 'ac', 'mul', 'div', 'add', 'sub', 'dot', 'exp', 'ans', 'solve',
]);

const NAV_KEY_IDS = new Set(['shift', 'alpha', 'up', 'down', 'left', 'right', 'mode']);

/** Match the flash/press shape already used by the keypad CSS. */
export function keyBorderRadius(id: string): string {
  switch (id) {
    case 'shift':
    case 'alpha':
      return '50% 50% 40% 40%';
    case 'up':
      return '50% 50% 5px 5px';
    case 'down':
      return '5px 5px 50% 50%';
    case 'left':
      return '50% 5px 5px 50%';
    case 'right':
      return '5px 50% 50% 5px';
    case 'mode':
      return '12px';
    default:
      return NUMERIC_KEY_IDS.has(id) ? '7px' : '5px';
  }
}

export function isNavKey(id: string): boolean {
  return NAV_KEY_IDS.has(id);
}

export function formatKeyStylesSource(styles: Record<string, KeyStyle>): string {
  const order = Object.keys(INITIAL_KEY_STYLES);
  const extra = Object.keys(styles).filter(id => !order.includes(id));
  const lines = [...order, ...extra].flatMap(id => {
    const s = styles[id];
    if (!s) return [];
    const key = /^[A-Za-z_][A-Za-z0-9_]*$/.test(id) ? id : `'${id}'`;
    return [`  ${key}: { top: ${s.top}, left: ${s.left}, width: ${s.width}, height: ${s.height} },`];
  });
  return `export const INITIAL_KEY_STYLES: Record<string, KeyStyle> = {\n${lines.join('\n')}\n};\n`;
}

export const PATS = ['!', 'sinh⁻¹(', 'cosh⁻¹(', 'tanh⁻¹(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sinh(', 'cosh(', 'tanh(', 'sin(', 'cos(', 'tan(', '×10^', 'sqrt(', 'sqr(', 'cube(', 'pwr(', 'root(', 'frac(', 'mix(', 'int(', 'diff(', 'e^(', '10^(', 'log_b(', 'log10(', 'ln(', 'abs(', 'Rnd(', 'Ans', 'nCr(', 'nPr(', 'Σ(', 'pol(', 'rec(', 'RanInt(', 'Ran#', '^(', 'root(3,'];

export const CURSOR_PATS = ['root(', 'sqrt(', 'sqr(', 'cube(', 'frac(', 'mix(', 'pwr(', 'diff(', 'int(', 'abs(', 'Rnd(', 'log_b(', 'log10(', 'ln(', 'e^(', '10^(', 'sinh⁻¹(', 'cosh⁻¹(', 'tanh⁻¹(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sinh(', 'cosh(', 'tanh(', 'sin(', 'cos(', 'tan(', 'Σ(', 'nCr(', 'nPr(', 'pow(', 'exp(', 'RanInt(', ','];

export const DELETE_STEMS = ['pwr', 'root', 'abs', 'Rnd', 'log10', 'ln', 'sinh⁻¹', 'cosh⁻¹', 'tanh⁻¹', 'sinh', 'cosh', 'tanh', 'sin', 'cos', 'tan', 'sum', 'int', 'fac', 'frac', 'sqrt', 'sqr', 'cube', 'log_b'];
