import { describe, expect, it } from 'vitest';
import { evaluateExpression, toFraction } from './evaluator.ts';
import { calculateStatVars } from './modes/stat.tsx';
import type { AngleMode, Vars } from './types.ts';

/** Empty A–F/M/X/Y memory, matching calculator power-on defaults. */
const EMPTY_VARS: Vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };

function evalComp(expr: string, angleMode: AngleMode = 'DEG'): number {
  return evaluateExpression(expr, { ...EMPTY_VARS }, 0, angleMode, {});
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
