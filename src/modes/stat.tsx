import React from 'react';
import type { StatEntry, StatType, Vars } from '../types.ts';
import { renderMathSymbol } from '../display.tsx';

export const calculateStatVars = (statType: StatType | null, statData: StatEntry[]): Vars => {
    const s: Vars = {
      'type': statType || '',
      'N': 0,
      'R': NaN,
      'A': NaN,
      'B': NaN,
      'C': NaN,
      'stat_sigx': 0,
      'stat_sigx2': 0,
      'stat_sigx3': 0,
      'stat_sigx4': 0,
      'stat_xbar': NaN,
      'stat_sigmax': NaN,
      'stat_sx': NaN,
      'stat_minx': NaN,
      'stat_maxx': NaN,
      'stat_sigy': 0,
      'stat_sigy2': 0,
      'stat_sigxy': 0,
      'stat_sigx2y': 0,
      'stat_ybar': NaN,
      'stat_sigmay': NaN,
      'stat_sy': NaN,
      'stat_miny': NaN,
      'stat_maxy': NaN,
    };
    if (!statType) return s;

    let n = 0, sumX = 0, sumX2 = 0, sumY = 0, sumY2 = 0, sumXY = 0;
    let sumX3 = 0, sumX4 = 0, sumX2Y = 0;
    const isTwoVar = statType !== '1-VAR';
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    statData.forEach(d => {
      const f = parseFloat(d.freq) || 0;
      if (f <= 0) return;
      if (d.x === '' && (!isTwoVar || d.y === '')) return;
      const x = parseFloat(d.x) || 0;
      const y = parseFloat(d.y) || 0;
      
      n += f;
      sumX += x * f;
      sumX2 += x * x * f;
      sumX3 += x * x * x * f;
      sumX4 += x * x * x * x * f;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);

      if (isTwoVar) {
        sumY += y * f;
        sumY2 += y * y * f;
        sumXY += x * y * f;
        sumX2Y += x * x * y * f;
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });

    if (n > 0) {
      s['type'] = statType;
      s['N'] = n;
      s['stat_sigx'] = sumX;
      s['stat_sigx2'] = sumX2;
      s['stat_sigx3'] = sumX3;
      s['stat_sigx4'] = sumX4;
      s['stat_xbar'] = sumX / n;
      s['stat_sigmax'] = Math.sqrt(Math.max(0, (sumX2 / n) - (sumX / n) ** 2));
      s['stat_sx'] = n > 1 ? Math.sqrt(Math.max(0, (sumX2 - (sumX ** 2) / n) / (n - 1))) : NaN;
      s['stat_minx'] = minX;
      s['stat_maxx'] = maxX;

      if (isTwoVar) {
        s['stat_sigy'] = sumY;
        s['stat_sigy2'] = sumY2;
        s['stat_sigxy'] = sumXY;
        s['stat_sigx2y'] = sumX2Y;
        s['stat_ybar'] = sumY / n;
        s['stat_sigmay'] = Math.sqrt(Math.max(0, (sumY2 / n) - (sumY / n) ** 2));
        s['stat_sy'] = n > 1 ? Math.sqrt(Math.max(0, (sumY2 - (sumY ** 2) / n) / (n - 1))) : NaN;
        s['stat_miny'] = minY;
        s['stat_maxy'] = maxY;

        if (statType === '_+CX2') {
          // Quadratic regression: Y = A + BX + CX^2
          const m11 = n, m12 = sumX, m13 = sumX2;
          const m21 = sumX, m22 = sumX2, m23 = sumX3;
          const m31 = sumX2, m32 = sumX3, m33 = sumX4;
          const y1 = sumY, y2 = sumXY, y3 = sumX2Y;

          const detM = m11 * (m22 * m33 - m23 * m32) - m12 * (m21 * m33 - m23 * m31) + m13 * (m21 * m32 - m22 * m31);
          if (detM !== 0) {
            const detA = y1 * (m22 * m33 - m23 * m32) - m12 * (y2 * m33 - m23 * y3) + m13 * (y2 * m32 - m22 * y3);
            const detB = m11 * (y2 * m33 - m23 * y3) - y1 * (m21 * m33 - m23 * m31) + m13 * (m21 * y3 - y2 * m31);
            const detC = m11 * (m22 * y3 - y2 * m32) - m12 * (m21 * y3 - y2 * m31) + y1 * (m21 * m32 - m22 * m31);
            s['A'] = detA / detM;
            s['B'] = detB / detM;
            s['C'] = detC / detM;
          } else {
            s['A'] = 0; s['B'] = 0; s['C'] = 0;
          }
        } else {
          // Other regressions modeled via linear transformations
          let nFit = 0, fitX = 0, fitX2 = 0, fitY = 0, fitY2 = 0, fitXY = 0;

          statData.forEach(d => {
            const f = parseFloat(d.freq) || 0;
            if (f <= 0) return;
            if (d.x === '' && (!isTwoVar || d.y === '')) return;
            let xi = parseFloat(d.x) || 0;
            let yi = parseFloat(d.y) || 0;

            if (statType === 'ln X') {
              if (xi <= 0) return;
              xi = Math.log(xi);
            } else if (statType === 'e^X' || statType === 'A*B^X') {
              if (yi <= 0) return;
              yi = Math.log(yi);
            } else if (statType === 'A*X^B') {
              if (xi <= 0 || yi <= 0) return;
              xi = Math.log(xi);
              yi = Math.log(yi);
            } else if (statType === '1/X') {
              if (xi === 0) return;
              xi = 1 / xi;
            }

            nFit += f;
            fitX += xi * f;
            fitX2 += xi * xi * f;
            fitY += yi * f;
            fitY2 += yi * yi * f;
            fitXY += xi * yi * f;
          });

          if (nFit > 0) {
            const termX = Math.max(0, nFit * fitX2 - fitX ** 2);
            const termY = Math.max(0, nFit * fitY2 - fitY ** 2);
            const bDenom = (nFit * fitX2 - fitX ** 2);
            const b = bDenom !== 0 ? (nFit * fitXY - fitX * fitY) / bDenom : 0;
            const a = (fitY - b * fitX) / nFit;
            
            const rDenom = Math.sqrt(termX * termY);
            const r = rDenom > 1e-15 ? Math.max(-1, Math.min(1, (nFit * fitXY - fitX * fitY) / rDenom)) : 0;

            if (statType === 'e^X') {
              s['A'] = Math.exp(a);
              s['B'] = b;
            } else if (statType === 'A*B^X') {
              s['A'] = Math.exp(a);
              s['B'] = Math.exp(b);
            } else if (statType === 'A*X^B') {
              s['A'] = Math.exp(a);
              s['B'] = b;
            } else {
              s['A'] = a;
              s['B'] = b;
            }
            s['R'] = r;
          } else {
            s['A'] = 0; s['B'] = 0; s['R'] = 0;
          }
        }
        s['xHat'] = 0; // Handled in __xhat
        s['yHat'] = 0; // Handled in __yhat
      }
    }
    if (isNaN(s['A'])) delete s['A'];
    if (isNaN(s['B'])) delete s['B'];
    if (isNaN(s['C'])) delete s['C'];
    if (isNaN(s['R'])) delete s['R'];
    return s;
};


export const STAT_TYPES: Record<string, StatType> = {
  '1': '1-VAR', '2': 'A+BX', '3': '_+CX2', '4': 'ln X',
  '5': 'e^X', '6': 'A*B^X', '7': 'A*X^B', '8': '1/X'
};

export const STAT_RESULT_TOP_OPTIONS: Record<string, string> = {
  '1': 'Type', '2': 'Data', '3': 'Sum', '4': 'Var', '5': 'Dist', '6': 'MinMax', '7': 'Reg'
};

export function getStatField(statType: StatType | null, statFrequencyEnabled: boolean, col: number): keyof StatEntry {
  const isTwoVar = statType !== '1-VAR';
  let field: keyof StatEntry = 'x';
  if (col === 1) {
    if (isTwoVar) field = 'y';
    else if (statFrequencyEnabled) field = 'freq';
  } else if (col === 2 && isTwoVar && statFrequencyEnabled) {
    field = 'freq';
  }
  return field;
}

export function applyStatDigit(
  data: StatEntry[],
  row: number,
  col: number,
  statType: StatType | null,
  statFrequencyEnabled: boolean,
  val: string,
): StatEntry[] | undefined {
  if (isNaN(Number(val)) && val !== '.' && val !== '-') return undefined;
  const next = [...data];
  if (row < 0 || row >= next.length) return undefined;
  const entry = { ...next[row] };
  const field = getStatField(statType, statFrequencyEnabled, col);
  let currentStr = String(entry[field] || "0");
  if (currentStr === "0" && val !== '.') currentStr = "";
  if (val === '-' && currentStr.startsWith('-')) return data;
  entry[field] = currentStr + val;
  next[row] = entry;
  return next;
}

export function applyStatDelete(
  data: StatEntry[],
  row: number,
  col: number,
  statType: StatType | null,
  statFrequencyEnabled: boolean,
): StatEntry[] {
  const next = [...data];
  const entry = { ...next[row] };
  const field = getStatField(statType, statFrequencyEnabled, col);
  let str = String(entry[field]);
  if (str.length > 0) {
    entry[field] = str.slice(0, -1) || "0";
  }
  next[row] = entry;
  return next;
}

export function getStatSubMenuInsert(statSubMenu: string | null, statType: StatType | null, val: string): string | null {
  const isTwoVar = statType !== '1-VAR';
  if (statSubMenu === 'Sum') {
    const options: Record<string, string> = isTwoVar
      ? { '1': 'Σx²', '2': 'Σx', '3': 'Σy²', '4': 'Σy', '5': 'Σxy', '6': 'Σx³', '7': 'Σx²y', '8': 'Σx⁴' }
      : { '1': 'Σx²', '2': 'Σx' };
    return options[val] || null;
  }
  if (statSubMenu === 'Var') {
    const options: Record<string, string> = isTwoVar
      ? { '1': 'n', '2': 'x̄', '3': 'σx', '4': 'sx', '5': 'ȳ', '6': 'σy', '7': 'sy' }
      : { '1': 'n', '2': 'x̄', '3': 'σx', '4': 'sx' };
    return options[val] || null;
  }
  if (statSubMenu === 'MinMax') {
    const options: Record<string, string> = isTwoVar
      ? { '1': 'minX', '2': 'maxX', '3': 'minY', '4': 'maxY' }
      : { '1': 'minX', '2': 'maxX' };
    return options[val] || null;
  }
  if (statSubMenu === 'Reg' && isTwoVar) {
    const options: Record<string, string> = statType === '_+CX2'
      ? { '1': 'A', '2': 'B', '3': 'C', '4': 'x̂1', '5': 'x̂2', '6': 'ŷ' }
      : { '1': 'A', '2': 'B', '3': 'r', '4': 'x̂', '5': 'ŷ' };
    return options[val] || null;
  }
  return null;
}

export function getStatSubMenuOptions(statSubMenu: string | null, statType: StatType | null): string[] {
  const isTwoVar = statType !== '1-VAR';
  if (statSubMenu === 'Sum') return isTwoVar ? ['Σx²', 'Σx', 'Σy²', 'Σy', 'Σxy', 'Σx³', 'Σx²y', 'Σx⁴'] : ['Σx²', 'Σx'];
  if (statSubMenu === 'Var') return isTwoVar ? ['n', 'x̄', 'σx', 'sx', 'ȳ', 'σy', 'sy'] : ['n', 'x̄', 'σx', 'sx'];
  if (statSubMenu === 'MinMax') return isTwoVar ? ['minX', 'maxX', 'minY', 'maxY'] : ['minX', 'maxX'];
  if (statSubMenu === 'Reg') {
    return statType === '_+CX2' ? ['A', 'B', 'C', 'x̂1', 'x̂2', 'ŷ'] : ['A', 'B', 'r', 'x̂', 'ŷ'];
  }
  return [];
}

export function StatMenuScreen() {
  return (
    <div className="stat-menu grid grid-cols-2 gap-x-2 gap-y-1 text-[0.9rem] flex-1">
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">1:</span>1-VAR</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">2:</span>A+BX</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">3:</span>_+CX²</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">4:</span>ln X</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">5:</span>e^X</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">6:</span>A·B^X</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">7:</span>A·X^B</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">8:</span>1/X</div>
    </div>
  );
}

export function StatDataScreen({
  statType,
  statFrequencyEnabled,
  statData,
  statCursor,
}: {
  statType: StatType | null;
  statFrequencyEnabled: boolean;
  statData: StatEntry[];
  statCursor: { row: number; col: number };
}) {
  const isTwoVar = statType !== '1-VAR';
  const gridCols = isTwoVar
    ? `40px 1fr 1fr ${statFrequencyEnabled ? '1fr' : ''}`
    : `40px 80px ${statFrequencyEnabled ? '1fr' : ''}`;

  return (
    <div className="stat-data w-full h-[140px] overflow-hidden flex flex-col font-mono text-[0.9rem] bg-black/5 rounded">
      <div className="grid border-b border-black/20 font-bold bg-black/10" style={{ gridTemplateColumns: gridCols }}>
        <div className="px-1 border-r border-black/10 text-center"></div>
        <div className="px-1 border-r border-black/10 text-center">X</div>
        {isTwoVar && <div className="px-1 border-r border-black/10 text-center">Y</div>}
        {statFrequencyEnabled && <div className="px-1 text-center">FREQ</div>}
      </div>
      <div className="flex-1 overflow-y-auto">
        {statData.map((entry, idx) => (
          <div key={idx} className="grid border-b border-black/5" style={{ gridTemplateColumns: gridCols }}>
            <div className="px-1 border-r border-black/10 text-center bg-black/5">{idx + 1}</div>
            <div className={`px-1 border-r border-black/10 text-right ${statCursor.row === idx && statCursor.col === 0 ? 'bg-black/20 outline outline-1 outline-black/30' : ''}`}>{entry.x === '' ? '0' : entry.x}</div>
            {isTwoVar && <div className={`px-1 border-r border-black/10 text-right ${statCursor.row === idx && statCursor.col === 1 ? 'bg-black/20 outline outline-1 outline-black/30' : ''}`}>{entry.y === '' ? '0' : entry.y}</div>}
            {statFrequencyEnabled && <div className={`px-1 text-right ${statCursor.row === idx && (isTwoVar ? statCursor.col === 2 : statCursor.col === 1) ? 'bg-black/20 outline outline-1 outline-black/30' : ''}`}>{entry.freq}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatResultScreen({ statType }: { statType: StatType | null }) {
  return (
    <div className="stat-result-menu grid grid-cols-2 gap-x-4 gap-y-2 text-[0.95rem] flex-1">
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">1:</span>Type</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">2:</span>Data</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">3:</span>Sum</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">4:</span>Var</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">5:</span>Dist</div>
        <div className="mode-item"><span className="mode-num mr-1 opacity-50">6:</span>MinMax</div>
        {statType !== '1-VAR' && <div className="mode-item"><span className="mode-num mr-1 opacity-50">7:</span>Reg</div>}
    </div>
  );
}

export function StatSubMenuScreen({
  statSubMenu,
  statType,
}: {
  statSubMenu: string | null;
  statType: StatType | null;
}) {
  const options = getStatSubMenuOptions(statSubMenu, statType);
  return (
    <div className="stat-submenu grid grid-cols-2 gap-x-4 gap-y-2 text-[0.85rem] flex-1">
      {options.map((opt, i) => (
        <div key={i} className="mode-item"><span className="mode-num mr-1 opacity-50">{i + 1}:</span>{renderMathSymbol(opt)}</div>
      ))}
    </div>
  );
}
