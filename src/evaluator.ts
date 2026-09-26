import { parse, ParseError, type AstNode } from './parser.ts';
import { DEFAULT_FORMAT, roundToFormat, type DisplayFormat } from './format.ts';
import { CalcError, calcPair, calcReal, type AngleMode, type CalcValue, type Vars } from './types.ts';

/** Rewrite text plus a parallel map: map[i] is the caret-stripped original index of text[i]. */
type Mapped = { text: string; map: number[] };

function mappedFromOriginal(original: string): Mapped {
  let text = '';
  const map: number[] = [];
  for (let i = 0; i < original.length; ) {
    const cp = original.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    const nfd = ch.normalize('NFD');
    for (const unit of nfd) {
      text += unit;
      map.push(i);
    }
    i += ch.length;
  }
  return { text, map };
}

function sliceMapped(m: Mapped, start: number, end: number = m.text.length): Mapped {
  return { text: m.text.slice(start, end), map: m.map.slice(start, end) };
}

function mappedLit(text: string, orig: number): Mapped {
  return { text, map: Array.from({ length: text.length }, () => orig) };
}

function concatMapped(parts: Mapped[]): Mapped {
  if (parts.length === 0) return { text: '', map: [] };
  if (parts.length === 1) return parts[0];
  let text = '';
  const map: number[] = [];
  for (const p of parts) {
    text += p.text;
    for (let i = 0; i < p.map.length; i++) map.push(p.map[i]);
  }
  return { text, map };
}

function replaceLiteral(m: Mapped, search: string, replacement: string): Mapped {
  if (!search || !m.text.includes(search)) return m;
  const parts: Mapped[] = [];
  let i = 0;
  while (i < m.text.length) {
    const idx = m.text.indexOf(search, i);
    if (idx === -1) {
      parts.push(sliceMapped(m, i));
      break;
    }
    if (idx > i) parts.push(sliceMapped(m, i, idx));
    parts.push(mappedLit(replacement, m.map[idx] ?? 0));
    i = idx + search.length;
  }
  return concatMapped(parts);
}

function replaceRegex(m: Mapped, re: RegExp, replacer: (match: RegExpExecArray) => string): Mapped {
  const g = re.global ? re : new RegExp(re.source, `${re.flags}g`);
  const parts: Mapped[] = [];
  let last = 0;
  g.lastIndex = 0;
  const src = m.text;
  let match: RegExpExecArray | null;
  while ((match = g.exec(src)) !== null) {
    if (match.index > last) parts.push(sliceMapped(m, last, match.index));
    parts.push(mappedLit(replacer(match), m.map[match.index] ?? 0));
    last = match.index + match[0].length;
    if (match[0].length === 0) g.lastIndex++;
  }
  if (last < src.length) parts.push(sliceMapped(m, last));
  return parts.length ? concatMapped(parts) : m;
}

function toOrig(map: number[], pos: number, origLen: number): number {
  if (pos < 0) return 0;
  if (pos >= map.length) return origLen;
  return map[pos];
}

function remapAstOffsets(node: AstNode, map: number[], origLen: number): AstNode {
  const offset = toOrig(map, node.offset, origLen);
  switch (node.type) {
    case 'num':
    case 'var':
      return { ...node, offset };
    case 'unary':
      return { ...node, offset, operand: remapAstOffsets(node.operand, map, origLen) };
    case 'binary':
      return {
        ...node,
        offset,
        left: remapAstOffsets(node.left, map, origLen),
        right: remapAstOffsets(node.right, map, origLen),
      };
    case 'call':
      return { ...node, offset, args: node.args.map((a) => remapAstOffsets(a, map, origLen)) };
  }
}

type NumFn = (...args: number[]) => number;
type LambdaFn = (f: (v: number) => number, ...rest: number[]) => number;
type HelperFn = NumFn | LambdaFn;
type HelperBag = Record<string, number | HelperFn | typeof Math>;

/** Integers only — do not round (R6). Cap stays 170 (`fact-max` is 69). */
export const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n === 0) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

/** Odd quarter-turns (90° / GRA 100 / π/2 and equivalents) are poles (R1). */
function isTanPole(x: number, angleMode: AngleMode): boolean {
  if (!Number.isFinite(x)) return true;
  let k: number;
  if (angleMode === 'DEG') k = (x - 90) / 180;
  else if (angleMode === 'GRA') k = (x - 100) / 200;
  else k = (x - Math.PI / 2) / Math.PI;
  return Math.abs(k - Math.round(k)) <= 1e-12;
}

/** Real odd root of a negative; even / non-integer index stays NaN (R5). */
function nthRoot(n: number, x: number): number {
  if (!Number.isFinite(n) || n === 0) return NaN;
  if (x < 0) {
    if (Number.isInteger(n) && Math.abs(n) % 2 === 1) {
      return -Math.pow(-x, 1 / n);
    }
    return NaN;
  }
  return Math.pow(x, 1 / n);
}

/** Hardware: 0^0 is Math ERROR, not JS 1 (R20). */
function realPow(base: number, exp: number): number {
  if (base === 0 && exp === 0) return NaN;
  return Math.pow(base, exp);
}

function requireNonnegInts(n: number, r: number): boolean {
  return Number.isInteger(n) && Number.isInteger(r) && n >= 0 && r >= 0 && r <= n;
}

export type PolRecWrite = { X: number; Y: number };

/** Copy Pol/Rec X,Y onto a vars snapshot for setVars (R16). */
export function mergePolRecVars(vars: Vars, write: PolRecWrite | null | undefined): Vars {
  if (!write || !Number.isFinite(write.X) || !Number.isFinite(write.Y)) return vars;
  return { ...vars, X: write.X, Y: write.Y };
}

function finitePolRecWrite(write: PolRecWrite): PolRecWrite | undefined {
  if (!Number.isFinite(write.X) || !Number.isFinite(write.Y)) return undefined;
  return { X: write.X, Y: write.Y };
}

/**
 * Hardware `%` is ÷100 on every path (R17 / E-11).
 * `200+10%` is 200.1; `200-10%` is 199.9. Not percent-of.
 */
function rewritePercentMapped(m: Mapped): Mapped {
  let curr = m;
  while (true) {
    const idx = curr.text.lastIndexOf('%');
    if (idx === -1) return curr;
    const pctOrig = curr.map[idx] ?? 0;
    curr = concatMapped([
      sliceMapped(curr, 0, idx),
      mappedLit('/100', pctOrig),
      sliceMapped(curr, idx + 1),
    ]);
  }
}

/**
 * Preceding operand for postfix x² / % / nCr.
 * Hardware priority: postfix x² is above prefix (−), so `(−) 3 x²`
 * is `-3²` = −9, not (−3)². Do not swallow a leading unary minus (R15).
 */
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
            'sinh⁻¹', 'cosh⁻¹', 'tanh⁻¹', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sin', 'cos', 'tan',
            'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan',
            'sqrt', 'abs', 'Rnd', 'frac', 'pwr', 'root', 'sqr', 'cube', 
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

/** 10-digit hardware: n/d must match the value to displayed precision. */
const fractionFits = (value: number, n: number, d: number) => {
  if (d <= 0 || !Number.isFinite(n / d)) return false;
  const scale = Math.max(Math.abs(value), Math.abs(n / d), 1e-12);
  return Math.abs(value - n / d) <= scale * 5e-11;
};

/**
 * Exact p/q only — never a nearby guess (cos 6° is not 363/365).
 * Continued fraction; accept only when it terminates (true rational) and
 * matches to 10 digits. Surd/π forms are `p4-exact`.
 */
export const toFraction = (decimal: number): { n: number; d: number } | null => {
  if (!Number.isFinite(decimal)) return null;
  const sign = decimal < 0 ? -1 : 1;
  const x = Math.abs(decimal);

  if (fractionFits(x, Math.round(x), 1)) return { n: sign * Math.round(x), d: 1 };

  let h0 = 0, k0 = 1, h1 = 1, k1 = 0;
  let v = x;
  for (let i = 0; i < 32; i++) {
    if (!Number.isFinite(v)) return null;
    const a = Math.floor(v);
    const h = a * h1 + h0;
    const k = a * k1 + k0;
    if (k === 0 || Math.abs(h) > 1e10 || k > 1e10) return null;
    const rem = v - a;
    if (rem < 1e-12) {
      return fractionFits(x, h, k) ? { n: sign * h, d: k } : null;
    }
    v = 1 / rem;
    h0 = h1; k0 = k1; h1 = h; k1 = k;
  }
  return null;
};

export const resultDisplayMode = (val: number): 'decimal' | 'fraction' => {
  const f = toFraction(val);
  return f !== null && f.d > 1 ? 'fraction' : 'decimal';
};

/** Regression / sample letters stay in user memory. STAT recall uses stat_*. */
const STAT_SCOPE_BLOCK = new Set(['A', 'B', 'C', 'R', 'N', 'type', 'xHat', 'yHat']);

function statRecallEnv(statVars: Vars): Vars {
  const env: Vars = {};
  for (const key of Object.keys(statVars)) {
    if (!STAT_SCOPE_BLOCK.has(key)) env[key] = statVars[key];
  }
  return env;
}

function finiteStat(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

/** Inverse estimate. Invalid domain is NaN → Math ERROR (R18), never a fake 0. */
function xhatEstimate(statVars: Vars, y: number, root: 1 | 2): number {
  const a = finiteStat(statVars.A);
  const b = finiteStat(statVars.B);
  const c = finiteStat(statVars.C);
  const t = String(statVars.type || 'A+BX');
  if (!Number.isFinite(y) || !Number.isFinite(a) || !Number.isFinite(b)) return NaN;

  if (t === '_+CX2' || root === 2) {
    if (!Number.isFinite(c)) return NaN;
    if (c === 0) return b !== 0 ? (y - a) / b : NaN;
    const disc = b * b - 4 * c * (a - y);
    if (disc < 0) return NaN;
    const sign = root === 2 ? -1 : 1;
    return (-b + sign * Math.sqrt(disc)) / (2 * c);
  }
  if (t === 'A+BX') return b !== 0 ? (y - a) / b : NaN;
  if (t === 'ln X') return b !== 0 ? Math.exp((y - a) / b) : NaN;
  if (t === 'e^X') {
    if (a === 0 || b === 0 || y / a <= 0) return NaN;
    return Math.log(y / a) / b;
  }
  if (t === 'A*B^X') {
    if (a === 0 || b <= 0 || y / a <= 0) return NaN;
    return Math.log(y / a) / Math.log(b);
  }
  if (t === 'A*X^B') {
    if (a === 0 || b === 0 || y / a <= 0) return NaN;
    return Math.exp(Math.log(y / a) / b);
  }
  if (t === '1/X') return y !== a ? b / (y - a) : NaN;
  return NaN;
}

function yhatEstimate(statVars: Vars, x: number): number {
  const a = finiteStat(statVars.A);
  const b = finiteStat(statVars.B);
  const c = finiteStat(statVars.C);
  const t = String(statVars.type || 'A+BX');
  if (!Number.isFinite(x) || !Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  if (t === 'A+BX') return a + b * x;
  if (t === 'ln X') return x > 0 ? a + b * Math.log(x) : NaN;
  if (t === 'e^X') return a * Math.exp(b * x);
  if (t === 'A*B^X') return b > 0 ? a * Math.pow(b, x) : NaN;
  if (t === 'A*X^B') return x > 0 ? a * Math.pow(x, b) : NaN;
  if (t === '1/X') return x !== 0 ? a + b / x : NaN;
  if (t === '_+CX2') return Number.isFinite(c) ? a + b * x + c * x * x : NaN;
  return NaN;
}

export const evaluateExpression = (
  expr: string,
  scope: Vars,
  ans: number,
  angleMode: AngleMode,
  statVars: Vars,
  displayFormat: DisplayFormat = DEFAULT_FORMAT,
  varsWrite?: PolRecWrite,
): CalcValue => {
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

  const polRecWrite: PolRecWrite = { X: Number.NaN, Y: Number.NaN };

  const h: HelperBag = {
    pi: Math.PI, e: Math.E,
    __sin: (x: number) => Math.sin(toRad(x)),
    __cos: (x: number) => Math.cos(toRad(x)),
    __tan: (x: number) => (isTanPole(x, angleMode) ? NaN : Math.tan(toRad(x))),
    __asin: (x: number) => fromRad(Math.asin(x)),
    __acos: (x: number) => fromRad(Math.acos(x)),
    __atan: (x: number) => fromRad(Math.atan(x)),
    __sinh: Math.sinh, __cosh: Math.cosh, __tanh: Math.tanh,
    __asinh: Math.asinh, __acosh: Math.acosh, __atanh: Math.atanh,
    __sqrt: Math.sqrt, __log: Math.log, __log10: Math.log10, __exp: Math.exp, __pow: realPow,
    __abs: Math.abs, Math: Math,
    __rnd: (x: number) => roundToFormat(x, displayFormat),
    __nthroot: nthRoot,
    __logb: (b: number, x: number) => Math.log(x) / Math.log(b),
    __factorial: factorial,
    __ncr: (n: number, r: number) => {
      if (!requireNonnegInts(n, r)) return NaN;
      if (n > 1000000) return Infinity;
      if (r === 0 || r === n) return 1;
      let res = 1;
      const k = Math.min(r, n - r);
      for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
      }
      return Math.round(res);
    },
    __npr: (n: number, r: number) => {
      if (!requireNonnegInts(n, r)) return NaN;
      if (n > 1000000) return Infinity;
      let res = 1;
      for (let i = 0; i < r; i++) {
        res *= (n - i);
        if (!isFinite(res)) break;
      }
      return Math.round(res);
    },
    __ranint: (a: number, b: number) => {
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    // hardware Ran#: three-digit decimal in [0, 1), i.e. 0.000 … 0.999.
    '__ranhash': () => Math.floor(Math.random() * 1000) / 1000,
    __pol: (x: number, y: number) => {
      const r = Math.sqrt(x*x + y*y);
      const theta = fromRad(Math.atan2(y, x));
      polRecWrite.X = r;
      polRecWrite.Y = theta;
      return r;
    },
    __rec: (r: number, theta: number) => {
      const x = r * Math.cos(toRad(theta));
      const y = r * Math.sin(toRad(theta));
      polRecWrite.X = x;
      polRecWrite.Y = y;
      return x;
    },
    __xhat: (y: number) => xhatEstimate(statVars, y, 1),
    __xhat1: (y: number) => xhatEstimate(statVars, y, 1),
    __xhat2: (y: number) => xhatEstimate(statVars, y, 2),
    __yhat: (x: number) => yhatEstimate(statVars, x),
    // Adaptive Gauss–Kronrod (G7–K15), the same family the hardware uses,
    // so ∫ matches the hardware to displayed precision instead of the old
    // fixed-step trapezoid.
    __int: (f: (v: number) => number, a: number, b: number) => {
      if (a === b) return 0;
      const sign = b < a ? -1 : 1;
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      // Hardware times out near a singularity (R22). Count f-evals, not depth.
      const INT_EVAL_BUDGET = 8000;
      let nEval = 0;
      const fb = (v: number) => {
        if (++nEval > INT_EVAL_BUDGET) throw new CalcError('timeout');
        return f(v);
      };

      const XGK = [
        0.991455371120813, 0.949107912342759, 0.864864423359769,
        0.741531185599394, 0.586087235467691, 0.405845151377397,
        0.207784955007898, 0.0,
      ];
      const WGK = [
        0.022935322010529, 0.063092092629979, 0.104790010322250,
        0.140653259715525, 0.169004726639267, 0.190350578064785,
        0.204432940075298, 0.209482141084728,
      ];
      const WG = [
        0.129484966168870, 0.279705391489277,
        0.381830050505119, 0.417959183673469,
      ];

      const gk15 = (lo2: number, hi2: number) => {
        const center = 0.5 * (lo2 + hi2);
        const halfLength = 0.5 * (hi2 - lo2);
        const fc = fb(center);
        let resGauss = WG[3] * fc;
        let resKronrod = WGK[7] * fc;
        for (let j = 0; j < 3; j++) {
          const jtw = 2 * j + 1;
          const x = halfLength * XGK[jtw];
          const fsum = fb(center - x) + fb(center + x);
          resGauss += WG[j] * fsum;
          resKronrod += WGK[jtw] * fsum;
        }
        for (let j = 0; j < 4; j++) {
          const jtwm = 2 * j;
          const x = halfLength * XGK[jtwm];
          resKronrod += WGK[jtwm] * (fb(center - x) + fb(center + x));
        }
        return {
          integral: resKronrod * halfLength,
          err: Math.abs((resKronrod - resGauss) * halfLength),
        };
      };

      const adaptive = (lo2: number, hi2: number, tol: number, depth: number): number => {
        const { integral, err } = gk15(lo2, hi2);
        if (err < tol || depth <= 0) return integral;
        const mid = 0.5 * (lo2 + hi2);
        return (
          adaptive(lo2, mid, tol / 2, depth - 1) +
          adaptive(mid, hi2, tol / 2, depth - 1)
        );
      };

      return sign * adaptive(lo, hi, 1e-11, 50);
    },
    // Central difference with one Richardson extrapolation (O(h^4)), replacing
    // the old forward difference so d/dx is symmetric and accurate to display.
    __diff: (f: (v: number) => number, p: number) => {
      const scale = Math.abs(p) > 1 ? Math.abs(p) : 1;
      const h = 1e-4 * scale;
      const d1 = (f(p + h) - f(p - h)) / (2 * h);
      const d2 = (f(p + h / 2) - f(p - h / 2)) / h;
      return (4 * d2 - d1) / 3;
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

  const original = expr.replace(/[‸⬚]/g, '');
  const origLen = original.length;
  let mapped = mappedFromOriginal(original);

  // Sexagesimal (degrees-minutes-seconds) input: d°m°s° → decimal degrees.
  // The °′″ key emits a single ° between each field, so 2°30°0° means 2°30′00″.
  // Longest match first so the 2- and 1-field fallbacks don't split a triple.
  mapped = replaceRegex(mapped, /(\d+(?:\.\d+)?)°(\d+(?:\.\d+)?)°(\d+(?:\.\d+)?)°?/g,
    (m) => `(${m[1]}+(${m[2]})/60+(${m[3]})/3600)`);
  mapped = replaceRegex(mapped, /(\d+(?:\.\d+)?)°(\d+(?:\.\d+)?)°?/g,
    (m) => `(${m[1]}+(${m[2]})/60)`);
  mapped = replaceRegex(mapped, /(\d+(?:\.\d+)?)°/g, (m) => `(${m[1]})`);

  // Convert statistical power/summation variables FIRST to avoid any word boundary or symbol conflicts with x, y, n, etc.
  const statLit: Array<[string, string]> = [
    ['Σx²', 'stat_sigx2'], ['Σx⁴', 'stat_sigx4'], ['Σx³', 'stat_sigx3'],
    ['Σx²y', 'stat_sigx2y'], ['Σxy', 'stat_sigxy'], ['Σx', 'stat_sigx'],
    ['x\u0304', 'stat_xbar'], ['x\u0305', 'stat_xbar'], ['x̄', 'stat_xbar'], ['x̅', 'stat_xbar'],
    ['X\u0304', 'stat_xbar'], ['X\u0305', 'stat_xbar'], ['X̄', 'stat_xbar'], ['X̅', 'stat_xbar'],
    ['σx', 'stat_sigmax'], ['\u03C3x', 'stat_sigmax'],
    ['Σy²', 'stat_sigy2'], ['Σy', 'stat_sigy'],
    ['y\u0304', 'stat_ybar'], ['y\u0305', 'stat_ybar'], ['ȳ', 'stat_ybar'], ['y̅', 'stat_ybar'],
    ['Y\u0304', 'stat_ybar'], ['Y\u0305', 'stat_ybar'], ['Ȳ', 'stat_ybar'], ['Y̅', 'stat_ybar'],
    ['σy', 'stat_sigmay'], ['\u03C3y', 'stat_sigmay'],
    ['minX', 'stat_minx'], ['maxX', 'stat_maxx'], ['minY', 'stat_miny'], ['maxY', 'stat_maxy'],
  ];
  for (const [from, to] of statLit) mapped = replaceLiteral(mapped, from, to);
  mapped = replaceRegex(mapped, /\bsx\b/g, () => 'stat_sx');
  mapped = replaceRegex(mapped, /\bsy\b/g, () => 'stat_sy');
  mapped = replaceRegex(mapped, /\bn\b/g, () => 'stat_n');
  mapped = replaceRegex(mapped, /\br\b/g, () => 'stat_r');

  // Robust xHat/yHat replacement
  for (const sym of ['x̂1', 'x̂2', 'x̂', 'ŷ'].map(s => s.normalize('NFD'))) {
    let sIdx: number;
    while ((sIdx = mapped.text.indexOf(sym)) !== -1) {
      const hatOrig = mapped.map[sIdx] ?? 0;
      let before = sliceMapped(mapped, 0, sIdx);
      const after = sliceMapped(mapped, sIdx + sym.length);
      let operand = '';
      if (before.text.endsWith(')')) {
        let parenCount = 0;
        for (let i = before.text.length - 1; i >= 0; i--) {
          if (before.text[i] === ')') parenCount++;
          else if (before.text[i] === '(') parenCount--;
          if (parenCount === 0) {
            operand = before.text.substring(i);
            before = sliceMapped(before, 0, i);
            break;
          }
        }
      } else {
        const match = before.text.match(/(\d+\.?\d*|Ans|[A-Zπe])$/);
        if (match) {
          operand = match[0];
          before = sliceMapped(before, 0, before.text.length - operand.length);
        }
      }
      if (operand) {
        let fn = '__yhat';
        if (sym === 'x̂1'.normalize('NFD')) fn = '__xhat1';
        else if (sym === 'x̂2'.normalize('NFD')) fn = '__xhat2';
        else if (sym === 'x̂'.normalize('NFD')) fn = '__xhat';
        mapped = concatMapped([before, mappedLit(`${fn}(${operand})`, hatOrig), after]);
      } else {
        mapped = concatMapped([before, mappedLit('0', hatOrig), after]);
      }
    }
  }

  if (mapped.text.includes('=') && !mapped.text.includes('→')) {
    const eq = mapped.text.indexOf('=');
    if (eq !== -1 && mapped.text.indexOf('=', eq + 1) === -1) {
      const eqOrig = mapped.map[eq] ?? 0;
      mapped = concatMapped([
        mappedLit('(', eqOrig),
        sliceMapped(mapped, 0, eq),
        mappedLit(') - (', eqOrig),
        sliceMapped(mapped, eq + 1),
        mappedLit(')', eqOrig),
      ]);
    }
  }

  type MathTemplate = { name: string; replace: (args: string[]) => string };
  const mathTemplates: MathTemplate[] = [
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
    { name: 'sinh⁻¹', replace: (args: string[]) => `__asinh(${args[0]})` },
    { name: 'cosh⁻¹', replace: (args: string[]) => `__acosh(${args[0]})` },
    { name: 'tanh⁻¹', replace: (args: string[]) => `__atanh(${args[0]})` },
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
    { name: 'Rnd', replace: (args: string[]) => `__rnd(${args[0]})` },
    { name: 'sqrt', replace: (args: string[]) => `__sqrt(${args[0]})` },
  ];

  const processTemplatesForJS = (s: Mapped): Mapped => {
    const parts: Mapped[] = [];
    let curr = s;
    while (curr.text.length > 0) {
      let earliestIdx = Infinity;
      let bestT: MathTemplate | null = null;

      for (const t of mathTemplates) {
        const idx = curr.text.indexOf(t.name + '(');
        if (idx !== -1 && idx < earliestIdx) {
          earliestIdx = idx;
          bestT = t;
        }
      }

      if (bestT) {
        if (earliestIdx > 0) parts.push(sliceMapped(curr, 0, earliestIdx));
        const stemOrig = curr.map[earliestIdx] ?? 0;
        const bal = getBalanced(curr.text, earliestIdx + bestT.name.length);
        if (bal) {
          const inner = processTemplatesForJS(sliceMapped(curr, earliestIdx + bestT.name.length + 1, bal.endIdx));
          const args = splitTopLevelArgs(inner.text);
          parts.push(mappedLit(bestT.replace(args), stemOrig));
          curr = sliceMapped(curr, bal.endIdx + 1);
        } else {
          parts.push(sliceMapped(curr, earliestIdx, earliestIdx + bestT.name.length + 1));
          curr = sliceMapped(curr, earliestIdx + bestT.name.length + 1);
        }
      } else {
        parts.push(curr);
        curr = { text: '', map: [] };
      }
    }
    return concatMapped(parts);
  };

  mapped = processTemplatesForJS(mapped);

  // Robust Factorial Replacement
  let fIdx: number;
  while ((fIdx = mapped.text.indexOf('!')) !== -1) {
    const bangOrig = mapped.map[fIdx] ?? 0;
    let before = sliceMapped(mapped, 0, fIdx);
    const after = sliceMapped(mapped, fIdx + 1);
    let operand = '';
    if (before.text.endsWith(')')) {
      let parenCount = 0;
      for (let i = before.text.length - 1; i >= 0; i--) {
        if (before.text[i] === ')') parenCount++;
        else if (before.text[i] === '(') parenCount--;
        if (parenCount === 0) {
          operand = before.text.substring(i);
          before = sliceMapped(before, 0, i);
          break;
        }
      }
    } else {
      const match = before.text.match(/(\d+\.?\d*|Ans|[A-Zπe])$/);
      if (match) {
        operand = match[0];
        before = sliceMapped(before, 0, before.text.length - operand.length);
      }
    }
    if (operand) {
      mapped = concatMapped([before, mappedLit(`__factorial(${operand})`, bangOrig), after]);
    } else {
      mapped = concatMapped([before, mappedLit('__factorial(NaN)', bangOrig), after]);
    }
  }

  mapped = replaceLiteral(mapped, '×', '*');
  mapped = replaceLiteral(mapped, '÷', '/');
  mapped = replaceLiteral(mapped, 'Ran#', '__ranhash()');
  mapped = rewritePercentMapped(mapped);
  mapped = replaceLiteral(mapped, '×10^', '*10**');

  const resolveExponentsMapped = (m: Mapped): Mapped => {
    let curr = m;
    while (true) {
      const idxPower = curr.text.lastIndexOf('^');
      const idxSqr = curr.text.lastIndexOf('²');
      const idxCube = curr.text.lastIndexOf('³');
      const maxIdx = Math.max(idxPower, idxSqr, idxCube);
      if (maxIdx === -1) break;

      const op = curr.text[maxIdx];
      const opOrig = curr.map[maxIdx] ?? 0;
      const beforeText = curr.text.substring(0, maxIdx);
      const afterText = curr.text.substring(maxIdx + 1);
      const base = findPrecedingOperand(beforeText);
      if (!base) {
        const fallback = op === '^' ? '**' : (op === '²' ? '**2' : '**3');
        curr = concatMapped([
          sliceMapped(curr, 0, maxIdx),
          mappedLit(fallback, opOrig),
          sliceMapped(curr, maxIdx + 1),
        ]);
        continue;
      }

      let exponent = '';
      let afterEnd = maxIdx + 1;
      if (op === '²') {
        exponent = '2';
      } else if (op === '³') {
        exponent = '3';
      } else if (afterText.startsWith('(')) {
        const bal = getBalanced(curr.text, maxIdx + 1);
        if (bal) {
          exponent = bal.content;
          afterEnd = bal.endIdx + 1;
        } else {
          const match = afterText.match(/^(\([^)]*\)|[a-zA-Z0-9_]+)/);
          if (match) {
            exponent = match[0];
            afterEnd = maxIdx + 1 + match[0].length;
          } else {
            exponent = 'NaN';
          }
        }
      } else {
        const fNameMatch = afterText.match(/^[a-zA-Z0-9_]+\(/);
        if (fNameMatch) {
          const fNameLength = fNameMatch[0].length - 1;
          const bal = getBalanced(afterText, fNameLength);
          if (bal) {
            exponent = afterText.substring(0, bal.endIdx + 1);
            afterEnd = maxIdx + 1 + bal.endIdx + 1;
          } else {
            exponent = 'NaN';
          }
        } else {
          const match = afterText.match(/^([a-zA-Z0-9_]+|\([^)]*\))/);
          if (match) {
            exponent = match[0];
            afterEnd = maxIdx + 1 + match[0].length;
          } else {
            exponent = 'NaN';
          }
        }
      }

      const parsedBase = resolveExponents(base);
      const parsedExponent = resolveExponents(exponent);
      curr = concatMapped([
        sliceMapped(curr, 0, maxIdx - base.length),
        mappedLit(`__pow(${parsedBase},${parsedExponent})`, opOrig),
        sliceMapped(curr, afterEnd),
      ]);
    }
    return curr;
  };

  mapped = resolveExponentsMapped(mapped);

  // Implicit multiply lives in the parser (token-level). Do not re-insert `*`
  // here — that used to turn `__log10(100)` into `__log10*(100)`.

  mapped = replaceLiteral(mapped, 'π', 'pi');
  mapped = replaceRegex(mapped, /\be\b/g, () => 'e');
  mapped = replaceRegex(mapped, /\bx\b/g, () => 'X');
  mapped = replaceRegex(mapped, /\by\b/g, () => 'Y');

  const proc = mapped.text;

  // Identifiers that resolve to a value (variables and constants). Function
  // names live in `h` and are looked up separately when a call node is walked.
  const constants: Vars = { pi: Math.PI, e: Math.E, NaN: NaN, Infinity: Infinity };
  // STAT A/B/C/R/N are fit letters, not user memory (R3). Recall uses stat_*.
  const baseEnv: Vars = { Ans: ans, ...scope, ...statRecallEnv(statVars), ...constants };

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
        throw new CalcError('syntax', node.offset);
      }
      case 'unary': {
        const v = evalNode(node.operand, env);
        const val = node.op === '-' ? -v : +v;
        if (!Number.isFinite(val)) throw new CalcError('math', node.offset);
        return val;
      }
      case 'binary': {
        const l = evalNode(node.left, env);
        const r = evalNode(node.right, env);
        let val: number;
        switch (node.op) {
          case '+': val = l + r; break;
          case '-': val = l - r; break;
          case '*': val = l * r; break;
          case '/': val = l / r; break;
          case '**': val = realPow(l, r); break;
        }
        if (!Number.isFinite(val) || Math.abs(val) >= 1e100) {
          throw new CalcError('math', node.offset);
        }
        return val;
      }
      case 'call': {
        const fn = h[node.name];
        if (typeof fn !== 'function') {
          throw new CalcError('syntax', node.offset);
        }
        let val: number;
        if (LAMBDA_FORMS.has(node.name)) {
          const [bodyNode, ...restNodes] = node.args;
          const f = (x: number) => evalNode(bodyNode, { ...env, X: x });
          const rest = restNodes.map((a) => evalNode(a, env));
          val = (fn as LambdaFn)(f, ...rest);
        } else {
          const args = node.args.map((a) => evalNode(a, env));
          val = (fn as NumFn)(...args);
        }
        if (!Number.isFinite(val) || Math.abs(val) >= 1e100) {
          throw new CalcError('math', node.offset);
        }
        return val;
      }
    }
  };

  try {
    const ast = remapAstOffsets(parse(proc), mapped.map, origLen);
    const val = evalNode(ast, baseEnv);
    if (!Number.isFinite(val) || Math.abs(val) >= 1e100) {
      throw new CalcError('math', ast.offset);
    }
    const written = finitePolRecWrite(polRecWrite);
    if (written && varsWrite) {
      varsWrite.X = written.X;
      varsWrite.Y = written.Y;
    }
    return wrapCalcValue(val, ast, polRecWrite);
  } catch (e) {
    if (e instanceof CalcError) throw e;
    if (e instanceof ParseError) throw new CalcError('syntax', toOrig(mapped.map, e.pos, origLen));
    throw new CalcError('syntax');
  }
};

/** Top-level Pol/Rec is a pair; everything else stays IEEE `real`. */
function wrapCalcValue(val: number, ast: AstNode, write: PolRecWrite): CalcValue {
  if (ast.type === 'call' && ast.name === '__pol') {
    return calcPair('pol', val, write.Y);
  }
  if (ast.type === 'call' && ast.name === '__rec') {
    return calcPair('rec', val, write.Y);
  }
  return calcReal(val);
}
