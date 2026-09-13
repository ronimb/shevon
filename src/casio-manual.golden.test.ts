import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { reconstructSequence } from './modes/comp.ts';
import { evaluateExpression, toFraction } from './evaluator.ts';
import { appendStatRowIfRoom, calculateStatVars, getStatMaxRows, StatDataScreen } from './modes/stat.tsx';
import { EqnQuadEntry, EqnQuadScreen, solveQuadratic } from './modes/eqn.tsx';
import { formatMath, toLaTeX } from './display.tsx';
import { formatForDisplay, formatEngineering, formatDMS, formatDMSText, roundToFormat, type DisplayFormat } from './format.ts';
import type { AngleMode, Vars } from './types.ts';

/** Empty A–F/M/X/Y memory, matching calculator power-on defaults. */
const EMPTY_VARS: Vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };

function evalComp(expr: string, angleMode: AngleMode = 'DEG', fmt?: DisplayFormat): number {
  return evaluateExpression(expr, { ...EMPTY_VARS }, 0, angleMode, {}, fmt);
}

describe('Casio fx-991ES PLUS sample operations', () => {
  it('E-16: sin 30° = 0.5 in Degree mode', () => {
    expect(evalComp('sin(30)')).toBeCloseTo(0.5, 10);
  });

  it('E-16: 4 × sin30 × (30 + 10 × 3) = 120', () => {
    expect(evalComp('4×sin(30)×(30+10×3)')).toBeCloseTo(120, 10);
  });

  it('E-10: 2/3 + 1/2 = 7/6 (Natural Display fraction)', () => {
    const value = evalComp('frac(2,3)+frac(1,2)');
    const frac = toFraction(value);
    expect(frac.n).toBe(7);
    expect(frac.d).toBe(6);
  });

  it('E-18: 10 nPr 4 = 5040', () => {
    expect(evalComp('nPr(10,4)')).toBe(5040);
  });

  it('E-18: 10 nCr 4 = 210', () => {
    expect(evalComp('nCr(10,4)')).toBe(210);
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
    // Casio LCD: 1.154700538
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
  it('abs( renders as Abs with a ⬚ slot, not raw ASCII abs(', () => {
    const html = formatMath('abs(‸)');
    expect(html).toContain('Abs');
    expect(html).not.toContain('abs(');
    expect(html).toContain('cursor');
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
  // docs/prompts/now-visual-slice.md.
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
    expect(roots[0].val).toBeCloseTo(3, 10);
    expect(roots[1].val).toBeCloseTo(2, 10);
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

describe('Phase 1 — Casio-accurate numerics', () => {
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

  it('overflow beyond ±10¹⁰⁰ is out of Casio range', () => {
    expect(Math.abs(evalComp('pwr(10,150)'))).toBeGreaterThanOrEqual(1e100);
  });
});

describe('History sequences match keyboard shortcuts', () => {
  it('variable X logs ALPHA, X (keyboard x), not the physical ) key', () => {
    expect(reconstructSequence('X')).toEqual(['ALPHA', 'X']);
    expect(reconstructSequence('2X')).toEqual(['2', 'ALPHA', 'X']);
  });

  it('variable Y logs ALPHA, Y (keyboard y), not S⇔D', () => {
    expect(reconstructSequence('Y')).toEqual(['ALPHA', 'Y']);
    expect(reconstructSequence('X+Y')).toEqual(['ALPHA', 'X', '+', 'ALPHA', 'Y']);
  });
});
