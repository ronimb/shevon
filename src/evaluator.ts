import { parse, type AstNode } from './parser.ts';
import type { AngleMode, Vars } from './types.ts';

export const factorial = (n: number): number => {
  const v = Math.round(n);
  if (v < 0) return NaN;
  if (v === 0) return 1;
  if (v > 170) return Infinity; 
  let r = 1;
  for (let i = 2; i <= v; i++) r *= i;
  return r;
};

export const findPrecedingOperand = (text: string): string => {
  if (!text) return '';
  
  // 1. Check for basic tokens (number, Ans, vars/consts)
  // Match a number or a special token at the end
  let match = text.match(/(\d+\.?\d*|Ans|stat_[a-z0-9_]+|pi|[A-M X-Yπe])$/);
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
            'log_b', 'log10', 'ln', 'e^', '10^', '__pow', '__factorial', '__yhat', '__xhat', '__xhat1', '__xhat2'
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

export const toFraction = (decimal: number) => {
  let best_n = Math.round(decimal), best_d = 1, best_err = Math.abs(decimal - best_n);
  for (let d = 1; d <= 1000; d++) {
    let n = Math.round(decimal * d), err = Math.abs(decimal - n / d);
    if (err < best_err) { best_n = n; best_d = d; best_err = err; }
    if (err < 1e-10) break;
  }
  return { n: best_n, d: best_d };
};

export const evaluateExpression = (expr: string, scope: Vars, ans: number, angleMode: AngleMode, statVars: Vars): number => {
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
    __xhat: (y: number) => {
       const { A, B, C, type } = statVars;
       const a = A || 0, b = B || 0, c = C || 0;
       const t = type || 'A+BX';
       if (t === 'A+BX') return (y - a) / (b || 1);
       if (t === 'ln X') return Math.exp((y - a) / (b || 1));
       if (t === 'e^X') return b !== 0 ? Math.log(y / (a || 1)) / b : 0;
       if (t === 'A*B^X') return (a !== 0 && b > 0) ? Math.log(y / a) / Math.log(b) : 0;
       if (t === 'A*X^B') return (a !== 0 && b !== 0) ? Math.exp(Math.log(y / a) / b) : 0;
       if (t === '1/X') return b / (y - a);
       if (t === '_+CX2') {
         if (c === 0) return b !== 0 ? (y - a) / b : 0;
         const disc = b * b - 4 * c * (a - y);
         if (disc < 0) return 0;
         return (-b + Math.sqrt(disc)) / (2 * c);
       }
       return 0;
    },
    __xhat1: (y: number) => {
       const { A, B, C } = statVars;
       const a = A || 0, b = B || 0, c = C || 0;
       if (c === 0) return b !== 0 ? (y - a) / b : 0;
       const disc = b * b - 4 * c * (a - y);
       if (disc < 0) return 0;
       return (-b + Math.sqrt(disc)) / (2 * c);
    },
    __xhat2: (y: number) => {
       const { A, B, C } = statVars;
       const a = A || 0, b = B || 0, c = C || 0;
       if (c === 0) return b !== 0 ? (y - a) / b : 0;
       const disc = b * b - 4 * c * (a - y);
       if (disc < 0) return 0;
       return (-b - Math.sqrt(disc)) / (2 * c);
    },
    __yhat: (x: number) => {
       const { A, B, C, type } = statVars;
       const a = A || 0, b = B || 0, c = C || 0;
       const t = type || 'A+BX';
       if (t === 'A+BX') return a + b * x;
       if (t === 'ln X') return x > 0 ? a + b * Math.log(x) : 0;
       if (t === 'e^X') return a * Math.exp(b * x);
       if (t === 'A*B^X') return a * Math.pow(b, x);
       if (t === 'A*X^B') return (a !== 0 && x > 0) ? a * Math.pow(x, b) : 0;
       if (t === '1/X') return x !== 0 ? a + b / x : 0;
       if (t === '_+CX2') return a + b * x + c * x * x;
       return 0;
    },
    __int: (f: (v: number) => number, a: number, b: number) => {
      const n = 100;
      const h = (b - a) / n;
      let res = (f(a) + f(b)) / 2;
      for (let i = 1; i < n; i++) res += f(a + i * h);
      return res * h;
    },
    __diff: (f: (v: number) => number, p: number) => {
      const h = 1e-7;
      return (f(p + h) - f(p)) / h;
    },
    __sum: (f: (v: number) => number, start: number, end: number) => {
      let t = 0;
      let s = Math.round(start), e = Math.min(Math.round(end), s + 1000);
      for (let i = s; i <= e; i++) t += f(i);
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

  const resolveExponents = (s: string): string => {
    let curr = s;
    while (true) {
      let idxPower = curr.lastIndexOf('^');
      let idxSqr = curr.lastIndexOf('²');
      let idxCube = curr.lastIndexOf('³');
      
      let maxIdx = Math.max(idxPower, idxSqr, idxCube);
      if (maxIdx === -1) {
        break;
      }
      
      let op = curr[maxIdx];
      let before = curr.substring(0, maxIdx);
      let after = curr.substring(maxIdx + 1);
      
      let base = findPrecedingOperand(before);
      if (!base) {
        curr = before + (op === '^' ? '**' : (op === '²' ? '**2' : '**3')) + after;
        continue;
      }
      
      let beforeWithoutBase = before.substring(0, before.length - base.length);
      let exponent = '';
      let afterWithoutExponent = '';
      
      if (op === '²') {
        exponent = '2';
        afterWithoutExponent = after;
      } else if (op === '³') {
        exponent = '3';
        afterWithoutExponent = after;
      } else { // op is '^'
        if (after.startsWith('(')) {
          let bal = getBalanced(curr, maxIdx + 1);
          if (bal) {
            exponent = bal.content;
            afterWithoutExponent = curr.substring(bal.endIdx + 1);
          } else {
            let match = after.match(/^(\([^)]*\)|[a-zA-Z0-9_]+)/);
            if (match) {
              exponent = match[0];
              afterWithoutExponent = after.substring(match[0].length);
            } else {
              exponent = 'NaN';
              afterWithoutExponent = after;
            }
          }
        } else {
          let fNameMatch = after.match(/^[a-zA-Z0-9_]+\(/);
          if (fNameMatch) {
            let fNameLength = fNameMatch[0].length - 1;
            let bal = getBalanced(after, fNameLength);
            if (bal) {
              exponent = after.substring(0, bal.endIdx + 1);
              afterWithoutExponent = after.substring(bal.endIdx + 1);
            } else {
              exponent = 'NaN';
              afterWithoutExponent = after;
            }
          } else {
            let match = after.match(/^([a-zA-Z0-9_]+|\([^)]*\))/);
            if (match) {
              exponent = match[0];
              afterWithoutExponent = after.substring(match[0].length);
            } else {
              exponent = 'NaN';
              afterWithoutExponent = after;
            }
          }
        }
      }
      
      let parsedBase = resolveExponents(base);
      let parsedExponent = resolveExponents(exponent);
      curr = beforeWithoutBase + `__pow(${parsedBase},${parsedExponent})` + afterWithoutExponent;
    }
    return curr;
  };

  let proc = expr.replace(/[‸⬚]/g, '').normalize('NFD');

  // Convert statistical power/summation variables FIRST to avoid any word boundary or symbol conflicts with x, y, n, etc.
  proc = proc
    .replace(/Σx²/g, 'stat_sigx2')
    .replace(/Σx⁴/g, 'stat_sigx4')
    .replace(/Σx³/g, 'stat_sigx3')
    .replace(/Σx²y/g, 'stat_sigx2y')
    .replace(/Σxy/g, 'stat_sigxy')
    .replace(/Σx/g, 'stat_sigx')
    .replace(/x\u0304/g, 'stat_xbar')
    .replace(/x\u0305/g, 'stat_xbar')
    .replace(/x̄/g, 'stat_xbar')
    .replace(/x̅/g, 'stat_xbar')
    .replace(/X\u0304/g, 'stat_xbar')
    .replace(/X\u0305/g, 'stat_xbar')
    .replace(/X̄/g, 'stat_xbar')
    .replace(/X̅/g, 'stat_xbar')
    .replace(/σx/g, 'stat_sigmax')
    .replace(/\u03C3x/g, 'stat_sigmax')
    .replace(/\bsx\b/g, 'stat_sx')
    .replace(/Σy²/g, 'stat_sigy2')
    .replace(/Σy/g, 'stat_sigy')
    .replace(/y\u0304/g, 'stat_ybar')
    .replace(/y\u0305/g, 'stat_ybar')
    .replace(/ȳ/g, 'stat_ybar')
    .replace(/y̅/g, 'stat_ybar')
    .replace(/Y\u0304/g, 'stat_ybar')
    .replace(/Y\u0305/g, 'stat_ybar')
    .replace(/Ȳ/g, 'stat_ybar')
    .replace(/Y̅/g, 'stat_ybar')
    .replace(/σy/g, 'stat_sigmay')
    .replace(/\u03C3y/g, 'stat_sigmay')
    .replace(/\bsy\b/g, 'stat_sy')
    .replace(/\bn\b/g, 'N')
    .replace(/\br\b/g, 'R')
    .replace(/minX/g, 'stat_minx')
    .replace(/maxX/g, 'stat_maxx')
    .replace(/minY/g, 'stat_miny')
    .replace(/maxY/g, 'stat_maxy');

  // Robust xHat/yHat replacement
  for (const sym of ['x̂1', 'x̂2', 'x̂', 'ŷ'].map(s => s.normalize('NFD'))) {
    let sIdx;
    while ((sIdx = proc.indexOf(sym)) !== -1) {
      let before = proc.substring(0, sIdx);
      let after = proc.substring(sIdx + sym.length);
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
        let fn = '__yhat';
        if (sym === 'x̂1'.normalize('NFD')) fn = '__xhat1';
        else if (sym === 'x̂2'.normalize('NFD')) fn = '__xhat2';
        else if (sym === 'x̂'.normalize('NFD')) fn = '__xhat';
        proc = before + `${fn}(${operand})` + after;
      } else {
        proc = before + '0' + after;
      }
    }
  }
  
  if (proc.includes('=') && !proc.includes('→')) {
    let parts = proc.split('=');
    if (parts.length === 2) {
      proc = `(${parts[0]}) - (${parts[1]})`;
    }
  }

  const mathTemplates = [
    // diff/int/Σ are lowered to plain calls; their first argument is left as a
    // sub-expression in the IR and evaluated as a function of X by the AST
    // walker (see LAMBDA_FORMS below). This avoids emitting JS arrow functions.
    { name: 'diff', replace: (args: string[]) => `__diff(${args[0]}, ${args[2]})` },
    { name: 'int', replace: (args: string[]) => `__int(${args[0]}, ${args[1]}, ${args[2]})` },
    { name: 'Σ', replace: (args: string[]) => `__sum(${args[0]}, ${args[2]}, ${args[3]})` },
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
    .replace(/×10\^/g, '*10**');

  proc = resolveExponents(proc);

  // Enhanced implicit multiplication
  const funcOrVar = '(Ans|[A-Zπe]|stat_[a-z0-9_]+|__[a-z]+[A-Za-z0-9]*\\()';
  proc = proc.replace(new RegExp(`(\\d+)${funcOrVar}`, 'g'), '$1*$2')
             .replace(new RegExp(`(\\bAns\\b|[A-Zπe])${funcOrVar}`, 'g'), '$1*$2')
             .replace(/(\bAns\\b|[A-Zπe])(\d+)/g, '$1*$2')
             .replace(new RegExp(`(\\))(\\d+|${funcOrVar})`, 'g'), ')*$2')
             .replace(new RegExp(`(\\d+|Ans|[A-Zπe]|\\))(\\()`, 'g'), '$1*(');

  proc = proc.replace(/π/g, 'pi')
    .replace(/\be\b/g, 'e')
    .replace(/\bx\b/g, 'X')
    .replace(/\by\b/g, 'Y');

  // Identifiers that resolve to a value (variables and constants). Function
  // names live in `h` and are looked up separately when a call node is walked.
  const constants: Vars = { pi: Math.PI, e: Math.E, NaN: NaN, Infinity: Infinity };
  const baseEnv: Vars = { Ans: ans, ...scope, ...statVars, ...constants };

  // Functions whose FIRST argument is a sub-expression in the calculator
  // variable X rather than a value: differentiation, integration and Σ. The
  // remaining arguments are ordinary values. Mapping: function name → the h
  // helper receives (f, ...restValues) where f(x) evaluates the sub-expression.
  const LAMBDA_FORMS = new Set(['__diff', '__int', '__sum']);

  const evalNode = (node: AstNode, env: Vars): number => {
    switch (node.type) {
      case 'num':
        return node.value;
      case 'var': {
        if (Object.prototype.hasOwnProperty.call(env, node.name)) {
          return Number(env[node.name]);
        }
        throw new Error(`Undefined variable "${node.name}"`);
      }
      case 'unary': {
        const v = evalNode(node.operand, env);
        return node.op === '-' ? -v : +v;
      }
      case 'binary': {
        const l = evalNode(node.left, env);
        const r = evalNode(node.right, env);
        switch (node.op) {
          case '+': return l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': return l / r;
          case '**': return Math.pow(l, r);
        }
        // Unreachable, but keeps the type checker happy.
        throw new Error(`Unknown operator "${(node as any).op}"`);
      }
      case 'call': {
        const fn = h[node.name];
        if (typeof fn !== 'function') {
          throw new Error(`Undefined function "${node.name}"`);
        }
        if (LAMBDA_FORMS.has(node.name)) {
          const [bodyNode, ...restNodes] = node.args;
          const f = (x: number) => evalNode(bodyNode, { ...env, X: x });
          const rest = restNodes.map((a) => evalNode(a, env));
          return fn(f, ...rest);
        }
        const args = node.args.map((a) => evalNode(a, env));
        return fn(...args);
      }
    }
  };

  try {
    const ast = parse(proc);
    return evalNode(ast, baseEnv);
  } catch (e) {
    console.warn("Evaluation error for expression:", proc, e);
    throw e;
  }
};
