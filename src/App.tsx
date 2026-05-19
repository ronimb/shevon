import React, { useState, useEffect, useCallback, useRef } from 'react';
import calculatorImg from './calculator_new.png';

// --- Types ---
type CalcMode = 'COMP' | 'MENU' | 'SETUP' | 'EQN_MENU' | 'EQN_QUAD' | 'EQN_RESULT';
type DisplayMode = 'decimal' | 'fraction';
type AngleMode = 'DEG' | 'RAD' | 'GRA';

interface EqnResult {
  label: string;
  val: number;
}

interface KeyStyle {
  top: number;
  left: number;
  width: number;
  height: number;
}

const INITIAL_KEY_STYLES: Record<string, KeyStyle> = {
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

interface HistoryItem {
  id: string;
  rawInput: string;
  displayInput: string;
  result: number;
  latex: string;
  sequence: string[];
}

interface Vars {
  [key: string]: number;
}

// --- Constants ---
const PATS = ['!', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', '×10^', 'sqrt(', 'sqr(', 'cube(', 'pwr(', 'root(', 'frac(', 'mix(', 'int(', 'diff(', 'e^(', '10^(', 'log_b(', 'log10(', 'ln(', 'abs(', 'Ans', 'nCr(', 'nPr(', 'Σ(', 'pol(', 'rec(', 'RanInt(', 'Ran#'];

// --- Helper Functions ---
const factorial = (n: number): number => {
  const v = Math.round(n);
  if (v < 0) return NaN;
  if (v === 0) return 1;
  if (v > 170) return Infinity; 
  let r = 1;
  for (let i = 2; i <= v; i++) r *= i;
  return r;
};

const findPrecedingOperand = (text: string): string => {
  if (!text) return '';
  
  // 1. Check for basic tokens (number, Ans, vars/consts)
  // Match a number or a special token at the end
  let match = text.match(/(\d+\.?\d*|Ans|[A-M X-Yπe])$/);
  if (match) return match[0];

  // 2. Handle parentheses
  if (text.endsWith(')')) {
    let parenCount = 0;
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] === ')') parenCount++;
      else if (text[i] === '(') parenCount--;
      
      if (parenCount === 0) {
        // Find the start of the parenthesis group
        let sub = text.substring(0, i);
        // Greedy stem matching
        const stems = [
            'sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sin', 'cos', 'tan', 
            'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan',
            'sqrt', 'abs', 'frac', 'pwr', 'root', 'sqr', 'cube', 
            'int', 'diff', 'Σ', 'mix', 'nCr', 'nPr', 'RanInt', 
            'log_b', 'log10', 'ln', 'e^', '10^'
        ];
        const sortedStems = [...stems].sort((a,b) => b.length - a.length);
        for (const stem of sortedStems) {
          if (sub.endsWith(stem)) {
            return text.substring(i - stem.length);
          }
        }
        return text.substring(i);
      }
    }
  }
  
  return '';
};

const toFraction = (decimal: number) => {
  let best_n = Math.round(decimal), best_d = 1, best_err = Math.abs(decimal - best_n);
  for (let d = 1; d <= 1000; d++) {
    let n = Math.round(decimal * d), err = Math.abs(decimal - n / d);
    if (err < best_err) { best_n = n; best_d = d; best_err = err; }
    if (err < 1e-10) break;
  }
  return { n: best_n, d: best_d };
};

const evaluateExpression = (expr: string, scope: Vars, ans: number, angleMode: AngleMode): number => {
  const toRad = (x: number) => {
    if (angleMode === 'DEG') return x * Math.PI / 180;
    if (angleMode === 'GRA') return x * Math.PI / 200;
    return x;
  };
  const fromRad = (x: number) => {
    if (angleMode === 'DEG') return x * 180 / Math.PI;
    if (angleMode === 'GRA') return x * 200 / Math.PI;
    return x;
  };

  const h: any = {
    pi: Math.PI, e: Math.E,
    __sin: (x: number) => Math.sin(toRad(x)),
    __cos: (x: number) => Math.cos(toRad(x)),
    __tan: (x: number) => Math.tan(x === 90 && angleMode === 'DEG' ? Infinity : toRad(x)),
    __asin: (x: number) => fromRad(Math.asin(x)),
    __acos: (x: number) => fromRad(Math.acos(x)),
    __atan: (x: number) => fromRad(Math.atan(x)),
    __sinh: Math.sinh, __cosh: Math.cosh, __tanh: Math.tanh,
    __asinh: Math.asinh, __acosh: Math.acosh, __atanh: Math.atanh,
    __sqrt: Math.sqrt, __log: Math.log, __log10: Math.log10, __exp: Math.exp, __pow: Math.pow,
    __abs: Math.abs, Math: Math,
    __nthroot: (n: number, x: number) => Math.pow(x, 1 / n),
    __logb: (b: number, x: number) => Math.log(x) / Math.log(b),
    __factorial: factorial,
    __ncr: (n: number, r: number) => {
      const nv = Math.floor(Math.abs(n)), rv = Math.floor(Math.abs(r));
      if (rv < 0 || rv > nv) return 0;
      if (nv > 1000000) return Infinity;
      if (rv === 0 || rv === nv) return 1;
      let res = 1;
      const k = Math.min(rv, nv - rv);
      for (let i = 1; i <= k; i++) {
        res = res * (nv - i + 1) / i;
      }
      return Math.round(res);
    },
    __npr: (n: number, r: number) => {
      const nv = Math.floor(Math.abs(n)), rv = Math.floor(Math.abs(r));
      if (rv < 0 || rv > nv) return 0;
      if (nv > 1000000) return Infinity;
      let res = 1;
      for (let i = 0; i < rv; i++) {
        res *= (nv - i);
        if (!isFinite(res)) break;
      }
      return Math.round(res);
    },
    __ranint: (a: number, b: number) => {
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    '__ranhash': () => Math.random(),
    __pol: (x: number, y: number) => {
      const r = Math.sqrt(x*x + y*y);
      const theta = fromRad(Math.atan2(y, x));
      scope.X = r; scope.Y = theta;
      return r;
    },
    __rec: (r: number, theta: number) => {
      const x = r * Math.cos(toRad(theta));
      const y = r * Math.sin(toRad(theta));
      scope.X = x; scope.Y = y;
      return x;
    },
    __int: (expStr: string, a: number, b: number, v: string) => {
      let f = (x: number) => evaluateExpression(expStr, { ...scope, [v]: x }, ans, angleMode);
      let n = 20, step = (b - a) / n, sumVal = f(a) + f(b);
      for (let i = 1; i < n; i++) sumVal += f(a + i * step) * (i % 2 === 0 ? 2 : 4);
      return (step / 3) * sumVal;
    },
    __diff: (expStr: string, v: string, a: number) => {
      let hVal = 1e-7;
      let f = (x: number) => evaluateExpression(expStr, { ...scope, [v]: x }, ans, angleMode);
      return (f(a + hVal) - f(a)) / hVal;
    },
    __sum: (expStr: string, v: string, a: number, b: number) => {
      let t = 0;
      let start = Math.floor(a);
      let end = Math.floor(b);
      if (end - start > 5000) end = start + 5000;
      for (let i = start; i <= end; i++) t += evaluateExpression(expStr, { ...scope, [v]: i }, ans, angleMode);
      return t;
    }
  };

  const getBalanced = (s: string, startIdx: number): { content: string, endIdx: number } | null => {
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

  const splitTopLevelArgs = (s: string) => {
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

  let proc = expr.replace(/[‸⬚]/g, '');
  
  if (proc.includes('=') && !proc.includes('→')) {
    let parts = proc.split('=');
    if (parts.length === 2) {
      proc = `(${parts[0]}) - (${parts[1]})`;
    }
  }

  // Pre-process templates that need transformation (e.g., adding quotes for variables)
  const templatesToTransform = ['int', 'diff', 'Σ'];
  for (const t of templatesToTransform) {
    let idx = 0;
    while ((idx = proc.indexOf(t + '(', idx)) !== -1) {
        const bal = getBalanced(proc, idx + t.length);
        if (!bal) { idx += t.length + 1; continue; }
        const topArgs = splitTopLevelArgs(bal.content);

        let replaced = '';
        if (t === 'int' && topArgs.length === 4) replaced = `__int("${topArgs[0]}",${topArgs[1]},${topArgs[2]},"${topArgs[3]}")`;
        else if (t === 'diff' && topArgs.length === 3) replaced = `__diff("${topArgs[0]}","${topArgs[1]}",${topArgs[2]})`;
        else if (t === 'Σ' && topArgs.length === 4) replaced = `__sum("${topArgs[0]}","${topArgs[1]}",${topArgs[2]},${topArgs[3]})`;
        else {
            idx += t.length + 1;
            continue; 
        }
        
        proc = proc.substring(0, idx) + replaced + proc.substring(bal.endIdx + 1);
        idx += replaced.length;
    }
  }

  const mathTemplates = [
    { name: 'pwr', replace: (args: string[]) => `((${args[0]})**(${args[1]}))` },
    { name: 'root', replace: (args: string[]) => `__nthroot(${args[0]},${args[1]})` },
    { name: 'mix', replace: (args: string[]) => `((${args[0]})+(${args[1]})/(${args[2]}))` },
    { name: 'frac', replace: (args: string[]) => `((${args[0]})/(${args[1]}))` },
    { name: 'log_b', replace: (args: string[]) => `__logb(${args[0]},${args[1]})` },
    { name: 'ln', replace: (args: string[]) => `__log(${args[0]})` },
    { name: 'log10', replace: (args: string[]) => `__log10(${args[0]})` },
    { name: 'sin⁻¹', replace: (args: string[]) => `__asin(${args[0]})` },
    { name: 'cos⁻¹', replace: (args: string[]) => `__acos(${args[0]})` },
    { name: 'tan⁻¹', replace: (args: string[]) => `__atan(${args[0]})` },
    { name: 'asin', replace: (args: string[]) => `__asin(${args[0]})` },
    { name: 'acos', replace: (args: string[]) => `__acos(${args[0]})` },
    { name: 'atan', replace: (args: string[]) => `__atan(${args[0]})` },
    { name: 'sin', replace: (args: string[]) => `__sin(${args[0]})` },
    { name: 'cos', replace: (args: string[]) => `__cos(${args[0]})` },
    { name: 'tan', replace: (args: string[]) => `__tan(${args[0]})` },
    { name: 'sinh', replace: (args: string[]) => `__sinh(${args[0]})` },
    { name: 'cosh', replace: (args: string[]) => `__cosh(${args[0]})` },
    { name: 'tanh', replace: (args: string[]) => `__tanh(${args[0]})` },
    { name: 'asinh', replace: (args: string[]) => `__asinh(${args[0]})` },
    { name: 'acosh', replace: (args: string[]) => `__acosh(${args[0]})` },
    { name: 'atanh', replace: (args: string[]) => `__atanh(${args[0]})` },
    { name: 'nCr', replace: (args: string[]) => `__ncr(${args[0]},${args[1]})` },
    { name: 'nPr', replace: (args: string[]) => `__npr(${args[0]},${args[1]})` },
    { name: 'pol', replace: (args: string[]) => `__pol(${args[0]},${args[1]})` },
    { name: 'rec', replace: (args: string[]) => `__rec(${args[0]},${args[1]})` },
    { name: 'RanInt', replace: (args: string[]) => `__ranint(${args[0]},${args[1]})` },
    { name: 'e^', replace: (args: string[]) => `__exp(${args[0]})` },
    { name: '10^', replace: (args: string[]) => `__pow(10,${args[0]})` },
    { name: 'sqr', replace: (args: string[]) => `((${args[0]})**2)` },
    { name: 'cube', replace: (args: string[]) => `((${args[0]})**3)` },
    { name: 'abs', replace: (args: string[]) => `__abs(${args[0]})` },
    { name: 'sqrt', replace: (args: string[]) => `__sqrt(${args[0]})` },
  ];

  const processTemplatesForJS = (s: string): string => {
    let result = '';
    let curr = s;
    while (curr.length > 0) {
      let earliestIdx = Infinity;
      let bestT: any = null;
      
      // Look for the first template in the string
      for (const t of mathTemplates) {
        let idx = curr.indexOf(t.name + '(');
        if (idx !== -1 && idx < earliestIdx) {
          earliestIdx = idx;
          bestT = t;
        }
      }
      
      if (bestT) {
        // Add everything before the template to the result
        result += curr.substring(0, earliestIdx);
        const bal = getBalanced(curr, earliestIdx + bestT.name.length);
        if (bal) {
          // Process the content of the template recursively
          const inner = processTemplatesForJS(bal.content);
          const args = splitTopLevelArgs(inner);
          const replaced = bestT.replace(args);
          result += replaced;
          // Continue scanning FROM AFTER the template we just processed
          curr = curr.substring(bal.endIdx + 1);
        } else {
          // Mismatched paren? Just consume the name and continue
          result += bestT.name + '(';
          curr = curr.substring(earliestIdx + bestT.name.length + 1);
        }
      } else {
        // No templates found, add the rest of the string
        result += curr;
        curr = '';
      }
    }
    return result;
  };

  proc = processTemplatesForJS(proc);

  // Robust Factorial Replacement
  let fIdx;
  while ((fIdx = proc.indexOf('!')) !== -1) {
      let before = proc.substring(0, fIdx);
      let after = proc.substring(fIdx + 1);
      let operand = '';
      if (before.endsWith(')')) {
          let parenCount = 0;
          for (let i = before.length - 1; i >= 0; i--) {
              if (before[i] === ')') parenCount++;
              else if (before[i] === '(') parenCount--;
              if (parenCount === 0) {
                  operand = before.substring(i);
                  before = before.substring(0, i);
                  break;
              }
          }
      } else {
          let match = before.match(/(\d+\.?\d*|Ans|[A-Zπe])$/);
          if (match) {
              operand = match[0];
              before = before.substring(0, before.length - operand.length);
          }
      }
      if (operand) {
          proc = before + `__factorial(${operand})` + after;
      } else {
          // No valid operand found, handle this ! manually or skip
          proc = before + '__factorial(NaN)' + after;
      }
  }

  proc = proc.replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/Ran#/g, '__ranhash()')
    .replace(/%/g, '/100')
    .replace(/×10\^/g, '*10**')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3');

  // Enhanced implicit multiplication
  const funcOrVar = '(Ans|[A-Zπe]|__[a-z]+[A-Za-z0-9]*\\()';
  proc = proc.replace(new RegExp(`(\\d+)${funcOrVar}`, 'g'), '$1*$2')
             .replace(new RegExp(`(\\bAns\\b|[A-Zπe])${funcOrVar}`, 'g'), '$1*$2')
             .replace(/(\bAns\b|[A-Zπe])(\d+)/g, '$1*$2')
             .replace(new RegExp(`(\\))(\\d+|${funcOrVar})`, 'g'), ')*$2')
             .replace(new RegExp(`(\\d+|Ans|[A-Zπe]|\\))(\\()`, 'g'), '$1*(');

  proc = proc.replace(/π/g, 'pi')
    .replace(/\be\b/g, 'e');

  let js = proc.replace(/\^/g, '**');
  try {
    const context = { Ans: ans, ...scope, ...h };
    const keys = Object.keys(context);
    const values = Object.values(context);
    if (process.env.NODE_ENV !== "production") {
       console.log("Evaluating JS:", js, "Context:", context);
    }
    return new Function(...keys, `return ${js};`)(...values);
  } catch (e) {
    console.error("JS Evaluation Error for code:", js, e);
    throw e;
  }
};

const toLaTeX = (expr: string): string => {
  let proc = expr.replace(/[‸⬚]/g, '');

  const getBalanced = (s: string, startIdx: number): { content: string, endIdx: number } | null => {
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

  const splitTopLevelArgs = (s: string) => {
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

  const renderLaTeX = (s: string): string => {
    let text = s;
    const templates = ['int', 'diff', 'frac', 'mix', 'root', 'sqrt', 'sqr', 'cube', 'log_b', 'log10', 'ln', 'abs', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sin', 'cos', 'tan', 'pwr', 'Σ', 'nCr', 'nPr', 'factorial', 'exp', 'pow'];
    
    // Process templates inner-out by always finding the first template with a balanced pair
    let lastLength = -1;
    while (text.length !== lastLength) {
        lastLength = text.length;
        let earliestIdx = Infinity;
        let bestT = '';
        
        for (const t of templates) {
            let idx = text.indexOf(t + '(');
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                bestT = t;
            }
        }
        
        if (bestT) {
            const bal = getBalanced(text, earliestIdx + bestT.length);
            if (bal) {
                // IMPORTANT: Process the inner content first to handle nested templates
                const innerProcessed = renderLaTeX(bal.content);
                const args = splitTopLevelArgs(innerProcessed);
                let replaced = '';
                
                if (bestT === 'int') replaced = `\\int_{${args[1]}}^{${args[2]}} ${args[0]} \\, d${args[3] || 'x'}`;
                else if (bestT === 'diff') replaced = `\\frac{d}{d${args[1] || 'x'}}\\left(${args[0]}\\right)\\bigg|_{${args[1] || 'x'}=${args[2]}}`;
                else if (bestT === 'frac') replaced = `\\frac{${args[0]}}{${args[1]}}`;
                else if (bestT === 'mix') replaced = `${args[0]}\\frac{${args[1]}}{${args[2]}}`;
                else if (bestT === 'root') replaced = `\\sqrt[${args[0]}]{${args[1]}}`;
                else if (bestT === 'sqrt') replaced = `\\sqrt{${args[0]}}`;
                else if (bestT === 'sqr') replaced = `{${args[0]}}^2`;
                else if (bestT === 'cube') replaced = `{${args[0]}}^3`;
                else if (bestT === 'pwr') replaced = `{${args[0]}}^{${args[1]}}`;
                else if (bestT === 'log_b') replaced = `\\log_{${args[0]}}(${args[1]})`;
                else if (bestT === 'log10') replaced = `\\log_{10}(${args[0]})`;
                else if (bestT === 'ln') replaced = `\\ln(${args[0]})`;
                else if (bestT === 'abs') replaced = `|${args[0]}|`;
                else if (bestT === 'sin') replaced = `\\sin(${args[0]})`;
                else if (bestT === 'cos') replaced = `\\cos(${args[0]})`;
                else if (bestT === 'tan') replaced = `\\tan(${args[0]})`;
                else if (bestT === 'sin⁻¹') replaced = `\\arcsin(${args[0]})`;
                else if (bestT === 'cos⁻¹') replaced = `\\arccos(${args[0]})`;
                else if (bestT === 'tan⁻¹') replaced = `\\arctan(${args[0]})`;
                else if (bestT === 'Σ') replaced = `\\sum_{${args[1] || 'x'}=${args[2]}}^{${args[3]}} ${args[0]}`;
                else if (bestT === 'nCr') replaced = `{\\textstyle \\binom{${args[0]}}{${args[1]}}}`;
                else if (bestT === 'nPr') replaced = `{}^{${args[0]}}P_{${args[1]}}`;
                else if (bestT === 'factorial') replaced = `{${args[0]}}!`;
                else if (bestT === 'exp') replaced = `e^{${args[0]}}`;
                else if (bestT === 'pow') replaced = `{${args[0]}}^{${args[1]}}`;

                text = text.substring(0, earliestIdx) + replaced + text.substring(bal.endIdx + 1);
                // After a replacement, we must break and start again to ensure correct order
                continue; 
            }
        }
        break; // No more templates with balanced parens found
    }
    return text;
  };

  let s = renderLaTeX(proc);
  
  // Basic replacements for symbols outside templates
  s = s.replace(/×/g, '\\times ')
       .replace(/÷/g, '\\div ')
       .replace(/π/g, '\\pi ')
       .replace(/×10\^/g, '\\times 10^');

  return s;
};

const formatMath = (input: string): string => {
  const isEmpty = (text: string) => {
    if (!text) return true;
    let clean = text.replace('‸', '');
    return clean.trim() === '';
  };

  const slot = (text: string) => {
    if (text.includes('‸')) return text;
    return isEmpty(text) ? '⬚' : text;
  };
  
  let h = input;

  // Replace factorial internal representation back to symbol for display
  h = h.replace(/factorial\(([^)]*)\)/g, '$1!');

  // Protect equals signs temporarily to avoid interference with tag replacements
  h = h.replace(/=/g, '___EQUALS___');

  const getBalanced = (s: string, startIdx: number): { content: string, endIdx: number } | null => {
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

  const splitTopLevelArgs = (s: string) => {
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

  // Improved recursive template rendering for display
  const renderTemplates = (s: string): string => {
    let proc = s;
    const templates = ['nCr', 'nPr', 'pol', 'rec', 'mix', 'frac', 'int', 'diff', 'root', 'sqrt', 'sqr', 'cube', 'log_b', 'log10', 'e^', '10^', 'pwr', 'Σ'];
    
    let lastLength = -1;
    while (proc.length !== lastLength) {
        lastLength = proc.length;
        let earliestIdx = Infinity;
        let bestT = '';
        
        for (const t of templates) {
            let idx = proc.indexOf(t + '(');
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                bestT = t;
            }
        }
        
        if (bestT) {
            const bal = getBalanced(proc, earliestIdx + bestT.length);
            if (bal) {
                const innerProcessed = renderTemplates(bal.content);
                const args = splitTopLevelArgs(innerProcessed);
                let replaced = '';
                
                if (bestT === 'nCr' || bestT === 'nPr') {
                   let sym = bestT === 'nCr' ? 'C' : 'P';
                   replaced = `<span class="comb-perm">${slot(args[0])}<span class="comb-perm-sym">${sym}</span>${slot(args[1] || '')}</span>`;
                } else if (bestT === 'pol' || bestT === 'rec') {
                   let sym = bestT === 'pol' ? 'Pol' : 'Rec';
                   replaced = `<span class="trig-fun">${sym}</span>(${slot(args[0])},${slot(args[1] || '')})`;
                } else if (bestT === 'frac') {
                    replaced = `<div class="frac-container"><span class="frac-num">${slot(args[0])}</span><span class="frac-den">${slot(args[1] || '')}</span></div>`;
                } else if (bestT === 'mix') {
                    replaced = `<div class="mix-container"><span class="mix-whole">${slot(args[0])}</span><div class="frac-container"><span class="frac-num">${slot(args[1] || '')}</span><span class="frac-den">${slot(args[2] || '')}</span></div></div>`;
                } else if (bestT === 'int') {
                    replaced = `<div class="int-container"><div class="int-bounds"><span>${slot(args[2])}</span><span>${slot(args[1])}</span></div><span class="int-symbol">∫</span><div class="int-body">${slot(args[0])} d${slot(args[3] || 'x')}</div></div>`;
                } else if (bestT === 'diff') {
                    replaced = `<div class="diff-container"><div class="diff-frac"><span class="diff-top">d</span><span>d${slot(args[1] || 'x')}</span></div>(${slot(args[0])})<div class="diff-at">| ${slot(args[1] || 'x')}=${slot(args[2])}</div></div>`;
                } else if (bestT === 'root') {
                    replaced = `<span class="sup">${slot(args[0])}</span><span class="root-symbol">√</span><span class="root-body">${slot(args[1] || '')}</span>`;
                } else if (bestT === 'sqrt') {
                    replaced = `<span class="root-symbol">√</span><span class="root-body">${slot(args[0])}</span>`;
                } else if (bestT === 'sqr') {
                    replaced = `${slot(args[0])}<span class="sup">2</span>`;
                } else if (bestT === 'cube') {
                    replaced = `${slot(args[0])}<span class="sup">3</span>`;
                } else if (bestT === 'pwr') {
                    replaced = `${slot(args[0])}<span class="sup">${slot(args[1] || '')}</span>`;
                } else if (bestT === 'log_b') {
                    replaced = `log<span class="sub">${slot(args[0])}</span>(${slot(args[1] || '')})`;
                } else if (bestT === 'log10') {
                    replaced = `log(${slot(args[0])})`;
                } else if (bestT === 'e^') {
                    replaced = `e<span class="sup">${slot(args[0])}</span>`;
                } else if (bestT === '10^') {
                    replaced = `10<span class="sup">${slot(args[0])}</span>`;
                } else if (bestT === 'Σ') {
                    replaced = `<div class="sum-container"><div class="sum-bounds"><span>${slot(args[3])}</span><span>${slot(args[1] || 'x')}=${slot(args[2])}</span></div><span class="sum-symbol">Σ</span><div class="sum-body">${slot(args[0])}</div></div>`;
                }

                proc = proc.substring(0, earliestIdx) + replaced + proc.substring(bal.endIdx + 1);
                continue;
            }
        }
        break;
    }
    return proc;
  };

  h = renderTemplates(h);

  h = h.replace(/→([A-M X-Y])/g, '<span style="font-size: 0.8em; margin: 0 4px;">→</span>$1')
       .replace(/\^\(([^)]*)\)/g, (m, p1) => `<span class="sup">${slot(p1)}</span>`) 
       .replace(/\^\(([^)]*)$/g, (m, p1) => `<span class="sup">${slot(p1)}</span>`) 
       .replace(/\^-1/g, '<span class="sup">-1</span>')
       .replace(/‸/g, '<span class="cursor"></span>');
  
  // Restore equals signs with proper styling
  h = h.replace(/___EQUALS___/g, '<span class="equal-symbol mx-1">=</span>');

  h = h.replace(/<span class="empty-slot">⬚<\/span><span class="cursor"><\/span>/g, '<span class="cursor"></span>')
       .replace(/<span class="cursor"><\/span><span class="empty-slot">⬚<\/span>/g, '<span class="cursor"></span>');
  
  return h;
};

const Calculator: React.FC = () => {
  const [isDebug, setIsDebug] = useState(false);
  const [keyStyles, setKeyStyles] = useState<Record<string, KeyStyle>>(INITIAL_KEY_STYLES);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number, y: number, initial: KeyStyle } | null>(null);

  const clickCount = useRef(0);
  const lastClick = useRef(0);

  const handleDebugToggle = () => {
    const now = Date.now();
    if (now - lastClick.current < 500) {
      clickCount.current++;
    } else {
      clickCount.current = 1;
    }
    lastClick.current = now;
    if (clickCount.current >= 3) {
      setIsDebug(!isDebug);
      clickCount.current = 0;
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'move' | 'resize') => {
    if (!isDebug) return;
    e.stopPropagation();
    e.preventDefault();
    setActiveKey(id);
    setDragType(type);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initial: { ...keyStyles[id] }
    });
  };

  const [scale, setScale] = useState(1);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDebug || !activeKey || !dragStart || !dragType) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    setKeyStyles(prev => {
      const current = { ...prev[activeKey] };
      if (dragType === 'move') {
        current.left = Math.round(dragStart.initial.left + dx);
        current.top = Math.round(dragStart.initial.top + dy);
      } else {
        current.width = Math.max(10, Math.round(dragStart.initial.width + dx));
        current.height = Math.max(10, Math.round(dragStart.initial.height + dy));
      }
      return { ...prev, [activeKey]: current };
    });
  }, [isDebug, activeKey, dragStart, dragType, scale]);

  const handleMouseUp = useCallback(() => {
    setActiveKey(null);
    setDragType(null);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (activeKey) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeKey, handleMouseMove, handleMouseUp]);

  const exportConfig = () => {
    let css = "/* New Key Mappings */\n";
    Object.entries(keyStyles).forEach(([id, style]) => {
      const s = style as KeyStyle;
      css += `.key-${id} { top: ${s.top}px; left: ${s.left}px; width: ${s.width}px; height: ${s.height}px; }\n`;
    });
    console.log(css);
    copyToClipboard(css);
    alert("New labels CSS copied to clipboard!");
  };

  const [currentInput, setCurrentInput] = useState<string>("‸");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ans, setAns] = useState<number>(() => {
    const saved = localStorage.getItem('calc_ans');
    return saved ? parseFloat(saved) : 0;
  });
  const [vars, setVars] = useState<Vars>(() => {
    try {
      const saved = localStorage.getItem('calc_vars');
      return saved ? JSON.parse(saved) : { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };
    } catch { return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 }; }
  });

  useEffect(() => {
    // History is no longer persisted
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calc_ans', ans.toString());
  }, [ans]);

  useEffect(() => {
    localStorage.setItem('calc_vars', JSON.stringify(vars));
  }, [vars]);

  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    const saved = localStorage.getItem('calc_angle_mode');
    return (saved as AngleMode) || 'DEG';
  });

  useEffect(() => {
    localStorage.setItem('calc_angle_mode', angleMode);
  }, [angleMode]);

  const [lastValue, setLastValue] = useState<number>(0);
  const [showingResult, setShowingResult] = useState<boolean>(false);
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [isSto, setIsSto] = useState<boolean>(false);
  const [isRcl, setIsRcl] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('decimal');
  const [calcMode, setCalcMode] = useState<CalcMode>('COMP');
  const [promptVar, setPromptVar] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState<string>("0");
  const [prevPromptValue, setPrevPromptValue] = useState<string>("0");
  const [promptVarsQueue, setPromptVarsQueue] = useState<string[]>([]);
  const [eqnCoeffs, setEqnCoeffs] = useState<string[]>(["0", "0", "0"]);
  const [eqnIndex, setEqnIndex] = useState<number>(0);
  const [eqnResults, setEqnResults] = useState<EqnResult[]>([]);
  const [eqnResultIdx, setEqnResultIdx] = useState<number>(0);
  const solveRef = useRef<() => void>(() => {});
  const [syntaxError, setSyntaxError] = useState<boolean>(false);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [showPane, setShowPane] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const targetHeight = 1000 + 40; // Calculator height + padding
      const newScale = Math.min(1, vh / targetHeight);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [paneView, setPaneView] = useState<'history' | 'help'>('history');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleInput = useCallback((val: string) => {
    if (promptVar) {
      if (!isNaN(Number(val)) || val === '.' || val === '-') {
        setPromptValue(prev => {
          if (prev === "0" && val !== '.') return val === '-' ? '-' : val;
          if (val === '-' && prev !== "") return prev;
          return prev + val;
        });
      }
      return;
    }
    if (calcMode === 'MENU') {
      if (val === '1') setCalcMode('COMP');
      else if (val === '5') setCalcMode('EQN_MENU');
      else {
        setCalcMode('COMP'); // Default back for others for now
      }
      setCurrentInput("‸");
      return;
    }
    if (calcMode === 'SETUP') {
      if (val === '3') setAngleMode('DEG');
      else if (val === '4') setAngleMode('RAD');
      else if (val === '5') setAngleMode('GRA');
      setCalcMode('COMP');
      return;
    }
    if (calcMode === 'EQN_MENU') {
      if (val === '3') {
        setCalcMode('EQN_QUAD');
        setEqnCoeffs(["0", "0", "0"]);
        setEqnIndex(0);
      } else return;
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      if (!isNaN(Number(val)) || val === '.' || val === '-') {
        setEqnCoeffs(prev => {
          const next = [...prev];
          let currentStr = next[eqnIndex];
          if (currentStr === "0" && val !== '.') currentStr = "";
          if (val === '-' && currentStr.startsWith('-')) return next;
          next[eqnIndex] = currentStr + val;
          return next;
        });
      }
      return;
    }
    if (calcMode === 'EQN_RESULT') {
      if (!isNaN(Number(val))) {
        setCalcMode('COMP');
        setCurrentInput(val + "‸");
      }
      return;
    }

    setSyntaxError(false);
    if (showingResult || currentInput.includes('→')) {
      const isOperator = /[+×÷\-]/.test(val) || val === 'sqr(‸)' || val === 'cube(‸)' || val.startsWith('pwr(') || val.startsWith('root(') || val.startsWith('frac(');
      let nextInput = isOperator ? "Ans" + val : val;
      if (!nextInput.includes('‸')) nextInput += '‸';
      setCurrentInput(nextInput);
      setShowingResult(false);
    } else {
      let target = val.includes('‸') ? val : val + '‸';
      setCurrentInput(prev => prev.replace('‸', target));
    }
  }, [calcMode, eqnIndex, showingResult, currentInput]);

  const handleTemplateKey = useCallback((type: string) => {
    if (type === 'diff') handleInput("diff(‸,x,‸)");
    else if (type === 'sum') handleInput("Σ(‸,x,0,10)");
    setIsShift(false);
  }, [handleInput]);

  // --- Handlers ---
  const handleKeyFlash = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.classList.add('key-flash');
    setTimeout(() => target.classList.remove('key-flash'), 300);
  };

  const setShiftMomentary = useCallback((val: boolean) => {
    setIsShift(val);
    if (val) setIsAlpha(false);
  }, []);

  const setAlphaMomentary = useCallback((val: boolean) => {
    setIsAlpha(val);
    if (val) setIsShift(false);
  }, []);

  // Wrap button clicks with flash
  const withFlash = (fn: (e?: any) => void, label?: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    handleKeyFlash(e);
    if (label) setCurrentSequence(prev => [...prev, label]);
    fn(e);
  };

  const handleModeSwitch = useCallback(() => {
    if (isShift) {
      setCalcMode('SETUP');
      setIsShift(false);
    } else {
      setCalcMode('MENU');
    }
  }, [isShift]);

  const reconstructSequence = (input: string): string[] => {
    const result: string[] = [];
    let s = input.replace(/[‸⬚]/g, '');
    const tokens = [
      "sinh⁻¹(", "cosh⁻¹(", "tanh⁻¹(", "sin⁻¹(", "cos⁻¹(", "tan⁻¹(",
      "sinh(", "cosh(", "tanh(", "sin(", "cos(", "tan(",
      "pwr(", "root(", "sqr(", "cube(", "frac(", "mix(", "diff(", "int(", "abs(", "log_b(", "log10(", "ln(", "Σ(", 
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

  const performEvaluation = useCallback(() => {
    if (!currentInput || currentInput.includes('→')) return null;
    try {
      let s = currentInput;
      let openCount = (s.match(/\(/g) || []).length, closeCount = (s.match(/\)/g) || []).length;
      s += ')'.repeat(Math.max(0, openCount - closeCount));
      
      let val = evaluateExpression(s, vars, ans, angleMode);
      if (isNaN(val) || !isFinite(val)) {
        console.warn("Evaluation resulted in non-finite value:", val);
        throw "Error";
      }
      
      const raw = currentInput.replace('‸', '');
      const finalSequence = reconstructSequence(raw);

      return { val, raw, finalSequence };
    } catch (e) {
      console.error("Calculator Evaluation Error:", e);
      setSyntaxError(true);
      return null;
    }
  }, [currentInput, vars, ans, angleMode]);

  const handleCalc = useCallback(() => {
    if (isShift) {
      // SOLVE implementation
      setIsShift(false);
      if (!currentInput.includes('X')) {
        setSyntaxError(true);
        return;
      }
      
      let x = vars.X || 0;
      let expr = currentInput.replace(/[‸⬚]/g, '');
      if (expr.includes('=') && !expr.includes('→')) {
        let parts = expr.split('=');
        expr = `(${parts[0]}) - (${parts[1]})`;
      }

      try {
        // Simple Newton-Raphson
        for (let i = 0; i < 40; i++) {
          let f = evaluateExpression(expr, { ...vars, X: x }, ans, angleMode);
          if (Math.abs(f) < 1e-12) break;
          let df = (evaluateExpression(expr, { ...vars, X: x + 1e-7 }, ans, angleMode) - f) / 1e-7;
          if (Math.abs(df) < 1e-15) break; 
          let nextX = x - f / df;
          if (isNaN(nextX)) break;
          x = nextX;
        }
        setVars(prev => ({ ...prev, X: x }));
        setAns(x);
        setShowingResult(true);
        setLastValue(x);
      } catch (e) {
        setSyntaxError(true);
      }
      return;
    }
    if (isAlpha) {
      handleInput('=');
      setIsAlpha(false);
      return;
    }

    // Normal CALC: Find variables
    const varsInExpr = Array.from(new Set(currentInput.match(/[A-MYX]/g) || []));
    if (varsInExpr.length > 0) {
      setPromptVarsQueue(varsInExpr);
      const firstVar = varsInExpr[0];
      setPromptVar(firstVar);
      setPromptValue("0");
      setPrevPromptValue(vars[firstVar]?.toString() || "0");
    } else {
      solveRef.current();
    }
  }, [isShift, isAlpha, currentInput, vars, handleInput, ans, angleMode]);

  const tackleNextPrompt = useCallback(() => {
    if (!promptVar) return;
    
    // Save current prompt value to variable
    const val = parseFloat(promptValue) || parseFloat(prevPromptValue) || 0;
    setVars(prev => ({ ...prev, [promptVar]: val }));

    const nextQueue = promptVarsQueue.slice(1);
    setPromptVarsQueue(nextQueue);
    
    if (nextQueue.length > 0) {
      const nextVar = nextQueue[0];
      setPromptVar(nextVar);
      setPromptValue("0");
      setPrevPromptValue(vars[nextVar]?.toString() || "0");
    } else {
      setPromptVar(null);
      solveRef.current();
    }
  }, [promptVar, promptValue, prevPromptValue, promptVarsQueue, vars]);

  const solve = useCallback(() => {
    if (promptVar) {
      tackleNextPrompt();
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      if (eqnIndex < 2) {
        setEqnIndex(prev => prev + 1);
        return;
      }
      let a = parseFloat(eqnCoeffs[0]) || 0;
      let b = parseFloat(eqnCoeffs[1]) || 0;
      let c = parseFloat(eqnCoeffs[2]) || 0;
      
      let results: EqnResult[] = [];
      if (a === 0) {
        if (b === 0) results = [{ label: "No solution", val: NaN }];
        else results = [{ label: "X =", val: -c / b }];
      } else {
        let disc = b * b - 4 * a * c;
        if (disc < 0) {
          results = [{ label: "No real solutions", val: NaN }];
        } else if (disc === 0) {
          results = [{ label: "X =", val: -b / (2 * a) }];
        } else {
          results = [
            { label: "X1 =", val: (-b + Math.sqrt(disc)) / (2 * a) },
            { label: "X2 =", val: (-b - Math.sqrt(disc)) / (2 * a) }
          ];
        }
      }
      setEqnResults(results);
      setCalcMode('EQN_RESULT');
      setEqnResultIdx(0);
      return;
    }

    if (calcMode === 'EQN_RESULT') {
      if (eqnResultIdx < eqnResults.length - 1) {
        setEqnResultIdx(prev => prev + 1);
      } else {
        setCalcMode('EQN_QUAD');
        setEqnIndex(2);
      }
      return;
    }

    const evalRes = performEvaluation();
    if (evalRes) {
      const { val, raw, finalSequence } = evalRes;
      const latex = toLaTeX(raw);
      setHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        rawInput: raw,
        displayInput: formatMath(raw),
        result: val,
        latex: latex,
        sequence: finalSequence
      }, ...prev].slice(0, 50));

      setAns(val);
      setCurrentSequence([]);
      setLastValue(val);
      setShowingResult(true);
      setDisplayMode(Number.isInteger(val) ? 'decimal' : 'fraction');
    }
  }, [calcMode, eqnIndex, eqnCoeffs, eqnResultIdx, eqnResults, performEvaluation, toLaTeX, formatMath, promptVar, tackleNextPrompt]);

  useEffect(() => {
    solveRef.current = solve;
  }, [solve]);

  const del = useCallback(() => {
    if (promptVar) {
      setPromptValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      setEqnCoeffs(prev => {
        const next = [...prev];
        let str = String(next[eqnIndex]);
        if (str.length > 0) {
          next[eqnIndex] = str.slice(0, -1) || "0";
        }
        return next;
      });
      return;
    }
    if (showingResult) { 
      setShowingResult(false); 
      setCurrentSequence([]);
      return; 
    }
    
    let parts = currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    if (before.length === 0) return;

    // Prune sequence
    setCurrentSequence(prev => prev.slice(0, -1));

    // 1. Atomic buttons
    let found = PATS.find(p => before.endsWith(p));
    if (found) {
      setCurrentInput(before.slice(0, -found.length) + '‸' + after);
      return;
    }

    // 2. Function stems that usually have parentheses
    const stems = ['pwr', 'root', 'abs', 'log10', 'ln', 'sin', 'cos', 'tan', 'sum', 'int', 'fac', 'frac', 'sqrt', 'sqr', 'cube', 'log_b'];
    
    // EXTREME ATOMIC DELETION: If we are at the end of a template, delete it but preserve content
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
          // If it's a multi-arg template with a comma, just back into the comma
          if (content.includes(',')) {
            let lastComma = content.lastIndexOf(',');
            let nextAfter = after;
            if (!after.startsWith(')')) nextAfter = ')' + after;
            setCurrentInput(prefix + '(' + content.slice(0, lastComma) + '‸' + content.slice(lastComma) + nextAfter);
            return;
          }
          setCurrentInput(prefix.slice(0, -match.length) + content + '‸' + after);
          return;
        }
      }
    }

    // Default: one char
    let nextBefore = before.slice(0, -1);
    
    // If we are after a "(", delete the stem too (previous logic)
    if (before.endsWith('(')) {
       let match = stems.find(s => before.endsWith(s + '('));
       if (match) {
          let nextAfter = after;
          if (after.startsWith(')')) {
            nextAfter = after.slice(1);
          }
          setCurrentInput(before.slice(0, -(match.length + 1)) + '‸' + nextAfter);
          return;
       }
    }

    // Successive BS on partial stems
    let revealed = stems.find(s => nextBefore.endsWith(s));
    if (revealed && before.endsWith('(')) {
       let nextAfter = after;
       if (after.startsWith(')')) {
          nextAfter = after.slice(1);
       }
       setCurrentInput(nextBefore.slice(0, -revealed.length) + '‸' + nextAfter);
       return;
    }

    // Special case for power/root comma deletion (e.g. pwr(8,‸) -> 8‸)
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
             // Ensure we consume the closing parenthesis of the template we're exploding
             if (after.startsWith(')')) nextAfter = after.slice(1);
             setCurrentInput(prefix + content + '‸' + nextAfter);
             return;
          }
       }
    }
    
    setCurrentInput(nextBefore + '‸' + after);
  }, [calcMode, eqnIndex, showingResult, currentInput]);

  const clearHistory = () => {
    setHistory([]);
  };

  const clearAll = useCallback(() => {
    if (calcMode === 'EQN_QUAD' || calcMode === 'EQN_RESULT') {
      setEqnCoeffs(["0", "0", "0"]);
      setEqnIndex(0);
      setCalcMode('EQN_QUAD');
      setCurrentSequence([]);
      return;
    }
    setCurrentInput("‸");
    setCurrentSequence([]);
    setShowingResult(false);
    setIsShift(false);
    setIsAlpha(false);
    setIsSto(false);
    setIsRcl(false);
    setCalcMode('COMP');
    setSyntaxError(false);
  }, [calcMode]);

  const handleRight = useCallback(() => {
    if (calcMode === 'EQN_QUAD') {
      setEqnIndex(prev => (prev + 1) % 3);
      return;
    }
    if (showingResult) { setShowingResult(false); return; }
    let i = currentInput.indexOf('‸');
    if (i === -1 || i >= currentInput.length - 1) return;
    
    let before = currentInput.substring(0, i);
    let after = currentInput.substring(i + 1);
    
    let found = PATS.find(p => after.startsWith(p));
    if (found) {
      setCurrentInput(before + found + '‸' + after.substring(found.length));
    } else {
      let c = after[0];
      setCurrentInput(before + c + '‸' + after.substring(1));
    }
  }, [calcMode, showingResult, currentInput]);

  const handleLeft = useCallback(() => {
    if (calcMode === 'EQN_QUAD') {
      setEqnIndex(prev => (prev + 2) % 3);
      return;
    }
    if (showingResult) { setShowingResult(false); return; }
    let i = currentInput.indexOf('‸');
    if (i <= 0) return;
    
    let before = currentInput.substring(0, i);
    let after = currentInput.substring(i + 1);
    
    let found = PATS.find(p => before.endsWith(p));
    if (found) {
      setCurrentInput(before.substring(0, before.length - found.length) + '‸' + found + after);
    } else {
      let c = before[before.length - 1];
      setCurrentInput(before.substring(0, before.length - 1) + '‸' + c + after);
    }
  }, [calcMode, showingResult, currentInput]);

  const handleDown = useCallback(() => {
    if (calcMode === 'EQN_RESULT') {
      if (eqnResultIdx < eqnResults.length - 1) {
        setEqnResultIdx(prev => prev + 1);
      }
      return;
    }
    let i = currentInput.indexOf('‸');
    if (i === -1) return;
    let before = currentInput.substring(0, i);
    let after = currentInput.substring(i + 1);

    // Jump to next comma or closing paren within current template
    let c = after.indexOf(',');
    let p = after.indexOf(')');
    let target = -1;
    
    if (c !== -1 && (p === -1 || c < p)) target = c;
    else if (p !== -1) target = p;

    if (target !== -1) {
      setCurrentInput(before + after.substring(0, target + 1) + '‸' + after.substring(target + 1));
    }
  }, [calcMode, eqnResultIdx, eqnResults, currentInput]);

  const handleUp = useCallback(() => {
    if (calcMode === 'EQN_RESULT') {
      if (eqnResultIdx > 0) {
        setEqnResultIdx(prev => prev - 1);
      }
      return;
    }
    let i = currentInput.indexOf('‸');
    if (i <= 0) return;
    let before = currentInput.substring(0, i);
    let after = currentInput.substring(i + 1);

    // Jump to previous comma or opening paren
    let c = before.lastIndexOf(',', i - 1);
    let p = before.lastIndexOf('(', i - 1);
    let target = -1;

    if (c !== -1 && (p === -1 || c > p)) target = c;
    else if (p !== -1) target = p;

    if (target !== -1) {
      setCurrentInput(before.substring(0, target) + '‸' + before.substring(target) + after);
    }
  }, [calcMode, eqnResultIdx, currentInput]);

  const toggleSD = useCallback(() => {
    if (!showingResult) return;
    setDisplayMode(prev => prev === 'decimal' ? 'fraction' : 'decimal');
  }, [showingResult]);

  const handleAlphaVarRef = useRef<((v: string) => void) | null>(null);
  const handleTrigRef = useRef<((type: string, v: string) => void) | null>(null);
  const handleParenthesesRef = useRef<((type: string, v: string) => void) | null>(null);

  const handleMemory = useCallback((action: string, v?: string) => {
    if (v === 'M' && isAlpha) {
      handleInput('M');
      setIsAlpha(false);
      setIsShift(false);
      return;
    }

    if (action === 'plus_minus') {
      let valToUse = ans;
      if (!showingResult) {
        const evalRes = performEvaluation();
        if (evalRes) {
          valToUse = evalRes.val;
          setAns(evalRes.val);
          setHistory(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            rawInput: evalRes.raw,
            displayInput: formatMath(evalRes.raw),
            result: evalRes.val,
            latex: toLaTeX(evalRes.raw),
            sequence: evalRes.finalSequence
          }, ...prev].slice(0, 50));
          setLastValue(evalRes.val);
          setShowingResult(true);
          setDisplayMode(Number.isInteger(evalRes.val) ? 'decimal' : 'fraction');
        } else {
          return; // Syntax error handled in performEvaluation
        }
      }
      setVars(prev => ({ ...prev, M: isShift ? prev.M - valToUse : prev.M + valToUse }));
    } else if (action === 'rcl_sto') {
      if (isShift) { setIsSto(true); setIsRcl(false); }
      else { setIsRcl(true); setIsSto(false); }
    }
    setIsShift(false);
    setIsAlpha(false);
  }, [isAlpha, isShift, showingResult, ans, performEvaluation, formatMath, toLaTeX, vars]);

  const handleAlphaVar = useCallback((v: string) => {
    if (isSto) {
      let beforeText = currentInput.replace('‸', '');
      let operand = findPrecedingOperand(beforeText);
      
      if (showingResult || !operand || beforeText === '') {
        setVars(prev => ({ ...prev, [v]: ans }));
        setCurrentInput(`Ans→${v}‸`);
      } else {
        try {
          let valToSave = evaluateExpression(operand.replace(/Ans/g, String(ans)), {}, ans, angleMode);
          setVars(prev => ({ ...prev, [v]: valToSave }));
          setCurrentInput(beforeText + `→${v}‸`);
        } catch(e) {
          setVars(prev => ({ ...prev, [v]: ans }));
          setCurrentInput(beforeText + `→${v}‸`);
        }
      }
      setShowingResult(true); 
      setIsSto(false);
      setIsShift(false);
      setIsAlpha(false);
    } else if (isRcl) {
      handleInput(v);
      setIsRcl(false);
      setIsShift(false);
      setIsAlpha(false);
    } else if (isAlpha) {
      handleInput(v);
      setIsAlpha(false);
      setIsShift(false);
    } else {
      if (v === 'A') handleInput('-'); 
      if (v === 'B') handleInput('°'); 
      if (v === 'C') handleInput('hyp'); 
      if (v === 'D') handleTrigRef.current?.('sin', 'D');
      if (v === 'E') handleTrigRef.current?.('cos', 'E');
      if (v === 'F') handleTrigRef.current?.('tan', 'F');
      if (v === 'X') handleParenthesesRef.current?.(')', 'X'); 
      if (v === 'Y') toggleSD(); 
      if (v === 'M') handleMemory('plus_minus', 'M'); 
    }
  }, [isSto, isRcl, isAlpha, currentInput, showingResult, ans, vars, angleMode, handleInput, toggleSD, handleMemory]);

  handleAlphaVarRef.current = handleAlphaVar;

  const handleTrig = useCallback((type: string, v: string) => {
    if (isSto || isRcl || isAlpha) {
      handleAlphaVar(v);
    } else {
      handleInput(type + (isShift ? '⁻¹(' : '('));
      setIsShift(false);
    }
  }, [isAlpha, isShift, isSto, isRcl, handleInput, handleAlphaVar]);

  handleTrigRef.current = handleTrig;

  const handleParentheses = useCallback((type: string, v: string, forceNormal?: boolean) => {
    if ((isSto || isRcl || isAlpha) && !forceNormal) {
      handleAlphaVar(v);
    }
    else if (isShift && !forceNormal) {
      handleInput(type === '(' ? '%' : ',');
      setIsShift(false);
    }
    else {
      handleInput(type);
    }
  }, [isAlpha, isShift, isSto, isRcl, handleInput, handleAlphaVar]);

  handleParenthesesRef.current = handleParentheses;

  const handleFracKey = useCallback(() => {
    if (isShift) {
      handleInput("mix(‸,,)");
    } else {
      if (showingResult) { 
        setCurrentInput("frac(Ans,‸)"); 
        setShowingResult(false); 
      } else {
        let parts = currentInput.split('‸');
        let before = parts[0], after = parts[1] || '';
        let operand = findPrecedingOperand(before);
        if (operand) {
          setCurrentInput(before.slice(0, -operand.length) + `frac(${operand},‸)` + after);
        } else {
          handleInput("frac(‸,)");
        }
      }
    }
    setIsShift(false);
  }, [isShift, showingResult, currentInput, handleInput]);

  const handlePermComb = useCallback((type: 'P' | 'C') => {
    if (!isShift) {
      handleInput(type === 'P' ? '×' : '÷');
      return;
    }
    let fn = type === 'P' ? 'nPr' : 'nCr';
    if (showingResult) {
      setCurrentInput(`${fn}(Ans,‸)`);
      setShowingResult(false);
    } else {
      let parts = currentInput.split('‸');
      let before = parts[0], after = parts[1] || '';
      let operand = findPrecedingOperand(before);
      if (operand) {
        setCurrentInput(before.slice(0, -operand.length) + `${fn}(${operand},‸)` + after);
      } else {
        setCurrentInput(before + `${fn}(‸,)` + after);
      }
    }
    setIsShift(false);
  }, [isShift, showingResult, currentInput, handleInput]);

  const handleIntegralKey = useCallback(() => {
    if (isShift) handleInput("diff(‸,x,‸)"); 
    else handleInput("int(‸,,,x)");
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleSquareKey = useCallback(() => {
    let parts = currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    let symbol = isShift ? '³' : '²';
    
    if (showingResult) {
      setCurrentInput(`Ans${symbol}‸`);
      setShowingResult(false);
      return;
    }

    setCurrentInput(before + `${symbol}‸` + after);
    setIsShift(false);
  }, [isShift, currentInput, showingResult, ans]);

  const handleExpKey = useCallback(() => {
    if (isShift) handleInput('π');
    else if (isAlpha) handleInput('e');
    else handleInput('×10^');
    setIsShift(false); setIsAlpha(false);
  }, [isShift, isAlpha, handleInput]);

  const handlePowerKey = useCallback((arg?: any) => {
    const forcePwr = arg === true;
    let parts = currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    let operand = findPrecedingOperand(before);
    
    if (isShift && !forcePwr) {
      if (operand) {
        // If operand is already wrapped in parentheses, don't double wrap for template if possible
        setCurrentInput(before.slice(0, -operand.length) + `root(${operand},‸)` + after);
      } else {
        setCurrentInput(before + `root(‸,)` + after);
      }
    } else {
      if (operand) {
        // Just use literal ^ for power if it's a simple number/ans/var to avoid template confusion?
        // Actually the user wants (x)^2 not modified. 
        // We'll use ^(‸) which renders as a superscript.
        setCurrentInput(before + `^(‸)` + after);
      } else {
        setCurrentInput(before + `pwr(‸,)` + after);
      }
    }
    setIsShift(false);
  }, [isShift, currentInput]);

  const handleFactorialKey = useCallback(() => {
    if (isShift) handleInput('!'); else handleInput('^-1');
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleSquareRootKey = useCallback(() => {
    if (isShift) handleInput('root(3,‸)'); else handleInput('sqrt(‸)');
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleLogKey = useCallback(() => {
    if (isShift) handleInput('Σ(‸,x,0,10)'); else handleInput('log_b(‸,)');
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleOpKey = useCallback((normal: string, shift: string) => {
    if (isShift) {
      if (shift === 'nCr') handlePermComb('C');
      else if (shift === 'nPr') handlePermComb('P');
      else if (shift === 'pol') handleInput('pol(‸,)');
      else if (shift === 'rec') handleInput('rec(‸,)');
      else handleInput(shift);
    } else {
      handleInput(normal);
    }
    setIsShift(false);
  }, [isShift, handleInput, handlePermComb]);

  // --- Keyboard Support ---
  useEffect(() => {
    const record = (l: string) => setCurrentSequence(prev => [...prev, l]);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();
        if (!isShift) {
          record('SHIFT');
          setShiftMomentary(true);
        }
        return;
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        if (!isAlpha) {
          record('ALPHA');
          setAlphaMomentary(true);
        }
        return;
      }
      
      // Basic keys
      if (e.key === 'Escape') { e.preventDefault(); record('AC'); clearAll(); }
    else if (e.key === 'Backspace') { e.preventDefault(); record('DEL'); del(); }
    else if (e.key === 'Enter') { e.preventDefault(); record('='); solve(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); record('→'); handleRight(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); record('←'); handleLeft(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); record('↑'); handleUp(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); record('↓'); handleDown(); }
    else if (e.key === 'Delete') { e.preventDefault(); record('AC'); clearAll(); }
    
    // Calculator inputs
    else if (/^[0-9]$/.test(e.key) && !e.shiftKey) { e.preventDefault(); record(e.key); handleInput(e.key); }
    else if (e.key === '.') { e.preventDefault(); record('.'); handleInput('.'); }
    else if (e.key === '+') { e.preventDefault(); record('+'); handleInput('+'); }
    else if (e.key === '-') { e.preventDefault(); record('-'); handleInput('-'); }
    else if (e.key === '*') { e.preventDefault(); record('×'); handleInput('×'); }
    else if (e.key === '/') { e.preventDefault(); record('÷'); handleInput('÷'); }
    else if (e.key === '(') { e.preventDefault(); record('('); handleParentheses('(', 'X', true); }
    else if (e.key === ')') { e.preventDefault(); record(')'); handleParentheses(')', 'Y', true); }
    else if (e.key === '^' || (e.key === '6' && e.shiftKey)) { 
      e.preventDefault(); 
      record('xⁿ'); 
      handlePowerKey(true); // Force power mode from keyboard
    }
    
    // Special shortcuts (don't trigger if modifiers are active unless expected)
    else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('SIN'); handleTrig('sin', 'D'); }
    else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('COS'); handleTrig('cos', 'E'); }
    else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('TAN'); handleTrig('tan', 'F'); }
    else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('LOG'); handleLogKey(); }
    else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('√'); handleSquareRootKey(); }
    else if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('x²'); handleSquareKey(); }
    else if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('Ans'); handleInput('Ans'); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();
        setShiftMomentary(false);
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        setAlphaMomentary(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setShiftMomentary, setAlphaMomentary, clearAll, del, solve, handleRight, handleLeft, handleUp, handleDown, handleInput, handleParentheses, handleTrig, handleLogKey, isShift, isAlpha]);

  // --- Rendering Helpers ---
  const renderInput = () => {
    if (promptVar) {
      return (
        <div className="flex flex-col">
          <div className="text-[0.9rem] opacity-70 mb-1" dangerouslySetInnerHTML={{ __html: formatMath(currentInput.replace('‸', '')) }} />
          <div className="flex items-center">
            <span className="mr-2">{promptVar}?</span>
          </div>
        </div>
      );
    }
    if (calcMode === 'MENU') {
      return (
        <div className="mode-menu">
            <div className="mode-item"><span className="mode-num">1:</span>COMP</div>
            <div className="mode-item"><span className="mode-num">2:</span>CMPLX</div>
            <div className="mode-item"><span className="mode-num">3:</span>STAT</div>
            <div className="mode-item"><span className="mode-num">4:</span>BASE-N</div>
            <div className="mode-item"><span className="mode-num">5:</span>EQN</div>
            <div className="mode-item"><span className="mode-num">6:</span>MATRIX</div>
            <div className="mode-item"><span className="mode-num">7:</span>TABLE</div>
            <div className="mode-item"><span className="mode-num">8:</span>VECTOR</div>
        </div>
      );
    }
    if (calcMode === 'SETUP') {
      return (
        <div className="mode-menu">
            <div className="mode-item"><span className="mode-num">1:</span>MthIO</div>
            <div className="mode-item"><span className="mode-num">2:</span>LineIO</div>
            <div className="mode-item"><span className="mode-num">3:</span>Deg</div>
            <div className="mode-item"><span className="mode-num">4:</span>Rad</div>
            <div className="mode-item"><span className="mode-num">5:</span>Gra</div>
            <div className="mode-item"><span className="mode-num">6:</span>Fix</div>
            <div className="mode-item"><span className="mode-num">7:</span>Sci</div>
            <div className="mode-item"><span className="mode-num">8:</span>Norm</div>
        </div>
      );
    }
    if (calcMode === 'EQN_MENU') {
      return (
        <div className="eqn-menu">
            <div>1: anX+bnY=cn</div>
            <div>2: anX+bnY+cnZ=dn</div>
            <div>3: aX²+bX+c=0</div>
            <div>4: aX³+bX²+cX+d=0</div>
        </div>
      );
    }
    if (calcMode === 'EQN_QUAD') {
      return (
        <>
          <div className="eqn-title">aX²+bX+c=0</div>
          <table className="eqn-table">
            <tbody>
              <tr>
                <td className={eqnIndex === 0 ? 'active-cell' : ''}>{eqnCoeffs[0]}</td>
                <td className={eqnIndex === 1 ? 'active-cell' : ''}>{eqnCoeffs[1]}</td>
                <td className={eqnIndex === 2 ? 'active-cell' : ''}>{eqnCoeffs[2]}</td>
              </tr>
            </tbody>
          </table>
        </>
      );
    }
    if (calcMode === 'EQN_RESULT') {
      let res = eqnResults[eqnResultIdx];
      return <div className="eqn-title">{res?.label}</div>;
    }

    return <div dangerouslySetInnerHTML={{ __html: formatMath(currentInput) }} />;
  };

  const renderResult = () => {
    if (promptVar) {
      return (
        <div className="decimal-result flex flex-col items-end">
          <div className="text-[0.7rem] opacity-50 mb-[-4px]">{prevPromptValue}</div>
          <div>{promptValue}</div>
        </div>
      );
    }
    if (calcMode === 'MENU' || calcMode === 'EQN_MENU' || calcMode === 'EQN_QUAD') return null;
    
    if (syntaxError) {
      return <div className="decimal-result error">Syntax ERROR</div>;
    }

    if (calcMode === 'EQN_RESULT') {
      let res = eqnResults[eqnResultIdx];
      return <div className="decimal-result">{res?.val !== undefined && !isNaN(res.val) ? parseFloat(res.val.toFixed(9)) : "Error"}</div>;
    }

    if (showingResult) {
      if (displayMode === 'fraction' && !Number.isInteger(ans)) {
        let f = toFraction(ans);
        if (f.d > 1000000 || f.d === 1) {
          return <div className="decimal-result">{parseFloat(ans.toFixed(9))}</div>;
        }
        return (
          <div className="fraction-result">
            <span className="res-num">{f.n}</span>
            <span className="res-den">{f.d}</span>
          </div>
        );
      }
      return <div className="decimal-result">{Number.isInteger(ans) ? ans : parseFloat(ans.toFixed(10))}</div>;
    }
    
    return <div className="decimal-result">0</div>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

    const renderMappingKey = (id: string, action: (e: React.MouseEvent<HTMLButtonElement>) => void, className: string = "", momentary?: { onDown: () => void, onUp: () => void }) => {
      const style = keyStyles[id];
      const inlineStyle = style ? {
        top: `${style.top}px`,
        left: `${style.left}px`,
        width: `${style.width}px`,
        height: `${style.height}px`,
      } : {};

      return (
        <button 
          key={id} 
          className={`key ${className} ${isDebug ? 'debug-visible' : ''}`} 
          style={inlineStyle}
          onMouseDown={(e) => {
            if (isDebug) {
              handleMouseDown(e, id, 'move');
            } else if (momentary) {
              momentary.onDown();
            }
          }}
          onMouseUp={(e) => {
             if (!isDebug && momentary) {
               momentary.onUp();
             }
          }}
          onMouseLeave={(e) => {
            if (!isDebug && momentary) {
              momentary.onUp();
            }
          }}
          // Touch support
          onPointerDown={(e) => {
            if (!isDebug && momentary) {
              e.currentTarget.setPointerCapture(e.pointerId);
              momentary.onDown();
            }
          }}
          onPointerUp={(e) => {
            if (!isDebug && momentary) {
              momentary.onUp();
            }
          }}
          onClick={(e) => { 
            if (isDebug || momentary) return;
            e.stopPropagation(); 
            action(e); 
          }}
        >
          {isDebug && (
            <>
              <span className="debug-coords">{id} ({style?.left},{style?.top}) {style?.width}x{style?.height}</span>
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-white/50 cursor-nwse-resize z-[110]"
                onMouseDown={(e) => handleMouseDown(e, id, 'resize')}
              />
            </>
          )}
        </button>
      );
    };

    const renderMiniButton = (label: string, id: string | number) => {
      let typeClass = '';
      if (label.match(/^[0-9.]+$/) || label === 'Ans' || label === 'π' || label === 'e' || label === '×10ˣ') {
        typeClass = 'num';
      } else if (['+', '-', '×', '÷', '=', 'DEL', 'AC', '(', ')'].includes(label)) {
        typeClass = 'op';
      } else if (label === 'SHIFT') {
        typeClass = 'shift';
      } else if (label === 'ALPHA') {
        typeClass = 'alpha';
      }
      
      const cls = `mini-btn ${typeClass} ${isDebug ? 'debug-visible' : ''}`;
      
      if (label === 'log_box') {
        return (
          <span className={cls} key={id}>
            log<span className="mini-box ml-1"></span>
          </span>
        );
      }
      if (label.toUpperCase() === 'LOG') {
        return <span className={cls} key={id}>log</span>;
      }
      if (label.toLowerCase() === 'ln') {
        return <span className={cls} key={id}>ln</span>;
      }
      if (label === '√') {
        return (
          <span className={cls} key={id}>
            <div className="flex items-center">
              <span className="text-[12px] -mr-1">√</span><span className="mini-box scale-75"></span>
            </div>
          </span>
        );
      }
      if (label === '∫') {
        return (
          <span className={cls} key={id}>
            <span className="text-[14px] font-serif -mr-1">∫</span>
            <div className="flex flex-col gap-0.5 ml-1">
               <div className="mini-box scale-50"></div>
               <div className="mini-box scale-50"></div>
            </div>
          </span>
        );
      }
      if (label === 'Σ') {
        return (
          <span className={cls} key={id}>
            <span className="text-xs mr-0.5">Σ</span>
            <div className="flex flex-col items-center">
              <span className="mini-box scale-50"></span>
              <span className="mini-box scale-50 mt-1"></span>
            </div>
          </span>
        );
      }
      if (label === 'frac') {
        return (
          <span className={cls} key={id}>
            <div className="frac-graphic">
              <div className="mini-box"></div>
              <div className="frac-line"></div>
              <div className="mini-box"></div>
            </div>
          </span>
        );
      }
      if (label === 'x²' || label === 'x³' || label === 'xⁿ' || label === 'x-1') {
        let sup = '▭';
        if (label.includes('²')) sup = '2';
        else if (label.includes('³')) sup = '3';
        else if (label.includes('-1')) sup = '-1';
        
        return (
          <span className={cls} key={id}>
            x<span className="text-[7px] -mt-2.5 ml-0.5 font-bold">{sup}</span>
          </span>
        );
      }
      if (label === '×10ˣ') {
        return <span className={cls} key={id}>×10ˣ</span>;
      }
      if (label === 'd/dx') {
        return (
          <span className={cls} key={id}>
             <div className="flex flex-col items-center leading-none text-[8px] font-bold">
               <span>d</span>
               <div className="w-3 h-[1px] bg-white/40 my-0.5"></div>
               <span>dx</span>
             </div>
          </span>
        );
      }
      if (label === '°\'"') {
        return <span className={cls} key={id}>°′″</span>;
      }
      if (label === '(-)') {
        return <span className={cls} key={id}>(-)</span>;
      }

      const navigationIcons: Record<string, any> = {
        'UP': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
        'DOWN': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
        'LEFT': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
        'RIGHT': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
      };

      return (
        <span className={cls} key={id}>
          {navigationIcons[label] || label}
        </span>
      );
    };


  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-5 bg-[#121212] min-h-screen m-0 overflow-x-hidden font-sans gap-8">
      {/* Sidebar Toggle */}
      <button 
        onClick={() => setShowPane(!showPane)}
        className="fixed top-4 right-4 z-50 p-3 bg-[#1c1c1c] text-white/80 rounded-full shadow-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors"
        title="Toggle History & Help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </button>

      {/* Scaling Wrapper */}
      <div 
        className="flex-shrink-0 flex items-start justify-center transition-all duration-300 relative"
        style={{ 
          height: `${1000 * scale}px`,
          width: `${504 * scale}px`,
        }}
      >
        <div 
          className="absolute origin-top transform"
          style={{ 
            transform: `scale(${scale})`,
            width: '504px',
            height: '1000px'
          }}
        >
          <div 
            className="calc-container relative w-[504px] h-[1000px] rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ 
              backgroundImage: `url(${calculatorImg})`,
              backgroundSize: '100% 100%', 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'center' 
            }}
          >
        
        <div 
          onClick={handleDebugToggle}
          className="lcd-screen absolute top-[148px] left-[68px] w-[368px] h-[166px] bg-[#94a394] bg-gradient-to-br from-[#a8b8a8] to-[#8e9e8e] px-[14px] pt-[22px] pb-[10px] flex flex-col justify-start font-mono box-border z-[60] cursor-pointer rounded-[4px] shadow-[inset_1px_1px_4px_rgba(0,0,0,0.3)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_0)] after:bg-[length:3.5px_3.5px] after:pointer-events-none after:z-10"
        >
          {isDebug && (
            <div className="absolute inset-x-0 -top-10 flex justify-center gap-2 z-[100]">
              <div className="text-[10px] text-red-500 font-bold bg-white/80 px-2 py-1 rounded text-center animate-pulse shadow-sm">
                CALIBRATION MODE ENABLED (DRAG TO MOVE, SMALL BOX TO RESIZE)
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); exportConfig(); }}
                className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-blue-700 shadow-sm"
              >
                COPY CSS CONFIG
              </button>
            </div>
          )}
          
          <div className="status-bar absolute top-0 left-0 right-0 h-5 px-[10px] text-[8px] font-black flex justify-between items-center z-20 pointer-events-none font-sans tracking-[-0.3px] bg-black/5 border-b border-black/10">
            <div className={`status-item ${isShift ? 'active' : 'opacity-10'}`}>S</div>
            <div className={`status-item ${isAlpha ? 'active' : 'opacity-10'}`}>A</div>
            <div className={`status-item ${vars.M !== 0 ? 'active' : 'opacity-10'}`}>M</div>
            <div className={`status-item ${isSto ? 'active' : 'opacity-10'}`}>STO</div>
            <div className={`status-item ${isRcl ? 'active' : 'opacity-10'}`}>RCL</div>
            <div className={`status-item opacity-10`}>STAT</div>
            <div className={`status-item opacity-10`}>CMPLX</div>
            <div className={`status-item opacity-10`}>MAT</div>
            <div className={`status-item opacity-10`}>VCT</div>
            <div className={`status-item ${angleMode === 'DEG' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>D</div>
            <div className={`status-item ${angleMode === 'RAD' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>R</div>
            <div className={`status-item ${angleMode === 'GRA' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>G</div>
            <div className={`status-item opacity-10`}>FIX</div>
            <div className={`status-item opacity-10`}>SCI</div>
            <div className={`status-item active`}>Math</div>
            <div className={`status-item ${(calcMode === 'EQN_RESULT' && eqnResultIdx > 0) ? 'active' : 'opacity-10'}`}>▲</div>
            <div className={`status-item ${(calcMode === 'EQN_RESULT' && eqnResultIdx < eqnResults.length - 1) ? 'active' : 'opacity-10'}`}>▼</div>
            <div className={`status-item opacity-10`}>Disp</div>
          </div>

          <div id="input-text" className="text-[1.35rem] text-[#111] min-h-[2.2em] text-left whitespace-pre-wrap leading-[1.1] break-all pt-1 relative z-[15] tracking-[-0.8px] mt-[2px] pointer-events-none">
            {renderInput()}
          </div>

          <div id="result-text" className="flex justify-end items-end grow text-[#1a1a1a] pb-1 pointer-events-none">
            {renderResult()}
          </div>
        </div>

        {/* --- Keys --- */}
        {renderMappingKey('calc', withFlash(handleCalc, 'CALC'), 'sci sr1 sc1')}
        {renderMappingKey('integral', withFlash(handleIntegralKey, '∫'), 'sci sr1 sc2')}
        {renderMappingKey('inv', withFlash(handleFactorialKey, 'x-1'), 'sci sr1 sc5')}
        {renderMappingKey('log', withFlash(handleLogKey, 'LOG'), 'sci sr1 sc6')}

        {renderMappingKey('frac', withFlash(handleFracKey, 'ab/c'), 'key-frac')}
        {renderMappingKey('sqrt', withFlash(handleSquareRootKey, '√'), 'sci sr2 sc2')}
        {renderMappingKey('sqr', withFlash(handleSquareKey, 'x²'), 'sci sr2 sc3')}
        {renderMappingKey('pwr', withFlash(handlePowerKey, 'xⁿ'), 'sci sr2 sc4')}
        {renderMappingKey('log10', withFlash(() => handleOpKey('log10(‸)', '10^(‸)'), 'log'), 'sci sr2 sc5')}
        {renderMappingKey('ln', withFlash(() => handleOpKey('ln(‸)', 'e^(‸)'), 'ln'), 'sci sr2 sc6')}

        {renderMappingKey('A', withFlash(() => handleAlphaVar('A'), '(-)'), 'sci sr3 sc1')}
        {renderMappingKey('B', withFlash(() => handleAlphaVar('B'), '°\'"'), 'sci sr3 sc2')}
        {renderMappingKey('C', withFlash(() => handleAlphaVar('C'), 'hyp'), 'sci sr3 sc3')}
        {renderMappingKey('sin', withFlash(() => handleTrig('sin', 'D'), 'SIN'), 'sci sr3 sc4')}
        {renderMappingKey('cos', withFlash(() => handleTrig('cos', 'E'), 'COS'), 'sci sr3 sc5')}
        {renderMappingKey('tan', withFlash(() => handleTrig('tan', 'F'), 'TAN'), 'sci sr3 sc6')}

        {renderMappingKey('rcl', withFlash(() => handleMemory('rcl_sto'), 'RCL'), 'sci sr4 sc1')}
        {renderMappingKey('eng', withFlash(() => handleInput('ENG'), 'ENG'), 'sci sr4 sc2')}
        {renderMappingKey('paren-open', withFlash(() => handleParentheses('(', ''), '('), 'sci sr4 sc3')}
        {renderMappingKey('paren-close', withFlash(() => handleAlphaVar('X'), ')'), 'sci sr4 sc4')}
        {renderMappingKey('sd', withFlash(() => handleAlphaVar('Y'), 'S⇔D'), 'key-sd')}
        {renderMappingKey('mplus', withFlash(() => handleAlphaVar('M'), 'M+'), 'key-mplus')}

        {/* Navigation - Higher priority/Z-index */}
        {renderMappingKey('up', withFlash(handleUp, 'UP'), 'key-up')}
        {renderMappingKey('down', withFlash(handleDown, 'DOWN'), 'key-down')}
        {renderMappingKey('left', withFlash(handleLeft, 'LEFT'), 'key-left')}
        {renderMappingKey('right', withFlash(handleRight, 'RIGHT'), 'key-right')}
        {renderMappingKey('shift', () => {}, 'key-shift', { 
          onDown: () => { setCurrentSequence(prev => [...prev, 'SHIFT']); setShiftMomentary(true); }, 
          onUp: () => setShiftMomentary(false) 
        })}
        {renderMappingKey('alpha', () => {}, 'key-alpha', { 
          onDown: () => { setCurrentSequence(prev => [...prev, 'ALPHA']); setAlphaMomentary(true); }, 
          onUp: () => setAlphaMomentary(false) 
        })}
        
        {renderMappingKey('mode', withFlash(handleModeSwitch, 'MODE'), 'sci sr0 sc6 absolute top-[372px] left-[346px] w-[42px] h-[28px] rounded-[12px] border border-white/5 bg-white/0')}

        {renderMappingKey('7', withFlash(() => handleInput('7'), '7'), 'num nr1 nc1')}
        {renderMappingKey('8', withFlash(() => handleInput('8'), '8'), 'num nr1 nc2')}
        {renderMappingKey('9', withFlash(() => handleInput('9'), '9'), 'num nr1 nc3')}
        {renderMappingKey('del', withFlash(del, 'DEL'), 'num nr1 nc4')}
        {renderMappingKey('ac', withFlash(clearAll, 'AC'), 'num nr1 nc5')}
        
        {renderMappingKey('4', withFlash(() => handleInput('4'), '4'), 'num nr2 nc1')}
        {renderMappingKey('5', withFlash(() => handleInput('5'), '5'), 'num nr2 nc2')}
        {renderMappingKey('6', withFlash(() => handleInput('6'), '6'), 'num nr2 nc3')}
        {renderMappingKey('mul', withFlash(() => handleOpKey('×', 'nPr'), '×'), 'num nr2 nc4')}
        {renderMappingKey('div', withFlash(() => handleOpKey('÷', 'nCr'), '÷'), 'num nr2 nc5')}
        
        {renderMappingKey('1', withFlash(() => handleInput('1'), '1'), 'num nr3 nc1')}
        {renderMappingKey('2', withFlash(() => handleInput('2'), '2'), 'num nr3 nc2')}
        {renderMappingKey('3', withFlash(() => handleInput('3'), '3'), 'num nr3 nc3')}
        {renderMappingKey('add', withFlash(() => handleOpKey('+', 'pol'), '+'), 'num nr3 nc4')}
        {renderMappingKey('sub', withFlash(() => handleOpKey('-', 'rec'), '-'), 'num nr3 nc5')}
        
        {renderMappingKey('0', withFlash(() => handleInput('0'), '0'), 'num nr4 nc1')}
        {renderMappingKey('dot', withFlash(() => handleInput('.'), '.'), 'num nr4 nc2')}
        {renderMappingKey('exp', withFlash(handleExpKey, '×10ˣ'), 'num nr4 nc3')}
        {renderMappingKey('ans', withFlash(() => handleInput('Ans'), 'Ans'), 'num nr4 nc4')}
        {renderMappingKey('solve', withFlash(solve, '='), 'num nr4 nc5')}
        </div>
      </div>
    </div>

      {/* Side Pane */}
      {showPane && (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:w-[350px] md:mt-0 bg-[#1a1a1a] md:rounded-3xl border-l md:border border-white/5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 h-full md:h-fit md:max-h-[900px]">
          <div className="flex border-b border-white/5 relative">
            <button 
              onClick={() => setPaneView('history')}
              className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${paneView === 'history' ? 'bg-white/5 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
            >
              History
            </button>
            <button 
              onClick={() => setPaneView('help')}
              className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${paneView === 'help' ? 'bg-white/5 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
            >
              Keyboard
            </button>
            {/* Close button for mobile split view */}
            <button 
              onClick={() => setShowPane(false)}
              className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {paneView === 'history' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2 pb-2">
                   <span className="text-[10px] font-black tracking-widest uppercase text-white/20">All time</span>
                   <button 
                     onClick={clearHistory}
                     className="text-[9px] font-black tracking-widest uppercase text-white/20 hover:text-red-400 transition-colors"
                   >
                     Clear History
                   </button>
                </div>
                {history.length === 0 ? (
                  <div className="py-20 text-center text-white/10 text-xs italic">
                    History is empty
                  </div>
                ) : (
                  history.map((item, idx) => (
                        <div key={item.id} className="history-row group flex flex-col bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all mb-2 last:mb-0">
                          <div className="flex justify-between items-center mb-1">
                             <div className="text-[9px] text-white/10 font-black tracking-widest uppercase">#{history.length - idx}</div>
                             <div className="flex gap-3">
                               <button 
                                 onClick={() => {
                                   setCurrentInput(item.rawInput + "‸");
                                   setCurrentSequence([...item.sequence]);
                                   setShowingResult(false);
                                 }}
                                 className="text-[9px] text-blue-400/40 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                               >
                                 Load
                               </button>
                           <button 
                             onClick={() => copyToClipboard(item.latex)}
                             className="text-[9px] text-white/5 hover:text-white/30 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                           >
                             LaTeX
                           </button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between overflow-hidden gap-3">
                        <div 
                          className="flex-shrink min-w-0 text-white/90 text-sm overflow-x-auto overflow-y-hidden whitespace-nowrap custom-scrollbar pb-1 lcd-screen-mini"
                          dangerouslySetInnerHTML={{ __html: formatMath(item.rawInput) }}
                        />
                        <div className="flex-shrink-0 text-white text-xl font-black tracking-tighter tabular-nums opacity-90 border-l border-white/10 pl-3">
                          {item.result.toLocaleString(undefined, { maximumFractionDigits: 10 })}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          className={`text-[9.5px] transition-all uppercase font-black tracking-[0.1em] cursor-pointer px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] ${expandedItem === item.id ? 'text-blue-400 border-blue-400/20' : 'text-white/30 hover:text-white/50'}`}
                        >
                          {expandedItem === item.id ? 'Hide Keys' : 'Show Keys'}
                        </button>
                      </div>
                      {expandedItem === item.id && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                          {item.sequence.map((label, i) => (
                            <React.Fragment key={i}>
                              {renderMiniButton(label, `${idx}-${i}`)}
                              {i < item.sequence.length - 1 && <span className="text-[10px] text-white/5 mx-1 font-black">›</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6 text-sm">
                <section>
                  <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                     Portable / Standalone
                  </h4>
                  <p className="text-white/60 text-[11px] leading-relaxed mb-3">
                    Share this app with colleagues for offline use:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                      <span><strong className="text-white/80">Desktop:</strong> Look for the <strong>Install</strong> icon in your browser's address bar.</span>
                    </li>
                    <li className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                      <span><strong className="text-white/80">Mobile:</strong> Open phone browser share menu and select <strong>"Add to Home Screen"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                      <span><strong className="text-white/80">Offline:</strong> Once installed, it works like a native app without internet!</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-blue-400 font-bold mb-2 uppercase text-[10px] tracking-widest">General</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Enter</kbd> <span>Solve/Equals</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Esc</kbd> <span>Clear (AC)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Backspace</kbd> <span>Delete (DEL)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Arrows</kbd> <span>Navigate cursor</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Shift</kbd> <span>Hold for Shift mode</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Alt</kbd> <span>Hold for Alpha mode</span></div>
                  </div>
                </section>
                <section>
                  <h4 className="text-blue-400 font-bold mb-2 uppercase text-[10px] tracking-widest">Math</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">S</kbd> <span>Sin</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">C</kbd> <span>Cos</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">T</kbd> <span>Tan</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">L</kbd> <span>Log / Sum</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">R</kbd> <span>Square Root</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Q</kbd> <span>Square (x²)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">^</kbd> <span>Power (xⁿ)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">A</kbd> <span>Answer (Ans)</span></div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
