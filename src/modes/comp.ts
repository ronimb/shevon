import { evaluateExpression, findPrecedingOperand } from '../evaluator.ts';
import { CURSOR_PATS, DELETE_STEMS, PATS } from '../keys.ts';
import type { AngleMode, Vars } from '../types.ts';

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
  return { input: before + `${fn}(‸,)` + after, showingResult: false };
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

export function newtonSolveX(expr: string, vars: Vars, ans: number, angleMode: AngleMode, statVars: Vars): number {
  let x = vars.X || 0;
  if (expr.includes('=') && !expr.includes('→')) {
    let parts = expr.split('=');
    expr = `(${parts[0]}) - (${parts[1]})`;
  }
  for (let i = 0; i < 40; i++) {
    let f = evaluateExpression(expr, { ...vars, X: x }, ans, angleMode, statVars);
    if (Math.abs(f) < 1e-12) break;
    let df = (evaluateExpression(expr, { ...vars, X: x + 1e-7 }, ans, angleMode, statVars) - f) / 1e-7;
    if (Math.abs(df) < 1e-15) break;
    let nextX = x - f / df;
    if (isNaN(nextX)) break;
    x = nextX;
  }
  return x;
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

export const reconstructSequence = (input: string): string[] => {
    const result: string[] = [];
    let s = input.replace(/[‸⬚]/g, '');
    const tokens = [
      "sinh⁻¹(", "cosh⁻¹(", "tanh⁻¹(", "sin⁻¹(", "cos⁻¹(", "tan⁻¹(",
      "sinh(", "cosh(", "tanh(", "sin(", "cos(", "tan(",
      "pwr(", "root(", "sqr(", "cube(", "frac(", "mix(", "diff(", "int(", "abs(", "Rnd(", "log_b(", "log10(", "ln(", "Σ(", 
      "RanInt(", "Ran#", "Ans", "e", "π", "°″", "×10^(", "×10^", "nCr(", "nPr(", "root(3,", "^(", "10^(", "e^(",
      "pol(", "rec(", "diff(", "int(", "!", "%", ",", "→", "Abs", "hyp", "°"
    ];
    
    // Mapping from internal labels or tokens to physical button sequences
    const sequenceMap: Record<string, string[]> = {
      'sin⁻¹': ['SHIFT', 'sin'],
      'cos⁻¹': ['SHIFT', 'cos'],
      'tan⁻¹': ['SHIFT', 'tan'],
      'sinh⁻¹': ['HYP', 'SHIFT', 'sin'],
      'cosh⁻¹': ['HYP', 'SHIFT', 'cos'],
      'tanh⁻¹': ['HYP', 'SHIFT', 'tan'],
      'sinh': ['HYP', 'sin'],
      'cosh': ['HYP', 'cos'],
      'tanh': ['HYP', 'tan'],
      'sin': ['sin'],
      'cos': ['cos'],
      'tan': ['tan'],
      'xⁿ': ['xⁿ'],
      'x²': ['x²'],
      'x³': ['SHIFT', 'x²'],
      'frac': ['frac'],
      'mix': ['SHIFT', 'frac'],
      'log': ['log'],
      '10^': ['SHIFT', 'log'],
      'ln': ['ln'],
      'e^': ['SHIFT', 'ln'],
      'Abs': ['SHIFT', 'hyp'],
      '√': ['√'],
      'root': ['SHIFT', 'xⁿ'],
      'root3': ['SHIFT', '√'],
      '∫': ['∫'],
      'd/dx': ['SHIFT', '∫'],
      'Σ': ['SHIFT', 'log_box'], 
      'log_box': ['log_box'], 
      'Rnd': ['SHIFT', '0'],
      'Ran#': ['SHIFT', '.'],
      'RanInt': ['ALPHA', '.'],
      'Ans': ['Ans'],
      '×10ˣ': ['×10ˣ'],
      'π': ['SHIFT', '×10ˣ'],
      'e': ['ALPHA', '×10ˣ'],
      'nCr': ['SHIFT', '÷'],
      'nPr': ['SHIFT', '×'],
      '°′″': ['°′″'],
      '(-)': ['(-)'],
      'x-1': ['x-1'],
      'pol': ['SHIFT', '+'],
      'rec': ['SHIFT', '-'],
      '!': ['SHIFT', 'x-1'],
      '→': ['SHIFT', 'RCL'],
      '%': ['SHIFT', '('],
      ',': ['SHIFT', ')'],
      '°': ['°\'"'],
      'hyp': ['hyp'],
      'A': ['ALPHA', '(-)'],
      'B': ['ALPHA', '°\'"'],
      'C': ['ALPHA', 'hyp'],
      'D': ['ALPHA', 'sin'],
      'E': ['ALPHA', 'cos'],
      'F': ['ALPHA', 'tan'],
      'X': ['ALPHA', ')'],
      'Y': ['ALPHA', 'S⇔D'],
      'M': ['ALPHA', 'M+'],
    };

    // To handle closing parentheses of templates
    let templateParenStack: number[] = [];
    let iter = 0;

    while (s.length > 0 && iter < 5000) {
      iter++;
      let matched = false;
      for (const t of tokens) {
        if (s.startsWith(t)) {
          let label = t;
          if (t === 'sin(') label = 'sin';
          else if (t === 'cos(') label = 'cos';
          else if (t === 'tan(') label = 'tan';
          else if (t === 'sin⁻¹(') label = 'sin⁻¹'; 
          else if (t === 'cos⁻¹(') label = 'cos⁻¹';
          else if (t === 'tan⁻¹(') label = 'tan⁻¹';
          else if (t === 'sinh(') label = 'sinh';
          else if (t === 'cosh(') label = 'cosh';
          else if (t === 'tanh(') label = 'tanh';
          else if (t === 'sinh⁻¹(') label = 'sinh⁻¹';
          else if (t === 'cosh⁻¹(') label = 'cosh⁻¹';
          else if (t === 'tanh⁻¹(') label = 'tanh⁻¹';
          else if (t === 'pwr(' || t === '^(') label = 'xⁿ';
          else if (t === 'sqr(') label = 'x²';
          else if (t === 'cube(') label = 'x³';
          else if (t === 'frac(') label = 'frac';
          else if (t === 'mix(') label = 'mix';
          else if (t === 'log10(' || t === '10^(') label = '10^';
          else if (t === 'ln(' || t === 'e^(') label = 'e^';
          else if (t === 'abs(') label = 'Abs';
          else if (t === 'Rnd(') label = 'Rnd';
          else if (t === 'sqrt(') label = '√';
          else if (t === 'root(3,') label = 'root3';
          else if (t === 'root(') label = 'root';
          else if (t === 'int(') label = '∫';
          else if (t === 'diff(') label = 'd/dx';
          else if (t === 'Σ(') label = 'Σ';
          else if (t === 'log_b(') label = 'log_box';
          else if (t === 'Ran#') label = 'Ran#';
          else if (t === 'RanInt(') label = 'RanInt';
          else if (t === 'Ans') label = 'Ans';
          else if (t === '×10^(' || t === '×10^') label = '×10ˣ';
          else if (t === 'nCr(') label = 'nCr';
          else if (t === 'nPr(') label = 'nPr';
          else if (t === 'pol(') label = 'pol';
          else if (t === 'rec(') label = 'rec';
          else if (t === '!') label = '!';
          else if (t === '%') label = '%';
          else if (t === ',') label = ',';
          else if (t === '→') label = '→';
          else if (t === 'Abs') label = 'Abs';
          else if (t === 'hyp') label = 'hyp';
          else if (t === '°') label = '°';
          
          if (sequenceMap[label]) result.push(...sequenceMap[label]);
          else result.push(label);

          s = s.slice(t.length);
          if (t.endsWith('(') || t.includes('(')) templateParenStack.push(1);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const char = s[0];
        if (char === '×') { result.push('×'); s = s.slice(1); matched = true; }
        else if (char === '÷') { result.push('÷'); s = s.slice(1); matched = true; }
        else if (char === '²') { result.push('x²'); s = s.slice(1); matched = true; }
        else if (char === 'ⁿ') { result.push('xⁿ'); s = s.slice(1); matched = true; }
        else if (char === '³') { result.push(...(sequenceMap['x³'] || ['x³'])); s = s.slice(1); matched = true; }
        else if (char === '⁻') {
           if (s.startsWith('⁻¹')) { result.push(...(sequenceMap['x-1'] || ['x-1'])); s = s.slice(2); matched = true; }
           else { result.push(...(sequenceMap['(-)'] || ['(-)'])); s = s.slice(1); matched = true; }
        } else if (char.match(/[0-9.]/)) {
           let num = "";
           while (s.length > 0 && s[0].match(/[0-9.]/)) {
              num += s[0];
              s = s.slice(1);
           }
           result.push(num);
           matched = true;
        } else if (char === '(') {
           result.push('('); s = s.slice(1); matched = true;
           if (templateParenStack.length > 0) templateParenStack[templateParenStack.length-1]++;
        } else if (char === ')') {
           if (templateParenStack.length > 0) {
              templateParenStack[templateParenStack.length-1]--;
              if (templateParenStack[templateParenStack.length-1] === 0) {
                 templateParenStack.pop();
                 s = s.slice(1); 
                 matched = true;
              } else {
                 result.push(')');
                 s = s.slice(1);
                 matched = true;
              }
           } else {
              result.push(')');
              s = s.slice(1);
              matched = true;
           }
        } else if (char === '+' || char === '-' || char === '*' || char === '/') {
          result.push(char === '*' ? '×' : char === '/' ? '÷' : char);
          s = s.slice(1);
          matched = true;
        } else if (char === 'π') {
           result.push(...(sequenceMap['π'] || ['π'])); s = s.slice(1); matched = true;
        } else if (char === 'e') {
           result.push(...(sequenceMap['e'] || ['e'])); s = s.slice(1); matched = true;
        } else if ('ABCDEFXYM'.includes(char)) {
           result.push(...(sequenceMap[char] || [char])); s = s.slice(1); matched = true;
        } else if (char === ',') { 
           result.push(...(sequenceMap[','] || [','])); s = s.slice(1); matched = true; 
        } else if (char === '°') {
           result.push(...(sequenceMap['°'] || ['°'])); s = s.slice(1); matched = true;
        } else if (char === '%') {
           result.push(...(sequenceMap['%'] || ['%'])); s = s.slice(1); matched = true;
        } else if (char === '→') {
           result.push(...(sequenceMap['→'] || ['→'])); s = s.slice(1); matched = true;
        } else {
          result.push(char);
          s = s.slice(1);
          matched = true;
        }
      }
    }
    return result;
  };
