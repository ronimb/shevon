export type CalcMode =
  | 'COMP'
  | 'MENU'
  | 'SETUP'
  | 'CLR_MENU'
  | 'EQN_MENU'
  | 'EQN_QUAD'
  | 'EQN_RESULT'
  | 'STAT_MENU'
  | 'STAT_DATA'
  | 'STAT_RESULT'
  | 'STAT_RESULT_SUB'
  | 'STAT_EDITOR_MENU'
  | 'STAT_EDIT';

export type DisplayMode = 'decimal' | 'fraction';
export type AngleMode = 'DEG' | 'RAD' | 'GRA';

export type StatType = '1-VAR' | 'A+BX' | '_+CX2' | 'ln X' | 'e^X' | 'A*B^X' | 'A*X^B' | '1/X';

export interface StatEntry {
  x: string;
  y?: string;
  freq: string;
}

export interface EqnResult {
  label: string;
  value: CalcValue;
}

export interface KeyStyle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type HistoryKind = 'calc' | 'action';

export interface HistoryItem {
  id: string;
  rawInput: string;
  displayInput: string;
  /** Null for mode / setup / CLR actions that have no numeric result. */
  result: CalcValue | null;
  latex: string;
  sequence: string[];
  kind: HistoryKind;
}

export interface Vars {
  [key: string]: any;
}

/** LCD errors. offset is the caret-stripped original index of the fault token. */
export type CalcErrorKind = 'syntax' | 'math' | 'variable' | 'cantSolve' | 'timeout';

export const CALC_ERROR_LABEL: Record<CalcErrorKind, string> = {
  syntax: 'Syntax ERROR',
  math: 'Math ERROR',
  variable: 'Variable ERROR',
  cantSolve: "Can't Solve",
  timeout: 'Time Out',
};

export function calcErrorLabel(kind: CalcErrorKind): string {
  return CALC_ERROR_LABEL[kind];
}

/**
 * Evaluator result. Add kinds here — do not invent a second result type.
 * CMPLX uses `complex` (rect/polar + conjugate / arg). Pol/Rec uses `pair`.
 * BASE-N / MATRIX attach via `CalcValueExt` (`integer`, `matrix`).
 */
export type ComplexForm = 'rect' | 'polar';
export type PairKind = 'pol' | 'rec';
export type NumberBase = 2 | 8 | 10 | 16;

export interface CalcReal {
  kind: 'real';
  /** IEEE payload. Fractions / sci / ENG / DMS are display of this. */
  re: number;
}

export interface CalcComplex {
  kind: 'complex';
  re: number;
  im: number;
  /** CMPLX S⇔D toggles rect ↔ polar. EQN a+bi stays rect. */
  form: ComplexForm;
}

export interface CalcPair {
  kind: 'pair';
  a: number;
  b: number;
  pair: PairKind;
}

/** Reserved for BASE-N. Do not add a parallel integer result type. */
export interface CalcInteger {
  kind: 'integer';
  n: number;
  base: NumberBase;
}

/** Reserved for MATRIX. Do not add a parallel matrix result type. */
export interface CalcMatrix {
  kind: 'matrix';
  rows: number;
  cols: number;
  cells: number[];
}

export type CalcValue = CalcReal | CalcComplex | CalcPair;
export type CalcValueExt = CalcValue | CalcInteger | CalcMatrix;

export function calcReal(re: number): CalcReal {
  return { kind: 'real', re };
}

export function calcComplex(re: number, im: number, form: ComplexForm = 'rect'): CalcComplex {
  return { kind: 'complex', re, im, form };
}

export function calcPair(pair: PairKind, a: number, b: number): CalcPair {
  return { kind: 'pair', a, b, pair };
}

export function calcInteger(n: number, base: NumberBase = 10): CalcInteger {
  return { kind: 'integer', n, base };
}

export function conjugate(z: CalcComplex): CalcComplex {
  return { ...z, im: -z.im };
}

/** |z|. CMPLX Abs later. */
export function complexAbs(z: CalcComplex): number {
  return Math.hypot(z.re, z.im);
}

/** Principal arg in radians. Caller applies Deg / Rad / Gra. */
export function complexArg(z: CalcComplex): number {
  return Math.atan2(z.im, z.re);
}

export function complexToPolar(z: CalcComplex): CalcComplex {
  const rect = z.form === 'polar' ? complexToRect(z) : z;
  return { kind: 'complex', re: complexAbs(rect), im: complexArg(rect), form: 'polar' };
}

export function complexToRect(z: CalcComplex): CalcComplex {
  if (z.form !== 'polar') return z;
  return { kind: 'complex', re: z.re * Math.cos(z.im), im: z.re * Math.sin(z.im), form: 'rect' };
}

export function pairLabels(p: CalcPair): readonly [string, string] {
  return p.pair === 'pol' ? ['r', 'θ'] : ['x', 'y'];
}

/** Ans / STO / M+ / formatters use the primary IEEE component. */
export function calcPrimary(v: CalcValue): number {
  switch (v.kind) {
    case 'real':
      return v.re;
    case 'complex':
      return v.form === 'polar' ? zPolarReal(v) : v.re;
    case 'pair':
      return v.a;
  }
}

function zPolarReal(z: CalcComplex): number {
  return z.re * Math.cos(z.im);
}

export function isCalcReal(v: CalcValue): v is CalcReal {
  return v.kind === 'real';
}

export class CalcError extends Error {
  readonly kind: CalcErrorKind;
  readonly offset?: number;

  constructor(kind: CalcErrorKind, offset?: number) {
    super(CALC_ERROR_LABEL[kind]);
    this.name = 'CalcError';
    this.kind = kind;
    this.offset = offset;
  }
}
