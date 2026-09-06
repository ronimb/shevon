import type { KeyStyle } from './types.ts';

export const INITIAL_KEY_STYLES: Record<string, KeyStyle> = {
  // Sci Row 1 (sr1 top 450)
  calc: { top: 450, left: 55, width: 57, height: 33 },
  integral: { top: 450, left: 120, width: 57, height: 33 },
  inv: { top: 450, left: 317, width: 57, height: 33 },
  log: { top: 450, left: 383, width: 57, height: 33 },
  // Sci Row 2 (sr2 top 504)
  frac: { top: 504, left: 55, width: 57, height: 33 },
  sqrt: { top: 504, left: 120, width: 57, height: 33 },
  sqr: { top: 504, left: 185, width: 57, height: 33 },
  pwr: { top: 504, left: 252, width: 57, height: 33 },
  log10: { top: 504, left: 317, width: 57, height: 33 },
  ln: { top: 504, left: 383, width: 57, height: 33 },
  // Sci Row 3 (sr3 top 562)
  A: { top: 562, left: 55, width: 57, height: 33 },
  B: { top: 562, left: 120, width: 57, height: 33 },
  C: { top: 562, left: 185, width: 57, height: 33 },
  sin: { top: 562, left: 252, width: 57, height: 33 },
  cos: { top: 562, left: 317, width: 57, height: 33 },
  tan: { top: 562, left: 383, width: 57, height: 33 },
  // Sci Row 4 (sr4 top 616)
  rcl: { top: 616, left: 55, width: 57, height: 33 },
  eng: { top: 616, left: 120, width: 57, height: 33 },
  'paren-open': { top: 616, left: 185, width: 57, height: 33 },
  'paren-close': { top: 616, left: 252, width: 57, height: 33 },
  sd: { top: 616, left: 317, width: 57, height: 33 },
  mplus: { top: 616, left: 383, width: 57, height: 33 },
  // Navigation
  shift: { top: 366, left: 60, width: 41, height: 40 },
  alpha: { top: 363, left: 121, width: 43, height: 42 },
  up: { top: 356, left: 228, width: 44, height: 43 },
  down: { top: 427, left: 230, width: 46, height: 48 },
  left: { top: 393, left: 178, width: 41, height: 44 },
  right: { top: 393, left: 283, width: 43, height: 44 },
  mode: { top: 363, left: 335, width: 42, height: 44 },
  // Num Row 1 (nr1 685)
  '7': { top: 685, left: 50, width: 75, height: 55 },
  '8': { top: 685, left: 132, width: 75, height: 55 },
  '9': { top: 685, left: 215, width: 75, height: 55 },
  del: { top: 685, left: 297, width: 75, height: 55 },
  ac: { top: 685, left: 379, width: 75, height: 55 },
  // Num Row 2 (nr2 750)
  '4': { top: 750, left: 50, width: 75, height: 55 },
  '5': { top: 750, left: 132, width: 75, height: 55 },
  '6': { top: 750, left: 215, width: 75, height: 55 },
  mul: { top: 750, left: 297, width: 75, height: 55 },
  div: { top: 750, left: 379, width: 75, height: 55 },
  // Num Row 3 (nr3 818)
  '1': { top: 818, left: 50, width: 75, height: 55 },
  '2': { top: 818, left: 132, width: 75, height: 55 },
  '3': { top: 818, left: 215, width: 75, height: 55 },
  add: { top: 818, left: 297, width: 75, height: 55 },
  sub: { top: 818, left: 379, width: 75, height: 55 },
  // Num Row 4 (nr4 888)
  '0': { top: 888, left: 50, width: 75, height: 55 },
  dot: { top: 888, left: 132, width: 75, height: 55 },
  exp: { top: 888, left: 215, width: 75, height: 55 },
  ans: { top: 888, left: 297, width: 75, height: 55 },
  solve: { top: 888, left: 379, width: 75, height: 55 },
};

export const PATS = ['!', 'sinh⁻¹(', 'cosh⁻¹(', 'tanh⁻¹(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sinh(', 'cosh(', 'tanh(', 'sin(', 'cos(', 'tan(', '×10^', 'sqrt(', 'sqr(', 'cube(', 'pwr(', 'root(', 'frac(', 'mix(', 'int(', 'diff(', 'e^(', '10^(', 'log_b(', 'log10(', 'ln(', 'abs(', 'Rnd(', 'Ans', 'nCr(', 'nPr(', 'Σ(', 'pol(', 'rec(', 'RanInt(', 'Ran#', '^(', 'root(3,'];

export const CURSOR_PATS = ['root(', 'sqrt(', 'sqr(', 'cube(', 'frac(', 'mix(', 'pwr(', 'diff(', 'int(', 'abs(', 'Rnd(', 'log_b(', 'sinh⁻¹(', 'cosh⁻¹(', 'tanh⁻¹(', 'sinh(', 'cosh(', 'tanh(', 'sin(', 'cos(', 'tan(', 'Σ(', 'nCr(', 'nPr(', 'pow(', 'exp(', 'RanInt(', ','];

export const DELETE_STEMS = ['pwr', 'root', 'abs', 'Rnd', 'log10', 'ln', 'sinh⁻¹', 'cosh⁻¹', 'tanh⁻¹', 'sinh', 'cosh', 'tanh', 'sin', 'cos', 'tan', 'sum', 'int', 'fac', 'frac', 'sqrt', 'sqr', 'cube', 'log_b'];
