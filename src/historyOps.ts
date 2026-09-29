import type { CalcErrorKind, CalcMode, HistoryItem } from './types.ts';
import { reconstructSequence, STO_LETTER_KEY } from './modes/comp.ts';

export const MODE_LABEL: Record<string, string> = {
  '1': 'COMP',
  '2': 'CMPLX',
  '3': 'STAT',
  '4': 'BASE-N',
  '5': 'EQN',
  '6': 'MATRIX',
  '7': 'TABLE',
  '8': 'VECTOR',
};

export type LiveOpState = {
  calcMode: CalcMode;
  setupPage: number;
  setupPrompt: null | 'fix' | 'sci' | 'norm' | 'freq';
  isSto: boolean;
  isRcl: boolean;
  currentInput: string;
  isShift?: boolean;
  solveScreen?: null | 'confirm' | 'result' | 'continue';
  lcdErrorKind?: CalcErrorKind | null;
};

/** Final physical-key recipe for whatever operation is in progress. */
export function liveOperationSequence(s: LiveOpState): string[] {
  switch (s.calcMode) {
    case 'MENU':
      return ['MODE'];
    case 'SETUP': {
      if (s.setupPrompt === 'freq') return ['SHIFT', 'MODE', 'DOWN', '3'];
      const seq = ['SHIFT', 'MODE'];
      if (s.setupPage === 1) seq.push('DOWN');
      if (s.setupPrompt === 'fix') seq.push('6');
      else if (s.setupPrompt === 'sci') seq.push('7');
      else if (s.setupPrompt === 'norm') seq.push('8');
      return seq;
    }
    case 'CLR_MENU':
      return ['SHIFT', '9'];
    case 'EQN_MENU':
      return ['MODE', '5'];
    case 'STAT_MENU':
      return ['MODE', '3'];
    case 'STAT_EDITOR_MENU':
      return ['SHIFT', '1'];
    case 'STAT_EDIT':
      return ['SHIFT', '1', '3'];
    default:
      break;
  }

  const raw = s.currentInput.replace(/[‸⬚]/g, '');
  const seq = raw ? reconstructSequence(raw) : [];
  if (s.isSto && !raw.includes('→')) seq.push('SHIFT', 'RCL');
  else if (s.isRcl) seq.push('RCL');
  else if (
    s.solveScreen ||
    s.lcdErrorKind === 'variable' ||
    s.lcdErrorKind === 'cantSolve'
  ) {
    seq.push('SHIFT', 'CALC');
  } else if (s.isShift) {
    seq.push('SHIFT');
  }
  return seq;
}

export function setupCommitSequence(
  kind: 'deg' | 'rad' | 'gra' | 'fix' | 'sci' | 'norm' | 'mix' | 'improper' | 'freq',
  digit?: string,
): string[] {
  switch (kind) {
    case 'deg': return ['SHIFT', 'MODE', '3'];
    case 'rad': return ['SHIFT', 'MODE', '4'];
    case 'gra': return ['SHIFT', 'MODE', '5'];
    case 'fix': return ['SHIFT', 'MODE', '6', digit ?? ''];
    case 'sci': return ['SHIFT', 'MODE', '7', digit ?? ''];
    case 'norm': return ['SHIFT', 'MODE', '8', digit ?? ''];
    case 'mix': return ['SHIFT', 'MODE', 'DOWN', '1'];
    case 'improper': return ['SHIFT', 'MODE', 'DOWN', '2'];
    case 'freq': return ['SHIFT', 'MODE', 'DOWN', '3', digit ?? ''];
  }
}

export { STO_LETTER_KEY };

/** LCD ▲/▼ replay only walks calculations and stores, not mode/setup actions. */
export function isReplayableHistory(item: HistoryItem): boolean {
  return item.kind === 'calc' || (item.result !== null && item.rawInput.includes('→'));
}

function nextReplayableFrom(history: HistoryItem[], start: number): number {
  let idx = start;
  while (idx < history.length && !isReplayableHistory(history[idx])) idx++;
  return idx < history.length ? idx : -1;
}

function prevReplayableFrom(history: HistoryItem[], start: number): number {
  let idx = start;
  while (idx >= 0 && !isReplayableHistory(history[idx])) idx--;
  return idx;
}

/**
 * ▲ after the latest `=` must skip the line already on screen (history[0]).
 * From a blank AC line, first ▲ loads the latest. (R31)
 */
export function nextHistoryReplayUp(
  history: HistoryItem[],
  replayIndex: number,
  showingResult: boolean,
  currentInput: string,
): number | null {
  if (history.length === 0) return null;
  let start: number;
  if (replayIndex < 0) {
    const blankLive = currentInput === '‸';
    if (!showingResult && !blankLive) return null;
    const latest = nextReplayableFrom(history, 0);
    if (latest < 0) return null;
    if (showingResult) {
      const onScreen = currentInput.replace(/[‸⬚]/g, '');
      if (history[latest].rawInput === onScreen) {
        start = latest + 1;
      } else {
        start = latest;
      }
    } else {
      start = latest;
    }
  } else {
    start = replayIndex + 1;
  }
  const idx = nextReplayableFrom(history, start);
  return idx < 0 ? null : idx;
}

/** ▼ toward newer history; `-1` exits replay to a blank COMP line. (R31) */
export function nextHistoryReplayDown(
  history: HistoryItem[],
  replayIndex: number,
): number | null {
  if (replayIndex < 0) return null;
  const idx = prevReplayableFrom(history, replayIndex - 1);
  return idx; // may be -1 = exit
}

/** Whether ▲ can move to an older replayable line from the current view. */
export function canHistoryReplayUp(
  history: HistoryItem[],
  replayIndex: number,
  showingResult: boolean,
  currentInput: string,
): boolean {
  return nextHistoryReplayUp(history, replayIndex, showingResult, currentInput) !== null;
}
