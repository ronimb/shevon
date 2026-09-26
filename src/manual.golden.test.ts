import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { allowsCalcSolveHyp, allowsCompLineEdit, applyAllClear, applyHistoryLoad, applyPowerKey, applySquareKey, attemptStoreOperand, collectSolvePromptVars, commitPromptValue, expressionHasSolveUnknown, moveCompCursorLeft, moveCompCursorRight, newtonSolveX, placeCaretAtOffset, reconstructSequence, wrapPrecedingBinary } from './modes/comp.ts';
import { CURSOR_PATS } from './keys.ts';
import { chipFamily, renderMiniButton } from './historyKeys.tsx';
import { liveOperationSequence, setupCommitSequence } from './historyOps.ts';
import { evaluateExpression, mergePolRecVars, toFraction } from './evaluator.ts';
import { isLcdMenu, resultLineWhileEditing } from './lcd.tsx';
import { loadPersistedAngle, loadPersistedAns, loadPersistedVars } from './useCalculatorState.ts';
import {
  CalcError,
  calcComplex,
  calcErrorLabel,
  calcInteger,
  calcPrimary,
  complexAbs,
  complexArg,
  complexToPolar,
  complexToRect,
  conjugate,
} from './types.ts';
import {
  appendStatRowIfRoom,
  applyStatDelete,
  applyStatDeleteAll,
  applyStatDigit,
  applyStatInsert,
  calculateStatVars,
  getStatMaxRows,
  initialStatData,
  statEditorWindow,
  statMenuAfterShift1,
  StatDataScreen,
  StatEditScreen,
  StatEditorMenuScreen,
} from './modes/stat.tsx';
import { EqnQuadEntry, EqnQuadScreen, EqnResultValue, solveQuadratic } from './modes/eqn.tsx';
import { formatMath, toLaTeX } from './display.tsx';
import { formatForDisplay, formatEngineering, formatDMS, formatDMSText, roundToFormat, type DisplayFormat } from './format.ts';
import type { AngleMode, Vars } from './types.ts';

/** Empty A–F/M/X/Y memory, matching calculator power-on defaults. */
const EMPTY_VARS: Vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };

function evalComp(expr: string, angleMode: AngleMode = 'DEG', fmt?: DisplayFormat): number {
  return calcPrimary(evaluateExpression(expr, { ...EMPTY_VARS }, 0, angleMode, {}, fmt));
}

describe('Manual sample operations', () => {
  it('E-16: sin 30° = 0.5 in Degree mode', () => {
    expect(evalComp('sin(30)')).toBeCloseTo(0.5, 10);
  });

  it('E-16: 4 × sin30 × (30 + 10 × 3) = 120', () => {
    expect(evalComp('4×sin(30)×(30+10×3)')).toBeCloseTo(120, 10);
  });

  it('E-10: 2/3 + 1/2 = 7/6 (Natural Display fraction)', () => {
    const value = evalComp('frac(2,3)+frac(1,2)');
    const frac = toFraction(value);
    expect(frac).not.toBeNull();
    expect(frac!.n).toBe(7);
    expect(frac!.d).toBe(6);
  });

  it('does not invent a fraction for a plain trig value', () => {
    expect(toFraction(evalComp('cos(6)'))).toBeNull();
    expect(toFraction(evalComp('sin(6)'))).toBeNull();
    const half = toFraction(evalComp('cos(60)'));
    expect(half).toEqual({ n: 1, d: 2 });
  });

  it('E-18: 10 nPr 4 = 5040', () => {
    expect(evalComp('nPr(10,4)')).toBe(5040);
  });

  it('E-18: 10 nCr 4 = 210', () => {
    expect(evalComp('nCr(10,4)')).toBe(210);
  });

  it('nCr / nPr alone are infix C/P with no ⬚ box', () => {
    expect(wrapPrecedingBinary('‸', false, 'nCr')).toEqual({ input: 'nCr(,‸)', showingResult: false });
    expect(wrapPrecedingBinary('‸', false, 'nPr')).toEqual({ input: 'nPr(,‸)', showingResult: false });
    const cr = formatMath('nCr(,‸)');
    const pr = formatMath('nPr(,‸)');
    expect(cr).not.toContain('empty-slot');
    expect(cr).not.toContain('⬚');
    expect(pr).not.toContain('empty-slot');
    expect(pr).not.toContain('⬚');
    expect(cr).toContain('comb-perm-sym');
    expect(formatMath('nCr(10,4)')).toContain('10');
    expect(formatMath('nCr(10,4)')).toContain('4');
  });

  it('E-24: 1-VAR mean and σx for {1,2,2,3,3,3,4,4,5}', () => {
    // Manual example uses FREQ ON: (x; freq) = (1;1), (2;2), (3;3), (4;2), (5;1)
    const stats = calculateStatVars('1-VAR', [
      { x: '1', freq: '1' },
      { x: '2', freq: '2' },
      { x: '3', freq: '3' },
      { x: '4', freq: '2' },
      { x: '5', freq: '1' },
    ]);
    expect(stats.N).toBe(9);
    expect(stats.stat_xbar).toBe(3);
    // hardware LCD: 1.154700538
    expect(stats.stat_sigmax).toBeCloseTo(1.154700538, 9);
  });
});

describe('Phase 1 — SETUP / COMP honesty', () => {
  it('Rnd( respects Fix 3: Rnd(10÷3)×3 = 9.999 vs 10÷3×3 = 10', () => {
    const fix3: DisplayFormat = { kind: 'fix', digits: 3 };
    expect(evalComp('10÷3×3', 'DEG', fix3)).toBeCloseTo(10, 10);
    expect(evalComp('Rnd(10÷3)×3', 'DEG', fix3)).toBeCloseTo(9.999, 10);
  });

  it('Rnd( in Norm rounds to 10 significant digits', () => {
    expect(evalComp('Rnd(10÷3)')).toBeCloseTo(3.333333333, 9);
  });

  it('hyp functions: sinh, cosh, tanh and inverses', () => {
    expect(evalComp('sinh(0)')).toBeCloseTo(0, 10);
    expect(evalComp('cosh(0)')).toBeCloseTo(1, 10);
    expect(evalComp('tanh(0)')).toBeCloseTo(0, 10);
    expect(evalComp('cosh(1)')).toBeCloseTo(Math.cosh(1), 10);
    expect(evalComp('sinh⁻¹(1)')).toBeCloseTo(Math.asinh(1), 10);
    expect(evalComp('cosh⁻¹(1)')).toBeCloseTo(0, 10);
    expect(evalComp('tanh⁻¹(0.5)')).toBeCloseTo(Math.atanh(0.5), 10);
  });

  it('SHIFT hyp = Abs', () => {
    expect(evalComp('abs(-7)')).toBe(7);
    expect(evalComp('abs(3-8)')).toBe(5);
  });

  it('sexagesimal input: 2°30°0° = 2.5', () => {
    expect(evalComp('2°30°0°')).toBeCloseTo(2.5, 10);
  });

  it('sexagesimal input: 1°30°30° = 1.508333…', () => {
    expect(evalComp('1°30°30°')).toBeCloseTo(1 + 30 / 60 + 30 / 3600, 9);
  });

  it('sexagesimal arithmetic: 1°15°0° + 0°30°0° = 1.75', () => {
    expect(evalComp('1°15°0°+0°30°0°')).toBeCloseTo(1.75, 10);
  });

  it('Ran# is a 3-digit value in [0,1)', () => {
    for (let i = 0; i < 50; i++) {
      const r = evalComp('Ran#');
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
      expect(r * 1000).toBeCloseTo(Math.round(r * 1000), 10);
    }
  });

  it('RanInt#(1,6) stays within bounds and is an integer', () => {
    for (let i = 0; i < 50; i++) {
      const r = evalComp('RanInt(1,6)');
      expect(Number.isInteger(r)).toBe(true);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    }
  });
});

describe('Phase 1 — display formatting', () => {
  it('Fix n rounds and pads to n decimals', () => {
    expect(roundToFormat(1 / 3, { kind: 'fix', digits: 3 })).toBeCloseTo(0.333, 10);
    expect(formatForDisplay(1 / 3, { kind: 'fix', digits: 3 })).toEqual({ type: 'plain', text: '0.333' });
    expect(formatForDisplay(2, { kind: 'fix', digits: 2 })).toEqual({ type: 'plain', text: '2.00' });
  });

  it('Sci n uses n significant digits in scientific form', () => {
    expect(formatForDisplay(123.456, { kind: 'sci', digits: 3 })).toEqual({ type: 'sci', mantissa: '1.23', exponent: 2 });
    expect(formatForDisplay(0.0012345, { kind: 'sci', digits: 2 })).toEqual({ type: 'sci', mantissa: '1.2', exponent: -3 });
  });

  it('Norm 1 switches to exponential below 10^-2, Norm 2 below 10^-9', () => {
    expect(formatForDisplay(0.001, { kind: 'norm', n: 1 })).toEqual({ type: 'sci', mantissa: '1', exponent: -3 });
    expect(formatForDisplay(0.001, { kind: 'norm', n: 2 })).toEqual({ type: 'plain', text: '0.001' });
  });

  it('engineering notation forces exponent to a multiple of 3', () => {
    expect(formatEngineering(56088, 0)).toEqual({ mantissa: '56.088', exponent: 3 });
    expect(formatEngineering(0.08, 0)).toEqual({ mantissa: '80', exponent: -3 });
    // SHIFT ENG raises the exponent by 3 (mantissa shrinks).
    expect(formatEngineering(56088, 1)).toEqual({ mantissa: '0.056088', exponent: 6 });
  });

  it('DMS result decomposition carries seconds and minutes', () => {
    expect(formatDMS(2.5)).toEqual({ deg: 2, min: 30, sec: '0' });
    expect(formatDMS(1.508333333)).toEqual({ deg: 1, min: 30, sec: '30' });
  });

  it('DMS result uses ° ′ ″ (not degree for min/sec)', () => {
    expect(formatDMSText(2.5)).toBe('2°30′0″');
    expect(formatDMSText(1.508333333)).toBe('1°30′30″');
    expect(formatDMSText(2.5)).not.toMatch(/°.*°/);
  });
});

describe('Phase 1 — COMP LCD templates', () => {
  it('abs( renders as |⬚|, not Abs( or raw ASCII abs(', () => {
    const html = formatMath('abs(‸)');
    expect(html).toContain('abs-template');
    expect(html).not.toContain('Abs');
    expect(html).not.toContain('abs(');
    expect(html).toContain('cursor');
    expect(html.replace(/<[^>]+>/g, '')).toBe('||');
  });

  it('Ran# renders as a function token, not a raw code fragment', () => {
    const html = formatMath('Ran#');
    expect(html).toContain('trig-fun');
    expect(html).toContain('Ran#');
  });

  it('RanInt#(a,b) uses ⬚ slots like other COMP templates', () => {
    const html = formatMath('RanInt(‸,)');
    expect(html).toContain('RanInt#');
    expect(html).toContain('empty-slot');
    expect(html).toContain('cursor');
  });
});

describe('vis-no-literal / ir-leak — IR stems never reach the LCD', () => {
  // Unclosed radical with a nested open power: the LCD must paint a radical
  // (√) and a superscript, never the letters "sqrt". Repro from
  // the vis-no-literal / ir-leak pass.
  it('unclosed sqrt(24^(2-2)‸ shows a radical, not the letters sqrt', () => {
    const html = formatMath('sqrt(24^(2-2)‸');
    expect(html).not.toContain('sqrt');
    expect(html).toContain('root-symbol'); // √
    expect(html).toContain('sup'); // ^(2-2) still superscripts inside the body
    expect(html).toContain('cursor');
  });

  it('a second open template (frac) also renders instead of leaking frac(', () => {
    const html = formatMath('frac(3‸');
    expect(html).not.toContain('frac(');
    expect(html).toContain('frac-container');
    expect(html).toContain('empty-slot'); // missing denominator slot
    expect(html).toContain('cursor');
  });

  it('open sin( paints a styled function name, not the ASCII stem', () => {
    const html = formatMath('sin(30‸');
    expect(html).not.toContain('sin(');
    expect(html).toContain('trig-fun');
    expect(html).toContain('sin');
    // Hardware: user types `)`. An unclosed IR must not paint a phantom closer.
    expect(html.replace(/<[^>]+>/g, '')).toBe('sin(30');
  });

  it('Pol/Rec insert as Pol( / Rec( with no built-in comma', () => {
    const polOpen = formatMath('pol(‸').replace(/<[^>]+>/g, '');
    const recOpen = formatMath('rec(‸').replace(/<[^>]+>/g, '');
    expect(polOpen).toBe('Pol(');
    expect(recOpen).toBe('Rec(');
    expect(polOpen).not.toContain(',');
    expect(formatMath('pol(3,4)').replace(/<[^>]+>/g, '')).toBe('Pol(3,4)');
    expect(formatMath('rec(2,0)').replace(/<[^>]+>/g, '')).toBe('Rec(2,0)');
  });

  it('open log / ln / hyp omit the closing paren; abs is | |', () => {
    expect(formatMath('log10(100‸').replace(/<[^>]+>/g, '')).toBe('log(100');
    expect(formatMath('ln(2‸').replace(/<[^>]+>/g, '')).toBe('ln(2');
    expect(formatMath('sinh(1‸').replace(/<[^>]+>/g, '')).toBe('sinh(1');
    expect(formatMath('abs(3‸').replace(/<[^>]+>/g, '')).toBe('|3|');
    expect(formatMath('abs(X)')).not.toContain('Abs');
    expect(formatMath('abs(X)').replace(/<[^>]+>/g, '')).toBe('|X|');
  });

  it('closed sin(30) does not print the ASCII stem sin(', () => {
    const html = formatMath('sin(30)');
    expect(html).not.toContain('sin(');
    expect(html).toContain('trig-fun');
  });

  it('closed ln(2) does not print the ASCII stem ln(', () => {
    const html = formatMath('ln(2)');
    expect(html).not.toContain('ln(');
    expect(html).toContain('trig-fun');
    expect(html).toContain('ln');
  });

  it('hyperbolic sinh( and its inverse paint a name, not the stem', () => {
    expect(formatMath('sinh(1)')).not.toContain('sinh(');
    expect(formatMath('sinh⁻¹(1‸')).not.toContain('sinh⁻¹(');
    expect(formatMath('cosh(0)')).toContain('trig-fun');
  });

  // Anti-drift guard: the LCD (formatMath) and History (toLaTeX) walk the same
  // table, so neither can leak a stem the other maps.
  it('history toLaTeX maps the same stems (no raw sqrt/sin/ln)', () => {
    expect(toLaTeX('sqrt(9)')).toBe('\\sqrt{9}');
    expect(toLaTeX('sin(30)')).toBe('\\sin(30)');
    expect(toLaTeX('ln(2)')).toBe('\\ln(2)');
    expect(toLaTeX('sinh(1)')).toBe('\\sinh(1)');
  });

  it('unicode x² paints the same .sup as ^(2)', () => {
    const fromKey = formatMath('5²');
    const fromPwr = formatMath('5^(2)');
    expect(fromKey).toContain('class="sup"');
    expect(fromKey).toContain('>2</span>');
    expect(fromPwr).toContain('class="sup"');
    expect(fromKey).not.toContain('²');
  });
});

describe('Smoke blockers — log10, memory, EQN no-real', () => {
  it('log10(100) evaluates to 2 (no __log10* rewrite)', () => {
    expect(evalComp('log10(100)')).toBeCloseTo(2, 10);
  });

  it('RCL A works when STAT type is null (no NaN A/B/C overlay)', () => {
    const empty = calculateStatVars(null, []);
    expect(empty.A).toBeUndefined();
    expect(calcPrimary(evaluateExpression('A', { ...EMPTY_VARS, A: 5 }, 0, 'DEG', empty))).toBe(5);
  });

  it('EQN negative discriminant shows the imaginary pair', () => {
    const roots = solveQuadratic(1, 0, 1);
    expect(roots).toHaveLength(2);
    expect(roots[0].label).toBe('X1 =');
    expect(roots[0].value.kind).toBe('complex');
    expect(roots[0].value.kind === 'complex' && roots[0].value.re).toBeCloseTo(0, 10);
    expect(roots[0].value.kind === 'complex' && roots[0].value.im).toBeCloseTo(1, 10);
    expect(roots[1].value.kind === 'complex' && roots[1].value.im).toBeCloseTo(-1, 10);
    const html = renderToStaticMarkup(React.createElement(EqnResultValue, { results: roots, resultIdx: 0 }));
    expect(html).toContain('>i<');
    expect(html).not.toMatch(/>Error</);
    expect(html).not.toMatch(/no real/i);
  });
});

describe('debt-value — CalcValue', () => {
  it('everyday COMP stays a real IEEE payload', () => {
    const v = evaluateExpression('sin(30)', { ...EMPTY_VARS }, 0, 'DEG', {});
    expect(v.kind).toBe('real');
    expect(calcPrimary(v)).toBeCloseTo(0.5, 10);
  });

  it('Pol returns pair r,θ and writes X,Y via the setVars bag (R16)', () => {
    const scope = { ...EMPTY_VARS };
    const write = { X: Number.NaN, Y: Number.NaN };
    const v = evaluateExpression('pol(3,4)', scope, 0, 'DEG', {}, undefined, write);
    expect(v.kind).toBe('pair');
    expect(v.kind === 'pair' && v.pair).toBe('pol');
    expect(v.kind === 'pair' && v.a).toBeCloseTo(5, 10);
    expect(v.kind === 'pair' && v.b).toBeCloseTo(53.13010235, 6);
    expect(scope.X).toBe(0);
    expect(scope.Y).toBe(0);
    expect(write.X).toBeCloseTo(5, 10);
    expect(write.Y).toBeCloseTo(53.13010235, 6);
    const merged = mergePolRecVars(scope, write);
    expect(merged.X).toBeCloseTo(5, 10);
    expect(merged.Y).toBeCloseTo(53.13010235, 6);
  });

  it('Rec returns pair X,Y', () => {
    const scope = { ...EMPTY_VARS };
    const v = evaluateExpression('rec(2,0)', scope, 0, 'DEG', {});
    expect(v.kind).toBe('pair');
    expect(v.kind === 'pair' && v.pair).toBe('rec');
    expect(v.kind === 'pair' && v.a).toBeCloseTo(2, 10);
    expect(v.kind === 'pair' && v.b).toBeCloseTo(0, 10);
  });

  it('nested Pol stays a real (only the top-level call is a pair)', () => {
    const v = evaluateExpression('2+pol(3,4)', { ...EMPTY_VARS }, 0, 'DEG', {});
    expect(v.kind).toBe('real');
    expect(calcPrimary(v)).toBeCloseTo(7, 10);
  });

  it('conjugate / arg / polar stay on CalcComplex (CMPLX later)', () => {
    const z = calcComplex(3, 4);
    expect(conjugate(z)).toEqual({ kind: 'complex', re: 3, im: -4, form: 'rect' });
    expect(complexAbs(z)).toBeCloseTo(5, 10);
    expect(complexArg(z)).toBeCloseTo(Math.atan2(4, 3), 12);
    const polar = complexToPolar(z);
    expect(polar.form).toBe('polar');
    expect(polar.re).toBeCloseTo(5, 10);
    const back = complexToRect(polar);
    expect(back.re).toBeCloseTo(3, 10);
    expect(back.im).toBeCloseTo(4, 10);
  });

  it('reserved BASE-N integer constructor exists without changing COMP', () => {
    expect(calcInteger(255, 16)).toEqual({ kind: 'integer', n: 255, base: 16 });
  });
});

describe('Phase 2 — STAT FREQ and EQN quadratic', () => {
  it('STAT editor row caps are 80 / 40 / 26 per FREQ and type', () => {
    expect(getStatMaxRows('1-VAR', false)).toBe(80);
    expect(getStatMaxRows('1-VAR', true)).toBe(40);
    expect(getStatMaxRows('A+BX', false)).toBe(40);
    expect(getStatMaxRows('A+BX', true)).toBe(26);
  });

  it('STAT editor will not grow past the FREQ cap', () => {
    const full = Array.from({ length: 40 }, () => ({ x: '1', y: '', freq: '1' }));
    expect(appendStatRowIfRoom(full, '1-VAR', true)).toHaveLength(40);
    expect(appendStatRowIfRoom(full, '1-VAR', false)).toHaveLength(41);
  });

  it('FREQ OFF counts each row once even if stored freq > 1', () => {
    const data = [
      { x: '1', freq: '3' },
      { x: '2', freq: '1' },
    ];
    expect(calculateStatVars('1-VAR', data, false).N).toBe(2);
    expect(calculateStatVars('1-VAR', data, true).N).toBe(4);
  });

  it('EQN quadratic: X² − 5X + 6 = 0 → X1=3, X2=2', () => {
    const roots = solveQuadratic(1, -5, 6);
    expect(roots).toHaveLength(2);
    expect(calcPrimary(roots[0].value)).toBeCloseTo(3, 10);
    expect(calcPrimary(roots[1].value)).toBeCloseTo(2, 10);
  });

  it('EQN quadratic editor has a/b/c labels, cell caret, and bottom-left entry', () => {
    const grid = renderToStaticMarkup(React.createElement(EqnQuadScreen, { coeffs: ['1', '2', '3'], index: 0 }));
    expect(grid).toContain('>a</th>');
    expect(grid).toContain('>b</th>');
    expect(grid).toContain('>c</th>');
    expect(grid).toContain('cursor');
    expect(grid).toContain('active-cell');
    const entry = renderToStaticMarkup(React.createElement(EqnQuadEntry, { value: '1' }));
    expect(entry).toContain('text-left');
    expect(entry).toContain('cursor');
  });

  it('STAT data editor shows FREQ and a caret in the active cell', () => {
    const html = renderToStaticMarkup(React.createElement(StatDataScreen, {
      statType: '1-VAR',
      statFrequencyEnabled: true,
      statData: [{ x: '1', freq: '2' }],
      statCursor: { row: 0, col: 1 },
    }));
    expect(html).toContain('FREQ');
    expect(html).toContain('cursor');
  });
});

describe('Phase 2 — STAT Edit Ins / Del-A / DEL-deletes-line (E-23)', () => {
  const rows = (xs: string[]) => xs.map(x => ({ x, y: '', freq: '1' }));

  it('DEL removes the current data line, not a digit of the cell', () => {
    const next = applyStatDelete(rows(['10', '20', '30']), 1);
    expect(next.data.map(d => d.x)).toEqual(['10', '30', '']);
    expect(next.row).toBe(1);
  });

  it('DEL on the last remaining line leaves the three-row blank window', () => {
    const next = applyStatDelete(rows(['7']), 0);
    expect(next.data).toHaveLength(3);
    expect(next.data.every(d => d.x === '')).toBe(true);
    expect(next.row).toBe(0);
  });

  it('Ins inserts a blank line at the caret', () => {
    const next = applyStatInsert(rows(['1', '3']), 1, '1-VAR', false);
    expect(next.data.map(d => d.x)).toEqual(['1', '', '3']);
    expect(next.row).toBe(1);
  });

  it('Ins is a no-op at the FREQ row cap', () => {
    const full = Array.from({ length: 40 }, () => ({ x: '1', y: '', freq: '1' }));
    const next = applyStatInsert(full, 0, '1-VAR', true);
    expect(next.data).toHaveLength(40);
    expect(next.row).toBe(0);
    expect(applyStatInsert(full, 0, '1-VAR', false).data).toHaveLength(41);
  });

  it('Del-A clears all sample data to three blank rows', () => {
    const next = applyStatDeleteAll();
    expect(next.data).toEqual(initialStatData());
    expect(next.row).toBe(0);
  });

  it('STAT Edit menu is 1:Ins 2:Del-A; editor SHIFT 1 menu is 3:Edit', () => {
    const edit = renderToStaticMarkup(React.createElement(StatEditScreen));
    expect(edit).toContain('Ins');
    expect(edit).toContain('Del-A');
    expect(edit).toContain('1:');
    expect(edit).toContain('2:');
    const editorMenu = renderToStaticMarkup(React.createElement(StatEditorMenuScreen));
    expect(editorMenu).toContain('Type');
    expect(editorMenu).toContain('Data');
    expect(editorMenu).toContain('Edit');
    expect(editorMenu).toContain('3:');
    expect(editorMenu).not.toContain('Sum');
    expect(editorMenu).not.toContain('Del-A');
  });

  it('empty STAT editor is three blank rows with the caret on row 1', () => {
    const data = initialStatData();
    expect(data).toHaveLength(3);
    const html = renderToStaticMarkup(React.createElement(StatDataScreen, {
      statType: '1-VAR',
      statFrequencyEnabled: false,
      statData: data,
      statCursor: { row: 0, col: 0 },
    }));
    expect(html).toContain('>1</div>');
    expect(html).toContain('>2</div>');
    expect(html).toContain('>3</div>');
    const window = statEditorWindow(data, 0);
    expect(window.map(r => r.index)).toEqual([0, 1, 2]);
    const four = applyStatInsert(data, 0, '1-VAR', false).data;
    expect(statEditorWindow(four, 1).map(r => r.index)).toEqual([0, 1, 2]);
  });

  it('Ins on a blank three-row table does not change the visible 0s', () => {
    const next = applyStatInsert(initialStatData(), 0, '1-VAR', false);
    expect(next.data).toHaveLength(4);
    const window = statEditorWindow(next.data, next.row);
    expect(window.every(r => r.entry.x === '')).toBe(true);
    expect(window).toHaveLength(3);
  });

  it('SHIFT 1 from the editor opens Type/Data/Edit, not Sum', () => {
    expect(statMenuAfterShift1('STAT_DATA', '1-VAR')).toBe('STAT_EDITOR_MENU');
    expect(statMenuAfterShift1('COMP', '1-VAR')).toBe('STAT_RESULT');
    expect(statMenuAfterShift1('COMP', null)).toBeNull();
  });
});

describe('ti-stat — FREQ overwrite, STAT memory, x̂/ŷ (R14 / R3 / R18)', () => {
  it('first digit replaces the FREQ cell (default 1 → 5, not 15)', () => {
    const start = [{ x: '2', y: '', freq: '1' }];
    const replaced = applyStatDigit(start, 0, 1, '1-VAR', true, '5');
    expect(replaced?.[0].freq).toBe('5');
    const appended = applyStatDigit(replaced!, 0, 1, '1-VAR', true, '2', false);
    expect(appended?.[0].freq).toBe('52');
    const xCell = applyStatDigit([{ x: '3', y: '', freq: '1' }], 0, 0, '1-VAR', true, '7');
    expect(xCell?.[0].x).toBe('7');
    const weighted = calculateStatVars('1-VAR', [{ x: '2', freq: '5' }]);
    expect(weighted.N).toBe(5);
    expect(weighted.stat_xbar).toBe(2);
  });

  it('STO A then STAT type then COMP A is still A (not the fit intercept)', () => {
    const fit = calculateStatVars('A+BX', [
      { x: '1', y: '2', freq: '1' },
      { x: '2', y: '4', freq: '1' },
    ]);
    expect(fit.A).toBeCloseTo(0, 10);
    expect(fit.B).toBeCloseTo(2, 10);
    const scope = { ...EMPTY_VARS, A: 7, N: 99 };
    expect(calcPrimary(evaluateExpression('A', scope, 0, 'DEG', fit))).toBe(7);
    expect(calcPrimary(evaluateExpression('x̄', scope, 0, 'DEG', fit))).toBeCloseTo(1.5, 10);
    expect(calcPrimary(evaluateExpression('n', scope, 0, 'DEG', fit))).toBe(2);
    expect(calcPrimary(evaluateExpression('n', scope, 0, 'DEG', fit))).not.toBe(99);
  });

  it('invalid x̂ / ŷ is Math ERROR, not 0', () => {
    const xhat = 'x\u0302';
    const yhat = 'y\u0302';
    const flat = calculateStatVars('A+BX', [
      { x: '1', y: '5', freq: '1' },
      { x: '2', y: '5', freq: '1' },
    ]);
    expect(flat.B).toBeCloseTo(0, 10);
    try {
      evaluateExpression(`5${xhat}`, { ...EMPTY_VARS }, 0, 'DEG', flat);
      throw new Error('expected CalcError');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('math');
    }

    const inv = calculateStatVars('1/X', [
      { x: '1', y: '1', freq: '1' },
      { x: '2', y: '0.5', freq: '1' },
    ]);
    try {
      evaluateExpression(`0${yhat}`, { ...EMPTY_VARS }, 0, 'DEG', inv);
      throw new Error('expected CalcError');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('math');
    }

    const line = calculateStatVars('A+BX', [
      { x: '1', y: '2', freq: '1' },
      { x: '2', y: '4', freq: '1' },
    ]);
    expect(calcPrimary(evaluateExpression(`3${yhat}`, { ...EMPTY_VARS }, 0, 'DEG', line))).toBeCloseTo(6, 10);
    expect(calcPrimary(evaluateExpression(`6${xhat}`, { ...EMPTY_VARS }, 0, 'DEG', line))).toBeCloseTo(3, 10);
  });
});

function expectMathError(expr: string, angleMode: AngleMode = 'DEG') {
  try {
    evalComp(expr, angleMode);
    throw new Error('expected CalcError');
  } catch (e) {
    expect(e).toBeInstanceOf(CalcError);
    expect((e as CalcError).kind).toBe('math');
  }
}

describe('ti-numerics — tan poles, odd roots, integer n!, 0^0 (R1 / R5 / R6 / R20)', () => {
  it('tan poles are Math ERROR at every odd quarter-turn (R1)', () => {
    expectMathError('tan(90)');
    expectMathError('tan(270)');
    expectMathError('tan(-90)');
    expectMathError('tan(450)');
    expectMathError('tan(100)', 'GRA');
    expectMathError('tan(300)', 'GRA');
    expectMathError('tan(-100)', 'GRA');
    expectMathError('tan(pi÷2)', 'RAD');
    expectMathError('tan(3×pi÷2)', 'RAD');
    expect(evalComp('tan(0)')).toBeCloseTo(0, 10);
    expect(evalComp('tan(180)')).toBeCloseTo(0, 10);
    expect(evalComp('tan(45)')).toBeCloseTo(1, 10);
    expect(evalComp('tan(0)', 'GRA')).toBeCloseTo(0, 10);
  });

  it('odd roots of negatives are real; even roots stay Math ERROR (R5)', () => {
    expect(evalComp('root(3,-8)')).toBeCloseTo(-2, 10);
    expect(evalComp('root(5,-32)')).toBeCloseTo(-2, 10);
    expect(evalComp('root(3,8)')).toBeCloseTo(2, 10);
    expectMathError('root(2,-4)');
    expectMathError('sqrt(-4)');
  });

  it('factorial / nCr / nPr Math ERROR on non-integers and negatives (R6)', () => {
    expect(evalComp('5!')).toBe(120);
    expect(evalComp('0!')).toBe(1);
    expect(evalComp('nPr(10,4)')).toBe(5040);
    expect(evalComp('nCr(10,4)')).toBe(210);
    expectMathError('3.7!');
    expectMathError('(-5)!');
    expectMathError('nCr(-5,2)');
    expectMathError('nCr(3.7,2)');
    expectMathError('nPr(10.5,2)');
    expectMathError('nPr(5,-1)');
  });

  it('0^0 and a lone ! are Math ERROR, not 1 (R20)', () => {
    expectMathError('0^0');
    expectMathError('pwr(0,0)');
    expectMathError('!');
    expect(evalComp('0^1')).toBe(0);
    expect(evalComp('2^0')).toBe(1);
    expect(evalComp('0!')).toBe(1);
  });
});

describe('ti-store — STO Ans-as-value, prompt 0 (R4 / R7)', () => {
  it('STO evaluates Ans as a value, not scientific text (R4)', () => {
    const huge = 1e21;
    const stored = attemptStoreOperand('Ans', { ...EMPTY_VARS }, huge, 'DEG', {});
    expect(stored.ok).toBe(true);
    if (stored.ok) expect(calcPrimary(stored.value)).toBe(huge);

    const plusOne = attemptStoreOperand('Ans+1', { ...EMPTY_VARS }, huge, 'DEG', {});
    expect(plusOne.ok).toBe(true);
    if (plusOne.ok) expect(calcPrimary(plusOne.value)).toBe(huge + 1);

    // Old bug: String(1e21) is "1e+21", which parsed as 1×e+21 ≈ 24.
    expect(String(huge)).toBe('1e+21');
    const asText = attemptStoreOperand(String(huge), { ...EMPTY_VARS }, 0, 'DEG', {});
    expect(asText.ok).toBe(true);
    if (asText.ok) expect(calcPrimary(asText.value)).not.toBe(huge);
  });

  it('STO does not write the letter when the operand is Math ERROR (R4)', () => {
    const failed = attemptStoreOperand('1÷0', { ...EMPTY_VARS, A: 7 }, 0, 'DEG', {});
    expect(failed.ok).toBe(false);
    if (failed.ok === false) expect(failed.error.kind).toBe('math');

    const tanPole = attemptStoreOperand('tan(90)', { ...EMPTY_VARS, A: 7 }, 0, 'DEG', {});
    expect(tanPole.ok).toBe(false);
    if (tanPole.ok === false) expect(tanPole.error.kind).toBe('math');
  });

  it('typing 0 at a prompt stores 0; empty keeps the previous value (R7)', () => {
    expect(commitPromptValue('0', '12')).toBe(0);
    expect(commitPromptValue('0.0', '12')).toBe(0);
    expect(commitPromptValue('', '12')).toBe(12);
    expect(commitPromptValue('', '0')).toBe(0);
    expect(commitPromptValue('5', '12')).toBe(5);
    expect(commitPromptValue('-3', '12')).toBe(-3);
    expect(parseFloat('0') || parseFloat('12')).toBe(12);
  });
});

describe('ti-parse — adjacent memory letters, SOLVE stems (R2 / R8)', () => {
  it('adjacent memory letters multiply; Ans stays a name (R2)', () => {
    expect(calcPrimary(evaluateExpression('XY', { ...EMPTY_VARS, X: 3, Y: 4 }, 0, 'DEG', {}))).toBe(12);
    expect(calcPrimary(evaluateExpression('AB', { ...EMPTY_VARS, A: 2, B: 5 }, 0, 'DEG', {}))).toBe(10);
    expect(calcPrimary(evaluateExpression('Ans', { ...EMPTY_VARS }, 7, 'DEG', {}))).toBe(7);
    expect(calcPrimary(evaluateExpression('AnsX', { ...EMPTY_VARS, X: 3 }, 5, 'DEG', {}))).toBe(15);
    expect(evalComp('log10(100)')).toBeCloseTo(2, 10);
  });

  it('SOLVE does not prompt letters inside Ans / nCr / function stems (R8)', () => {
    expect(collectSolvePromptVars('Ans+X')).toEqual([]);
    expect(collectSolvePromptVars('nCr(X,2)')).toEqual([]);
    expect(collectSolvePromptVars('nCr(A,X)')).toEqual(['A']);
    expect(collectSolvePromptVars('abs(X)+1=0')).toEqual([]);
    expect(collectSolvePromptVars('cos(X)')).toEqual([]);
    expect(collectSolvePromptVars('Y=X+10')).toEqual(['Y']);
    expect(collectSolvePromptVars('A+X')).toEqual(['A']);
    expect(collectSolvePromptVars('frac(A,B)+X')).toEqual(['A', 'B']);
  });
});

describe('ti-keys — x^n / x² / caret stems / mode-gated frac (R9 / R10 / R11 / R25)', () => {
  it('x^n after = starts from Ans, not the old formula (R9)', () => {
    expect(applyPowerKey('2+3‸', true, false)).toEqual({ input: 'Ans^(‸)', showingResult: false });
    expect(applyPowerKey('2+3‸', true, true)).toEqual({ input: 'root(Ans,‸)', showingResult: false });
    expect(applyPowerKey('2+3‸', false, false)).toEqual({ input: '2+3^(‸)', showingResult: false });
    expect(applyPowerKey('‸', false, false)).toEqual({ input: 'pwr(‸,)', showingResult: false });
  });

  it('x² / cube after a result always clears SHIFT (R10)', () => {
    expect(applySquareKey('2+3‸', true, false)).toEqual({
      input: 'Ans²‸', showingResult: false, isShift: false,
    });
    expect(applySquareKey('2+3‸', true, true)).toEqual({
      input: 'Ans³‸', showingResult: false, isShift: false,
    });
    expect(applySquareKey('5‸', false, true)).toEqual({
      input: '5³‸', showingResult: false, isShift: false,
    });
  });

  it('caret jumps pol( rec( ^( instead of splitting the stem (R11)', () => {
    expect(CURSOR_PATS).toEqual(expect.arrayContaining(['pol(', 'rec(', '^(']));
    expect(CURSOR_PATS.indexOf('e^(')).toBeLessThan(CURSOR_PATS.indexOf('^('));
    expect(CURSOR_PATS.indexOf('10^(')).toBeLessThan(CURSOR_PATS.indexOf('^('));
    expect(moveCompCursorRight('‸pol(3,4)')).toBe('pol(‸3,4)');
    expect(moveCompCursorRight('‸rec(2,0)')).toBe('rec(‸2,0)');
    expect(moveCompCursorRight('5‸^(2)')).toBe('5^(‸2)');
    expect(moveCompCursorLeft('pol(‸3,4)')).toBe('‸pol(3,4)');
    expect(moveCompCursorLeft('5^(‸2)')).toBe('5‸^(2)');
  });

  it('frac / nPr / nCr / x^n write COMP only in COMP (R9 / R25)', () => {
    expect(allowsCompLineEdit('COMP')).toBe(true);
    expect(allowsCompLineEdit('STAT_DATA')).toBe(false);
    expect(allowsCompLineEdit('STAT_RESULT')).toBe(false);
    expect(allowsCompLineEdit('EQN_QUAD')).toBe(false);
    expect(allowsCompLineEdit('EQN_RESULT')).toBe(false);
    expect(allowsCompLineEdit('MENU')).toBe(false);
  });
});

describe('ti-escape — overlays, AC, History Load (R12 / R13 / R26)', () => {
  it('CALC / SOLVE / hyp only on a COMP calc line (R12)', () => {
    expect(allowsCalcSolveHyp('COMP')).toBe(true);
    expect(allowsCalcSolveHyp('STAT_DATA')).toBe(false);
    expect(allowsCalcSolveHyp('STAT_RESULT')).toBe(false);
    expect(allowsCalcSolveHyp('EQN_QUAD')).toBe(false);
    expect(allowsCalcSolveHyp('EQN_RESULT')).toBe(false);
    expect(allowsCalcSolveHyp('MENU')).toBe(false);
    expect(isLcdMenu({ showHypMenu: true, solveScreen: null, calcMode: 'COMP' })).toBe(true);
    expect(isLcdMenu({ showHypMenu: true, solveScreen: null, calcMode: 'EQN_QUAD' })).toBe(false);
    expect(isLcdMenu({ showHypMenu: false, solveScreen: 'confirm', calcMode: 'EQN_QUAD' })).toBe(false);
    expect(isLcdMenu({ showHypMenu: false, solveScreen: 'confirm', calcMode: 'STAT_DATA' })).toBe(true);
  });

  it('AC from STAT enters COMP and clears overlays + STAT type (R13)', () => {
    const fromStat = applyAllClear('STAT_DATA');
    expect(fromStat.calcMode).toBe('COMP');
    expect(fromStat.clearStatType).toBe(true);
    expect(fromStat.showHypMenu).toBe(false);
    expect(fromStat.promptVar).toBeNull();
    expect(fromStat.solveScreen).toBeNull();
    expect(fromStat.lcdError).toBeNull();
    expect(fromStat.resetCompLine).toBe(true);

    const fromEqn = applyAllClear('EQN_RESULT');
    expect(fromEqn.calcMode).toBe('EQN_QUAD');
    expect(fromEqn.resetEqn).toBe(true);
    expect(fromEqn.clearStatType).toBe(false);
    expect(fromEqn.showHypMenu).toBe(false);
    expect(fromEqn.promptVar).toBeNull();
    expect(fromEqn.solveScreen).toBeNull();
    expect(fromEqn.lcdError).toBeNull();

    const fromComp = applyAllClear('COMP');
    expect(fromComp.calcMode).toBe('COMP');
    expect(fromComp.clearStatType).toBe(false);
  });

  it('History Load enters COMP and clears overlays (R26)', () => {
    const load = applyHistoryLoad('2+2', ['2', '+', '2']);
    expect(load.calcMode).toBe('COMP');
    expect(load.currentInput).toBe('2+2‸');
    expect(load.currentSequence).toEqual(['2', '+', '2']);
    expect(load.showingResult).toBe(false);
    expect(load.clearStatType).toBe(true);
    expect(load.showHypMenu).toBe(false);
    expect(load.promptVar).toBeNull();
    expect(load.solveScreen).toBeNull();
    expect(load.lcdError).toBeNull();
  });
});

describe('ti-edges — signed square, %, EQN a=0, display, ∫, persist (R15–R17, R19, R21–R24)', () => {
  it('(-) 3 x² is −9; packed (−3)² is 9 (R15)', () => {
    expect(evalComp('-3²')).toBe(-9);
    expect(evalComp('(-3)²')).toBe(9);
    expect(evalComp('-3^2')).toBe(-9);
  });

  it('% is ÷100 on every path (R17)', () => {
    expect(evalComp('200+10%')).toBeCloseTo(200.1, 10);
    expect(evalComp('200-10%')).toBeCloseTo(199.9, 10);
    expect(evalComp('10%')).toBeCloseTo(0.1, 10);
    expect(evalComp('200×10%')).toBeCloseTo(20, 10);
    expect(evalComp('200÷10%')).toBeCloseTo(0.2, 10);
  });

  it('EQN quadratic a=0 is Math ERROR (R19)', () => {
    expect(() => solveQuadratic(0, 2, -4)).toThrow(CalcError);
    expect(() => solveQuadratic(0, 0, 0)).toThrow(CalcError);
    try {
      solveQuadratic(0, 1, 1);
      expect.fail('expected Math ERROR');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('math');
    }
  });

  it('|x| < 1e-15 uses Norm sci, not a forced 0 (R21)', () => {
    expect(formatForDisplay(0, { kind: 'norm', n: 1 })).toEqual({ type: 'plain', text: '0' });
    expect(formatForDisplay(1e-16, { kind: 'norm', n: 1 })).toEqual({
      type: 'sci',
      mantissa: '1',
      exponent: -16,
    });
    expect(formatForDisplay(1e-16, { kind: 'norm', n: 2 })).toEqual({
      type: 'sci',
      mantissa: '1',
      exponent: -16,
    });
  });

  it('singular ∫ is Time Out and returns (R22)', () => {
    const t0 = Date.now();
    try {
      evalComp('int(1/x,0,1)');
      expect.fail('expected Time Out');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('timeout');
      expect(calcErrorLabel('timeout')).toBe('Time Out');
    }
    expect(Date.now() - t0).toBeLessThan(2000);
    expect(evalComp('int(sqr(x),0,1)')).toBeCloseTo(1 / 3, 9);
  });

  it('persisted Ans / vars / angle are validated (R23)', () => {
    expect(loadPersistedAns(null)).toBe(0);
    expect(loadPersistedAns('not-a-number')).toBe(0);
    expect(loadPersistedAns('Infinity')).toBe(0);
    expect(loadPersistedAns('1.5')).toBe(1.5);
    expect(loadPersistedVars('{"A":"nope","X":3}')).toEqual({
      ...EMPTY_VARS,
      X: 3,
    });
    expect(loadPersistedVars('[]')).toEqual(EMPTY_VARS);
    expect(loadPersistedVars('{')).toEqual(EMPTY_VARS);
    expect(loadPersistedAngle('RAD')).toBe('RAD');
    expect(loadPersistedAngle('DEG')).toBe('DEG');
    expect(loadPersistedAngle('GRA')).toBe('GRA');
    expect(loadPersistedAngle('nope')).toBe('DEG');
    expect(loadPersistedAngle(null)).toBe('DEG');
  });

  it('result line is blank while typing, 0 when idle (R24)', () => {
    expect(resultLineWhileEditing('‸', false)).toBe('0');
    expect(resultLineWhileEditing('1+2‸', false)).toBe('');
    expect(resultLineWhileEditing('1+2‸', true)).toBe('');
  });
});

describe('Phase 1 — hardware-accurate numerics', () => {
  it('∫ (Gauss–Kronrod): ∫₀¹ x² dx = 1/3', () => {
    expect(evalComp('int(sqr(x),0,1)')).toBeCloseTo(1 / 3, 9);
  });

  it('∫ ₀¹ x dx = 1/2', () => {
    expect(evalComp('int(x,0,1)')).toBeCloseTo(0.5, 10);
  });

  it('∫ ₁ᵉ (1/x) dx = 1', () => {
    expect(evalComp('int(frac(1,x),1,e)')).toBeCloseTo(1, 9);
  });

  it('∫ handles reversed limits with a sign flip', () => {
    expect(evalComp('int(sqr(x),1,0)')).toBeCloseTo(-1 / 3, 9);
  });

  it('d/dx (central difference): d/dx x² at 3 = 6', () => {
    expect(evalComp('diff(sqr(x),x,3)')).toBeCloseTo(6, 7);
  });

  it('d/dx x³ at 2 = 12', () => {
    expect(evalComp('diff(cube(x),x,2)')).toBeCloseTo(12, 7);
  });

  it('d/dx (1/x) at 2 = -1/4', () => {
    expect(evalComp('diff(frac(1,x),x,2)')).toBeCloseTo(-0.25, 7);
  });

  it('overflow beyond ±10¹⁰⁰ is out of hardware range', () => {
    expect(() => evalComp('pwr(10,150)')).toThrow(CalcError);
    try {
      evalComp('pwr(10,150)');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('math');
    }
  });
});

describe('Phase 2 — SOLVE errors and L−R (E-20, E-21, E-41)', () => {
  it('SOLVE without X is Variable ERROR, not Syntax ERROR', () => {
    expect(expressionHasSolveUnknown('2+2')).toBe(false);
    expect(expressionHasSolveUnknown('A+B')).toBe(false);
    expect(expressionHasSolveUnknown('X+1')).toBe(true);
    expect(expressionHasSolveUnknown('Y=X+10')).toBe(true);
    expect(calcErrorLabel('variable')).toBe('Variable ERROR');
    expect(calcErrorLabel('syntax')).toBe('Syntax ERROR');
  });

  it('E-41: non-converging Newton reports Can\'t Solve', () => {
    expect(() => newtonSolveX('abs(X)+1=0', { ...EMPTY_VARS }, 0, 'DEG', {})).toThrow(CalcError);
    try {
      newtonSolveX('abs(X)+1=0', { ...EMPTY_VARS }, 0, 'DEG', {});
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('cantSolve');
    }
    try {
      newtonSolveX('X×0+1=2', { ...EMPTY_VARS }, 0, 'DEG', {});
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('cantSolve');
    }
    expect(calcErrorLabel('cantSolve')).toBe("Can't Solve");
  });

  it('E-20: Y=X+10 with Y=12 solves X=2 and L−R ≈ 0', () => {
    expect(collectSolvePromptVars('Y=X+10')).toEqual(['Y']);
    const r = newtonSolveX('Y=X+10', { ...EMPTY_VARS, Y: 12, X: 0 }, 0, 'DEG', {});
    expect(r.x).toBeCloseTo(2, 8);
    expect(r.residual).toBeCloseTo(0, 8);
  });

  it('evaluateExpression routes parse failure to Syntax ERROR', () => {
    try {
      evalComp('bogus(2)');
      throw new Error('expected CalcError');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).kind).toBe('syntax');
    }
  });
});

describe('E-40 — CalcError.offset and jump-to-token (debt-source-map)', () => {
  function syntaxOf(expr: string): CalcError {
    try {
      evalComp(expr);
      throw new Error('expected CalcError');
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      return e as CalcError;
    }
  }

  it('log10(100) stays 2 after implicit multiply moved to the parser', () => {
    expect(evalComp('log10(100)')).toBeCloseTo(2, 10);
    expect(evalComp('2log10(100)')).toBeCloseTo(4, 10);
  });

  it('Syntax ERROR offset is the fault token in the original string', () => {
    const err = syntaxOf('2+');
    expect(err.kind).toBe('syntax');
    expect(err.offset).toBe(1);
  });

  it('rewritten stem keeps the original start as Math ERROR offset', () => {
    const err = syntaxOf('1+sqrt(-1)');
    expect(err.kind).toBe('math');
    expect(err.offset).toBe(2);
  });

  it('left/right jump places the caret at the fault token', () => {
    const trailing = syntaxOf('2+');
    expect(placeCaretAtOffset('2+‸', trailing.offset ?? 0)).toBe('2‸+');

    const stem = syntaxOf('1+sqrt(-1)');
    expect(placeCaretAtOffset('1+sqrt(-1)‸', stem.offset ?? 0)).toBe('1+‸sqrt(-1)');
  });

  it('Variable ERROR / Can\'t Solve have no token offset (◀▶ dismiss, expression stays)', () => {
    expect(new CalcError('variable').offset).toBeUndefined();
    expect(new CalcError('cantSolve').offset).toBeUndefined();
    expect(placeCaretAtOffset('2+2‸', 0)).toBe('‸2+2');
  });

  it('▶ exits painted abs bars by closing the IR', () => {
    expect(moveCompCursorRight('abs(X‸')).toBe('abs(X)‸');
    expect(moveCompCursorRight('1+abs(X‸')).toBe('1+abs(X)‸');
    expect(moveCompCursorRight('abs(X)‸')).toBe('abs(X)‸');
    expect(moveCompCursorRight('sin(30‸')).toBe('sin(30‸');
  });
});

describe('History sequences use physical faceplate keys', () => {
  it('variable X is ALPHA + ) (the key that wears the red X)', () => {
    expect(reconstructSequence('X')).toEqual(['ALPHA', ')']);
    expect(reconstructSequence('2X')).toEqual(['2', 'ALPHA', ')']);
  });

  it('variable Y is ALPHA + S⇔D', () => {
    expect(reconstructSequence('Y')).toEqual(['ALPHA', 'S⇔D']);
    expect(reconstructSequence('X+Y')).toEqual(['ALPHA', ')', '+', 'ALPHA', 'S⇔D']);
  });

  it('digits are one chip each, not a grouped number', () => {
    expect(reconstructSequence('cos(60)+1')).toEqual(['cos', '6', '0', '+', '1']);
  });

  it('equals in an equation is ALPHA + CALC, not a chip labelled =', () => {
    expect(reconstructSequence('abs(X)+1=0')).toEqual([
      'SHIFT', 'hyp', 'ALPHA', ')', '+', '1', 'ALPHA', 'CALC', '0',
    ]);
    expect(reconstructSequence('5X+3=4')).toEqual([
      '5', 'ALPHA', ')', '+', '3', 'ALPHA', 'CALC', '4',
    ]);
  });

  it('power template after X matches the faceplate x^□ key', () => {
    expect(reconstructSequence('cos(60)+X^(4)')).toEqual([
      'cos', '6', '0', '+', 'ALPHA', ')', 'xⁿ', '4',
    ]);
  });

  it('log / ln are the unshifted keys; 10^ and e^ add SHIFT', () => {
    expect(reconstructSequence('log10(100)')).toEqual(['log', '1', '0', '0']);
    expect(reconstructSequence('ln(2)')).toEqual(['ln', '2']);
    expect(reconstructSequence('10^(2)')).toEqual(['SHIFT', 'log', '2']);
    expect(reconstructSequence('e^(1)')).toEqual(['SHIFT', 'ln', '1']);
  });

  it('sqrt and hyp menu use the keys actually pressed', () => {
    expect(reconstructSequence('sqrt(16)')).toEqual(['√', '1', '6']);
    expect(reconstructSequence('sinh(1)')).toEqual(['hyp', '1', '1']);
    expect(reconstructSequence('sin⁻¹(0.5)')).toEqual(['SHIFT', 'sin', '0', '.', '5']);
  });

  it('A–F / M / π / e map to ALPHA or SHIFT plus the physical key', () => {
    expect(reconstructSequence('A')).toEqual(['ALPHA', '(-)']);
    expect(reconstructSequence('M')).toEqual(['ALPHA', 'M+']);
    expect(reconstructSequence('2π')).toEqual(['2', 'SHIFT', '×10ˣ']);
    expect(reconstructSequence('e')).toEqual(['ALPHA', '×10ˣ']);
  });

  it('STO uses SHIFT RCL and the letter key, not ALPHA', () => {
    expect(reconstructSequence('5→A')).toEqual(['5', 'SHIFT', 'RCL', '(-)']);
    expect(reconstructSequence('Ans→X')).toEqual(['Ans', 'SHIFT', 'RCL', ')']);
  });

  it('Show Keys chips paint faceplate legends, not logical letters', () => {
    const x = renderToStaticMarkup(renderMiniButton(')', 'x') as React.ReactElement);
    expect(x).toContain(')');
    expect(x).not.toContain('>X<');
    const pwr = renderToStaticMarkup(renderMiniButton('xⁿ', 'p') as React.ReactElement);
    expect(pwr).toContain('mini-box');
    expect(pwr).toContain('>x<');
    const cos = renderToStaticMarkup(renderMiniButton('cos', 'c') as React.ReactElement);
    expect(cos).toContain('cos');
    expect(cos).not.toContain('COS');
    const shift = renderToStaticMarkup(renderMiniButton('SHIFT', 's') as React.ReactElement);
    expect(shift).toContain('shape-shift');
    const alpha = renderToStaticMarkup(renderMiniButton('ALPHA', 'a') as React.ReactElement);
    expect(alpha).toContain('shape-alpha');
    const six = renderToStaticMarkup(renderMiniButton('6', '6') as React.ReactElement);
    expect(six).toContain('shape-numpad');
    expect(six).toContain('mini-btn num');
    const plus = renderToStaticMarkup(renderMiniButton('+', 'p') as React.ReactElement);
    expect(plus).toContain('shape-numpad');
    expect(plus).toContain('mini-btn num');
    expect(plus).not.toContain('shape-sci');
    const calc = renderToStaticMarkup(renderMiniButton('CALC', 'k') as React.ReactElement);
    expect(calc).toContain('CALC');
    expect(calc).toContain('shape-sci');
    expect(calc).not.toContain('>=<');
    const sine = renderToStaticMarkup(renderMiniButton('sin', 'si') as React.ReactElement);
    expect(sine).toContain('shape-sci');
    const close = renderToStaticMarkup(renderMiniButton(')', 'rp') as React.ReactElement);
    expect(close).toContain('shape-sci');
    const ac = renderToStaticMarkup(renderMiniButton('AC', 'ac') as React.ReactElement);
    expect(ac).toContain('shape-numpad');
    expect(ac).toContain('mini-btn ac');
  });

  it('every physical keychip uses its faceplate family', () => {
    const families: Record<string, string[]> = {
      numpad: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '×', '÷', 'Ans', '×10ˣ', '='],
      del: ['DEL'],
      ac: ['AC'],
      shift: ['SHIFT'],
      alpha: ['ALPHA'],
      mode: ['MODE'],
      'nav-up': ['UP', '↑'],
      'nav-down': ['DOWN', '↓'],
      'nav-left': ['LEFT', '←'],
      'nav-right': ['RIGHT', '→'],
      sci: [
        'CALC', '∫', 'x-1', 'log_box', 'log', 'ln', 'sin', 'cos', 'tan', 'hyp',
        '√', 'frac', 'x²', 'xⁿ', '(', ')', 'S⇔D', '°\'"', '(-)', 'RCL', 'M+',
      ],
    };
    for (const [family, labels] of Object.entries(families)) {
      for (const label of labels) {
        expect(chipFamily(label), label).toBe(family);
      }
    }
    expect(chipFamily('+')).not.toBe('sci');
    expect(chipFamily('(-)')).toBe('sci');
  });
});

describe('Non-calculation operations in live keys / history', () => {
  const idle = {
    setupPage: 0 as const,
    setupPrompt: null,
    isSto: false,
    isRcl: false,
    currentInput: '‸',
  };

  it('MODE menu and SETUP are live key recipes, not empty', () => {
    expect(liveOperationSequence({ ...idle, calcMode: 'MENU' })).toEqual(['MODE']);
    expect(liveOperationSequence({ ...idle, calcMode: 'SETUP' })).toEqual(['SHIFT', 'MODE']);
    expect(liveOperationSequence({ ...idle, calcMode: 'SETUP', setupPrompt: 'fix' })).toEqual(['SHIFT', 'MODE', '6']);
  });

  it('pending STO appends SHIFT RCL until the letter is pressed', () => {
    expect(liveOperationSequence({
      ...idle,
      calcMode: 'COMP',
      currentInput: '5‸',
      isSto: true,
    })).toEqual(['5', 'SHIFT', 'RCL']);
  });

  it('completed SETUP Deg is SHIFT MODE 3', () => {
    expect(setupCommitSequence('deg')).toEqual(['SHIFT', 'MODE', '3']);
  });

  it('pending SHIFT and SOLVE append SHIFT CALC after the expression', () => {
    const expr = {
      ...idle,
      calcMode: 'COMP' as const,
      currentInput: 'abs(X)+1=0‸',
    };
    expect(liveOperationSequence(expr)).toEqual([
      'SHIFT', 'hyp', 'ALPHA', ')', '+', '1', 'ALPHA', 'CALC', '0',
    ]);
    expect(liveOperationSequence({ ...expr, isShift: true })).toEqual([
      'SHIFT', 'hyp', 'ALPHA', ')', '+', '1', 'ALPHA', 'CALC', '0', 'SHIFT',
    ]);
    expect(liveOperationSequence({ ...expr, solveScreen: 'confirm' })).toEqual([
      'SHIFT', 'hyp', 'ALPHA', ')', '+', '1', 'ALPHA', 'CALC', '0', 'SHIFT', 'CALC',
    ]);
    expect(liveOperationSequence({ ...expr, lcdErrorKind: 'cantSolve' })).toEqual([
      'SHIFT', 'hyp', 'ALPHA', ')', '+', '1', 'ALPHA', 'CALC', '0', 'SHIFT', 'CALC',
    ]);
  });
});
