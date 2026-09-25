import { evaluateExpression, findPrecedingOperand } from '../evaluator.ts';
import { CURSOR_PATS, DELETE_STEMS, PATS } from '../keys.ts';
import { CalcError, type AngleMode, type Vars } from '../types.ts';

/** SOLVE unknown is X. Dummy template `x` (∫ / d/dx / Σ) does not count. */
export function expressionHasSolveUnknown(expr: string): boolean {
  return expr.replace(/[‸⬚]/g, '').includes('X');
}

/** Non-X letters SOLVE prompts before the initial-X guess (A–F, M, Y). */
export function collectSolvePromptVars(expr: string): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const ch of expr.replace(/[‸⬚]/g, '')) {
    if ('ABCDEFMY'.includes(ch) && !seen.has(ch)) {
      seen.add(ch);
      order.push(ch);
    }
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

export function newtonSolveX(expr: string, vars: Vars, ans: number, angleMode: AngleMode, statVars: Vars): NewtonSolveOk {
  const raw = expr.replace(/[‸⬚]/g, '');
  let x = Number(vars.X) || 0;

  const evalAt = (xx: number, step: boolean): number => {
    try {
      return evaluateExpression(raw, { ...vars, X: xx }, ans, angleMode, statVars);
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

export function moveCompCursorRight(currentInput: string): string {
  let i = currentInput.indexOf('‸');
  if (i === -1 || i >= currentInput.length - 1) return currentInput;

  let before = currentInput.substring(0, i);
  let after = currentInput.substring(i + 1);

  let found = CURSOR_PATS.find(p => after.startsWith(p));
  if (found) {
    const nextBefore = before + found;
    const nextAfter = after.substring(found.length);
    if (found === 'diff(' && nextAfter.includes(',x,')) {
      return nextBefore + '‸' + nextAfter;
    } else if (found === ',' && (nextAfter.startsWith('x,') || nextAfter.startsWith('X,'))) {
      const skippedVar = nextAfter.startsWith('x,') ? 'x,' : 'X,';
      return nextBefore + skippedVar + '‸' + nextAfter.substring(2);
    } else {
      return nextBefore + '‸' + nextAfter;
    }
  } else {
    let c = after[0];
    const nextBefore = before + c;
    const nextAfter = after.substring(1);
    if (c === ',' && (nextAfter.startsWith('x,') || nextAfter.startsWith('X,'))) {
      const skippedVar = nextAfter.startsWith('x,') ? 'x,' : 'X,';
      return nextBefore + skippedVar + '‸' + nextAfter.substring(2);
    } else {
      return nextBefore + '‸' + nextAfter;
    }
  }
}

export function moveCompCursorLeft(currentInput: string): string {
  let i = currentInput.indexOf('‸');
  if (i <= 0) return currentInput;

  let before = currentInput.substring(0, i);
  let after = currentInput.substring(i + 1);

  let found = CURSOR_PATS.find(p => before.endsWith(p));
  if (found) {
    const nextBefore = before.substring(0, before.length - found.length);
    const targetStr = found + after;

    if (found === ',' && (nextBefore.endsWith(',x') || nextBefore.endsWith(',X'))) {
      const preVal = nextBefore.slice(0, -2);
      return preVal + '‸' + nextBefore.slice(-2) + targetStr;
    }

    return nextBefore + '‸' + targetStr;
  } else {
    let c = before[before.length - 1];
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
}

export function moveCompCursorDown(currentInput: string): string {
  let i = currentInput.indexOf('‸');
  if (i === -1) return currentInput;
  let before = currentInput.substring(0, i);
  let after = currentInput.substring(i + 1);

  let c = after.indexOf(',');
  let p = after.indexOf(')');
  let target = -1;

  if (c !== -1 && (p === -1 || c < p)) target = c;
  else if (p !== -1) target = p;

  if (target !== -1) {
    return before + after.substring(0, target + 1) + '‸' + after.substring(target + 1);
  }
  return currentInput;
}

export function moveCompCursorUp(currentInput: string): string {
  let i = currentInput.indexOf('‸');
  if (i <= 0) return currentInput;
  let before = currentInput.substring(0, i);
  let after = currentInput.substring(i + 1);

  let c = before.lastIndexOf(',', i - 1);
  let p = before.lastIndexOf('(', i - 1);
  let target = -1;

  if (c !== -1 && (p === -1 || c > p)) target = c;
  else if (p !== -1) target = p;

  if (target !== -1) {
    return before.substring(0, target) + '‸' + before.substring(target) + after;
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
