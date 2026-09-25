import { describe, expect, it } from 'vitest';
import { parse, tokenize, ParseError, insertImplicitMultiply, type AstNode } from './parser.ts';
import { evaluateExpression } from './evaluator.ts';
import type { AngleMode, Vars } from './types.ts';

const EMPTY_VARS: Vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };

function evalComp(expr: string, angleMode: AngleMode = 'DEG', vars: Vars = EMPTY_VARS): number {
  return evaluateExpression(expr, { ...vars }, 0, angleMode, {});
}

function shape(node: AstNode): unknown {
  switch (node.type) {
    case 'num':
      return { type: 'num', value: node.value };
    case 'var':
      return { type: 'var', name: node.name };
    case 'call':
      return { type: 'call', name: node.name, args: node.args.map(shape) };
    case 'unary':
      return { type: 'unary', op: node.op, operand: shape(node.operand) };
    case 'binary':
      return { type: 'binary', op: node.op, left: shape(node.left), right: shape(node.right) };
  }
}

describe('parser: AST shape', () => {
  it('respects * over + precedence and left-associativity', () => {
    expect(shape(parse('1+2*3'))).toEqual({
      type: 'binary',
      op: '+',
      left: { type: 'num', value: 1 },
      right: {
        type: 'binary',
        op: '*',
        left: { type: 'num', value: 2 },
        right: { type: 'num', value: 3 },
      },
    });
  });

  it('parses ** as right-associative above unary minus', () => {
    expect(shape(parse('2**3**2'))).toEqual({
      type: 'binary',
      op: '**',
      left: { type: 'num', value: 2 },
      right: {
        type: 'binary',
        op: '**',
        left: { type: 'num', value: 3 },
        right: { type: 'num', value: 2 },
      },
    });
  });

  it('parses function calls, nested calls and identifiers', () => {
    expect(shape(parse('__sin(__pow(X,2))'))).toEqual({
      type: 'call',
      name: '__sin',
      args: [
        {
          type: 'call',
          name: '__pow',
          args: [
            { type: 'var', name: 'X' },
            { type: 'num', value: 2 },
          ],
        },
      ],
    });
  });

  it('parses zero-argument calls', () => {
    expect(shape(parse('__ranhash()'))).toEqual({
      type: 'call',
      name: '__ranhash',
      args: [],
    });
  });

  it('parses unary minus', () => {
    expect(shape(parse('-X'))).toEqual({
      type: 'unary',
      op: '-',
      operand: { type: 'var', name: 'X' },
    });
  });
});

describe('parser: errors', () => {
  it('rejects a trailing operator', () => {
    expect(() => parse('2+')).toThrow(ParseError);
  });

  it('rejects an unclosed parenthesis', () => {
    expect(() => parse('(1+2')).toThrow(ParseError);
  });

  it('rejects unexpected characters', () => {
    expect(() => tokenize('2 ° 3')).toThrow(ParseError);
  });
});

describe('evaluator: no new Function, AST-backed', () => {
  it('evaluates arithmetic with correct precedence', () => {
    expect(evalComp('1+2×3')).toBe(7);
    expect(evalComp('(1+2)×3')).toBe(9);
  });

  it('evaluates powers and roots', () => {
    expect(evalComp('sqr(5)')).toBe(25);
    expect(evalComp('cube(2)')).toBe(8);
    expect(evalComp('2^(10)')).toBe(1024);
    expect(evalComp('sqrt(144)')).toBe(12);
  });

  it('evaluates factorial', () => {
    expect(evalComp('5!')).toBe(120);
  });

  it('handles implicit multiplication', () => {
    expect(evalComp('2sin(30)')).toBeCloseTo(1, 10);
    expect(evalComp('2(3)')).toBe(6);
  });

  it('does not insert multiply inside __log10(', () => {
    expect(evalComp('log10(100)')).toBeCloseTo(2, 10);
    expect(shape(parse('__log10(100)'))).toEqual({
      type: 'call',
      name: '__log10',
      args: [{ type: 'num', value: 100 }],
    });
    const toks = insertImplicitMultiply(tokenize('__log10(100)'));
    expect(toks.some((t) => t.type === 'op' && t.value === '*')).toBe(false);
  });

  it('inserts implicit multiply at token level for 2(', () => {
    expect(shape(parse('2(3)'))).toEqual({
      type: 'binary',
      op: '*',
      left: { type: 'num', value: 2 },
      right: { type: 'num', value: 3 },
    });
  });

  it('evaluates a summation via the Σ lambda form', () => {
    // Σ(X, x, 1, 5) = 1+2+3+4+5 = 15
    expect(evalComp('Σ(X,X,1,5)')).toBe(15);
  });

  it('differentiates x² at 3 ≈ 6', () => {
    expect(evalComp('diff(sqr(X),X,3)')).toBeCloseTo(6, 4);
  });

  it('integrates 2x from 0 to 3 ≈ 9', () => {
    expect(evalComp('int(2×X,0,3)')).toBeCloseTo(9, 6);
  });

  it('throws on undefined function so the UI can flag a syntax error', () => {
    expect(() => evalComp('bogus(2)')).toThrow();
  });
});
