import React from 'react';
import type { EqnResult } from '../types.ts';
import { formatResultNumber } from '../display.tsx';

export function solveQuadratic(a: number, b: number, c: number): EqnResult[] {
  if (a === 0) {
    if (b === 0) return [{ label: "No solution", val: NaN }];
    else return [{ label: "X =", val: -c / b }];
  }
  let disc = b * b - 4 * a * c;
  if (disc < 0) {
    return [{ label: "No real solutions", val: NaN }];
  } else if (disc === 0) {
    return [{ label: "X =", val: -b / (2 * a) }];
  } else {
    return [
      { label: "X1 =", val: (-b + Math.sqrt(disc)) / (2 * a) },
      { label: "X2 =", val: (-b - Math.sqrt(disc)) / (2 * a) }
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
  return (
    <>
      <div className="eqn-title">aX²+bX+c=0</div>
      <table className="eqn-table">
        <tbody>
          <tr>
            <td className={index === 0 ? 'active-cell' : ''}>{coeffs[0]}</td>
            <td className={index === 1 ? 'active-cell' : ''}>{coeffs[1]}</td>
            <td className={index === 2 ? 'active-cell' : ''}>{coeffs[2]}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export function EqnResultLabel({ results, resultIdx }: { results: EqnResult[]; resultIdx: number }) {
  let res = results[resultIdx];
  return <div className="eqn-title">{res?.label}</div>;
}

export function EqnResultValue({ results, resultIdx }: { results: EqnResult[]; resultIdx: number }) {
  let res = results[resultIdx];
  return (
    <div className="decimal-result">
      {res?.val !== undefined && !isNaN(res.val) ? formatResultNumber(res.val) : "Error"}
    </div>
  );
}
