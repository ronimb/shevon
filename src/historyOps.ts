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
