import React, { useState, useEffect, useCallback, useRef } from 'react';
import calculatorImg from './calculator_new.png';
import type { CalcMode, DisplayMode, AngleMode, StatType, StatEntry, EqnResult, KeyStyle, HistoryItem, Vars } from './types.ts';
import { INITIAL_KEY_STYLES } from './keys.ts';
import { evaluateExpression, findPrecedingOperand, toFraction } from './evaluator.ts';
import { toLaTeX, formatMath, formatResultNumber, SciNotation } from './display.tsx';
import {
  DEFAULT_FORMAT,
  formatEngineering,
  formatDMS,
  type DisplayFormat,
} from './format.ts';
import {
  deleteCompAtCursor,
  insertCompValue,
  moveCompCursorDown,
  moveCompCursorLeft,
  moveCompCursorRight,
  moveCompCursorUp,
  newtonSolveX,
  reconstructSequence,
  wrapFracTemplate,
  wrapPrecedingBinary,
} from './modes/comp.ts';
import {
  STAT_RESULT_TOP_OPTIONS,
  STAT_TYPES,
  applyStatDelete,
  applyStatDigit,
  calculateStatVars,
  getStatSubMenuInsert,
  StatDataScreen,
  StatMenuScreen,
  StatResultScreen,
  StatSubMenuScreen,
} from './modes/stat.tsx';
import {
  applyEqnDelete,
  applyEqnDigit,
  EqnMenuScreen,
  EqnQuadScreen,
  EqnResultLabel,
  EqnResultValue,
  solveQuadratic,
} from './modes/eqn.tsx';

const Calculator: React.FC = () => {
  const [isDebug, setIsDebug] = useState(false);
  const [keyStyles, setKeyStyles] = useState<Record<string, KeyStyle>>(INITIAL_KEY_STYLES);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number, y: number, initial: KeyStyle } | null>(null);

  const clickCount = useRef(0);
  const lastClick = useRef(0);

  const handleDebugToggle = () => {
    const now = Date.now();
    if (now - lastClick.current < 500) {
      clickCount.current++;
    } else {
      clickCount.current = 1;
    }
    lastClick.current = now;
    if (clickCount.current >= 3) {
      setIsDebug(!isDebug);
      clickCount.current = 0;
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'move' | 'resize') => {
    if (!isDebug) return;
    e.stopPropagation();
    e.preventDefault();
    setActiveKey(id);
    setDragType(type);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initial: { ...keyStyles[id] }
    });
  };

  const [scale, setScale] = useState(1);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDebug || !activeKey || !dragStart || !dragType) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    setKeyStyles(prev => {
      const current = { ...prev[activeKey] };
      if (dragType === 'move') {
        current.left = Math.round(dragStart.initial.left + dx);
        current.top = Math.round(dragStart.initial.top + dy);
      } else {
        current.width = Math.max(10, Math.round(dragStart.initial.width + dx));
        current.height = Math.max(10, Math.round(dragStart.initial.height + dy));
      }
      return { ...prev, [activeKey]: current };
    });
  }, [isDebug, activeKey, dragStart, dragType, scale]);

  const handleMouseUp = useCallback(() => {
    setActiveKey(null);
    setDragType(null);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (activeKey) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeKey, handleMouseMove, handleMouseUp]);

  const exportConfig = () => {
    let css = "/* New Key Mappings */\n";
    Object.entries(keyStyles).forEach(([id, style]) => {
      const s = style as KeyStyle;
      css += `.key-${id} { top: ${s.top}px; left: ${s.left}px; width: ${s.width}px; height: ${s.height}px; }\n`;
    });
    console.log(css);
    copyToClipboard(css);
    alert("New labels CSS copied to clipboard!");
  };

  const [currentInput, setCurrentInput] = useState<string>("‸");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ans, setAns] = useState<number>(() => {
    const saved = localStorage.getItem('calc_ans');
    return saved ? parseFloat(saved) : 0;
  });
  const [vars, setVars] = useState<Vars>(() => {
    try {
      const saved = localStorage.getItem('calc_vars');
      return saved ? JSON.parse(saved) : { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };
    } catch { return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 }; }
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

  const [lastValue, setLastValue] = useState<number>(0);
  const [showingResult, setShowingResult] = useState<boolean>(false);
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [isSto, setIsSto] = useState<boolean>(false);
  const [isRcl, setIsRcl] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('decimal');
  const [calcMode, setCalcMode] = useState<CalcMode>('COMP');
  const [statType, setStatType] = useState<StatType | null>(null);
  const [statFrequencyEnabled, setStatFrequencyEnabled] = useState<boolean>(false);
  const [statData, setStatData] = useState<StatEntry[]>([]);
  const [statCursor, setStatCursor] = useState({ row: 0, col: 0 }); // col 0:x, 1:y, 2:freq
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
  const [syntaxError, setSyntaxError] = useState<boolean>(false);
  const [mathError, setMathError] = useState<boolean>(false);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [showPane, setShowPane] = useState<boolean>(false);

  // --- Phase 1: SETUP display format, engineering, DMS, hyp menu ---
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>(() => {
    try {
      const saved = localStorage.getItem('calc_display_format');
      return saved ? (JSON.parse(saved) as DisplayFormat) : DEFAULT_FORMAT;
    } catch { return DEFAULT_FORMAT; }
  });
  useEffect(() => {
    localStorage.setItem('calc_display_format', JSON.stringify(displayFormat));
  }, [displayFormat]);

  // ab/c (mixed) vs d/c (improper) fraction result form.
  const [mixedFraction, setMixedFraction] = useState<boolean>(() => localStorage.getItem('calc_mixed_frac') === '1');
  useEffect(() => {
    localStorage.setItem('calc_mixed_frac', mixedFraction ? '1' : '0');
  }, [mixedFraction]);

  // SETUP sub-prompt awaiting a digit: Fix 0~9 / Sci 0~9 / Norm 1~2.
  const [setupPrompt, setSetupPrompt] = useState<null | 'fix' | 'sci' | 'norm'>(null);
  const [setupPage, setSetupPage] = useState<number>(0);

  // hyp key menu (sinh/cosh/tanh + inverses) overlaid on COMP.
  const [showHypMenu, setShowHypMenu] = useState<boolean>(false);

  // Engineering-notation offset applied to the shown result (null = off).
  const [engMode, setEngMode] = useState<number | null>(null);
  // Sexagesimal (°′″) rendering of the shown result.
  const [dmsResult, setDmsResult] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const targetHeight = 1000 + 40; // Calculator height + padding
      const newScale = Math.min(1, vh / targetHeight);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [paneView, setPaneView] = useState<'history' | 'help'>('history');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const statCursorRef = useRef(statCursor);
  useEffect(() => { statCursorRef.current = statCursor; }, [statCursor]);

  const handleInput = useCallback((val: string) => {
    if (showHypMenu) {
      const hypMap: Record<string, string> = {
        '1': 'sinh(‸)', '2': 'cosh(‸)', '3': 'tanh(‸)',
        '4': 'sinh⁻¹(‸)', '5': 'cosh⁻¹(‸)', '6': 'tanh⁻¹(‸)',
      };
      if (hypMap[val]) {
        setShowHypMenu(false);
        setSyntaxError(false);
        setMathError(false);
        const next = insertCompValue(currentInput, showingResult, hypMap[val]);
        setCurrentInput(next.input);
        setShowingResult(next.showingResult);
      }
      return;
    }
    if (promptVar) {
      if (!isNaN(Number(val)) || val === '.' || val === '-') {
        setPromptValue(prev => {
          if (prev === "0" && val !== '.') return val === '-' ? '-' : val;
          if (val === '-' && prev !== "") return prev;
          return prev + val;
        });
      }
      return;
    }
    if (calcMode === 'MENU') {
      if (val === '1') {
        setCalcMode('COMP');
        setStatType(null);
      }
      else if (val === '3') setCalcMode('STAT_MENU');
      else if (val === '5') setCalcMode('EQN_MENU');
      else {
        setCalcMode('COMP'); // Default back for others for now
      }
      setCurrentInput("‸");
      return;
    }
    if (calcMode === 'STAT_MENU') {
      if (STAT_TYPES[val]) {
        setStatType(STAT_TYPES[val]);
        setCalcMode('STAT_DATA');
        setStatData([{ x: '', y: '', freq: '1' }]);
        setStatCursor({ row: 0, col: 0 });
      }
      return;
    }
    if (calcMode === 'STAT_DATA') {
      setStatData(prev => {
        const next = applyStatDigit(prev, statCursorRef.current.row, statCursorRef.current.col, statType, statFrequencyEnabled, val);
        return next === undefined ? prev : next;
      });
      return;
    }
    if (calcMode === 'STAT_RESULT') {
      if (val === '1') setCalcMode('STAT_MENU');
      else if (val === '2') setCalcMode('STAT_DATA');
      else if (STAT_RESULT_TOP_OPTIONS[val]) {
        setStatSubMenu(STAT_RESULT_TOP_OPTIONS[val]);
        setCalcMode('STAT_RESULT_SUB');
      }
      return;
    }
    if (calcMode === 'STAT_RESULT_SUB') {
      const insertStatVar = (name: string) => {
        setCalcMode('COMP');
        setSyntaxError(false);
        setMathError(false);
        if (showingResult || currentInput.includes('→')) {
          const isOperator = /[+×÷\-]/.test(name) || name === 'sqr(‸)' || name === 'cube(‸)' || name.startsWith('pwr(') || name.startsWith('root(') || name.startsWith('frac(');
          let nextInput = isOperator ? "Ans" + name : name;
          if (!nextInput.includes('‸')) nextInput += '‸';
          setCurrentInput(nextInput);
          setShowingResult(false);
        } else {
          let target = name.includes('‸') ? name : name + '‸';
          setCurrentInput(prev => {
            const hasCursor = prev.includes('‸');
            if (hasCursor) {
              return prev.replace('‸', target);
            } else {
              return prev + target;
            }
          });
        }
      };

      const inserted = getStatSubMenuInsert(statSubMenu, statType, val);
      if (inserted) insertStatVar(inserted);
      return;
    }
    if (calcMode === 'SETUP') {
      // Awaiting the digit for a Fix/Sci/Norm sub-prompt.
      if (setupPrompt) {
        const d = parseInt(val, 10);
        if (!isNaN(d)) {
          if (setupPrompt === 'fix') setDisplayFormat({ kind: 'fix', digits: Math.min(9, d) });
          else if (setupPrompt === 'sci') setDisplayFormat({ kind: 'sci', digits: d === 0 ? 10 : Math.min(10, d) });
          else if (setupPrompt === 'norm') setDisplayFormat({ kind: 'norm', n: d === 2 ? 2 : 1 });
          setSetupPrompt(null);
          setSetupPage(0);
          setCalcMode('COMP');
        }
        return;
      }
      if (setupPage === 0) {
        if (val === '3') { setAngleMode('DEG'); setCalcMode('COMP'); }
        else if (val === '4') { setAngleMode('RAD'); setCalcMode('COMP'); }
        else if (val === '5') { setAngleMode('GRA'); setCalcMode('COMP'); }
        else if (val === '6') setSetupPrompt('fix');
        else if (val === '7') setSetupPrompt('sci');
        else if (val === '8') setSetupPrompt('norm');
        else { setCalcMode('COMP'); } // MthIO/LineIO left as display-only for now
        return;
      }
      // Second page: Disp — 1: ab/c (mixed), 2: d/c (improper)
      if (val === '1') { setMixedFraction(true); setSetupPage(0); setCalcMode('COMP'); }
      else if (val === '2') { setMixedFraction(false); setSetupPage(0); setCalcMode('COMP'); }
      else { setSetupPage(0); setCalcMode('COMP'); }
      return;
    }
    if (calcMode === 'EQN_MENU') {
      if (val === '3') {
        setCalcMode('EQN_QUAD');
        setEqnCoeffs(["0", "0", "0"]);
        setEqnIndex(0);
      } else return;
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      setEqnCoeffs(prev => applyEqnDigit(prev, eqnIndex, val) ?? prev);
      return;
    }
    if (calcMode === 'EQN_RESULT') {
      if (!isNaN(Number(val))) {
        setCalcMode('COMP');
        setCurrentInput(val + "‸");
      }
      return;
    }

    setSyntaxError(false);
    setMathError(false);
    setEngMode(null);
    setDmsResult(false);
    const next = insertCompValue(currentInput, showingResult, val);
    setCurrentInput(next.input);
    setShowingResult(next.showingResult);
  }, [calcMode, eqnIndex, showingResult, currentInput, promptVar, statType, statFrequencyEnabled, statCursor, showHypMenu, setupPrompt, setupPage]);

  const handleTemplateKey = useCallback((type: string) => {
    if (type === 'diff') handleInput("diff(‸,x,)");
    else if (type === 'sum') handleInput("Σ(‸,x,0,10)");
    setIsShift(false);
  }, [handleInput]);

  // --- Handlers ---
  const handleKeyFlash = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.classList.add('key-flash');
    setTimeout(() => target.classList.remove('key-flash'), 300);
  };

  const setShiftMomentary = useCallback((val: boolean) => {
    setIsShift(val);
    if (val) setIsAlpha(false);
  }, []);

  const setAlphaMomentary = useCallback((val: boolean) => {
    setIsAlpha(val);
    if (val) setIsShift(false);
  }, []);

  // Wrap button clicks with flash
  const withFlash = (fn: (e?: any) => void, label?: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    handleKeyFlash(e);
    if (label) setCurrentSequence(prev => [...prev, label]);
    fn(e);
  };

  const handleModeSwitch = useCallback(() => {
    if (isShift) {
      setCalcMode('SETUP');
      setSetupPage(0);
      setSetupPrompt(null);
      setIsShift(false);
    } else {
      setCalcMode('MENU');
    }
  }, [isShift]);

  const performEvaluation = useCallback(() => {
    if (!currentInput || currentInput.includes('→')) return null;
    try {
      setSyntaxError(false);
      setMathError(false);
      let s = currentInput;
      let openCount = (s.match(/\(/g) || []).length, closeCount = (s.match(/\)/g) || []).length;
      s += ')'.repeat(Math.max(0, openCount - closeCount));
      
      const statVars = calculateStatVars(statType, statData);
      let val = evaluateExpression(s, vars, ans, angleMode, statVars, displayFormat);
      if (isNaN(val) || !isFinite(val)) {
        console.warn("Evaluation resulted in non-finite value:", val, {
          inputExpression: s,
          vars,
          statType,
          statData,
          computedStatVars: statVars
        });
        throw "MathError";
      }
      
      const raw = currentInput.replace('‸', '');
      const finalSequence = reconstructSequence(raw);

      return { val, raw, finalSequence };
    } catch (e) {
      console.warn("Calculator Evaluation Error details:", {
        error: e,
        inputExpression: currentInput,
        vars,
        statType,
        statData,
        stack: e instanceof Error ? e.stack : undefined
      });
      if (e === "MathError") {
        setMathError(true);
      } else {
        setSyntaxError(true);
      }
      return null;
    }
  }, [currentInput, vars, ans, angleMode, statType, statData, displayFormat]);

  const handleCalc = useCallback(() => {
    if (isShift) {
      // SOLVE implementation
      setIsShift(false);
      if (!currentInput.includes('X')) {
        setSyntaxError(true);
        return;
      }
      
      try {
        const sVars = calculateStatVars(statType, statData);
        const x = newtonSolveX(currentInput.replace(/[‸⬚]/g, ''), vars, ans, angleMode, sVars);
        setVars(prev => ({ ...prev, X: x }));
        setAns(x);
        setShowingResult(true);
        setLastValue(x);
      } catch (e) {
        setSyntaxError(true);
      }
      return;
    }
    if (isAlpha) {
      handleInput('=');
      setIsAlpha(false);
      return;
    }

    // Normal CALC: Find variables
    const varsInExpr = Array.from(new Set(currentInput.match(/[A-MYX]/g) || []));
    if (varsInExpr.length > 0) {
      setPromptVarsQueue(varsInExpr);
      const firstVar = varsInExpr[0];
      setPromptVar(firstVar);
      setPromptValue("0");
      setPrevPromptValue(vars[firstVar]?.toString() || "0");
    } else {
      solveRef.current();
    }
  }, [isShift, isAlpha, currentInput, vars, handleInput, ans, angleMode]);

  const tackleNextPrompt = useCallback(() => {
    if (!promptVar) return;
    
    // Save current prompt value to variable
    const val = parseFloat(promptValue) || parseFloat(prevPromptValue) || 0;
    setVars(prev => ({ ...prev, [promptVar]: val }));

    const nextQueue = promptVarsQueue.slice(1);
    setPromptVarsQueue(nextQueue);
    
    if (nextQueue.length > 0) {
      const nextVar = nextQueue[0];
      setPromptVar(nextVar);
      setPromptValue("0");
      setPrevPromptValue(vars[nextVar]?.toString() || "0");
    } else {
      setPromptVar(null);
      solveRef.current();
    }
  }, [promptVar, promptValue, prevPromptValue, promptVarsQueue, vars]);

  const solve = useCallback(() => {
    if (promptVar) {
      tackleNextPrompt();
      return;
    }
    if (calcMode === 'STAT_DATA') {
      const isTwoVar = statType !== '1-VAR';
      const maxCol = (isTwoVar ? 1 : 0) + (statFrequencyEnabled ? 1 : 0);
      
      setStatCursor(prev => {
        if (prev.col < maxCol) return { ...prev, col: prev.col + 1 };
        const nextRow = prev.row + 1;
        setStatData(d => {
          if (nextRow >= d.length) {
            return [...d, { x: '', y: '', freq: '1' }];
          }
          return d;
        });
        return { row: nextRow, col: 0 };
      });
      return;
    }
    if (calcMode === 'MENU') {
      setCalcMode('COMP');
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      if (eqnIndex < 2) {
        setEqnIndex(prev => prev + 1);
        return;
      }
      const results = solveQuadratic(
        parseFloat(eqnCoeffs[0]) || 0,
        parseFloat(eqnCoeffs[1]) || 0,
        parseFloat(eqnCoeffs[2]) || 0,
      );
      setEqnResults(results);
      setCalcMode('EQN_RESULT');
      setEqnResultIdx(0);
      return;
    }

    if (calcMode === 'EQN_RESULT') {
      if (eqnResultIdx < eqnResults.length - 1) {
        setEqnResultIdx(prev => prev + 1);
      } else {
        setCalcMode('EQN_QUAD');
        setEqnIndex(2);
      }
      return;
    }

    const evalRes = performEvaluation();
    if (evalRes) {
      const { val, raw, finalSequence } = evalRes;
      const latex = toLaTeX(raw);
      setHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        rawInput: raw,
        displayInput: formatMath(raw),
        result: val,
        latex: latex,
        sequence: finalSequence
      }, ...prev].slice(0, 50));

      setAns(val);
      setCurrentSequence([]);
      setLastValue(val);
      setShowingResult(true);
      setEngMode(null);
      setDmsResult(false);
      setDisplayMode(Number.isInteger(val) ? 'decimal' : 'fraction');
    }
  }, [calcMode, eqnIndex, eqnCoeffs, eqnResultIdx, eqnResults, performEvaluation, toLaTeX, formatMath, promptVar, tackleNextPrompt, statType, statData, statCursor]);

  useEffect(() => {
    solveRef.current = solve;
  }, [solve]);

  const del = useCallback(() => {
    if (promptVar) {
      setPromptValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
      return;
    }
    if (calcMode === 'STAT_DATA') {
      setStatData(prev => applyStatDelete(prev, statCursor.row, statCursor.col, statType, statFrequencyEnabled));
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      setEqnCoeffs(prev => applyEqnDelete(prev, eqnIndex));
      return;
    }
    if (showingResult) { 
      setShowingResult(false); 
      setCurrentSequence([]);
      return; 
    }

    const nextInput = deleteCompAtCursor(currentInput);
    if (nextInput === null) return;
    setCurrentSequence(prev => prev.slice(0, -1));
    setCurrentInput(nextInput);
  }, [calcMode, eqnIndex, showingResult, currentInput, promptVar, statCursor, statData]);

  const clearHistory = () => {
    setHistory([]);
  };

  const clearAll = useCallback(() => {
    if (calcMode === 'STAT_DATA' || calcMode === 'STAT_MENU' || calcMode === 'STAT_RESULT' || calcMode === 'STAT_RESULT_SUB') {
      setCalcMode('COMP');
      return;
    }
    if (calcMode === 'EQN_QUAD' || calcMode === 'EQN_RESULT') {
      setEqnCoeffs(["0", "0", "0"]);
      setEqnIndex(0);
      setCalcMode('EQN_QUAD');
      setCurrentSequence([]);
      return;
    }
    setCurrentInput("‸");
    setCurrentSequence([]);
    setShowingResult(false);
    setIsShift(false);
    setIsAlpha(false);
    setIsSto(false);
    setIsRcl(false);
    setCalcMode('COMP');
    setSyntaxError(false);
    setMathError(false);
    setShowHypMenu(false);
    setSetupPrompt(null);
    setSetupPage(0);
    setEngMode(null);
    setDmsResult(false);
  }, [calcMode]);

  const handleRight = useCallback(() => {
    if (calcMode === 'STAT_DATA') {
      const isTwoVar = statType !== '1-VAR';
      const maxCol = (isTwoVar ? 1 : 0) + (statFrequencyEnabled ? 1 : 0);
      setStatCursor(prev => ({ ...prev, col: Math.min(maxCol, prev.col + 1) }));
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      setEqnIndex(prev => (prev + 1) % 3);
      return;
    }
    if (showingResult) { setShowingResult(false); return; }
    setCurrentInput(moveCompCursorRight(currentInput));
  }, [calcMode, showingResult, currentInput, statType, statFrequencyEnabled]);

  const handleLeft = useCallback(() => {
    if (calcMode === 'STAT_DATA') {
      setStatCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
      return;
    }
    if (calcMode === 'EQN_QUAD') {
      setEqnIndex(prev => (prev + 2) % 3);
      return;
    }
    if (showingResult) { setShowingResult(false); return; }
    setCurrentInput(moveCompCursorLeft(currentInput));
  }, [calcMode, showingResult, currentInput]);

  const handleDown = useCallback(() => {
    if (calcMode === 'SETUP') { setSetupPage(p => (p === 0 ? 1 : 0)); return; }
    if (calcMode === 'STAT_DATA') {
      setStatCursor(prev => {
        const nextRow = prev.row + 1;
        setStatData(d => {
          if (nextRow >= d.length) {
            return [...d, { x: '', y: '', freq: '1' }];
          }
          return d;
        });
        return { ...prev, row: nextRow };
      });
      return;
    }
    if (calcMode === 'EQN_RESULT') {
      if (eqnResultIdx < eqnResults.length - 1) {
        setEqnResultIdx(prev => prev + 1);
      }
      return;
    }
    setCurrentInput(moveCompCursorDown(currentInput));
  }, [calcMode, eqnResultIdx, eqnResults, currentInput, statCursor, statData]);

  const handleUp = useCallback(() => {
    if (calcMode === 'SETUP') { setSetupPage(p => (p === 0 ? 1 : 0)); return; }
    if (calcMode === 'STAT_DATA') {
      setStatCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
      return;
    }
    if (calcMode === 'EQN_RESULT') {
      if (eqnResultIdx > 0) {
        setEqnResultIdx(prev => prev - 1);
      }
      return;
    }
    setCurrentInput(moveCompCursorUp(currentInput));
  }, [calcMode, eqnResultIdx, currentInput]);

  const toggleSD = useCallback(() => {
    if (!showingResult) return;
    setDisplayMode(prev => prev === 'decimal' ? 'fraction' : 'decimal');
  }, [showingResult]);

  const handleAlphaVarRef = useRef<((v: string) => void) | null>(null);
  const handleTrigRef = useRef<((type: string, v: string) => void) | null>(null);
  const handleParenthesesRef = useRef<((type: string, v: string) => void) | null>(null);

  const handleMemory = useCallback((action: string, v?: string) => {
    if (v === 'M' && isAlpha) {
      handleInput('M');
      setIsAlpha(false);
      setIsShift(false);
      return;
    }

    if (action === 'plus_minus') {
      let valToUse = ans;
      if (!showingResult) {
        const evalRes = performEvaluation();
        if (evalRes) {
          valToUse = evalRes.val;
          setAns(evalRes.val);
          setHistory(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            rawInput: evalRes.raw,
            displayInput: formatMath(evalRes.raw),
            result: evalRes.val,
            latex: toLaTeX(evalRes.raw),
            sequence: evalRes.finalSequence
          }, ...prev].slice(0, 50));
          setLastValue(evalRes.val);
          setShowingResult(true);
          setDisplayMode(Number.isInteger(evalRes.val) ? 'decimal' : 'fraction');
        } else {
          return; // Syntax error handled in performEvaluation
        }
      }
      setVars(prev => ({ ...prev, M: isShift ? prev.M - valToUse : prev.M + valToUse }));
    } else if (action === 'rcl_sto') {
      if (isShift) { setIsSto(true); setIsRcl(false); }
      else { setIsRcl(true); setIsSto(false); }
    }
    setIsShift(false);
    setIsAlpha(false);
  }, [isAlpha, isShift, showingResult, ans, performEvaluation, formatMath, toLaTeX, vars]);

  const handleAlphaVar = useCallback((v: string) => {
    if (isSto) {
      let beforeText = currentInput.replace('‸', '');
      let operand = findPrecedingOperand(beforeText);
      
      if (showingResult || !operand || beforeText === '') {
        setVars(prev => ({ ...prev, [v]: ans }));
        setCurrentInput(`Ans→${v}‸`);
      } else {
        try {
          const sVars = calculateStatVars(statType, statData);
          let valToSave = evaluateExpression(operand.replace(/Ans/g, String(ans)), {}, ans, angleMode, sVars);
          setVars(prev => ({ ...prev, [v]: valToSave }));
          setCurrentInput(beforeText + `→${v}‸`);
        } catch(e) {
          setVars(prev => ({ ...prev, [v]: ans }));
          setCurrentInput(beforeText + `→${v}‸`);
        }
      }
      setShowingResult(true); 
      setIsSto(false);
      setIsShift(false);
      setIsAlpha(false);
    } else if (isRcl) {
      handleInput(v);
      setIsRcl(false);
      setIsShift(false);
      setIsAlpha(false);
    } else if (isAlpha) {
      handleInput(v);
      setIsAlpha(false);
      setIsShift(false);
    } else {
      if (v === 'A') handleInput('-'); 
      if (v === 'B') {
        // °′″ key: toggle a result into sexagesimal, else insert a DMS separator.
        if (showingResult) setDmsResult(prev => !prev);
        else handleInput('°');
      }
      if (v === 'C') {
        // hyp key: SHIFT hyp = Abs(, otherwise open the sinh/cosh/tanh menu.
        if (isShift) { handleInput('abs(‸)'); setIsShift(false); }
        else setShowHypMenu(true);
      }
      if (v === 'D') handleTrigRef.current?.('sin', 'D');
      if (v === 'E') handleTrigRef.current?.('cos', 'E');
      if (v === 'F') handleTrigRef.current?.('tan', 'F');
      if (v === 'X') handleParenthesesRef.current?.(')', 'X'); 
      if (v === 'Y') toggleSD(); 
      if (v === 'M') handleMemory('plus_minus', 'M'); 
    }
  }, [isSto, isRcl, isAlpha, isShift, currentInput, showingResult, ans, vars, angleMode, handleInput, toggleSD, handleMemory]);

  handleAlphaVarRef.current = handleAlphaVar;

  const handleTrig = useCallback((type: string, v: string) => {
    if (isSto || isRcl || isAlpha) {
      handleAlphaVar(v);
    } else {
      handleInput(type + (isShift ? '⁻¹(' : '('));
      setIsShift(false);
    }
  }, [isAlpha, isShift, isSto, isRcl, handleInput, handleAlphaVar]);

  handleTrigRef.current = handleTrig;

  const handleParentheses = useCallback((type: string, v: string, forceNormal?: boolean) => {
    if ((isSto || isRcl || isAlpha) && !forceNormal) {
      handleAlphaVar(v);
    }
    else if (isShift && !forceNormal) {
      handleInput(type === '(' ? '%' : ',');
      setIsShift(false);
    }
    else {
      handleInput(type);
    }
  }, [isAlpha, isShift, isSto, isRcl, handleInput, handleAlphaVar]);

  handleParenthesesRef.current = handleParentheses;

  const handleFracKey = useCallback(() => {
    if (isShift) {
      handleInput("mix(‸,,)");
    } else {
      const wrapped = wrapFracTemplate(currentInput, showingResult);
      if (wrapped.insertInstead) {
        handleInput(wrapped.insertInstead);
      } else {
        setCurrentInput(wrapped.input);
        setShowingResult(wrapped.showingResult);
      }
    }
    setIsShift(false);
  }, [isShift, showingResult, currentInput, handleInput]);

  const handlePermComb = useCallback((type: 'P' | 'C') => {
    if (!isShift) {
      handleInput(type === 'P' ? '×' : '÷');
      return;
    }
    const wrapped = wrapPrecedingBinary(currentInput, showingResult, type === 'P' ? 'nPr' : 'nCr');
    setCurrentInput(wrapped.input);
    setShowingResult(wrapped.showingResult);
    setIsShift(false);
  }, [isShift, showingResult, currentInput, handleInput]);

  const handleIntegralKey = useCallback(() => {
    if (isShift) handleInput("diff(‸,x,)"); 
    else handleInput("int(‸,,,x)");
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleSquareKey = useCallback(() => {
    let parts = currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    let symbol = isShift ? '³' : '²';
    
    if (showingResult) {
      setCurrentInput(`Ans${symbol}‸`);
      setShowingResult(false);
      return;
    }

    setCurrentInput(before + `${symbol}‸` + after);
    setIsShift(false);
  }, [isShift, currentInput, showingResult, ans]);

  const handleExpKey = useCallback(() => {
    if (isShift) handleInput('π');
    else if (isAlpha) handleInput('e');
    else handleInput('×10^');
    setIsShift(false); setIsAlpha(false);
  }, [isShift, isAlpha, handleInput]);

  // ENG: convert the displayed result to engineering notation (exponent a
  // multiple of 3). ENG grows the mantissa (exponent −3), SHIFT ENG shrinks it.
  const handleEng = useCallback(() => {
    if (!showingResult) { setIsShift(false); return; }
    const shiftUp = isShift;
    setEngMode(prev => {
      if (prev === null) return 0; // first press → natural engineering form
      return shiftUp ? prev + 1 : prev - 1;
    });
    setIsShift(false);
  }, [showingResult, isShift]);

  // "." key: SHIFT . = Ran#, ALPHA . = RanInt#(a,b), otherwise a decimal point.
  const handleDotKey = useCallback(() => {
    if (isShift) { handleInput('Ran#'); setIsShift(false); }
    else if (isAlpha) { handleInput('RanInt(‸,)'); setIsAlpha(false); }
    else handleInput('.');
  }, [isShift, isAlpha, handleInput]);

  const handlePowerKey = useCallback((arg?: any) => {
    const forcePwr = arg === true;
    let parts = currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    let operand = findPrecedingOperand(before);
    
    if (isShift && !forcePwr) {
      if (operand) {
        // If operand is already wrapped in parentheses, don't double wrap for template if possible
        setCurrentInput(before.slice(0, -operand.length) + `root(${operand},‸)` + after);
      } else {
        setCurrentInput(before + `root(‸,)` + after);
      }
    } else {
      if (operand) {
        // Just use literal ^ for power if it's a simple number/ans/var to avoid template confusion?
        // Actually the user wants (x)^2 not modified. 
        // We'll use ^(‸) which renders as a superscript.
        setCurrentInput(before + `^(‸)` + after);
      } else {
        setCurrentInput(before + `pwr(‸,)` + after);
      }
    }
    setIsShift(false);
  }, [isShift, currentInput]);

  const handleFactorialKey = useCallback(() => {
    if (isShift) handleInput('!'); else handleInput('^-1');
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleSquareRootKey = useCallback(() => {
    if (isShift) handleInput('root(3,‸)'); else handleInput('sqrt(‸)');
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleLogKey = useCallback(() => {
    if (isShift) handleInput('Σ(‸,x,0,10)'); else handleInput('log_b(‸,)');
    setIsShift(false);
  }, [isShift, handleInput]);

  const handleOpKey = useCallback((normal: string, shift: string) => {
    if (isShift) {
      if (shift === 'nCr') handlePermComb('C');
      else if (shift === 'nPr') handlePermComb('P');
      else if (shift === 'pol') handleInput('pol(‸,)');
      else if (shift === 'rec') handleInput('rec(‸,)');
      else handleInput(shift);
    } else {
      handleInput(normal);
    }
    setIsShift(false);
  }, [isShift, handleInput, handlePermComb]);

  // --- Keyboard Support ---
  useEffect(() => {
    const record = (l: string) => setCurrentSequence(prev => [...prev, l]);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();
        if (!isShift) {
          record('SHIFT');
          setShiftMomentary(true);
        }
        return;
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        if (!isAlpha) {
          record('ALPHA');
          setAlphaMomentary(true);
        }
        return;
      }
      
      // Basic keys
      if (e.key === 'Escape') { e.preventDefault(); record('AC'); clearAll(); }
    else if (e.key === 'Backspace') { e.preventDefault(); record('DEL'); del(); }
    else if (e.key === 'Enter') { e.preventDefault(); record('='); solve(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); record('→'); handleRight(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); record('←'); handleLeft(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); record('↑'); handleUp(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); record('↓'); handleDown(); }
    else if (e.key === 'Delete') { e.preventDefault(); record('AC'); clearAll(); }
    
    // Calculator inputs
    else if (/^[0-9]$/.test(e.key) && !e.shiftKey) { e.preventDefault(); record(e.key); handleInput(e.key); }
    else if (e.key === '.') { e.preventDefault(); record('.'); handleInput('.'); }
    else if (e.key === '+') { e.preventDefault(); record('+'); handleInput('+'); }
    else if (e.key === '-') { e.preventDefault(); record('-'); handleInput('-'); }
    else if (e.key === '*') { e.preventDefault(); record('×'); handleInput('×'); }
    else if (e.key === '/') { e.preventDefault(); record('÷'); handleInput('÷'); }
    else if (e.key === '(') { e.preventDefault(); record('('); handleParentheses('(', 'X', true); }
    else if (e.key === ')') { e.preventDefault(); record(')'); handleParentheses(')', 'Y', true); }
    else if (e.key === '^' || (e.key === '6' && e.shiftKey)) { 
      e.preventDefault(); 
      record('xⁿ'); 
      handlePowerKey(true); // Force power mode from keyboard
    }
    
    // Special shortcuts (don't trigger if modifiers are active unless expected)
    else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('SIN'); handleTrig('sin', 'D'); }
    else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('COS'); handleTrig('cos', 'E'); }
    else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('TAN'); handleTrig('tan', 'F'); }
    else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('LOG'); handleLogKey(); }
    else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('√'); handleSquareRootKey(); }
    else if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('x²'); handleSquareKey(); }
    else if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); record('Ans'); handleInput('Ans'); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();
        setShiftMomentary(false);
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        setAlphaMomentary(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setShiftMomentary, setAlphaMomentary, clearAll, del, solve, handleRight, handleLeft, handleUp, handleDown, handleInput, handleParentheses, handleTrig, handleLogKey, isShift, isAlpha]);

  // --- Rendering Helpers ---
  const renderInput = () => {
    if (showHypMenu) {
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
    if (promptVar) {
      return (
        <div className="flex flex-col">
          <div className="text-[0.9rem] opacity-70 mb-1" dangerouslySetInnerHTML={{ __html: formatMath(currentInput.replace('‸', '')) }} />
          <div className="flex items-center">
            <span className="mr-2">{promptVar}?</span>
          </div>
        </div>
      );
    }
    if (calcMode === 'MENU') {
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
    if (calcMode === 'STAT_MENU') {
      return <StatMenuScreen />;
    }
    if (calcMode === 'STAT_DATA') {
      return (
        <StatDataScreen
          statType={statType}
          statFrequencyEnabled={statFrequencyEnabled}
          statData={statData}
          statCursor={statCursor}
        />
      );
    }
    if (calcMode === 'STAT_RESULT') {
      return <StatResultScreen statType={statType} />;
    }
    if (calcMode === 'STAT_RESULT_SUB') {
      return <StatSubMenuScreen statSubMenu={statSubMenu} statType={statType} />;
    }
    if (calcMode === 'SETUP') {
      if (setupPrompt) {
        const label = setupPrompt === 'fix' ? 'Fix 0~9?' : setupPrompt === 'sci' ? 'Sci 0~9?' : 'Norm 1~2?';
        return <div className="mode-menu"><div className="mode-item">{label}</div></div>;
      }
      if (setupPage === 1) {
        return (
          <div className="mode-menu">
            <div className="mode-item"><span className="mode-num">1:</span>ab/c</div>
            <div className="mode-item"><span className="mode-num">2:</span>d/c</div>
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
    if (calcMode === 'EQN_MENU') {
      return <EqnMenuScreen />;
    }
    if (calcMode === 'EQN_QUAD') {
      return <EqnQuadScreen coeffs={eqnCoeffs} index={eqnIndex} />;
    }
    if (calcMode === 'EQN_RESULT') {
      return <EqnResultLabel results={eqnResults} resultIdx={eqnResultIdx} />;
    }

    return <div dangerouslySetInnerHTML={{ __html: formatMath(currentInput) }} />;
  };

  const renderResult = () => {
    if (promptVar) {
      return (
        <div className="decimal-result flex flex-col items-end">
          <div className="text-[0.7rem] opacity-50 mb-[-4px]">{prevPromptValue}</div>
          <div>{promptValue}</div>
        </div>
      );
    }
    if (calcMode === 'MENU' || calcMode === 'EQN_MENU' || calcMode === 'EQN_QUAD') return null;
    
    if (syntaxError) {
      return <div className="decimal-result error">Syntax ERROR</div>;
    }

    if (mathError) {
      return <div className="decimal-result error">Math ERROR</div>;
    }

    if (calcMode === 'EQN_RESULT') {
      return <EqnResultValue results={eqnResults} resultIdx={eqnResultIdx} />;
    }

    if (showingResult) {
      // Engineering notation view (ENG / SHIFT ENG).
      if (engMode !== null) {
        const eng = formatEngineering(ans, engMode);
        return <div className="decimal-result"><SciNotation mantissa={eng.mantissa} exponent={eng.exponent} /></div>;
      }
      // Sexagesimal (°′″) view.
      if (dmsResult) {
        const { deg, min, sec } = formatDMS(ans);
        return (
          <div className="decimal-result">
            {deg}<span className="opacity-70 mx-[1px]">°</span>{min}<span className="opacity-70 mx-[1px]">°</span>{sec}<span className="opacity-70 mx-[1px]">°</span>
          </div>
        );
      }
      // Fractions only exist in Norm; Fix/Sci always show a formatted decimal.
      if (displayMode === 'fraction' && !Number.isInteger(ans) && displayFormat.kind === 'norm') {
        let f = toFraction(ans);
        if (f.d > 1000000 || f.d === 1) {
          return <div className="decimal-result">{formatResultNumber(ans, displayFormat)}</div>;
        }
        if (mixedFraction && Math.abs(f.n) > f.d) {
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
      return <div className="decimal-result">{formatResultNumber(ans, displayFormat)}</div>;
    }
    
    return <div className="decimal-result">0</div>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

    const renderMappingKey = (id: string, action: (e: React.MouseEvent<HTMLButtonElement>) => void, className: string = "", momentary?: { onDown: () => void, onUp: () => void }) => {
      const style = keyStyles[id];
      const inlineStyle = style ? {
        top: `${style.top}px`,
        left: `${style.left}px`,
        width: `${style.width}px`,
        height: `${style.height}px`,
      } : {};

      return (
        <button 
          key={id} 
          className={`key ${className} ${isDebug ? 'debug-visible' : ''}`} 
          style={inlineStyle}
          onMouseDown={(e) => {
            if (isDebug) {
              handleMouseDown(e, id, 'move');
            } else if (momentary) {
              momentary.onDown();
            }
          }}
          onMouseUp={(e) => {
             if (!isDebug && momentary) {
               momentary.onUp();
             }
          }}
          onMouseLeave={(e) => {
            if (!isDebug && momentary) {
              momentary.onUp();
            }
          }}
          // Touch support
          onPointerDown={(e) => {
            if (!isDebug && momentary) {
              e.currentTarget.setPointerCapture(e.pointerId);
              momentary.onDown();
            }
          }}
          onPointerUp={(e) => {
            if (!isDebug && momentary) {
              momentary.onUp();
            }
          }}
          onClick={(e) => { 
            if (isDebug || momentary) return;
            e.stopPropagation(); 
            action(e); 
          }}
        >
          {isDebug && (
            <>
              <span className="debug-coords">{id} ({style?.left},{style?.top}) {style?.width}x{style?.height}</span>
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-white/50 cursor-nwse-resize z-[110]"
                onMouseDown={(e) => handleMouseDown(e, id, 'resize')}
              />
            </>
          )}
        </button>
      );
    };

    const renderMiniButton = (label: string, id: string | number) => {
      let typeClass = '';
      if (label.match(/^[0-9.]+$/) || label === 'Ans' || label === 'π' || label === 'e' || label === '×10ˣ') {
        typeClass = 'num';
      } else if (['+', '-', '×', '÷', '=', 'DEL', 'AC', '(', ')'].includes(label)) {
        typeClass = 'op';
      } else if (label === 'SHIFT') {
        typeClass = 'shift';
      } else if (label === 'ALPHA') {
        typeClass = 'alpha';
      }
      
      const cls = `mini-btn ${typeClass} ${isDebug ? 'debug-visible' : ''}`;
      
      if (label === 'log_box') {
        return (
          <span className={cls} key={id}>
            log<span className="mini-box ml-1"></span>
          </span>
        );
      }
      if (label.toUpperCase() === 'LOG') {
        return <span className={cls} key={id}>log</span>;
      }
      if (label.toLowerCase() === 'ln') {
        return <span className={cls} key={id}>ln</span>;
      }
      if (label === '√') {
        return (
          <span className={cls} key={id}>
            <div className="flex items-center">
              <span className="text-[12px] -mr-1">√</span><span className="mini-box scale-75"></span>
            </div>
          </span>
        );
      }
      if (label === '∫') {
        return (
          <span className={cls} key={id}>
            <span className="text-[14px] font-serif -mr-1">∫</span>
            <div className="flex flex-col gap-0.5 ml-1">
               <div className="mini-box scale-50"></div>
               <div className="mini-box scale-50"></div>
            </div>
          </span>
        );
      }
      if (label === 'Σ') {
        return (
          <span className={cls} key={id}>
            <span className="text-xs mr-0.5">Σ</span>
            <div className="flex flex-col items-center">
              <span className="mini-box scale-50"></span>
              <span className="mini-box scale-50 mt-1"></span>
            </div>
          </span>
        );
      }
      if (label === 'frac') {
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
        let sup = '▭';
        if (label.includes('²')) sup = '2';
        else if (label.includes('³')) sup = '3';
        else if (label.includes('-1')) sup = '-1';
        
        return (
          <span className={cls} key={id}>
            x<span className="text-[7px] -mt-2.5 ml-0.5 font-bold">{sup}</span>
          </span>
        );
      }
      if (label === '×10ˣ') {
        return <span className={cls} key={id}>×10ˣ</span>;
      }
      if (label === 'd/dx') {
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
      if (label === '°\'"') {
        return <span className={cls} key={id}>°′″</span>;
      }
      if (label === '(-)') {
        return <span className={cls} key={id}>(-)</span>;
      }

      const navigationIcons: Record<string, any> = {
        'UP': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
        'DOWN': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
        'LEFT': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
        'RIGHT': <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
      };

      return (
        <span className={cls} key={id}>
          {navigationIcons[label] || label}
        </span>
      );
    };


  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-5 bg-[#121212] min-h-screen m-0 overflow-x-hidden font-sans gap-8">
      {/* Sidebar Toggle */}
      <button 
        onClick={() => setShowPane(!showPane)}
        className="fixed top-4 right-4 z-50 p-3 bg-[#1c1c1c] text-white/80 rounded-full shadow-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors"
        title="Toggle History & Help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </button>

      {/* Scaling Wrapper */}
      <div 
        className="flex-shrink-0 flex items-start justify-center transition-all duration-300 relative"
        style={{ 
          height: `${1000 * scale}px`,
          width: `${504 * scale}px`,
        }}
      >
        <div 
          className="absolute origin-top transform"
          style={{ 
            transform: `scale(${scale})`,
            width: '504px',
            height: '1000px'
          }}
        >
          <div 
            className="calc-container relative w-[504px] h-[1000px] rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ 
              backgroundImage: `url(${calculatorImg})`,
              backgroundSize: '100% 100%', 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'center' 
            }}
          >
        
        <div 
          onClick={handleDebugToggle}
          className="lcd-screen absolute top-[148px] left-[68px] w-[368px] h-[166px] bg-[#94a394] bg-gradient-to-br from-[#a8b8a8] to-[#8e9e8e] px-[14px] pt-[22px] pb-[10px] flex flex-col justify-start font-mono box-border z-[60] cursor-pointer rounded-[4px] shadow-[inset_1px_1px_4px_rgba(0,0,0,0.3)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_0)] after:bg-[length:3.5px_3.5px] after:pointer-events-none after:z-10"
        >
          {isDebug && (
            <div className="absolute inset-x-0 -top-10 flex justify-center gap-2 z-[100]">
              <div className="text-[10px] text-red-500 font-bold bg-white/80 px-2 py-1 rounded text-center animate-pulse shadow-sm">
                CALIBRATION MODE ENABLED (DRAG TO MOVE, SMALL BOX TO RESIZE)
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); exportConfig(); }}
                className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-blue-700 shadow-sm"
              >
                COPY CSS CONFIG
              </button>
            </div>
          )}
          
          <div className="status-bar absolute top-0 left-0 right-0 h-5 px-[10px] text-[8px] font-black flex justify-between items-center z-20 pointer-events-none font-sans tracking-[-0.3px] bg-black/5 border-b border-black/10">
            <div className={`status-item ${isShift ? 'active' : 'opacity-10'}`}>S</div>
            <div className={`status-item ${isAlpha ? 'active' : 'opacity-10'}`}>A</div>
            <div className={`status-item ${vars.M !== 0 ? 'active' : 'opacity-10'}`}>M</div>
            <div className={`status-item ${isSto ? 'active' : 'opacity-10'}`}>STO</div>
            <div className={`status-item ${isRcl ? 'active' : 'opacity-10'}`}>RCL</div>
            <div className={`status-item ${statType !== null ? 'active' : 'opacity-10'}`}>STAT</div>
            <div className={`status-item opacity-10`}>CMPLX</div>
            <div className={`status-item opacity-10`}>MAT</div>
            <div className={`status-item opacity-10`}>VCT</div>
            <div className={`status-item ${angleMode === 'DEG' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>D</div>
            <div className={`status-item ${angleMode === 'RAD' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>R</div>
            <div className={`status-item ${angleMode === 'GRA' ? 'active' : 'opacity-10'} text-[6px] outline outline-1 outline-black px-[1px] mx-[1px] leading-none`}>G</div>
            <div className={`status-item ${displayFormat.kind === 'fix' ? 'active' : 'opacity-10'}`}>FIX</div>
            <div className={`status-item ${displayFormat.kind === 'sci' ? 'active' : 'opacity-10'}`}>SCI</div>
            <div className={`status-item active`}>Math</div>
            <div className={`status-item ${(calcMode === 'EQN_RESULT' && eqnResultIdx > 0) ? 'active' : 'opacity-10'}`}>▲</div>
            <div className={`status-item ${(calcMode === 'EQN_RESULT' && eqnResultIdx < eqnResults.length - 1) ? 'active' : 'opacity-10'}`}>▼</div>
            <div className={`status-item opacity-10`}>Disp</div>
          </div>

          <div id="input-text" className="text-[1.35rem] text-[#111] min-h-[2.2em] text-left whitespace-pre-wrap leading-[1.1] break-all pt-1 relative z-[15] tracking-[-0.8px] mt-[2px] pointer-events-none">
            {renderInput()}
          </div>

          <div id="result-text" className="flex justify-end items-end grow text-[#1a1a1a] pb-1 pointer-events-none">
            {renderResult()}
          </div>
        </div>

        {/* --- Keys --- */}
        {renderMappingKey('calc', withFlash(handleCalc, 'CALC'), 'sci sr1 sc1')}
        {renderMappingKey('integral', withFlash(handleIntegralKey, '∫'), 'sci sr1 sc2')}
        {renderMappingKey('inv', withFlash(handleFactorialKey, 'x-1'), 'sci sr1 sc5')}
        {renderMappingKey('log', withFlash(handleLogKey, 'LOG'), 'sci sr1 sc6')}

        {renderMappingKey('frac', withFlash(handleFracKey, 'ab/c'), 'key-frac')}
        {renderMappingKey('sqrt', withFlash(handleSquareRootKey, '√'), 'sci sr2 sc2')}
        {renderMappingKey('sqr', withFlash(handleSquareKey, 'x²'), 'sci sr2 sc3')}
        {renderMappingKey('pwr', withFlash(handlePowerKey, 'xⁿ'), 'sci sr2 sc4')}
        {renderMappingKey('log10', withFlash(() => handleOpKey('log10(‸)', '10^(‸)'), 'log'), 'sci sr2 sc5')}
        {renderMappingKey('ln', withFlash(() => handleOpKey('ln(‸)', 'e^(‸)'), 'ln'), 'sci sr2 sc6')}

        {renderMappingKey('A', withFlash(() => handleAlphaVar('A'), '(-)'), 'sci sr3 sc1')}
        {renderMappingKey('B', withFlash(() => handleAlphaVar('B'), '°\'"'), 'sci sr3 sc2')}
        {renderMappingKey('C', withFlash(() => handleAlphaVar('C'), 'hyp'), 'sci sr3 sc3')}
        {renderMappingKey('sin', withFlash(() => handleTrig('sin', 'D'), 'SIN'), 'sci sr3 sc4')}
        {renderMappingKey('cos', withFlash(() => handleTrig('cos', 'E'), 'COS'), 'sci sr3 sc5')}
        {renderMappingKey('tan', withFlash(() => handleTrig('tan', 'F'), 'TAN'), 'sci sr3 sc6')}

        {renderMappingKey('rcl', withFlash(() => handleMemory('rcl_sto'), 'RCL'), 'sci sr4 sc1')}
        {renderMappingKey('eng', withFlash(handleEng, 'ENG'), 'sci sr4 sc2')}
        {renderMappingKey('paren-open', withFlash(() => handleParentheses('(', ''), '('), 'sci sr4 sc3')}
        {renderMappingKey('paren-close', withFlash(() => handleAlphaVar('X'), ')'), 'sci sr4 sc4')}
        {renderMappingKey('sd', withFlash(() => handleAlphaVar('Y'), 'S⇔D'), 'key-sd')}
        {renderMappingKey('mplus', withFlash(() => handleAlphaVar('M'), 'M+'), 'key-mplus')}

        {/* Navigation - Higher priority/Z-index */}
        {renderMappingKey('up', withFlash(handleUp, 'UP'), 'key-up')}
        {renderMappingKey('down', withFlash(handleDown, 'DOWN'), 'key-down')}
        {renderMappingKey('left', withFlash(handleLeft, 'LEFT'), 'key-left')}
        {renderMappingKey('right', withFlash(handleRight, 'RIGHT'), 'key-right')}
        {renderMappingKey('shift', withFlash(() => {
          setIsShift(prev => !prev);
          setIsAlpha(false);
        }, 'SHIFT'), 'key-shift')}
        {renderMappingKey('alpha', withFlash(() => {
          setIsAlpha(prev => !prev);
          setIsShift(false);
        }, 'ALPHA'), 'key-alpha')}
        
        {renderMappingKey('mode', withFlash(handleModeSwitch, 'MODE'), 'sci sr0 sc6 absolute top-[372px] left-[346px] w-[42px] h-[28px] rounded-[12px] border border-white/5 bg-white/0')}

        {renderMappingKey('7', withFlash(() => handleInput('7'), '7'), 'num nr1 nc1')}
        {renderMappingKey('8', withFlash(() => handleInput('8'), '8'), 'num nr1 nc2')}
        {renderMappingKey('9', withFlash(() => handleInput('9'), '9'), 'num nr1 nc3')}
        {renderMappingKey('del', withFlash(del, 'DEL'), 'num nr1 nc4')}
        {renderMappingKey('ac', withFlash(clearAll, 'AC'), 'num nr1 nc5')}
        
        {renderMappingKey('4', withFlash(() => handleInput('4'), '4'), 'num nr2 nc1')}
        {renderMappingKey('5', withFlash(() => handleInput('5'), '5'), 'num nr2 nc2')}
        {renderMappingKey('6', withFlash(() => handleInput('6'), '6'), 'num nr2 nc3')}
        {renderMappingKey('mul', withFlash(() => handleOpKey('×', 'nPr'), '×'), 'num nr2 nc4')}
        {renderMappingKey('div', withFlash(() => handleOpKey('÷', 'nCr'), '÷'), 'num nr2 nc5')}
        
        {renderMappingKey('1', withFlash(() => {
          if (isShift && statType !== null) {
            setCalcMode('STAT_RESULT');
            setIsShift(false);
          } else {
            handleInput('1');
          }
        }, '1'), 'num nr3 nc1')}
        {renderMappingKey('2', withFlash(() => handleInput('2'), '2'), 'num nr3 nc2')}
        {renderMappingKey('3', withFlash(() => handleInput('3'), '3'), 'num nr3 nc3')}
        {renderMappingKey('add', withFlash(() => handleOpKey('+', 'pol'), '+'), 'num nr3 nc4')}
        {renderMappingKey('sub', withFlash(() => handleOpKey('-', 'rec'), '-'), 'num nr3 nc5')}
        
        {renderMappingKey('0', withFlash(() => {
          if (isShift) { handleInput('Rnd(‸)'); setIsShift(false); }
          else handleInput('0');
        }, '0'), 'num nr4 nc1')}
        {renderMappingKey('dot', withFlash(handleDotKey, '.'), 'num nr4 nc2')}
        {renderMappingKey('exp', withFlash(handleExpKey, '×10ˣ'), 'num nr4 nc3')}
        {renderMappingKey('ans', withFlash(() => handleInput('Ans'), 'Ans'), 'num nr4 nc4')}
        {renderMappingKey('solve', withFlash(solve, '='), 'num nr4 nc5')}
        </div>
      </div>
    </div>

      {/* Side Pane */}
      {showPane && (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:w-[350px] md:mt-0 bg-[#1a1a1a] md:rounded-3xl border-l md:border border-white/5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 h-full md:h-fit md:max-h-[900px]">
          <div className="flex border-b border-white/5 relative">
            <button 
              onClick={() => setPaneView('history')}
              className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${paneView === 'history' ? 'bg-white/5 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
            >
              History
            </button>
            <button 
              onClick={() => setPaneView('help')}
              className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${paneView === 'help' ? 'bg-white/5 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
            >
              Keyboard
            </button>
            {/* Close button for mobile split view */}
            <button 
              onClick={() => setShowPane(false)}
              className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {paneView === 'history' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2 pb-2">
                   <span className="text-[10px] font-black tracking-widest uppercase text-white/20">All time</span>
                   <button 
                     onClick={clearHistory}
                     className="text-[9px] font-black tracking-widest uppercase text-white/20 hover:text-red-400 transition-colors"
                   >
                     Clear History
                   </button>
                </div>
                {history.length === 0 ? (
                  <div className="py-20 text-center text-white/10 text-xs italic">
                    History is empty
                  </div>
                ) : (
                  history.map((item, idx) => (
                        <div key={item.id} className="history-row group flex flex-col bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all mb-2 last:mb-0">
                          <div className="flex justify-between items-center mb-1">
                             <div className="text-[9px] text-white/10 font-black tracking-widest uppercase">#{history.length - idx}</div>
                             <div className="flex gap-3">
                               <button 
                                 onClick={() => {
                                   setCurrentInput(item.rawInput + "‸");
                                   setCurrentSequence([...item.sequence]);
                                   setShowingResult(false);
                                 }}
                                 className="text-[9px] text-blue-400/40 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                               >
                                 Load
                               </button>
                           <button 
                             onClick={() => copyToClipboard(item.latex)}
                             className="text-[9px] text-white/5 hover:text-white/30 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                           >
                             LaTeX
                           </button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between overflow-hidden gap-3">
                        <div 
                          className="flex-shrink min-w-0 text-white/90 text-sm overflow-x-auto overflow-y-hidden whitespace-nowrap custom-scrollbar pb-1 lcd-screen-mini"
                          dangerouslySetInnerHTML={{ __html: formatMath(item.rawInput) }}
                        />
                        <div className="flex-shrink-0 text-white text-xl font-black tracking-tighter tabular-nums opacity-90 border-l border-white/10 pl-3">
                          {item.result.toLocaleString(undefined, { maximumFractionDigits: 10 })}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          className={`text-[9.5px] transition-all uppercase font-black tracking-[0.1em] cursor-pointer px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] ${expandedItem === item.id ? 'text-blue-400 border-blue-400/20' : 'text-white/30 hover:text-white/50'}`}
                        >
                          {expandedItem === item.id ? 'Hide Keys' : 'Show Keys'}
                        </button>
                      </div>
                      {expandedItem === item.id && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                          {item.sequence.map((label, i) => (
                            <React.Fragment key={i}>
                              {renderMiniButton(label, `${idx}-${i}`)}
                              {i < item.sequence.length - 1 && <span className="text-[10px] text-white/5 mx-1 font-black">›</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6 text-sm">
                <section>
                  <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                     Portable / Standalone
                  </h4>
                  <p className="text-white/60 text-[11px] leading-relaxed mb-3">
                    Share this app with colleagues for offline use:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                      <span><strong className="text-white/80">Desktop:</strong> Look for the <strong>Install</strong> icon in your browser's address bar.</span>
                    </li>
                    <li className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                      <span><strong className="text-white/80">Mobile:</strong> Open phone browser share menu and select <strong>"Add to Home Screen"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                      <span><strong className="text-white/80">Offline:</strong> Once installed, it works like a native app without internet!</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-blue-400 font-bold mb-2 uppercase text-[10px] tracking-widest">General</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Enter</kbd> <span>Solve/Equals</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Esc</kbd> <span>Clear (AC)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Backspace</kbd> <span>Delete (DEL)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Arrows</kbd> <span>Navigate cursor</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Shift</kbd> <span>Hold for Shift mode</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Alt</kbd> <span>Hold for Alpha mode</span></div>
                  </div>
                </section>
                <section>
                  <h4 className="text-blue-400 font-bold mb-2 uppercase text-[10px] tracking-widest">Math</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">S</kbd> <span>Sin</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">C</kbd> <span>Cos</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">T</kbd> <span>Tan</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">L</kbd> <span>Log / Sum</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">R</kbd> <span>Square Root</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Q</kbd> <span>Square (x²)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">^</kbd> <span>Power (xⁿ)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">A</kbd> <span>Answer (Ans)</span></div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;

