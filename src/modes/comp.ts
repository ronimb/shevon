import { evaluateExpression, findPrecedingOperand, type PolRecWrite } from '../evaluator.ts';
import { DEFAULT_FORMAT } from '../format.ts';
import { CURSOR_PATS, DELETE_STEMS, PATS } from '../keys.ts';
import { CalcError, calcPrimary, type AngleMode, type CalcMode, type CalcValue, type Vars } from '../types.ts';

/** CALC/SOLVE prompt commit. Typed 0 is 0 — do not treat parseFloat("0") as empty (R7). */
export function commitPromptValue(typed: string, previous: string): number {
  const n = Number.parseFloat(typed);
  if (Number.isFinite(n)) return n;
  const p = Number.parseFloat(previous);
  return Number.isFinite(p) ? p : 0;
}

export type StoreAttempt =
  | { ok: true; value: CalcValue; varsWrite?: PolRecWrite }
  | { ok: false; error: CalcError };

/** STO operand. Ans is the numeric env binding — never String(ans) (R4). */
export function attemptStoreOperand(
  operand: string,
  scope: Vars,
  ans: number,
  angleMode: AngleMode,
  statVars: Vars,
): StoreAttempt {
  const varsWrite: PolRecWrite = { X: Number.NaN, Y: Number.NaN };
  try {
    const value = evaluateExpression(operand, { ...scope }, ans, angleMode, statVars, DEFAULT_FORMAT, varsWrite);
    const written = Number.isFinite(varsWrite.X) && Number.isFinite(varsWrite.Y)
      ? { X: varsWrite.X, Y: varsWrite.Y }
      : undefined;
    return { ok: true, value, varsWrite: written };
  } catch (e) {
    return { ok: false, error: e instanceof CalcError ? e : new CalcError('syntax') };
  }
}

/** SOLVE unknown is X. Dummy template `x` (∫ / d/dx / Σ) does not count. */
export function expressionHasSolveUnknown(expr: string): boolean {
  return expr.replace(/[‸⬚]/g, '').includes('X');
}

/** IR stems whose letters are not memory (Ans, nCr, sin, …). Longest first (R8). */
const SOLVE_IR_STEMS = Array.from(new Set([
  ...PATS.map((p) => p.replace(/\($/, '')),
  ...DELETE_STEMS,
  'Ans', 'nCr', 'nPr', 'Ran#', 'RanInt',
  'minX', 'maxX', 'minY', 'maxY',
])).sort((a, b) => b.length - a.length);

const SOLVE_PROMPT_LETTERS = 'ABCDEFMY';

/** Non-X letters SOLVE prompts before the initial-X guess (A–F, M, Y). */
export function collectSolvePromptVars(expr: string): string[] {
  const raw = expr.replace(/[‸⬚]/g, '');
  const seen = new Set<string>();
  const order: string[] = [];
  let i = 0;
  while (i < raw.length) {
    if (raw.startsWith('stat_', i)) {
      i += 5;
      while (i < raw.length && /[A-Za-z0-9_]/.test(raw[i])) i++;
      continue;
    }
    const stem = SOLVE_IR_STEMS.find((s) => raw.startsWith(s, i));
    if (stem) {
      i += stem.length;
      continue;
    }
    const ch = raw[i];
    if (SOLVE_PROMPT_LETTERS.includes(ch) && !seen.has(ch)) {
      seen.add(ch);
      order.push(ch);
    }
    i++;
  }
  return order;
}

export interface NewtonSolveOk {
  x: number;
  residual: number;
}

const SOLVE_CONVERGED = 1e-12;
const SOLVE_ACCEPT = 1e-8;

export function insertCompValue(currentInput: string, showingResult: boolean, val: string): { input: string; showingResult: boolean } {
  if (showingResult || currentInput.includes('→')) {
    const isOperator = /[+×÷\-]/.test(val) || val === 'sqr(‸)' || val === 'cube(‸)' || val.startsWith('pwr(') || val.startsWith('root(') || val.startsWith('frac(');
    let nextInput = isOperator ? "Ans" + val : val;
    if (!nextInput.includes('‸')) nextInput += '‸';
    return { input: nextInput, showingResult: false };
  }
  let target = val.includes('‸') ? val : val + '‸';
  return { input: currentInput.replace('‸', target), showingResult: false };
}

export function wrapPrecedingBinary(currentInput: string, showingResult: boolean, fn: string): { input: string; showingResult: boolean } {
  if (showingResult) {
    return { input: `${fn}(Ans,‸)`, showingResult: false };
  }
  let parts = currentInput.split('‸');
  let before = parts[0], after = parts[1] || '';
  let operand = findPrecedingOperand(before);
  if (operand) {
    return { input: before.slice(0, -operand.length) + `${fn}(${operand},‸)` + after, showingResult: false };
  }
  // Infix nCr/nPr: caret sits after C/P, same as after wrapping an n.
  return { input: before + `${fn}(,‸)` + after, showingResult: false };
}

export function wrapFracTemplate(currentInput: string, showingResult: boolean): { input: string; showingResult: boolean; insertInstead?: string } {
  if (showingResult) {
    return { input: "frac(Ans,‸)", showingResult: false };
  }
  let parts = currentInput.split('‸');
  let before = parts[0], after = parts[1] || '';
  let operand = findPrecedingOperand(before);
  if (operand) {
    return { input: before.slice(0, -operand.length) + `frac(${operand},‸)` + after, showingResult: false };
  }
  return { input: currentInput, showingResult: false, insertInstead: "frac(‸,)" };
}

/** x^n / x² / frac / nPr / nCr write the COMP line only in COMP (R9 / R10 / R25). */
export function allowsCompLineEdit(calcMode: CalcMode): boolean {
  return calcMode === 'COMP';
}

/**
 * CALC / SOLVE / hyp overlays. COMP, or a STAT calc line that already
 * jumped to COMP (`insertStatVar` / `stat-jump-comp`). Not STAT/EQN screens (R12).
 */
export function allowsCalcSolveHyp(calcMode: CalcMode): boolean {
  return calcMode === 'COMP';
}

export function isStatSessionMode(calcMode: CalcMode): boolean {
  return (
    calcMode === 'STAT_DATA' || calcMode === 'STAT_MENU' ||
    calcMode === 'STAT_RESULT' || calcMode === 'STAT_RESULT_SUB' ||
    calcMode === 'STAT_EDITOR_MENU' || calcMode === 'STAT_EDIT'
  );
}

export function isEqnEditorMode(calcMode: CalcMode): boolean {
  return calcMode === 'EQN_QUAD' || calcMode === 'EQN_RESULT';
}

export type OverlayClear = {
  showHypMenu: false;
  promptVar: null;
  promptVarsQueue: [];
  solveScreen: null;
  lcdError: null;
};

/** hyp / prompt / SOLVE / lcdError — AC and History Load both use this (R13 / R26). */
export function clearedOverlays(): OverlayClear {
  return {
    showHypMenu: false,
    promptVar: null,
    promptVarsQueue: [],
    solveScreen: null,
    lcdError: null,
  };
}

export type AllClearPatch = OverlayClear & {
  calcMode: CalcMode;
  clearStatType: boolean;
  resetEqn: boolean;
  resetCompLine: boolean;
};

/** AC: leave STAT with the indicator off; EQN stays in the editor; always drop overlays (R13). */
export function applyAllClear(calcMode: CalcMode): AllClearPatch {
  const overlays = clearedOverlays();
  if (isEqnEditorMode(calcMode)) {
    return {
      calcMode: 'EQN_QUAD',
      clearStatType: false,
      resetEqn: true,
      resetCompLine: false,
      ...overlays,
    };
  }
  return {
    calcMode: 'COMP',
    clearStatType: isStatSessionMode(calcMode),
    resetEqn: false,
    resetCompLine: true,
    ...overlays,
  };
}

export type HistoryLoadPatch = OverlayClear & {
  currentInput: string;
  currentSequence: string[];
  showingResult: false;
  replayIndex: -1;
  calcMode: 'COMP';
  clearStatType: true;
};

/** History Load always enters COMP and drops overlays so the line is visible (R26). */
export function applyHistoryLoad(rawInput: string, sequence: string[]): HistoryLoadPatch {
  return {
    currentInput: rawInput + '‸',
    currentSequence: [...sequence],
    showingResult: false,
    replayIndex: -1,
    calcMode: 'COMP',
    clearStatType: true,
    ...clearedOverlays(),
  };
}

export function applyPowerKey(
  currentInput: string,
  showingResult: boolean,
  isShift: boolean,
  forcePwr?: boolean,
): { input: string; showingResult: false } {
  if (showingResult) {
    if (isShift && !forcePwr) return { input: 'root(Ans,‸)', showingResult: false };
    return { input: 'Ans^(‸)', showingResult: false };
  }
  const parts = currentInput.split('‸');
  const before = parts[0], after = parts[1] || '';
  const operand = findPrecedingOperand(before);
  if (isShift && !forcePwr) {
    if (operand) {
      return { input: before.slice(0, -operand.length) + `root(${operand},‸)` + after, showingResult: false };
    }
    return { input: before + `root(‸,)` + after, showingResult: false };
  }
  if (operand) {
    return { input: before + `^(‸)` + after, showingResult: false };
  }
  return { input: before + `pwr(‸,)` + after, showingResult: false };
}

/** x² / cube. After a result, SHIFT is always consumed (R10). */
export function applySquareKey(
  currentInput: string,
  showingResult: boolean,
  isShift: boolean,
): { input: string; showingResult: false; isShift: false } {
  const symbol = isShift ? '³' : '²';
  if (showingResult) {
    return { input: `Ans${symbol}‸`, showingResult: false, isShift: false };
  }
  const parts = currentInput.split('‸');
  const before = parts[0], after = parts[1] || '';
  return { input: before + `${symbol}‸` + after, showingResult: false, isShift: false };
}

export function newtonSolveX(expr: string, vars: Vars, ans: number, angleMode: AngleMode, statVars: Vars): NewtonSolveOk {
  const raw = expr.replace(/[‸⬚]/g, '');
  let x = Number(vars.X) || 0;

  const evalAt = (xx: number, step: boolean): number => {
    try {
      return calcPrimary(evaluateExpression(raw, { ...vars, X: xx }, ans, angleMode, statVars));
    } catch (e) {
      if (step && e instanceof CalcError && e.kind === 'math') {
        throw new CalcError('cantSolve');
      }
      throw e;
    }
  };

  let f = evalAt(x, false);
  if (Math.abs(f) < SOLVE_CONVERGED) return { x, residual: f };

  for (let i = 0; i < 40; i++) {
    const fPlus = evalAt(x + 1e-7, true);
    const df = (fPlus - f) / 1e-7;
    if (Math.abs(df) < 1e-15) {
      if (Math.abs(f) < SOLVE_ACCEPT) return { x, residual: f };
      throw new CalcError('cantSolve');
    }
    const nextX = x - f / df;
    if (!Number.isFinite(nextX) || Math.abs(nextX) >= 1e100) {
      throw new CalcError('cantSolve');
    }
    x = nextX;
    f = evalAt(x, true);
    if (Math.abs(f) < SOLVE_CONVERGED) return { x, residual: f };
  }
  if (Math.abs(f) < SOLVE_ACCEPT) return { x, residual: f };
  throw new CalcError('cantSolve');
}

/** E-40: put the COMP caret at `offset` in the caret-stripped expression. */
export function placeCaretAtOffset(input: string, offset: number): string {
  const raw = input.replace(/[‸⬚]/g, '');
  const o = Math.max(0, Math.min(Math.floor(offset), raw.length));
  return `${raw.slice(0, o)}‸${raw.slice(o)}`;
}

/** Unclosed `abs(` paints both bars (`|X|`), so ▶ at the end must close it. */
function unclosedAbsAtEnd(before: string): boolean {
  let depth = 0;
  for (let i = before.length - 1; i >= 0; i--) {
    const c = before[i];
    if (c === ')') depth++;
    else if (c === '(') {
      if (depth === 0) return before.slice(0, i).endsWith('abs');
      depth--;
    }
  }
  return false;
}

type IntSlot = 'before' | 'stem' | 'integrand' | 'lower' | 'upper' | 'dummy' | 'after';

interface IntArg { start: number; end: number }

interface IntTemplate {
  stemStart: number;
  open: number;
  close: number;
  end: number;
  args: IntArg[];
}

function isIntStemAt(s: string, i: number): boolean {
  return s.startsWith('int(', i) && (i < 3 || s.slice(i - 3, i) !== 'Ran');
}

function parseIntTemplates(raw: string): IntTemplate[] {
  const out: IntTemplate[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (!isIntStemAt(raw, i)) continue;
    const open = i + 3;
    let depth = 0;
    let close = -1;
    const commas: number[] = [];
    for (let j = open; j < raw.length; j++) {
      const ch = raw[j];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) {
          close = j;
          break;
        }
      } else if (ch === ',' && depth === 1) {
        commas.push(j);
      }
    }
    const bodyEnd = close === -1 ? raw.length : close;
    const args: IntArg[] = [];
    let cur = open + 1;
    for (const comma of commas) {
      args.push({ start: cur, end: comma });
      cur = comma + 1;
    }
    args.push({ start: cur, end: bodyEnd });
    out.push({
      stemStart: i,
      open,
      close,
      end: close === -1 ? bodyEnd : close + 1,
      args,
    });
  }
  return out;
}

function classifyInt(t: IntTemplate, caret: number): IntSlot {
  if (caret <= t.stemStart) return 'before';
  if (caret <= t.open) return 'stem';
  const a = t.args;
  if (a.length >= 1 && caret <= a[0].end) return 'integrand';
  if (a.length >= 2 && caret <= a[1].end) return 'lower';
  if (a.length >= 3 && caret <= a[2].end) return 'upper';
  if (caret < t.end && a.length >= 4) return 'dummy';
  return 'after';
}

function placeCaret(raw: string, pos: number): string {
  const p = Math.max(0, Math.min(pos, raw.length));
  return `${raw.slice(0, p)}‸${raw.slice(p)}`;
}

function intHit(raw: string, caret: number): { t: IntTemplate; slot: IntSlot } | null {
  const all = parseIntTemplates(raw);
  const entering = all.find(t => caret === t.stemStart);
  if (entering) return { t: entering, slot: 'before' };
  let best: { t: IntTemplate; slot: IntSlot } | null = null;
  for (const t of all) {
    if (caret > t.stemStart && caret <= t.end) {
      if (!best || t.end - t.stemStart < best.t.end - best.t.stemStart) {
        best = { t, slot: classifyInt(t, caret) };
      }
    }
  }
  return best;
}

function jumpIntNext(t: IntTemplate, slot: IntSlot, raw: string): string {
  if (slot === 'integrand' && t.args[1]) return placeCaret(raw, t.args[1].start);
  if (slot === 'lower' && t.args[2]) return placeCaret(raw, t.args[2].start);
  return placeCaret(raw, t.end);
}

function jumpIntPrev(t: IntTemplate, slot: IntSlot, raw: string): string {
  if (slot === 'lower' && t.args[0]) return placeCaret(raw, t.args[0].end);
  if (slot === 'upper' && t.args[1]) return placeCaret(raw, t.args[1].end);
  return placeCaret(raw, t.stemStart);
}

/** Character / stem walk used by every template except the ∫ slot path. */
function moveCompCursorRightBasic(currentInput: string): string {
  const i = currentInput.indexOf('‸');
  if (i === -1 || i >= currentInput.length - 1) return currentInput;

  const before = currentInput.substring(0, i);
  const after = currentInput.substring(i + 1);

  const found = CURSOR_PATS.find(p => after.startsWith(p));
  if (found) {
    const nextBefore = before + found;
    const nextAfter = after.substring(found.length);
    if (found === 'diff(' && nextAfter.includes(',x,')) {
      return nextBefore + '‸' + nextAfter;
    }
    if (found === ',' && (nextAfter.startsWith('x,') || nextAfter.startsWith('X,'))) {
      const skippedVar = nextAfter.startsWith('x,') ? 'x,' : 'X,';
      return nextBefore + skippedVar + '‸' + nextAfter.substring(2);
    }
    return nextBefore + '‸' + nextAfter;
  }

  const c = after[0];
  const nextBefore = before + c;
  const nextAfter = after.substring(1);
  if (c === ',' && (nextAfter.startsWith('x,') || nextAfter.startsWith('X,'))) {
    const skippedVar = nextAfter.startsWith('x,') ? 'x,' : 'X,';
    return nextBefore + skippedVar + '‸' + nextAfter.substring(2);
  }
  return nextBefore + '‸' + nextAfter;
}

function moveCompCursorLeftBasic(currentInput: string): string {
  const i = currentInput.indexOf('‸');
  if (i <= 0) return currentInput;

  const before = currentInput.substring(0, i);
  const after = currentInput.substring(i + 1);

  const found = CURSOR_PATS.find(p => before.endsWith(p));
  if (found) {
    const nextBefore = before.substring(0, before.length - found.length);
    const targetStr = found + after;
    if (found === ',' && (nextBefore.endsWith(',x') || nextBefore.endsWith(',X'))) {
      return nextBefore.slice(0, -2) + '‸' + nextBefore.slice(-2) + targetStr;
    }
    return nextBefore + '‸' + targetStr;
  }

  const c = before[before.length - 1];
  const nextBefore = before.substring(0, before.length - 1);
  const targetStr = c + after;
  if (c === ',' && (nextBefore.endsWith('x') || nextBefore.endsWith('X'))) {
    const preVar = nextBefore.slice(0, -1);
    if (preVar.endsWith(',')) {
      return preVar.slice(0, -1) + '‸' + ',' + nextBefore.slice(-1) + targetStr;
    }
  }
  return nextBefore + '‸' + targetStr;
}

export function moveCompCursorRight(currentInput: string): string {
  const i = currentInput.indexOf('‸');
  if (i === -1) return currentInput;
  const raw = currentInput.replace(/‸/g, '');
  const caret = i;
  const hit = intHit(raw, caret);

  if (hit?.slot === 'before' || hit?.slot === 'stem') {
    return placeCaret(raw, hit.t.args[0]?.start ?? hit.t.open + 1);
  }
  if (hit?.slot === 'dummy') {
    return placeCaret(raw, hit.t.end);
  }
  if (hit && (hit.slot === 'integrand' || hit.slot === 'lower' || hit.slot === 'upper')) {
    const tentative = i >= currentInput.length - 1
      ? currentInput
      : moveCompCursorRightBasic(currentInput);
    if (tentative === currentInput) return jumpIntNext(hit.t, hit.slot, raw);
    const tRaw = tentative.replace(/‸/g, '');
    const tCaret = tentative.indexOf('‸');
    if (tRaw === raw && classifyInt(hit.t, tCaret) !== hit.slot) {
      return jumpIntNext(hit.t, hit.slot, raw);
    }
    return tentative;
  }
  if (hit?.slot === 'after' && caret >= raw.length) {
    return placeCaret(raw, hit.t.stemStart);
  }

  if (i >= currentInput.length - 1) {
    const before = currentInput.substring(0, i);
    return unclosedAbsAtEnd(before) ? `${before})‸` : currentInput;
  }
  return moveCompCursorRightBasic(currentInput);
}

export function moveCompCursorLeft(currentInput: string): string {
  const i = currentInput.indexOf('‸');
  if (i === -1) return currentInput;
  const raw = currentInput.replace(/‸/g, '');
  const caret = i;
  const hit = intHit(raw, caret);

  if (hit && (hit.slot === 'before' || hit.slot === 'stem') && caret === 0) {
    return placeCaret(raw, hit.t.end);
  }
  if (hit?.slot === 'stem') {
    return placeCaret(raw, hit.t.stemStart);
  }
  if (hit && (hit.slot === 'after' || hit.slot === 'dummy')) {
    return placeCaret(raw, hit.t.args[2] ? hit.t.args[2].end : hit.t.end);
  }
  if (hit && (hit.slot === 'integrand' || hit.slot === 'lower' || hit.slot === 'upper')) {
    const tentative = i <= 0 ? currentInput : moveCompCursorLeftBasic(currentInput);
    if (tentative === currentInput) return jumpIntPrev(hit.t, hit.slot, raw);
    const tRaw = tentative.replace(/‸/g, '');
    const tCaret = tentative.indexOf('‸');
    if (tRaw === raw && classifyInt(hit.t, tCaret) !== hit.slot) {
      return jumpIntPrev(hit.t, hit.slot, raw);
    }
    return tentative;
  }

  if (i <= 0) return currentInput;
  return moveCompCursorLeftBasic(currentInput);
}

/** ▲/▼ swap ∫ upper/lower. From the integrand they jump to those slots.
 *  From a bound they swap to the other bound. No comma-walk in other templates. */
export function moveCompCursorDown(currentInput: string): string {
  const i = currentInput.indexOf('‸');
  if (i === -1) return currentInput;
  const raw = currentInput.replace(/‸/g, '');
  const hit = intHit(raw, i);
  if ((hit?.slot === 'integrand' || hit?.slot === 'upper') && hit.t.args[1]) {
    return placeCaret(raw, hit.t.args[1].start);
  }
  return currentInput;
}

export function moveCompCursorUp(currentInput: string): string {
  const i = currentInput.indexOf('‸');
  if (i === -1) return currentInput;
  const raw = currentInput.replace(/‸/g, '');
  const hit = intHit(raw, i);
  if ((hit?.slot === 'integrand' || hit?.slot === 'lower') && hit.t.args[2]) {
    return placeCaret(raw, hit.t.args[2].start);
  }
  return currentInput;
}

export function deleteCompAtCursor(currentInput: string): string | null {
  let parts = currentInput.split('‸');
  let before = parts[0], after = parts[1] || '';
  if (before.length === 0) return null;

  let found = PATS.find(p => before.endsWith(p));
  if (found) {
    let nextAfter = after;
    if ((found.endsWith('(') || found.endsWith(',')) && after.startsWith(')')) {
      nextAfter = after.slice(1);
    }
    return before.slice(0, -found.length) + '‸' + nextAfter;
  }

  const stems = DELETE_STEMS;

  if (after === '' && before.endsWith(')')) {
    let parenCount = 0;
    let startIdx = -1;
    for (let i = before.length - 1; i >= 0; i--) {
      if (before[i] === ')') parenCount++;
      if (before[i] === '(') parenCount--;
      if (parenCount === 0) {
        startIdx = i;
        break;
      }
    }
    if (startIdx !== -1) {
      let prefix = before.slice(0, startIdx);
      let match = stems.find(s => prefix.endsWith(s));
      if (match) {
        let content = before.slice(startIdx + 1, -1);
        if (content.includes(',')) {
          let lastComma = content.lastIndexOf(',');
          let nextAfter = after;
          if (!after.startsWith(')')) nextAfter = ')' + after;
          return prefix + '(' + content.slice(0, lastComma) + '‸' + content.slice(lastComma) + nextAfter;
        }
        return prefix.slice(0, -match.length) + content + '‸' + after;
      }
    }
  }

  let nextBefore = before.slice(0, -1);

  if (before.endsWith('(')) {
     let match = stems.find(s => before.endsWith(s + '('));
     if (match) {
        let nextAfter = after;
        if (after.startsWith(')')) {
          nextAfter = after.slice(1);
        }
        return before.slice(0, -(match.length + 1)) + '‸' + nextAfter;
     }
  }

  let revealed = stems.find(s => nextBefore.endsWith(s));
  if (revealed && before.endsWith('(')) {
     let nextAfter = after;
     if (after.startsWith(')')) {
        nextAfter = after.slice(1);
     }
     return nextBefore.slice(0, -revealed.length) + '‸' + nextAfter;
  }

  if (before.endsWith(',')) {
     let segment = before.slice(0, -1);
     let parenIdx = segment.lastIndexOf('(');
     if (parenIdx !== -1) {
        let prefixWithStem = segment.slice(0, parenIdx);
        let stem = stems.find(s => prefixWithStem.endsWith(s));
        if (stem) {
           let content = segment.slice(parenIdx + 1);
           let prefix = prefixWithStem.slice(0, -stem.length);
           let nextAfter = after;
           if (after.startsWith(')')) nextAfter = after.slice(1);
           return prefix + content + '‸' + nextAfter;
        }
     }
  }

  return nextBefore + '‸' + after;
}

/**
 * History / live-sequence vocabulary: the physical faceplate key, plus
 * SHIFT/ALPHA when that key's shifted or alpha legend is what ran.
 * X is ALPHA + ) (the key that wears the red X), not a chip labelled X.
 */
const IR_TO_PHYSICAL: Record<string, string[]> = {
  'sin(': ['sin'],
  'cos(': ['cos'],
  'tan(': ['tan'],
  'sin⁻¹(': ['SHIFT', 'sin'],
  'cos⁻¹(': ['SHIFT', 'cos'],
  'tan⁻¹(': ['SHIFT', 'tan'],
  // hyp opens a numbered menu (E-41): 1 sinh … 6 tanh⁻¹.
  'sinh(': ['hyp', '1'],
  'cosh(': ['hyp', '2'],
  'tanh(': ['hyp', '3'],
  'sinh⁻¹(': ['hyp', '4'],
  'cosh⁻¹(': ['hyp', '5'],
  'tanh⁻¹(': ['hyp', '6'],
  'log10(': ['log'],
  '10^(': ['SHIFT', 'log'],
  'ln(': ['ln'],
  'e^(': ['SHIFT', 'ln'],
  'sqrt(': ['√'],
  'root(3,': ['SHIFT', '√'],
  'root(': ['SHIFT', 'xⁿ'],
  'pwr(': ['xⁿ'],
  '^(': ['xⁿ'],
  '^-1': ['x-1'],
  'sqr(': ['x²'],
  'cube(': ['SHIFT', 'x²'],
  'frac(': ['frac'],
  'mix(': ['SHIFT', 'frac'],
  'abs(': ['SHIFT', 'hyp'],
  'Abs': ['SHIFT', 'hyp'],
  'Rnd(': ['SHIFT', '0'],
  'log_b(': ['log_box'],
  'Σ(': ['SHIFT', 'log_box'],
  'diff(': ['SHIFT', '∫'],
  'int(': ['∫'],
  'RanInt(': ['ALPHA', '.'],
  'Ran#': ['SHIFT', '.'],
  'Ans': ['Ans'],
  '×10^(': ['×10ˣ'],
  '×10^': ['×10ˣ'],
  'nCr(': ['SHIFT', '÷'],
  'nPr(': ['SHIFT', '×'],
  'pol(': ['SHIFT', '+'],
  'rec(': ['SHIFT', '-'],
  '!': ['SHIFT', 'x-1'],
  '%': ['SHIFT', '('],
  ',': ['SHIFT', ')'],
  '°': ['°\'"'],
  'π': ['SHIFT', '×10ˣ'],
  'e': ['ALPHA', '×10ˣ'],
  'hyp': ['hyp'],
};

const LETTER_TO_PHYSICAL: Record<string, string[]> = {
  A: ['ALPHA', '(-)'],
  B: ['ALPHA', '°\'"'],
  C: ['ALPHA', 'hyp'],
  D: ['ALPHA', 'sin'],
  E: ['ALPHA', 'cos'],
  F: ['ALPHA', 'tan'],
  X: ['ALPHA', ')'],
  Y: ['ALPHA', 'S⇔D'],
  M: ['ALPHA', 'M+'],
};

/** Faceplate key that wears this ALPHA letter. STO/RCL uses it without ALPHA. */
export const STO_LETTER_KEY: Record<string, string> = {
  A: '(-)',
  B: '°\'"',
  C: 'hyp',
  D: 'sin',
  E: 'cos',
  F: 'tan',
  X: ')',
  Y: 'S⇔D',
  M: 'M+',
};

const IR_TOKENS = Object.keys(IR_TO_PHYSICAL).sort((a, b) => b.length - a.length);

export const reconstructSequence = (input: string): string[] => {
    const result: string[] = [];
    let s = input.replace(/[‸⬚]/g, '');

    // Closing parens that belong to a template (sin(, pwr(, …) are not a ) key.
    let templateParenStack: number[] = [];
    let iter = 0;

    while (s.length > 0 && iter < 5000) {
      iter++;
      let matched = false;
      for (const t of IR_TOKENS) {
        if (s.startsWith(t)) {
          result.push(...IR_TO_PHYSICAL[t]);
          s = s.slice(t.length);
          if (t.includes('(')) templateParenStack.push(1);
          matched = true;
          break;
        }
      }
      if (matched) continue;

      const char = s[0];
      if (char === '×') { result.push('×'); s = s.slice(1); }
      else if (char === '÷') { result.push('÷'); s = s.slice(1); }
      else if (char === '²') { result.push('x²'); s = s.slice(1); }
      else if (char === 'ⁿ') { result.push('xⁿ'); s = s.slice(1); }
      else if (char === '³') { result.push('SHIFT', 'x²'); s = s.slice(1); }
      else if (s.startsWith('⁻¹')) { result.push('x-1'); s = s.slice(2); }
      else if (char === '⁻') { result.push('(-)'); s = s.slice(1); }
      else if (char.match(/[0-9.]/)) {
        // One chip per digit / decimal key, not a grouped "60".
        result.push(char);
        s = s.slice(1);
      } else if (char === '(') {
        result.push('(');
        s = s.slice(1);
        if (templateParenStack.length > 0) templateParenStack[templateParenStack.length - 1]++;
      } else if (char === ')') {
        if (templateParenStack.length > 0) {
          templateParenStack[templateParenStack.length - 1]--;
          if (templateParenStack[templateParenStack.length - 1] === 0) {
            templateParenStack.pop();
            s = s.slice(1);
          } else {
            result.push(')');
            s = s.slice(1);
          }
        } else {
          result.push(')');
          s = s.slice(1);
        }
      } else if (char === '+' || char === '-' || char === '*' || char === '/') {
        result.push(char === '*' ? '×' : char === '/' ? '÷' : char);
        s = s.slice(1);
      } else if (char === 'π') { result.push('SHIFT', '×10ˣ'); s = s.slice(1); }
      else if (char === 'e') { result.push('ALPHA', '×10ˣ'); s = s.slice(1); }
      else if (LETTER_TO_PHYSICAL[char]) {
        result.push(...LETTER_TO_PHYSICAL[char]);
        s = s.slice(1);
      }       else if (char === ',') { result.push('SHIFT', ')'); s = s.slice(1); }
      else if (char === '°') { result.push('°\'"'); s = s.slice(1); }
      else if (char === '%') { result.push('SHIFT', '('); s = s.slice(1); }
      else if (char === '=') {
        // ALPHA CALC inserts = (the CALC key wears the red =).
        result.push('ALPHA', 'CALC');
        s = s.slice(1);
      }
      else if (char === '→') {
        // STO is SHIFT RCL then the letter's key — not ALPHA + letter.
        result.push('SHIFT', 'RCL');
        s = s.slice(1);
        const letter = s[0];
        if (letter && STO_LETTER_KEY[letter]) {
          result.push(STO_LETTER_KEY[letter]);
          s = s.slice(1);
        }
      }
      else {
        result.push(char);
        s = s.slice(1);
      }
    }
    return result;
  };
