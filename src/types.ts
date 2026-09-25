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
  | 'STAT_RESULT_SUB';

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
  val: number;
  /** Imaginary part when the quadratic has complex roots. */
  imag?: number;
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
  result: number | null;
  latex: string;
  sequence: string[];
  kind: HistoryKind;
}

export interface Vars {
  [key: string]: any;
}

/** LCD errors. offset is the caret-stripped original index of the fault token. */
export type CalcErrorKind = 'syntax' | 'math' | 'variable' | 'cantSolve';

export const CALC_ERROR_LABEL: Record<CalcErrorKind, string> = {
  syntax: 'Syntax ERROR',
  math: 'Math ERROR',
  variable: 'Variable ERROR',
  cantSolve: "Can't Solve",
};

export function calcErrorLabel(kind: CalcErrorKind): string {
  return CALC_ERROR_LABEL[kind];
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
