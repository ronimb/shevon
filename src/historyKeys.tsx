import React from 'react';

/** Light-gray number-pad keycaps (same 68×46 family as 0–9, +, Ans, =). */
const NUMPAD_GRAY = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '.', '+', '-', '×', '÷', 'Ans', '×10ˣ', '=',
]);
/** Same 68×46 rect as digits; smaller legend only. */
const NUMPAD_LEGEND = new Set(['Ans', '×10ˣ']);

export type ChipFamily =
  | 'numpad'
  | 'del'
  | 'ac'
  | 'sci'
  | 'shift'
  | 'alpha'
  | 'mode'
  | 'nav-up'
  | 'nav-down'
  | 'nav-left'
  | 'nav-right';

/** Faceplate family for one History / Current-keys chip. */
export function chipFamily(label: string): ChipFamily {
  if (label === 'SHIFT') return 'shift';
  if (label === 'ALPHA') return 'alpha';
  if (label === 'UP' || label === '↑') return 'nav-up';
  if (label === 'DOWN' || label === '↓') return 'nav-down';
  if (label === 'LEFT' || label === '←') return 'nav-left';
  if (label === 'RIGHT' || label === '→') return 'nav-right';
  if (label === 'MODE') return 'mode';
  if (label === 'AC') return 'ac';
  if (label === 'DEL') return 'del';
  if (NUMPAD_GRAY.has(label) || /^\d$/.test(label)) return 'numpad';
  return 'sci';
}

function miniClass(label: string): string {
  switch (chipFamily(label)) {
    case 'shift': return 'mini-btn shift shape-shift';
    case 'alpha': return 'mini-btn alpha shape-alpha';
    case 'nav-up': return 'mini-btn chrome shape-up';
    case 'nav-down': return 'mini-btn chrome shape-down';
    case 'nav-left': return 'mini-btn chrome shape-left';
    case 'nav-right': return 'mini-btn chrome shape-right';
    case 'mode': return 'mini-btn chrome shape-mode';
    case 'ac': return 'mini-btn ac shape-numpad legend';
    case 'del': return 'mini-btn del shape-numpad legend';
    case 'numpad':
      return `mini-btn num shape-numpad${NUMPAD_LEGEND.has(label) ? ' legend' : ''}`;
    default:
      return 'mini-btn shape-sci';
  }
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  UP: <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  DOWN: <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  LEFT: <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  RIGHT: <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

/** Faceplate-style chip for one History / live-sequence key. */
export function renderMiniButton(label: string, id: string | number): React.ReactNode {
  const cls = miniClass(label);

  if (label === 'log_box' || label === 'LOG') {
    return (
      <span className={cls} key={id}>
        log<span className="mini-box ml-0.5" />
      </span>
    );
  }
  if (label === 'log') {
    return <span className={cls} key={id}>log</span>;
  }
  if (label === 'ln' || label.toLowerCase() === 'ln') {
    return <span className={cls} key={id}>ln</span>;
  }
  if (label === 'sin' || label === 'SIN') return <span className={cls} key={id}>sin</span>;
  if (label === 'cos' || label === 'COS') return <span className={cls} key={id}>cos</span>;
  if (label === 'tan' || label === 'TAN') return <span className={cls} key={id}>tan</span>;
  if (label === 'hyp' || label === 'HYP') return <span className={cls} key={id}>hyp</span>;
  if (label === 'CALC' || label === 'calc') return <span className={cls} key={id}>CALC</span>;

  if (label === '√') {
    return <span className={cls} key={id}>√</span>;
  }
  if (label === '∫') {
    return <span className={cls} key={id}><span className="text-[13px] font-serif">∫</span></span>;
  }
  if (label === 'frac' || label === 'ab/c') {
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
    // Physical: x², SHIFT+x² → x³, x^□, x⁻¹. x³ still paints as x² because
    // the sequence emits SHIFT then the x² key.
    const sup = label === 'x²' ? '2' : label === 'x-1' ? '−1' : <span className="mini-box" />;
    return (
      <span className={cls} key={id}>
        <span className="mini-x-power">
          x<span className="mini-sup">{sup}</span>
        </span>
      </span>
    );
  }
  if (label === '×10ˣ') {
    return <span className={cls} key={id}>×10ˣ</span>;
  }
  if (label === 'S⇔D') {
    return <span className={cls} key={id}>S⇔D</span>;
  }
  if (label === '°\'"' || label === '°′″') {
    return <span className={cls} key={id}>°′″</span>;
  }
  if (label === '(-)') {
    return <span className={cls} key={id}>(-)</span>;
  }
  if (label === 'd/dx') {
    // Only used if a raw token leaks; reconstruct emits SHIFT + ∫.
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
  if (label === 'Σ') {
    return <span className={cls} key={id}>Σ</span>;
  }

  return (
    <span className={cls} key={id}>
      {NAV_ICONS[label] || label}
    </span>
  );
}
