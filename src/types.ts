export type CalcMode =
  | 'COMP'
  | 'MENU'
  | 'SETUP'
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
}

export interface KeyStyle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface HistoryItem {
  id: string;
  rawInput: string;
  displayInput: string;
  result: number;
  latex: string;
  sequence: string[];
}

export interface Vars {
  [key: string]: any;
}
