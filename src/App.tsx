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
const PATS = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', '×10^', 'sqrt(', 'sqr(', 'cube(', 'pwr(', 'root(', 'frac(', 'mix(', 'int(', 'diff(', 'e^(', '10^(', 'log_b(', 'log10(', 'ln(', 'abs(', 'Ans', 'nCr(', 'nPr(', 'Σ('];

// --- Helper Functions ---
const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
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
    sin: (x: number) => Math.sin(toRad(x)),
    cos: (x: number) => Math.cos(toRad(x)),
    tan: (x: number) => Math.tan(x === 90 && angleMode === 'DEG' ? Infinity : toRad(x)),
    asin: (x: number) => fromRad(Math.asin(x)),
    acos: (x: number) => fromRad(Math.acos(x)),
    atan: (x: number) => fromRad(Math.atan(x)),
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
    sqrt: Math.sqrt, log: Math.log, log10: Math.log10, exp: Math.exp, pow: Math.pow,
    nthRoot: (n: number, x: number) => Math.pow(x, 1 / n),
    logB: (b: number, x: number) => Math.log(x) / Math.log(b),
    nPr: (n: number, r: number) => factorial(n) / factorial(n - r),
    nCr: (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r)),
    abs: Math.abs,
    int: (expStr: string, a: number, b: number, v: string) => {
      let f = (x: number) => evaluateExpression(expStr, { ...scope, [v]: x }, ans, angleMode);
      let n = 100, step = (b - a) / n, sum = f(a) + f(b);
      for (let i = 1; i < n; i++) sum += f(a + i * step) * (i % 2 === 0 ? 2 : 4);
      return (step / 3) * sum;
    },
    diff: (expStr: string, v: string, a: number) => {
      let hVal = 1e-7;
      let f = (x: number) => evaluateExpression(expStr, { ...scope, [v]: x }, ans, angleMode);
      return (f(a + hVal) - f(a)) / hVal;
    },
    sum: (expStr: string, v: string, a: number, b: number) => {
      let t = 0;
      for (let i = a; i <= b; i++) t += evaluateExpression(expStr, { ...scope, [v]: i }, ans, angleMode);
      return t;
    }
  };

  let proc = expr.replace(/[‸⬚]/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E');

  let js = proc.replace(/\^/g, '**');
  try {
    return new Function('ctx', 'h', `with(ctx) { with(h) { return ${js}; } }`)( { ...scope, Ans: ans }, h);
  } catch (e) {
    throw e;
  }
};

const toLaTeX = (expr: string): string => {
  let s = expr.replace(/[‸⬚]/g, '');
  
  // Basic replacements
  s = s.replace(/×/g, '\\times ')
       .replace(/÷/g, '\\div ')
       .replace(/π/g, '\\pi ')
       .replace(/\^\(([^)]*)\)/g, '^{$1}')
       .replace(/\^/g, '^')
       .replace(/log10\(([^)]*)\)/g, '\\log_{10}($1)')
       .replace(/ln\(([^)]*)\)/g, '\\ln($1)')
       .replace(/abs\(([^)]*)\)/g, '|$1|')
       .replace(/sin\(([^)]*)\)/g, '\\sin($1)')
       .replace(/cos\(([^)]*)\)/g, '\\cos($1)')
       .replace(/tan\(([^)]*)\)/g, '\\tan($1)')
       .replace(/sin⁻¹\(([^)]*)\)/g, '\\arcsin($1)')
       .replace(/cos⁻¹\(([^)]*)\)/g, '\\arccos($1)')
       .replace(/tan⁻¹\(([^)]*)\)/g, '\\arctan($1)');

  // Templates
  s = s.replace(/=/g, '=')
       .replace(/int\(([^,]*),([^,]*),([^,]*),([^)]*)\)/g, '\\int_{$2}^{$3} $1 \\, d$4')
       .replace(/diff\(([^,]*),([^,]*),([^)]*)\)/g, '\\frac{d}{d$2}\\left($1\\right)\\bigg|_{$2=$3}')
       .replace(/frac\(([^,]*),([^)]*)\)/g, '\\frac{$1}{$2}')
       .replace(/mix\(([^,]*),([^,]*),([^)]*)\)/g, '$1\\frac{$2}{$3}')
       .replace(/root\(([^,]*),([^)]*)\)/g, '\\sqrt[$1]{$2}')
       .replace(/sqrt\(([^)]*)\)/g, '\\sqrt{$1}')
       .replace(/sqr\(([^)]*)\)/g, '{$1}^2')
       .replace(/cube\(([^)]*)\)/g, '{$1}^3')
       .replace(/pwr\(([^,]*),([^)]*)\)/g, '{$1}^{$2}')
       .replace(/log_b\(([^,]*),([^)]*)\)/g, '\\log_{$1}($2)')
       .replace(/Σ\(([^,]*),([^,]*),([^,]*),([^)]*)\)/g, '\\sum_{$2=$3}^{$4} $1')
       .replace(/nCr\(([^,]*),([^)]*)\)/g, '{\\textstyle \\binom{$1}{$2}}')
       .replace(/nPr\(([^,]*),([^)]*)\)/g, '{}^{$1}P_{$2}')
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
  h = h.replace(/(nCr|nPr)\(([^,]*),([^,)]*)\)/g, (m, type, n, r) => {
      let sym = type === 'nCr' ? 'C' : 'P';
      return `<span class="comb-perm">${slot(n)}<span class="comb-perm-sym">${sym}</span>${slot(r)}</span>`;
  })
  .replace(/(nCr|nPr)\(([^,)]*)$/g, (m, type, n) => {
      let sym = type === 'nCr' ? 'C' : 'P';
      return `<span class="comb-perm">${slot(n)}<span class="comb-perm-sym">${sym}</span><span class="empty-slot">⬚</span></span>`;
  });

  h = h.replace(/²/g, '<span class="sup">2</span>')
       .replace(/³/g, '<span class="sup">3</span>');

  // Replace equals while avoiding matching inside existing HTML tags
  h = h.replace(/=(?![^<]*>)/g, '<span class="equal-symbol mx-1">=</span>');

  h = h.replace(/mix\(([^,)]*),([^,)]*),([^)]*)\)/g, (m, w, n, d) => `<div class="mix-container"><span class="mix-whole">${w}</span><div class="frac-container"><span class="frac-num">${n}</span><span class="frac-den">${d}</span></div></div>`)
       .replace(/mix\(([^,)]*),([^,)]*),([^)]*)$/g, (m, w, n, d) => `<div class="mix-container"><span class="mix-whole">${slot(w)}</span><div class="frac-container"><span class="frac-num">${slot(n)}</span><span class="frac-den">${slot(d)}</span></div></div>`)
       .replace(/mix\(([^,)]*),([^,)]*)$/g, (m, w, n) => `<div class="mix-container"><span class="mix-whole">${slot(w)}</span><div class="frac-container"><span class="frac-num">${slot(n)}</span><span class="frac-den"><span class="empty-slot">⬚</span></span></div></div>`)
       .replace(/mix\(([^,)]*)$/g, (m, w) => `<div class="mix-container"><span class="mix-whole">${slot(w)}</span><div class="frac-container"><span class="frac-num"><span class="empty-slot">⬚</span></span><span class="frac-den"><span class="empty-slot">⬚</span></span></div></div>`);

  h = h.replace(/frac\(([^,)]*),([^)]*)\)/g, (m, p1, p2) => `<div class="frac-container"><span class="frac-num">${slot(p1)}</span><span class="frac-den">${slot(p2)}</span></div>`)
       .replace(/frac\(([^,)]*),([^)]*)$/g, (m, p1, p2) => `<div class="frac-container"><span class="frac-num">${slot(p1)}</span><span class="frac-den">${slot(p2)}</span></div>`)
       .replace(/frac\(([^,)]*)$/g, (m, p1) => `<div class="frac-container"><span class="frac-num">${slot(p1)}</span><span class="frac-den"><span class="empty-slot">⬚</span></span></div>`);

  h = h.replace(/int\(([^,)]*),([^,)]*),([^,)]*),([^)]*)\)/g, (m, f, a, b, v) => `<div class="int-container"><div class="int-bounds"><span>${b}</span><span>${a}</span></div><span class="int-symbol">∫</span><div class="int-body">${f} d${v}</div></div>`)
       .replace(/int\(([^,)]*),([^,)]*),([^,)]*),([^)]*)$/g, (m, f, a, b, v) => `<div class="int-container"><div class="int-bounds"><span>${slot(b)}</span><span>${slot(a)}</span></div><span class="int-symbol">∫</span><div class="int-body">${slot(f)} d${v}</div></div>`);

  h = h.replace(/diff\(([^,)]*),([^,)]*),([^)]*)\)/g, (m, f, v, a) => `<div class="diff-container"><div class="diff-frac"><span class="diff-top">d</span><span>d${v}</span></div>(${f})<div class="diff-at">| ${v}=${a}</div></div>`)
       .replace(/diff\(([^,)]*),([^,)]*),([^)]*)$/g, (m, f, v, a) => `<div class="diff-container"><div class="diff-frac"><span class="diff-top">d</span><span>d${v}</span></div>(${slot(f)})<div class="diff-at">| ${v}=${slot(a)}</div></div>`)
       .replace(/root\(([^,)]*),([^)]*)\)/g, (m, p1, p2) => `<span class="sup">${slot(p1)}</span><span class="root-symbol">√</span><span class="root-body">${slot(p2)}</span>`)
       .replace(/root\(([^,)]*),([^)]*)$/g, (m, p1, p2) => `<span class="sup">${slot(p1)}</span><span class="root-symbol">√</span><span class="root-body">${slot(p2)}</span>`)
       .replace(/root\(([^)]*)\)/g, (m, p1) => `<span class="sup">${slot(p1)}</span><span class="root-symbol">√</span><span class="root-body"><span class="empty-slot">⬚</span></span>`)
       .replace(/root\(([^,)]*)$/g, (m, p1) => `<span class="sup">${slot(p1)}</span><span class="root-symbol">√</span><span class="root-body"><span class="empty-slot">⬚</span></span>`)
       .replace(/sqrt\(([^)]*)\)/g, (m, p1) => `<span class="root-symbol">√</span><span class="root-body">${slot(p1)}</span>`)
       .replace(/sqrt\(([^)]*)$/g, (m, p1) => `<span class="root-symbol">√</span><span class="root-body">${slot(p1)}</span>`) 
       .replace(/log_b\(([^,)]*),([^)]*)\)/g, (m, p1, p2) => `log<span class="sub">${slot(p1)}</span>(${slot(p2)})`)
       .replace(/log_b\(([^,)]*),([^)]*)$/g, (m, p1, p2) => `log<span class="sub">${slot(p1)}</span>(${slot(p2)})`)
       .replace(/log_b\(([^)]*)\)/g, (m, p1) => `log<span class="sub">${slot(p1)}</span>(<span class="empty-slot">⬚</span>)`)
       .replace(/log_b\(([^,)]*)$/g, (m, p1) => `log<span class="sub">${slot(p1)}</span>(<span class="empty-slot">⬚</span>)`)
       .replace(/log10\(([^)]*)\)/g, (m, p1) => `log(${slot(p1)})`)
       .replace(/log10\(([^)]*)$/g, (m, p1) => `log(${slot(p1)})`)
       .replace(/e\^\(([^)]*)\)/g, (m, p1) => `e<span class="sup">${slot(p1)}</span>`)
       .replace(/e\^\(([^)]*)$/g, (m, p1) => `e<span class="sup">${slot(p1)}</span>`)
       .replace(/10\^\(([^)]*)\)/g, (m, p1) => `10<span class="sup">${slot(p1)}</span>`)
       .replace(/10\^\(([^)]*)$/g, (m, p1) => `10<span class="sup">${slot(p1)}</span>`)
       .replace(/pwr\(([^,)]*),([^)]*)\)/g, (m, p1, p2) => (slot(p1)) + '<span class="sup">' + (slot(p2)) + '</span>')
       .replace(/pwr\(([^,)]*),([^,)]*)$/g, (m, p1, p2) => (slot(p1)) + '<span class="sup">' + (slot(p2)) + '</span>')
       .replace(/pwr\(([^)]*)\)/g, (m, p1) => (slot(p1)) + '<span class="sup"><span class="empty-slot">⬚</span></span>')
       .replace(/pwr\(([^,)]*)$/g, (m, p1) => (slot(p1)) + '<span class="sup"><span class="empty-slot">⬚</span></span>')
       .replace(/sqr\(([^)]*)\)/g, (m, p1) => (slot(p1)) + '<span class="sup">2</span>')
       .replace(/sqr\(([^)]*)$/g, (m, p1) => (slot(p1)) + '<span class="sup">2</span>')
       .replace(/cube\(([^)]*)\)/g, (m, p1) => (slot(p1)) + '<span class="sup">3</span>')
       .replace(/cube\(([^)]*)$/g, (m, p1) => (slot(p1)) + '<span class="sup">3</span>')
       .replace(/→([A-M X-Y])/g, '<span style="font-size: 0.8em; margin: 0 4px;">→</span>$1')
       .replace(/\^\(([^)]*)\)/g, (m, p1) => `<span class="sup">${slot(p1)}</span>`) 
       .replace(/\^\(([^)]*)$/g, (m, p1) => `<span class="sup">${slot(p1)}</span>`) 
       .replace(/\^-1/g, '<span class="sup">-1</span>')
       .replace(/Σ\(([^,)]*),([^,)]*),([^,)]*),([^)]*)\)/g, (m, f, v, s, e) => `<div class="sum-container"><div class="sum-bounds"><span>${slot(e)}</span><span>${v}=${slot(s)}</span></div><span class="sum-symbol">Σ</span><div class="sum-body">${slot(f)}</div></div>`)
       .replace(/Σ\(([^,)]*),([^,)]*),([^,)]*),([^)]*)$/g, (m, f, v, s, e) => `<div class="sum-container"><div class="sum-bounds"><span>${slot(e)}</span><span>${v}=${slot(s)}</span></div><span class="sum-symbol">Σ</span><div class="sum-body">${slot(f)}</div></div>`)
       .replace(/‸/g, '<span class="cursor"></span>');
  
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

  const toggleShift = useCallback(() => {
    setIsShift(prev => !prev);
    setIsAlpha(false);
  }, []);

  // Wrap button clicks with flash
  const withFlash = (fn: (e?: any) => void, label?: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    handleKeyFlash(e);
    if (label) setCurrentSequence(prev => [...prev, label]);
    fn(e);
  };

  const toggleAlpha = useCallback(() => {
    setIsAlpha(prev => !prev);
    setIsShift(false);
  }, []);

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
      "RanInt(", "Ran#", "Ans", "e", "π", "°′″", "×10^", "nCr(", "nPr("
    ];
    while (s.length > 0) {
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
          else if (t === 'pwr(') label = 'xⁿ';
          else if (t === 'sqr(') label = 'x²';
          else if (t === 'cube(') label = 'x³';
          else if (t === 'frac(') label = 'frac';
          else if (t === 'mix(') label = 'mix';
          else if (t === 'log10(') label = 'log';
          else if (t === 'ln(') label = 'ln';
          else if (t === 'abs(') label = 'Abs';
          else if (t === 'sqrt(') label = '√';
          else if (t === 'root(') label = 'root';
          else if (t === 'int(') label = '∫';
          else if (t === 'diff(') label = 'd/dx';
          else if (t === 'Σ(') label = 'Σ';
          else if (t === 'log_b(') label = 'log_box';
          else if (t === 'Ran#') label = 'Ran#';
          else if (t === 'RanInt(') label = 'RanInt';
          else if (t === 'Ans') label = 'Ans';
          else if (t === '×10^') label = 'EXP';
          else if (t === 'nCr(') label = 'nCr';
          else if (t === 'nPr(') label = 'nPr';
          
          result.push(label);
          s = s.slice(t.length);
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
        else if (char === '³') { result.push('x³'); s = s.slice(1); matched = true; }
        else if (char === '⁻') {
           if (s.startsWith('⁻¹')) { result.push('x-1'); s = s.slice(2); matched = true; }
           else { result.push('(-)'); s = s.slice(1); matched = true; }
        } else if (char.match(/[0-9.]/)) { result.push(char); s = s.slice(1); matched = true;}
        else if (char === '(' || char === ')') { result.push(char); s = s.slice(1); matched = true;}
        else if (char === '+' || char === '-' || char === '*' || char === '/') {
          result.push(char === '*' ? '×' : char === '/' ? '÷' : char);
          s = s.slice(1);
          matched = true;
        }
        else if (char === ',') { s = s.slice(1); matched = true; } // Skip commas in templates
        else {
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
      let s = currentInput.replace(/[‸⬚]/g, '');
      if (s.includes('=') && !s.includes('→')) {
        let parts = s.split('=');
        if (parts.length === 2) {
          s = `(${parts[0]}) - (${parts[1]})`;
        }
      }
      let openCount = (s.match(/\(/g) || []).length, closeCount = (s.match(/\)/g) || []).length;
      s += ')'.repeat(Math.max(0, openCount - closeCount));
      
      let proc = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/ln\(/g, 'log(').replace(/sin⁻¹\(/g, 'asin(').replace(/cos⁻¹\(/g, 'acos(').replace(/tan⁻¹\(/g, 'atan(')
                  .replace(/log10\(([^)]*)\)/g, 'log10($1)').replace(/e\^\(([^)]*)\)/g, 'exp($1)').replace(/10\^\(([^)]*)\)/g, 'pow(10,$1)')
                  .replace(/sqr\(([^)]*)\)/g, '(($1)**2)').replace(/cube\(([^)]*)\)/g, '(($1)**3)')
                  .replace(/pwr\(([^,]*),([^)]*)\)/g, '(($1)**($2))')
                  .replace(/mix\(([^,]+),([^,]+),([^)]+)\)/g, '(($1)+($2)/($3))')
                  .replace(/frac\(([^,]*),([^)]*)\)/g, '(($1)/($2))').replace(/root\(([^,]+),([^)]+)\)/g, 'nthRoot($1, $2)').replace(/log_b\(([^,]+),([^)]+)\)/g, 'logB($1, $2)')
                  .replace(/int\(([^,]+),([^,]+),([^,]+),([^)]+)\)/g, (m, e, a, b, v) => `int("${e}",${a},${b},"${v}")`)
                  .replace(/diff\(([^,]+),([^,]+),([^)]+)\)/g, (m, e, v, a) => `diff("${e}","${v}",${a})`)
                  .replace(/Σ\(([^,]+),([^,]+),([^,]+),([^)]+)\)/g, (m, e, v, a, b) => `sum("${e}","${v}",${a},${b})`).replace(/%/g, '/100').replace(/nPr\(([^,]+),([^)]+)\)/g, 'nPr($1,$2)').replace(/nCr\(([^,]+),([^)]+)\)/g, 'nCr($1,$2)')
                  .replace(/×10\^/g, '*10**')
                  .replace(/²/g, '**2').replace(/³/g, '**3');

      // Enhanced implicit multiplication
      proc = proc.replace(/(\d+)(Ans|[A-Zπe]|[a-z]+[0-9]*\()/g, '$1*$2')
                 .replace(/(\bAns\b|[A-Zπe])(Ans|[A-Zπe]|[a-z]+[0-9]*\()/g, '$1*$2')
                 .replace(/(\bAns\b|[A-Zπe])(\d+)/g, '$1*$2')
                 .replace(/(\))(\d+|Ans|[A-Zπe]|[a-z]+[0-9]*\()/g, ')*$2')
                 .replace(/(\d+|Ans|[A-Zπe]|\))(\()/g, '$1*(');
      
      // Safety: Ensure no weird dangling operators
      proc = proc.replace(/\*+/g, '*').replace(/\/+/g, '/').replace(/\*\*+/g, '**');

      let val = evaluateExpression(proc, vars, ans, angleMode);
      if (isNaN(val) || !isFinite(val)) throw "Error";
      
      const raw = currentInput.replace('‸', '');
      const finalSequence = reconstructSequence(raw);

      return { val, raw, finalSequence };
    } catch (e) {
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
    if (i >= currentInput.length - 1) return;
    
    let after = currentInput.substring(i + 1);
    let found = PATS.find(p => after.startsWith(p));
    
    if (found) {
      setCurrentInput(currentInput.substring(0, i) + found + '‸' + after.substring(found.length));
    } else {
      let c = currentInput[i+1];
      setCurrentInput(currentInput.replace('‸', c).substring(0, i+1) + '‸' + currentInput.replace('‸', c).substring(i+2));
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
    let found = PATS.find(p => before.endsWith(p));
    
    if (found) {
      setCurrentInput(before.substring(0, before.length - found.length) + '‸' + found + currentInput.substring(i + 1));
    } else {
      let c = currentInput[i-1];
      setCurrentInput(currentInput.substring(0, i-1) + '‸' + c + currentInput.substring(i+1));
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
    let before = currentInput.substring(0, i);
    let after = currentInput.substring(i + 1);

    let fracMatch = before.match(/(frac|mix)\(([^\,)]*)$/);
    if (fracMatch && after.includes(',')) {
      let commaIdx = after.indexOf(',');
      setCurrentInput(before + after.substring(0, commaIdx + 1) + '‸' + after.substring(commaIdx + 1));
      return;
    }

    let c = currentInput.indexOf(',', i), p = currentInput.indexOf(')', i), t = (c !== -1 && (p === -1 || c < p)) ? c : p; 
    if (t !== -1) { 
      setCurrentInput(currentInput.substring(0, i) + currentInput.substring(i+1, t+1) + '‸' + currentInput.substring(t+1)); 
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
    let before = currentInput.substring(0, i);
    let after = currentInput.substring(i + 1);

    if (before.includes(',')) {
      let lastComma = before.lastIndexOf(',');
      let segment = before.substring(0, lastComma);
      if (segment.match(/(frac|mix)\([^,]*$/)) {
        setCurrentInput(segment + '‸' + before.substring(lastComma) + after);
        return;
      }
    }

    let c = currentInput.lastIndexOf(',', i-1), p = currentInput.lastIndexOf('(', i-1), t = Math.max(c, p); 
    if (t !== -1) { 
      setCurrentInput(currentInput.substring(0, t+1) + '‸' + currentInput.substring(t+1, i) + currentInput.substring(i+1)); 
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
    handleInput(isShift ? shift : normal);
    setIsShift(false);
  }, [isShift, handleInput]);

  // --- Keyboard Support ---
  useEffect(() => {
    const record = (l: string) => setCurrentSequence(prev => [...prev, l]);
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Shift only when NOT typing other keys
      if (e.key === 'Shift') {
        if (e.repeat) return;
        e.preventDefault();
        record('SHIFT');
        toggleShift();
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleShift, clearAll, del, solve, handleRight, handleLeft, handleUp, handleDown, handleInput, handleParentheses, handleTrig, handleLogKey]);

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

    const renderMappingKey = (id: string, action: (e: React.MouseEvent<HTMLButtonElement>) => void, className: string = "") => {
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
          onMouseDown={(e) => isDebug ? handleMouseDown(e, id, 'move') : null}
          onClick={(e) => { 
            if (isDebug) return;
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
      const cls = `mini-btn ${isDebug ? 'debug-visible' : ''}`;
      
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
        {renderMappingKey('shift', withFlash(toggleShift, 'SHIFT'), 'key-shift')}
        {renderMappingKey('alpha', withFlash(toggleAlpha, 'ALPHA'), 'key-alpha')}
        
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
        {renderMappingKey('exp', withFlash(handleExpKey, 'EXP'), 'num nr4 nc3')}
        {renderMappingKey('ans', withFlash(() => handleInput('Ans'), 'Ans'), 'num nr4 nc4')}
        {renderMappingKey('solve', withFlash(solve, '='), 'num nr4 nc5')}
        </div>
      </div>
    </div>

      {/* Side Pane */}
      {showPane && (
        <div className="w-full md:w-[350px] mt-8 md:mt-0 h-fit max-h-[900px] bg-[#1a1a1a] rounded-3xl border border-white/5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="flex border-b border-white/5">
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
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Shift</kbd> <span>Toggle Shift mode</span></div>
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
          
          <div className="p-4 bg-black/20 border-t border-white/5 space-y-2">
            <div className="text-[10px] text-white/10 uppercase tracking-widest font-black text-center">
              Casio fx-991ES Emulator Pro
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
