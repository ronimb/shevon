import { useState, useEffect, useCallback, useRef } from 'react';
import { CalcError, calcReal, type AngleMode, type CalcMode, type CalcValue, type DisplayMode, type EqnResult, type HistoryItem, type StatEntry, type StatType, type Vars } from './types.ts';
import { DEFAULT_FORMAT, type DisplayFormat } from './format.ts';
import type { SetupPrompt, SolveScreen } from './lcd.tsx';

const EMPTY_VARS: Vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };

export function useCalculatorState() {
  const [currentInput, setCurrentInput] = useState<string>("‸");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ans, setAns] = useState<number>(() => {
    const saved = localStorage.getItem('calc_ans');
    return saved ? parseFloat(saved) : 0;
  });
  const [vars, setVars] = useState<Vars>(() => {
    try {
      const saved = localStorage.getItem('calc_vars');
      return saved ? JSON.parse(saved) : { ...EMPTY_VARS };
    } catch { return { ...EMPTY_VARS }; }
  });

  useEffect(() => {
    // History is no longer persisted
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calc_ans', ans.toString());
  }, [ans]);

  useEffect(() => {
    localStorage.setItem('calc_vars', JSON.stringify(vars));
  }, [vars]);

  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    const saved = localStorage.getItem('calc_angle_mode');
    return (saved as AngleMode) || 'DEG';
  });

  useEffect(() => {
    localStorage.setItem('calc_angle_mode', angleMode);
  }, [angleMode]);

  const [lastValue, setLastValue] = useState<CalcValue>(() => calcReal(0));
  const [showingResult, setShowingResult] = useState<boolean>(false);
  const [isShift, setIsShiftState] = useState<boolean>(false);
  const isShiftRef = useRef(false);
  const setIsShift = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setIsShiftState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      isShiftRef.current = next;
      return next;
    });
  }, []);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [isSto, setIsSto] = useState<boolean>(false);
  const [isRcl, setIsRcl] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('decimal');
  const [calcMode, setCalcMode] = useState<CalcMode>('COMP');
  const [statType, setStatType] = useState<StatType | null>(null);
  const [statFrequencyEnabled, setStatFrequencyEnabled] = useState<boolean>(() => localStorage.getItem('calc_stat_freq') === '1');
  const [statData, setStatData] = useState<StatEntry[]>([]);
  const [statCursor, setStatCursor] = useState({ row: 0, col: 0 });
  const [statSubMenu, setStatSubMenu] = useState<string | null>(null);
  const [promptVar, setPromptVar] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState<string>("0");
  const [prevPromptValue, setPrevPromptValue] = useState<string>("0");
  const [promptVarsQueue, setPromptVarsQueue] = useState<string[]>([]);
  const [eqnCoeffs, setEqnCoeffs] = useState<string[]>(["0", "0", "0"]);
  const [eqnIndex, setEqnIndex] = useState<number>(0);
  const [eqnResults, setEqnResults] = useState<EqnResult[]>([]);
  const [eqnResultIdx, setEqnResultIdx] = useState<number>(0);
  const solveRef = useRef<() => void>(() => {});
  const [lcdError, setLcdError] = useState<CalcError | null>(null);
  const [solveScreen, setSolveScreen] = useState<SolveScreen>(null);
  const [solveResidual, setSolveResidual] = useState<number>(0);
  const solveAfterPromptsRef = useRef(false);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);

  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>(() => {
    try {
      const saved = localStorage.getItem('calc_display_format');
      return saved ? (JSON.parse(saved) as DisplayFormat) : DEFAULT_FORMAT;
    } catch { return DEFAULT_FORMAT; }
  });
  useEffect(() => {
    localStorage.setItem('calc_display_format', JSON.stringify(displayFormat));
  }, [displayFormat]);

  const [mixedFraction, setMixedFraction] = useState<boolean>(() => localStorage.getItem('calc_mixed_frac') === '1');
  useEffect(() => {
    localStorage.setItem('calc_mixed_frac', mixedFraction ? '1' : '0');
  }, [mixedFraction]);

  useEffect(() => {
    localStorage.setItem('calc_stat_freq', statFrequencyEnabled ? '1' : '0');
  }, [statFrequencyEnabled]);

  const [setupPrompt, setSetupPrompt] = useState<SetupPrompt>(null);
  const [setupPage, setSetupPage] = useState<number>(0);
  const [showHypMenu, setShowHypMenu] = useState<boolean>(false);
  const [engMode, setEngMode] = useState<number | null>(null);
  const [dmsResult, setDmsResult] = useState<boolean>(false);
  const [replayIndex, setReplayIndex] = useState<number>(-1);

  const prependHistory = useCallback((item: Omit<HistoryItem, 'id'>) => {
    setHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      ...item,
    }, ...prev].slice(0, 50));
  }, []);

  const statCursorRef = useRef(statCursor);
  useEffect(() => { statCursorRef.current = statCursor; }, [statCursor]);
  const statTypeRef = useRef(statType);
  useEffect(() => { statTypeRef.current = statType; }, [statType]);
  const calcModeRef = useRef(calcMode);
  useEffect(() => { calcModeRef.current = calcMode; }, [calcMode]);

  return {
    currentInput, setCurrentInput,
    history, setHistory,
    ans, setAns,
    vars, setVars,
    angleMode, setAngleMode,
    lastValue, setLastValue,
    showingResult, setShowingResult,
    isShift, setIsShift,
    isAlpha, setIsAlpha,
    isSto, setIsSto,
    isRcl, setIsRcl,
    displayMode, setDisplayMode,
    calcMode, setCalcMode,
    statType, setStatType,
    statFrequencyEnabled, setStatFrequencyEnabled,
    statData, setStatData,
    statCursor, setStatCursor,
    statSubMenu, setStatSubMenu,
    promptVar, setPromptVar,
    promptValue, setPromptValue,
    prevPromptValue, setPrevPromptValue,
    promptVarsQueue, setPromptVarsQueue,
    eqnCoeffs, setEqnCoeffs,
    eqnIndex, setEqnIndex,
    eqnResults, setEqnResults,
    eqnResultIdx, setEqnResultIdx,
    lcdError, setLcdError,
    solveScreen, setSolveScreen,
    solveResidual, setSolveResidual,
    currentSequence, setCurrentSequence,
    displayFormat, setDisplayFormat,
    mixedFraction, setMixedFraction,
    setupPrompt, setSetupPrompt,
    setupPage, setSetupPage,
    showHypMenu, setShowHypMenu,
    engMode, setEngMode,
    dmsResult, setDmsResult,
    replayIndex, setReplayIndex,
    prependHistory,
    solveRef,
    solveAfterPromptsRef,
    statCursorRef,
    isShiftRef,
    statTypeRef,
    calcModeRef,
  };
}

export type CalculatorStore = ReturnType<typeof useCalculatorState>;
