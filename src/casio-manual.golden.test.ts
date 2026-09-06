import { describe, expect, it } from 'vitest';
import { evaluateExpression, toFraction } from './evaluator.ts';
import { calculateStatVars } from './modes/stat.tsx';
import { formatForDisplay, formatEngineering, formatDMS, roundToFormat, type DisplayFormat } from './format.ts';
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
});
