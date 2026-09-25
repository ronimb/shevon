import React from 'react';
import { calcComplex, calcReal, type EqnResult } from '../types.ts';
import { EditorCaret, formatComplexPair, formatResultNumber } from '../display.tsx';

export function solveQuadratic(a: number, b: number, c: number): EqnResult[] {
  if (a === 0) {
    if (b === 0) return [{ label: "No solution", value: calcReal(NaN) }];
    else return [{ label: "X =", value: calcReal(-c / b) }];
  }
  let disc = b * b - 4 * a * c;
  if (disc < 0) {
    const real = -b / (2 * a);
    const imag = Math.sqrt(-disc) / (2 * a);
    return [
      { label: "X1 =", value: calcComplex(real, imag) },
      { label: "X2 =", value: calcComplex(real, -imag) },
    ];
  } else if (disc === 0) {
    return [{ label: "X =", value: calcReal(-b / (2 * a)) }];
  } else {
    return [
      { label: "X1 =", value: calcReal((-b + Math.sqrt(disc)) / (2 * a)) },
      { label: "X2 =", value: calcReal((-b - Math.sqrt(disc)) / (2 * a)) },
    ];
  }
}

export function applyEqnDigit(coeffs: string[], index: number, val: string): string[] | undefined {
  if (isNaN(Number(val)) && val !== '.' && val !== '-') return undefined;
  const next = [...coeffs];
  let currentStr = next[index];
  if (currentStr === "0" && val !== '.') currentStr = "";
  if (val === '-' && currentStr.startsWith('-')) return coeffs;
  next[index] = currentStr + val;
  return next;
}

export function applyEqnDelete(coeffs: string[], index: number): string[] {
  const next = [...coeffs];
  let str = String(next[index]);
  if (str.length > 0) {
    next[index] = str.slice(0, -1) || "0";
  }
  return next;
}

export function EqnMenuScreen() {
  return (
    <div className="eqn-menu">
        <div>1: anX+bnY=cn</div>
        <div>2: anX+bnY+cnZ=dn</div>
        <div>3: aX²+bX+c=0</div>
        <div>4: aX³+bX²+cX+d=0</div>
    </div>
  );
}

export function EqnQuadScreen({ coeffs, index }: { coeffs: string[]; index: number }) {
  const labels = ['a', 'b', 'c'];
  return (
    <table className="eqn-table">
      <thead>
        <tr>
          {labels.map((label) => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {coeffs.map((coeff, i) => (
            <td key={labels[i]} className={index === i ? 'active-cell' : ''}>
              <EditorCaret value={coeff} active={index === i} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/** Hardware puts the coefficient being typed at the bottom-left of the LCD. */
export function EqnQuadEntry({ value }: { value: string }) {
  return (
    <div className="decimal-result text-left w-full">
      <EditorCaret value={value} active />
    </div>
  );
}

export function EqnResultLabel({ results, resultIdx }: { results: EqnResult[]; resultIdx: number }) {
  let res = results[resultIdx];
  return <div className="eqn-title">{res?.label}</div>;
}

export function EqnResultValue({ results, resultIdx }: { results: EqnResult[]; resultIdx: number }) {
  let res = results[resultIdx];
  const v = res?.value;
  if (v?.kind === 'complex' && Math.abs(v.im) > 1e-12) {
    return <div className="decimal-result">{formatComplexPair(v.re, v.im)}</div>;
  }
  // Message-only outcomes (no solution) already put the text on the input
  // line via EqnResultLabel — don't also paint a bare "Error".
  const n = v?.kind === 'real' ? v.re : v?.kind === 'complex' ? v.re : NaN;
  if (v === undefined || isNaN(n)) {
    return <div className="decimal-result" />;
  }
  return (
    <div className="decimal-result">
      {formatResultNumber(n)}
    </div>
  );
}
