import { useCallback, useEffect, useRef, type RefObject } from 'react';

export function useKeyFlash(keysRootRef: RefObject<HTMLElement | null>) {
  const flashTimers = useRef<Map<string, number>>(new Map());

  const flashKey = useCallback((id: string, persist = false) => {
    const el = keysRootRef.current?.querySelector(`[data-key="${CSS.escape(id)}"]`);
    if (!(el instanceof HTMLElement)) return;
    const existing = flashTimers.current.get(id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
      flashTimers.current.delete(id);
    }
    el.classList.add('key-flash');
    if (persist) return;
    const t = window.setTimeout(() => {
      el.classList.remove('key-flash');
      flashTimers.current.delete(id);
    }, 140);
    flashTimers.current.set(id, t);
  }, [keysRootRef]);

  const unflashKey = useCallback((id: string) => {
    const existing = flashTimers.current.get(id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
      flashTimers.current.delete(id);
    }
    const el = keysRootRef.current?.querySelector(`[data-key="${CSS.escape(id)}"]`);
    if (el instanceof HTMLElement) el.classList.remove('key-flash');
  }, [keysRootRef]);

  useEffect(() => () => {
    flashTimers.current.forEach(t => window.clearTimeout(t));
    flashTimers.current.clear();
  }, []);

  return { flashKey, unflashKey };
}

export type PcKeyboardActions = {
  setShiftMomentary: (val: boolean) => void;
  setAlphaMomentary: (val: boolean) => void;
  setCurrentSequence: (fn: (prev: string[]) => string[]) => void;
  clearAll: () => void;
  del: () => void;
  solve: () => void;
  handleRight: () => void;
  handleLeft: () => void;
  handleUp: () => void;
  handleDown: () => void;
  handleInput: (val: string) => void;
  handleCalc: () => void;
  handleParentheses: (type: string, v: string, forceNormal?: boolean) => void;
  handleTrig: (type: string, v: string) => void;
  handleLog10Key: () => void;
  handleDotKey: () => void;
  handleSubKey: () => void;
  handleDivKey: () => void;
  handleDigit0: () => void;
  handleDigit1: () => void;
  handleDigit9: () => void;
  handleSquareRootKey: () => void;
  handleSquareKey: () => void;
  handlePowerKey: (arg?: unknown) => void;
  handleAlphaVar: (v: string) => void;
  flashKey: (id: string, persist?: boolean) => void;
  unflashKey: (id: string) => void;
  isShift: boolean;
  isAlpha: boolean;
  isSto: boolean;
  isRcl: boolean;
};

export function usePcKeyboard(a: PcKeyboardActions) {
  const aRef = useRef(a);
  aRef.current = a;

  useEffect(() => {
    const record = (l: string) => aRef.current.setCurrentSequence(prev => [...prev, l]);
    const recordShortcut = (keys: string[]) => {
      aRef.current.setCurrentSequence(prev => {
        const next = [...prev];
        for (const k of keys) {
          if ((k === 'ALPHA' || k === 'SHIFT') && next[next.length - 1] === k) continue;
          next.push(k);
        }
        return next;
      });
    };
    const press = (id: string, run: () => void, label?: string) => {
      aRef.current.flashKey(id);
      if (label) record(label);
      run();
    };
    const pressVar = (v: 'X' | 'Y', flashId: string) => {
      const cur = aRef.current;
      cur.flashKey(flashId);
      recordShortcut(['ALPHA', v === 'X' ? ')' : 'S⇔D']);
      if (cur.isSto || cur.isRcl || cur.isAlpha) cur.handleAlphaVar(v);
      else cur.handleInput(v);
    };
    const pressEquals = () => {
      const cur = aRef.current;
      cur.flashKey('calc');
      if (cur.isAlpha) {
        record('CALC');
        cur.handleCalc();
      } else {
        recordShortcut(['ALPHA', 'CALC']);
        cur.handleInput('=');
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const cur = aRef.current;
      if (e.key === 'Shift') {
        e.preventDefault();
        cur.flashKey('shift', true);
        if (!cur.isShift) {
          record('SHIFT');
          cur.setShiftMomentary(true);
        }
        return;
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        cur.flashKey('alpha', true);
        if (!cur.isAlpha) {
          record('ALPHA');
          cur.setAlphaMomentary(true);
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) return;

      if (e.key === 'Escape' || e.key === 'Delete') { e.preventDefault(); press('ac', cur.clearAll, 'AC'); }
      else if (e.key === 'Backspace') { e.preventDefault(); press('del', cur.del, 'DEL'); }
      else if (e.key === 'Enter') { e.preventDefault(); press('solve', cur.solve, '='); }
      else if (e.key === '=' && !e.shiftKey) { e.preventDefault(); pressEquals(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); press('right', cur.handleRight, '→'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); press('left', cur.handleLeft, '←'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); press('up', cur.handleUp, '↑'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); press('down', cur.handleDown, '↓'); }

      else if (e.key === '0' && !e.shiftKey) { e.preventDefault(); press('0', cur.handleDigit0, '0'); }
      else if (e.key === '1' && !e.shiftKey) { e.preventDefault(); press('1', cur.handleDigit1, '1'); }
      else if (e.key === '9' && !e.shiftKey) { e.preventDefault(); press('9', cur.handleDigit9, '9'); }
      else if (/^[2-8]$/.test(e.key) && !e.shiftKey) { e.preventDefault(); press(e.key, () => cur.handleInput(e.key), e.key); }
      else if (e.key === '.') { e.preventDefault(); press('dot', cur.handleDotKey, '.'); }
      else if (e.key === '+') { e.preventDefault(); press('add', () => cur.handleInput('+'), '+'); }
      else if (e.key === '-') { e.preventDefault(); press('sub', cur.handleSubKey, '-'); }
      else if (e.key === '*') { e.preventDefault(); press('mul', () => cur.handleInput('×'), '×'); }
      else if (e.key === '/') { e.preventDefault(); press('div', cur.handleDivKey, '÷'); }
      else if (e.key === '(') { e.preventDefault(); press('paren-open', () => cur.handleParentheses('(', 'X', true), '('); }
      else if (e.key === ')') { e.preventDefault(); press('paren-close', () => cur.handleParentheses(')', 'Y', true), ')'); }
      else if (e.key === '^' || (e.key === '6' && e.shiftKey)) {
        e.preventDefault();
        press('pwr', () => cur.handlePowerKey(true), 'xⁿ');
      }

      else if (e.key.toLowerCase() === 'x') { e.preventDefault(); pressVar('X', 'paren-close'); }
      else if (e.key.toLowerCase() === 'y') { e.preventDefault(); pressVar('Y', 'sd'); }
      else if (e.key.toLowerCase() === 's') { e.preventDefault(); press('sd', () => cur.handleAlphaVar('Y'), 'S⇔D'); }
      else if (e.key.toLowerCase() === 'c') { e.preventDefault(); press('cos', () => cur.handleTrig('cos', 'E'), 'cos'); }
      else if (e.key.toLowerCase() === 't') { e.preventDefault(); press('tan', () => cur.handleTrig('tan', 'F'), 'tan'); }
      else if (e.key.toLowerCase() === 'l') { e.preventDefault(); press('log10', cur.handleLog10Key, 'log'); }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); press('sqrt', cur.handleSquareRootKey, '√'); }
      else if (e.key.toLowerCase() === 'q') { e.preventDefault(); press('sqr', cur.handleSquareKey, 'x²'); }
      else if (e.key.toLowerCase() === 'a') { e.preventDefault(); press('ans', () => cur.handleInput('Ans'), 'Ans'); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const cur = aRef.current;
      if (e.key === 'Shift') {
        e.preventDefault();
        cur.unflashKey('shift');
        cur.setShiftMomentary(false);
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        cur.unflashKey('alpha');
        cur.setAlphaMomentary(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}
