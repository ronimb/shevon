import React from 'react';
import type { AngleMode, CalcMode, CalcValue, DisplayMode, EqnResult, HistoryItem, StatEntry, StatType, Vars } from './types.ts';
import { pairLabels } from './types.ts';
import { CalcError, calcErrorLabel } from './types.ts';
import { formatMath, formatResultNumber, SciNotation } from './display.tsx';
import { formatEngineering, formatDMS, type DisplayFormat } from './format.ts';
import { toFraction } from './evaluator.ts';
import { moveCompCursorRight } from './modes/comp.ts';
import {
  StatDataScreen,
  StatMenuScreen,
  StatResultScreen,
  StatSubMenuScreen,
} from './modes/stat.tsx';
import {
  EqnMenuScreen,
  EqnQuadEntry,
  EqnQuadScreen,
  EqnResultLabel,
  EqnResultValue,
} from './modes/eqn.tsx';

export type SolveScreen = null | 'confirm' | 'result' | 'continue';
export type SetupPrompt = null | 'fix' | 'sci' | 'norm' | 'freq';

export function isLcdMenu(opts: {
  showHypMenu: boolean;
  solveScreen: SolveScreen;
  calcMode: CalcMode;
}): boolean {
  const { showHypMenu, solveScreen, calcMode } = opts;
  return (
    showHypMenu ||
    solveScreen === 'confirm' || solveScreen === 'continue' ||
    calcMode === 'MENU' || calcMode === 'SETUP' || calcMode === 'CLR_MENU' ||
    calcMode === 'EQN_MENU' || calcMode === 'STAT_MENU' || calcMode === 'STAT_RESULT' ||
    calcMode === 'STAT_RESULT_SUB' || calcMode === 'STAT_DATA'
  );
}

export function lcdIndicators(opts: {
  calcMode: CalcMode;
  showingResult: boolean;
  lcdError: CalcError | null;
  solveScreen: SolveScreen;
  promptVar: string | null;
  isLcdMenu: boolean;
  currentInput: string;
  history: HistoryItem[];
  replayIndex: number;
  eqnResultIdx: number;
  eqnResults: EqnResult[];
}): { canCaretLeft: boolean; canCaretRight: boolean; indicatorUp: boolean; indicatorDown: boolean } {
  const {
    calcMode, showingResult, lcdError, solveScreen, promptVar,
    currentInput, history, replayIndex, eqnResultIdx, eqnResults,
  } = opts;
  const menu = opts.isLcdMenu;
  const compEditing =
    calcMode === 'COMP' && !showingResult && !lcdError && !solveScreen && !promptVar && !menu;
  const caretIdx = currentInput.indexOf('‸');
  const errorArrows = calcMode === 'COMP' && !!lcdError;
  const canCaretLeft = errorArrows || (compEditing && caretIdx > 0);
  const canCaretRight = errorArrows || (compEditing && moveCompCursorRight(currentInput) !== currentInput);
  const canReplayUp =
    calcMode === 'COMP' && history.length > 0 &&
    ((replayIndex < 0 && (showingResult || currentInput === '‸')) ||
      (replayIndex >= 0 && replayIndex < history.length - 1));
  const canReplayDown = calcMode === 'COMP' && replayIndex >= 0;
  return {
    canCaretLeft,
    canCaretRight,
    indicatorUp: (calcMode === 'EQN_RESULT' && eqnResultIdx > 0) || canReplayUp,
    indicatorDown: (calcMode === 'EQN_RESULT' && eqnResultIdx < eqnResults.length - 1) || canReplayDown,
  };
}

export interface LcdProps {
  isShift: boolean;
  isAlpha: boolean;
  isSto: boolean;
  isRcl: boolean;
  vars: Vars;
  statType: StatType | null;
  angleMode: AngleMode;
  displayFormat: DisplayFormat;
  displayMode: DisplayMode;
  mixedFraction: boolean;
  calcMode: CalcMode;
  showingResult: boolean;
  lcdError: CalcError | null;
  solveScreen: SolveScreen;
  solveResidual: number;
  promptVar: string | null;
  promptValue: string;
  prevPromptValue: string;
  currentInput: string;
  ans: number;
  result: CalcValue;
  history: HistoryItem[];
  replayIndex: number;
  eqnCoeffs: string[];
  eqnIndex: number;
  eqnResults: EqnResult[];
  eqnResultIdx: number;
  showHypMenu: boolean;
  setupPrompt: SetupPrompt;
  setupPage: number;
  statFrequencyEnabled: boolean;
  statData: StatEntry[];
  statCursor: { row: number; col: number };
  statSubMenu: string | null;
  engMode: number | null;
  dmsResult: boolean;
}

export function LcdScreen(p: LcdProps) {
  const menu = isLcdMenu({ showHypMenu: p.showHypMenu, solveScreen: p.solveScreen, calcMode: p.calcMode });
  const { canCaretLeft, canCaretRight, indicatorUp, indicatorDown } = lcdIndicators({
    calcMode: p.calcMode,
    showingResult: p.showingResult,
    lcdError: p.lcdError,
    solveScreen: p.solveScreen,
    promptVar: p.promptVar,
    isLcdMenu: menu,
    currentInput: p.currentInput,
    history: p.history,
    replayIndex: p.replayIndex,
    eqnResultIdx: p.eqnResultIdx,
    eqnResults: p.eqnResults,
  });

  const renderInput = () => {
    if (p.solveScreen === 'confirm') {
      return <div className="mode-menu"><div className="mode-item">solve for x</div></div>;
    }
    if (p.solveScreen === 'continue') {
      return <div className="mode-menu"><div className="mode-item">Continue?</div></div>;
    }
    if (p.showHypMenu) {
      return (
        <div className="mode-menu grid grid-cols-3 gap-x-4 gap-y-2 text-[0.95rem]">
          <div className="mode-item"><span className="mode-num mr-1 text-black/40">1:</span>sinh</div>
          <div className="mode-item"><span className="mode-num mr-1 text-black/40">2:</span>cosh</div>
          <div className="mode-item"><span className="mode-num mr-1 text-black/40">3:</span>tanh</div>
          <div className="mode-item"><span className="mode-num mr-1 text-black/40">4:</span>sinh⁻¹</div>
          <div className="mode-item"><span className="mode-num mr-1 text-black/40">5:</span>cosh⁻¹</div>
          <div className="mode-item"><span className="mode-num mr-1 text-black/40">6:</span>tanh⁻¹</div>
        </div>
      );
    }
    if (p.promptVar) {
      return (
        <div className="flex flex-col">
          <div className="text-[0.9rem] opacity-70 mb-1" dangerouslySetInnerHTML={{ __html: formatMath(p.currentInput.replace('‸', '')) }} />
          <div className="flex items-center">
            <span className="mr-2">{p.promptVar}?</span>
          </div>
        </div>
      );
    }
    if (p.calcMode === 'MENU') {
      return (
        <div className="mode-menu grid grid-cols-2 gap-x-4 gap-y-2 text-[0.95rem] flex-1">
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">1:</span>COMP</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">2:</span>CMPLX</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">3:</span>STAT</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">4:</span>BASE-N</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">5:</span>EQN</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">6:</span>MATRIX</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">7:</span>TABLE</div>
            <div className="mode-item"><span className="mode-num mr-1 text-black/40">8:</span>VECTOR</div>
        </div>
      );
    }
    if (p.calcMode === 'STAT_MENU') {
      return <StatMenuScreen />;
    }
    if (p.calcMode === 'STAT_DATA') {
      return (
        <StatDataScreen
          statType={p.statType}
          statFrequencyEnabled={p.statFrequencyEnabled}
          statData={p.statData}
          statCursor={p.statCursor}
        />
      );
    }
    if (p.calcMode === 'STAT_RESULT') {
      return <StatResultScreen statType={p.statType} />;
    }
    if (p.calcMode === 'STAT_RESULT_SUB') {
      return <StatSubMenuScreen statSubMenu={p.statSubMenu} statType={p.statType} />;
    }
    if (p.calcMode === 'SETUP') {
      if (p.setupPrompt === 'freq') {
        return (
          <div className="mode-menu">
            <div className="mode-item col-span-2">STAT</div>
            <div className="mode-item"><span className="mode-num">1:</span>ON</div>
            <div className="mode-item"><span className="mode-num">2:</span>OFF</div>
          </div>
        );
      }
      if (p.setupPrompt) {
        const label = p.setupPrompt === 'fix' ? 'Fix 0~9?' : p.setupPrompt === 'sci' ? 'Sci 0~9?' : 'Norm 1~2?';
        return <div className="mode-menu"><div className="mode-item">{label}</div></div>;
      }
      if (p.setupPage === 1) {
        return (
          <div className="mode-menu">
            <div className="mode-item"><span className="mode-num">1:</span>ab/c</div>
            <div className="mode-item"><span className="mode-num">2:</span>d/c</div>
            <div className="mode-item"><span className="mode-num">3:</span>STAT</div>
            <div className="mode-item col-span-2 text-black/40 text-[0.75rem]">▲ back</div>
          </div>
        );
      }
      return (
        <div className="mode-menu">
            <div className="mode-item"><span className="mode-num">1:</span>MthIO</div>
            <div className="mode-item"><span className="mode-num">2:</span>LineIO</div>
            <div className="mode-item"><span className="mode-num">3:</span>Deg</div>
            <div className="mode-item"><span className="mode-num">4:</span>Rad</div>
            <div className="mode-item"><span className="mode-num">5:</span>Gra</div>
            <div className="mode-item"><span className="mode-num">6:</span>Fix</div>
            <div className="mode-item"><span className="mode-num">7:</span>Sci</div>
            <div className="mode-item"><span className="mode-num">8:</span>Norm</div>
            <div className="mode-item col-span-2 text-black/40 text-[0.75rem]">▼ Disp</div>
        </div>
      );
    }
    if (p.calcMode === 'CLR_MENU') {
      return (
        <div className="mode-menu">
            <div className="mode-item"><span className="mode-num">1:</span>Setup</div>
            <div className="mode-item"><span className="mode-num">2:</span>Memory</div>
            <div className="mode-item"><span className="mode-num">3:</span>All</div>
        </div>
      );
    }
    if (p.calcMode === 'EQN_MENU') {
      return <EqnMenuScreen />;
    }
    if (p.calcMode === 'EQN_QUAD') {
      return <EqnQuadScreen coeffs={p.eqnCoeffs} index={p.eqnIndex} />;
    }
    if (p.calcMode === 'EQN_RESULT') {
      return <EqnResultLabel results={p.eqnResults} resultIdx={p.eqnResultIdx} />;
    }

    if (p.solveScreen === 'result') {
      return <div dangerouslySetInnerHTML={{ __html: formatMath(p.currentInput.replace('‸', '')) }} />;
    }

    return <div dangerouslySetInnerHTML={{ __html: formatMath(p.currentInput) }} />;
  };

  const renderResult = () => {
    if (p.promptVar) {
      return (
        <div className="decimal-result flex flex-col items-end">
          <div className="text-[0.7rem] opacity-50 mb-[-4px]">{p.prevPromptValue}</div>
          <div>{p.promptValue}</div>
        </div>
      );
    }
    if (menu) return null;

    if (p.lcdError) {
      return <div className="decimal-result error">{calcErrorLabel(p.lcdError.kind)}</div>;
    }

    if (p.solveScreen === 'result') {
      return (
        <div className="solve-result">
          <div className="solve-result-row">
            <span>x=</span>
            <span className="solve-val">{formatResultNumber(p.ans, p.displayFormat)}</span>
          </div>
          <div className="solve-result-row">
            <span>L-R=</span>
            <span className="solve-val">{formatResultNumber(p.solveResidual, p.displayFormat)}</span>
          </div>
        </div>
      );
    }

    if (p.calcMode === 'EQN_QUAD') {
      return <EqnQuadEntry value={p.eqnCoeffs[p.eqnIndex]} />;
    }

    if (p.calcMode === 'EQN_RESULT') {
      return <EqnResultValue results={p.eqnResults} resultIdx={p.eqnResultIdx} />;
    }

    if (p.showingResult) {
      if (p.result.kind === 'pair') {
        const [la, lb] = pairLabels(p.result);
        const rec = p.result.pair === 'rec';
        return (
          <div className={`pair-result w-full ${rec ? 'text-right' : 'text-left'}`}>
            <span>{la}=</span>
            {formatResultNumber(p.result.a, p.displayFormat)}
            <span>, {lb}=</span>
            {formatResultNumber(p.result.b, p.displayFormat)}
          </div>
        );
      }
      if (p.engMode !== null) {
        const eng = formatEngineering(p.ans, p.engMode);
        return <div className="decimal-result"><SciNotation mantissa={eng.mantissa} exponent={eng.exponent} /></div>;
      }
      if (p.dmsResult) {
        const { deg, min, sec } = formatDMS(p.ans);
        return (
          <div className="decimal-result">
            {deg}<span className="opacity-70 mx-[1px]">°</span>{min}<span className="opacity-70 mx-[1px]">′</span>{sec}<span className="opacity-70 mx-[1px]">″</span>
          </div>
        );
      }
      if (p.displayMode === 'fraction' && !Number.isInteger(p.ans) && p.displayFormat.kind === 'norm') {
        let f = toFraction(p.ans);
        if (!f || f.d === 1) {
          return <div className="decimal-result">{formatResultNumber(p.ans, p.displayFormat)}</div>;
        }
        if (p.mixedFraction && Math.abs(f.n) > f.d) {
          const sign = f.n < 0 ? -1 : 1;
          const an = Math.abs(f.n);
          const whole = sign * Math.floor(an / f.d);
          const rem = an % f.d;
          return (
            <div className="fraction-result">
              <span className="res-num mr-1">{whole}</span>
              <span className="res-num">{rem}</span>
              <span className="res-den">{f.d}</span>
            </div>
          );
        }
        return (
          <div className="fraction-result">
            <span className="res-num">{formatResultNumber(f.n)}</span>
            <span className="res-den">{formatResultNumber(f.d)}</span>
          </div>
        );
      }
      return <div className="decimal-result">{formatResultNumber(p.ans, p.displayFormat)}</div>;
    }

    return <div className="decimal-result">0</div>;
  };

  return (
    <div
      className="lcd-screen absolute top-[148px] left-[68px] w-[368px] h-[166px] bg-[#94a394] bg-gradient-to-br from-[#a8b8a8] to-[#8e9e8e] px-[14px] pt-[22px] pb-[10px] flex flex-col justify-start font-mono box-border z-[60] rounded-[4px] overflow-hidden shadow-[inset_1px_1px_4px_rgba(0,0,0,0.3)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_0)] after:bg-[length:3.5px_3.5px] after:pointer-events-none after:z-10"
    >
      <div className="status-bar absolute top-0 left-0 right-0 h-5 px-[10px] text-[8px] font-black flex justify-between items-center z-20 pointer-events-none font-sans tracking-[-0.3px] bg-black/5 border-b border-black/10">
        <div className={`status-item ${p.isShift ? 'active' : 'opacity-10'}`}>S</div>
        <div className={`status-item ${p.isAlpha ? 'active' : 'opacity-10'}`}>A</div>
        <div className={`status-item ${p.vars.M !== 0 ? 'active' : 'opacity-10'}`}>M</div>
        <div className={`status-item ${p.isSto ? 'active' : 'opacity-10'}`}>STO</div>
        <div className={`status-item ${p.isRcl ? 'active' : 'opacity-10'}`}>RCL</div>
        <div className={`status-item ${p.statType !== null ? 'active' : 'opacity-10'}`}>STAT</div>
        <div className={`status-item opacity-10`}>CMPLX</div>
        <div className={`status-item opacity-10`}>MAT</div>
        <div className={`status-item opacity-10`}>VCT</div>
        <div className={`status-item ${p.angleMode === 'DEG' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>D</div>
        <div className={`status-item ${p.angleMode === 'RAD' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>R</div>
        <div className={`status-item ${p.angleMode === 'GRA' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>G</div>
        <div className={`status-item ${p.displayFormat.kind === 'fix' ? 'active' : 'opacity-10'}`}>FIX</div>
        <div className={`status-item ${p.displayFormat.kind === 'sci' ? 'active' : 'opacity-10'}`}>SCI</div>
        <div className={`status-item active`}>Math</div>
        <div className={`status-item ${canCaretLeft ? 'active' : 'opacity-10'}`}>◀</div>
        <div className={`status-item ${canCaretRight ? 'active' : 'opacity-10'}`}>▶</div>
        <div className={`status-item ${indicatorUp ? 'active' : 'opacity-10'}`}>▲</div>
        <div className={`status-item ${indicatorDown ? 'active' : 'opacity-10'}`}>▼</div>
        <div className={`status-item opacity-10`}>Disp</div>
      </div>

      <div id="input-text" className={`text-[1.35rem] text-[#111] text-left whitespace-pre-wrap leading-[1.1] break-all pt-1 relative z-[15] tracking-[-0.8px] mt-[2px] pointer-events-none ${
        menu ? 'grow min-h-0 overflow-hidden' : 'min-h-[2.2em]'
      }`}>
        {renderInput()}
      </div>

      <div id="result-text" className={`flex items-end grow text-[#1a1a1a] pb-1 pointer-events-none ${p.calcMode === 'EQN_QUAD' || p.solveScreen === 'result' || (p.showingResult && p.result.kind === 'pair' && p.result.pair === 'pol') ? 'justify-start' : 'justify-end'} ${menu ? 'hidden' : ''}`}>
        {renderResult()}
      </div>
    </div>
  );
}
