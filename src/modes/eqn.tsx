import React from 'react';
import { CalcError, calcComplex, calcReal, type CalcMode, type EqnKind, type EqnResult } from '../types.ts';
import { EditorCaret, formatComplexPair, formatResultNumber } from '../display.tsx';

export function eqnCoeffCount(kind: EqnKind): number {
  if (kind === '2unk') return 6;
  if (kind === '3unk') return 12;
  if (kind === 'cubic') return 4;
  return 3;
}

export function eqnColCount(kind: EqnKind): number {
  if (kind === '3unk' || kind === 'cubic') return 4;
  return 3;
}

export function zeroEqnCoeffs(kind: EqnKind): string[] {
  return Array.from({ length: eqnCoeffCount(kind) }, () => '0');
}

export function eqnEditorMode(kind: EqnKind): CalcMode {
  if (kind === '2unk') return 'EQN_2UNK';
  if (kind === '3unk') return 'EQN_3UNK';
  if (kind === 'cubic') return 'EQN_CUBIC';
  return 'EQN_QUAD';
}

export function isEqnCoeffEditor(calcMode: CalcMode): boolean {
  return calcMode === 'EQN_QUAD' || calcMode === 'EQN_CUBIC' ||
    calcMode === 'EQN_2UNK' || calcMode === 'EQN_3UNK';
}

export function eqnMenuSelect(val: string): { kind: EqnKind; label: string } | null {
  if (val === '1') return { kind: '2unk', label: 'EQN 2-unknown' };
  if (val === '2') return { kind: '3unk', label: 'EQN 3-unknown' };
  if (val === '3') return { kind: 'quad', label: 'EQN quadratic' };
  if (val === '4') return { kind: 'cubic', label: 'EQN cubic' };
  return null;
}

export function moveEqnIndex(kind: EqnKind, index: number, dir: 'left' | 'right' | 'up' | 'down'): number {
  const n = eqnCoeffCount(kind);
  const cols = eqnColCount(kind);
  if (dir === 'left') return (index + n - 1) % n;
  if (dir === 'right') return (index + 1) % n;
  if (dir === 'up') return index >= cols ? index - cols : index;
  return index + cols < n ? index + cols : index;
}

function parseCoeff(raw: string): number {
  return parseFloat(raw) || 0;
}

/** No unique solution — same Math ERROR class as quadratic a=0 (R19). */
function noUniqueSolution(det: number, cells: number[]): boolean {
  if (!Number.isFinite(det)) return true;
  const scale = cells.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  return Math.abs(det) <= 1e-12 * Math.max(1, scale);
}

function finiteReals(values: number[]): boolean {
  return values.every(Number.isFinite);
}

function cubicRootValue(re: number, im: number): EqnResult['value'] {
  if (!Number.isFinite(re) || !Number.isFinite(im)) throw new CalcError('math');
  if (Math.abs(im) > 1e-12) return calcComplex(re, im);
  return calcReal(re);
}

/**
 * Depressed cubic t³ + p t + q = 0. Three-real order uses trig k = 1, 0, 2
 * so E-28 Ex.5 (x³−2x²−x+2=0) is X1=−1, X2=2, X3=1.
 */
function depressedCubicRoots(p: number, q: number): { re: number; im: number }[] {
  const p3 = p / 3;
  const q2 = q / 2;
  const disc = q2 * q2 + p3 * p3 * p3;
  const tiny = 1e-16 * Math.max(1, Math.abs(p) ** 3, Math.abs(q) ** 2);

  if (Math.abs(p) <= 1e-15 && Math.abs(q) <= 1e-15) {
    return [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }];
  }

  if (disc > tiny) {
    const sqrtD = Math.sqrt(disc);
    const u = Math.cbrt(-q2 + sqrtD);
    const v = Math.cbrt(-q2 - sqrtD);
    const t0 = u + v;
    const imag = (u - v) * Math.sqrt(3) / 2;
    return [
      { re: t0, im: 0 },
      { re: -t0 / 2, im: imag },
      { re: -t0 / 2, im: -imag },
    ];
  }

  if (disc >= -tiny) {
    const u = Math.cbrt(-q2);
    return [
      { re: 2 * u, im: 0 },
      { re: -u, im: 0 },
      { re: -u, im: 0 },
    ];
  }

  const amp = 2 * Math.sqrt(-p3);
  const denom = Math.sqrt(-p3 * p3 * p3);
  const arg = Math.min(1, Math.max(-1, -q2 / denom));
  const theta = Math.acos(arg);
  return [1, 0, 2].map(k => ({
    re: amp * Math.cos(theta / 3 + (2 * Math.PI * k) / 3),
    im: 0,
  }));
}

/** Hardware cubic needs a≠0. a=0 is Math ERROR, same class as quadratic (R19). */
export function solveCubic(a: number, b: number, c: number, d: number): EqnResult[] {
  if (a === 0) throw new CalcError('math');
  const A = b / a;
  const B = c / a;
  const C = d / a;
  if (![A, B, C].every(Number.isFinite)) throw new CalcError('math');
  const shift = A / 3;
  const p = B - A * A / 3;
  const q = C + (2 * A * A * A - 9 * A * B) / 27;
  const roots = depressedCubicRoots(p, q).map(t => ({ re: t.re - shift, im: t.im }));
  return roots.map((r, i) => ({
    label: `X${i + 1} =`,
    value: cubicRootValue(r.re, r.im),
  }));
}

/** Hardware quadratic needs a≠0. a=0 is Math ERROR, not a line (R19). */
export function solveQuadratic(a: number, b: number, c: number): EqnResult[] {
  if (a === 0) throw new CalcError('math');
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

/** E-28 type 1: anX + bnY = cn. Singular / no unique solution is Math ERROR. */
export function solveLinear2(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number,
): EqnResult[] {
  const cells = [a1, b1, c1, a2, b2, c2];
  const det = a1 * b2 - a2 * b1;
  if (noUniqueSolution(det, cells)) throw new CalcError('math');
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  if (!finiteReals([x, y])) throw new CalcError('math');
  return [
    { label: 'X =', value: calcReal(x) },
    { label: 'Y =', value: calcReal(y) },
  ];
}

function det3(
  a11: number, a12: number, a13: number,
  a21: number, a22: number, a23: number,
  a31: number, a32: number, a33: number,
): number {
  return (
    a11 * (a22 * a33 - a23 * a32)
    - a12 * (a21 * a33 - a23 * a31)
    + a13 * (a21 * a32 - a22 * a31)
  );
}

/** E-28 type 2: anX + bnY + cnZ = dn. Singular / no unique solution is Math ERROR. */
export function solveLinear3(
  a1: number, b1: number, c1: number, d1: number,
  a2: number, b2: number, c2: number, d2: number,
  a3: number, b3: number, c3: number, d3: number,
): EqnResult[] {
  const cells = [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3];
  const det = det3(a1, b1, c1, a2, b2, c2, a3, b3, c3);
  if (noUniqueSolution(det, cells)) throw new CalcError('math');
  const dx = det3(d1, b1, c1, d2, b2, c2, d3, b3, c3);
  const dy = det3(a1, d1, c1, a2, d2, c2, a3, d3, c3);
  const dz = det3(a1, b1, d1, a2, b2, d2, a3, b3, d3);
  const x = dx / det;
  const y = dy / det;
  const z = dz / det;
  if (!finiteReals([x, y, z])) throw new CalcError('math');
  return [
    { label: 'X =', value: calcReal(x) },
    { label: 'Y =', value: calcReal(y) },
    { label: 'Z =', value: calcReal(z) },
  ];
}

export function solveEqn(kind: EqnKind, coeffs: string[]): EqnResult[] {
  const n = coeffs.map(parseCoeff);
  if (kind === '2unk') {
    return solveLinear2(n[0], n[1], n[2], n[3], n[4], n[5]);
  }
  if (kind === '3unk') {
    return solveLinear3(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], n[9], n[10], n[11]);
  }
  if (kind === 'cubic') {
    return solveCubic(n[0], n[1], n[2], n[3]);
  }
  return solveQuadratic(n[0], n[1], n[2]);
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

export function EqnQuadScreen({
  coeffs,
  index,
  labels = ['a', 'b', 'c'],
}: {
  coeffs: string[];
  index: number;
  labels?: string[];
}) {
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

/** Coefficient Editor for anX+bnY=cn / anX+bnY+cnZ=dn. Row numbers + an/bn/cn(/dn). */
export function EqnLinearScreen({
  kind,
  coeffs,
  index,
}: {
  kind: '2unk' | '3unk';
  coeffs: string[];
  index: number;
}) {
  const cols = eqnColCount(kind);
  const rows = kind === '2unk' ? 2 : 3;
  const headers = kind === '2unk' ? ['an', 'bn', 'cn'] : ['an', 'bn', 'cn', 'dn'];
  return (
    <table className={`eqn-table eqn-linear ${kind === '3unk' ? 'eqn-3unk' : ''}`}>
      <thead>
        <tr>
          <th className="eqn-row-h" />
          {headers.map((label) => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            <td className="eqn-row-num">{r + 1}</td>
            {Array.from({ length: cols }, (_, c) => {
              const i = r * cols + c;
              return (
                <td key={headers[c]} className={index === i ? 'active-cell' : ''}>
                  <EditorCaret value={coeffs[i] ?? '0'} active={index === i} />
                </td>
              );
            })}
          </tr>
        ))}
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
