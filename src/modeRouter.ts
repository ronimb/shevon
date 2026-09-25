import { useCallback, useEffect, useRef } from 'react';
import { CalcError } from './types.ts';
import type { Vars } from './types.ts';
import { evaluateExpression, findPrecedingOperand, resultDisplayMode } from './evaluator.ts';
import { formatMath, toLaTeX } from './display.tsx';
import { DEFAULT_FORMAT } from './format.ts';
import {
  deleteCompAtCursor,
  insertCompValue,
  moveCompCursorDown,
  moveCompCursorLeft,
  moveCompCursorRight,
  moveCompCursorUp,
  placeCaretAtOffset,
  collectSolvePromptVars,
  expressionHasSolveUnknown,
  newtonSolveX,
  reconstructSequence,
  wrapFracTemplate,
  wrapPrecedingBinary,
} from './modes/comp.ts';
import {
  STAT_RESULT_TOP_OPTIONS,
  STAT_TYPES,
  appendStatRowIfRoom,
  applyStatDelete,
  applyStatDigit,
  calculateStatVars,
  getStatMaxRows,
  getStatSubMenuInsert,
  insertStatVar,
} from './modes/stat.tsx';
import {
  applyEqnDelete,
  applyEqnDigit,
  solveQuadratic,
} from './modes/eqn.tsx';
import { isReplayableHistory, MODE_LABEL, setupCommitSequence } from './historyOps.ts';
import type { CalculatorStore } from './useCalculatorState.ts';

export function useModeRouter(s: CalculatorStore) {
  const handleInput = useCallback((val: string) => {
    if (s.showHypMenu) {
      const hypMap: Record<string, string> = {
        '1': 'sinh(‸', '2': 'cosh(‸', '3': 'tanh(‸',
        '4': 'sinh⁻¹(‸', '5': 'cosh⁻¹(‸', '6': 'tanh⁻¹(‸',
      };
      if (hypMap[val]) {
        s.setShowHypMenu(false);
        s.setLcdError(null);
        const next = insertCompValue(s.currentInput, s.showingResult, hypMap[val]);
        s.setCurrentInput(next.input);
        s.setShowingResult(next.showingResult);
      }
      return;
    }
    if (s.promptVar) {
      if (!isNaN(Number(val)) || val === '.' || val === '-') {
        s.setPromptValue(prev => {
          if (prev === "0" && val !== '.') return val === '-' ? '-' : val;
          if (val === '-' && prev !== "") return prev;
          return prev + val;
        });
      }
      return;
    }
    if (s.calcMode === 'MENU') {
      const modeLabel = MODE_LABEL[val] ?? 'COMP';
      s.prependHistory({
        rawInput: modeLabel,
        displayInput: modeLabel,
        result: null,
        latex: '',
        sequence: ['MODE', val],
        kind: 'action',
      });
      if (val === '1') {
        s.setCalcMode('COMP');
        s.setStatType(null);
      }
      else if (val === '3') s.setCalcMode('STAT_MENU');
      else if (val === '5') s.setCalcMode('EQN_MENU');
      else {
        s.setCalcMode('COMP');
      }
      s.setCurrentInput("‸");
      return;
    }
    if (s.calcMode === 'STAT_MENU') {
      if (STAT_TYPES[val]) {
        const statLabel = STAT_TYPES[val];
        s.prependHistory({
          rawInput: `STAT ${statLabel}`,
          displayInput: `STAT ${statLabel}`,
          result: null,
          latex: '',
          sequence: ['MODE', '3', val],
          kind: 'action',
        });
        s.setStatType(statLabel);
        s.setCalcMode('STAT_DATA');
        s.setStatData([{ x: '', y: '', freq: '1' }]);
        s.setStatCursor({ row: 0, col: 0 });
      }
      return;
    }
    if (s.calcMode === 'STAT_DATA') {
      s.setStatData(prev => {
        const next = applyStatDigit(prev, s.statCursorRef.current.row, s.statCursorRef.current.col, s.statType, s.statFrequencyEnabled, val);
        return next === undefined ? prev : next;
      });
      return;
    }
    if (s.calcMode === 'STAT_RESULT') {
      if (val === '1') s.setCalcMode('STAT_MENU');
      else if (val === '2') s.setCalcMode('STAT_DATA');
      else if (STAT_RESULT_TOP_OPTIONS[val]) {
        s.setStatSubMenu(STAT_RESULT_TOP_OPTIONS[val]);
        s.setCalcMode('STAT_RESULT_SUB');
      }
      return;
    }
    if (s.calcMode === 'STAT_RESULT_SUB') {
      const inserted = getStatSubMenuInsert(s.statSubMenu, s.statType, val);
      if (inserted) {
        const next = insertStatVar(inserted, s.currentInput, s.showingResult);
        s.setCalcMode(next.calcMode);
        s.setLcdError(next.lcdError);
        s.setCurrentInput(next.currentInput);
        s.setShowingResult(next.showingResult);
      }
      return;
    }
    if (s.calcMode === 'SETUP') {
      if (s.setupPrompt) {
        if (s.setupPrompt === 'freq') {
          if (val === '1' || val === '2') {
            const on = val === '1';
            s.prependHistory({
              rawInput: `FREQ ${on ? 'ON' : 'OFF'}`,
              displayInput: `FREQ ${on ? 'ON' : 'OFF'}`,
              result: null,
              latex: '',
              sequence: setupCommitSequence('freq', val),
              kind: 'action',
            });
            s.setStatFrequencyEnabled(on);
            s.setStatData(prev => prev.slice(0, getStatMaxRows(s.statType, on)));
            s.setSetupPrompt(null);
            s.setSetupPage(0);
            s.setCalcMode('COMP');
          }
          return;
        }
        const d = parseInt(val, 10);
        if (!isNaN(d)) {
          if (s.setupPrompt === 'fix') {
            s.setDisplayFormat({ kind: 'fix', digits: Math.min(9, d) });
            s.prependHistory({ rawInput: `Fix ${d}`, displayInput: `Fix ${d}`, result: null, latex: '', sequence: setupCommitSequence('fix', val), kind: 'action' });
          } else if (s.setupPrompt === 'sci') {
            s.setDisplayFormat({ kind: 'sci', digits: d === 0 ? 10 : Math.min(10, d) });
            s.prependHistory({ rawInput: `Sci ${d}`, displayInput: `Sci ${d}`, result: null, latex: '', sequence: setupCommitSequence('sci', val), kind: 'action' });
          } else if (s.setupPrompt === 'norm') {
            s.setDisplayFormat({ kind: 'norm', n: d === 2 ? 2 : 1 });
            s.prependHistory({ rawInput: `Norm ${d === 2 ? 2 : 1}`, displayInput: `Norm ${d === 2 ? 2 : 1}`, result: null, latex: '', sequence: setupCommitSequence('norm', val), kind: 'action' });
          }
          s.setSetupPrompt(null);
          s.setSetupPage(0);
          s.setCalcMode('COMP');
        }
        return;
      }
      if (s.setupPage === 0) {
        if (val === '3') {
          s.prependHistory({ rawInput: 'Deg', displayInput: 'Deg', result: null, latex: '', sequence: setupCommitSequence('deg'), kind: 'action' });
          s.setAngleMode('DEG'); s.setCalcMode('COMP');
        }
        else if (val === '4') {
          s.prependHistory({ rawInput: 'Rad', displayInput: 'Rad', result: null, latex: '', sequence: setupCommitSequence('rad'), kind: 'action' });
          s.setAngleMode('RAD'); s.setCalcMode('COMP');
        }
        else if (val === '5') {
          s.prependHistory({ rawInput: 'Gra', displayInput: 'Gra', result: null, latex: '', sequence: setupCommitSequence('gra'), kind: 'action' });
          s.setAngleMode('GRA'); s.setCalcMode('COMP');
        }
        else if (val === '6') s.setSetupPrompt('fix');
        else if (val === '7') s.setSetupPrompt('sci');
        else if (val === '8') s.setSetupPrompt('norm');
        else { s.setCalcMode('COMP'); }
        return;
      }
      if (val === '1') {
        s.prependHistory({ rawInput: 'ab/c', displayInput: 'ab/c', result: null, latex: '', sequence: setupCommitSequence('mix'), kind: 'action' });
        s.setMixedFraction(true); s.setSetupPage(0); s.setCalcMode('COMP');
      }
      else if (val === '2') {
        s.prependHistory({ rawInput: 'd/c', displayInput: 'd/c', result: null, latex: '', sequence: setupCommitSequence('improper'), kind: 'action' });
        s.setMixedFraction(false); s.setSetupPage(0); s.setCalcMode('COMP');
      }
      else if (val === '3') s.setSetupPrompt('freq');
      else { s.setSetupPage(0); s.setCalcMode('COMP'); }
      return;
    }
    if (s.calcMode === 'CLR_MENU') {
      const resetSetup = () => {
        s.setDisplayFormat(DEFAULT_FORMAT);
        s.setAngleMode('DEG');
        s.setMixedFraction(false);
        s.setStatFrequencyEnabled(false);
      };
      const resetMemory = () => {
        s.setVars({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 });
        s.setAns(0);
        s.setHistory([]);
      };
      if (val === '1') resetSetup();
      else if (val === '2') resetMemory();
      else if (val === '3') { resetSetup(); resetMemory(); }
      else return;
      const clrLabel = val === '1' ? 'CLR Setup' : val === '2' ? 'CLR Memory' : 'CLR All';
      s.prependHistory({
        rawInput: clrLabel,
        displayInput: clrLabel,
        result: null,
        latex: '',
        sequence: ['SHIFT', '9', val],
        kind: 'action',
      });
      s.setCurrentInput('‸');
      s.setShowingResult(false);
      s.setCurrentSequence([]);
      s.setCalcMode('COMP');
      return;
    }
    if (s.calcMode === 'EQN_MENU') {
      if (val === '3') {
        s.prependHistory({
          rawInput: 'EQN quadratic',
          displayInput: 'EQN quadratic',
          result: null,
          latex: '',
          sequence: ['MODE', '5', '3'],
          kind: 'action',
        });
        s.setCalcMode('EQN_QUAD');
        s.setEqnCoeffs(["0", "0", "0"]);
        s.setEqnIndex(0);
      } else return;
      return;
    }
    if (s.calcMode === 'EQN_QUAD') {
      s.setEqnCoeffs(prev => applyEqnDigit(prev, s.eqnIndex, val) ?? prev);
      return;
    }
    if (s.calcMode === 'EQN_RESULT') {
      if (!isNaN(Number(val))) {
        s.setCalcMode('COMP');
        s.setCurrentInput(val + "‸");
      }
      return;
    }

    if (s.solveScreen) return;
    s.setLcdError(null);
    s.setEngMode(null);
    s.setDmsResult(false);
    s.setReplayIndex(-1);
    const next = insertCompValue(s.currentInput, s.showingResult, val);
    s.setCurrentInput(next.input);
    s.setShowingResult(next.showingResult);
  }, [s]);

  const handleModeSwitch = useCallback(() => {
    if (s.isShift) {
      s.setCalcMode('SETUP');
      s.setSetupPage(0);
      s.setSetupPrompt(null);
      s.setIsShift(false);
    } else {
      s.setCalcMode('MENU');
    }
  }, [s]);

  const performEvaluation = useCallback((scope?: Vars) => {
    if (!s.currentInput || s.currentInput.includes('→')) return null;
    const usedVars = scope ?? s.vars;
    try {
      s.setLcdError(null);
      let expr = s.currentInput;
      let openCount = (expr.match(/\(/g) || []).length, closeCount = (expr.match(/\)/g) || []).length;
      expr += ')'.repeat(Math.max(0, openCount - closeCount));

      const statVars = calculateStatVars(s.statType, s.statData, s.statFrequencyEnabled);
      let val = evaluateExpression(expr, usedVars, s.ans, s.angleMode, statVars, s.displayFormat);

      const raw = s.currentInput.replace('‸', '');
      const finalSequence = reconstructSequence(raw);

      return { val, raw, finalSequence };
    } catch (e) {
      if (e instanceof CalcError) s.setLcdError(e);
      else s.setLcdError(new CalcError('syntax'));
      return null;
    }
  }, [s]);

  const applyEvalSuccess = useCallback((evalRes: { val: number; raw: string; finalSequence: string[] }) => {
    const { val, raw, finalSequence } = evalRes;
    s.prependHistory({
      rawInput: raw,
      displayInput: formatMath(raw),
      result: val,
      latex: toLaTeX(raw),
      sequence: finalSequence,
      kind: 'calc',
    });
    s.setAns(val);
    s.setCurrentSequence([]);
    s.setLastValue(val);
    s.setShowingResult(true);
    s.setEngMode(null);
    s.setDmsResult(false);
    s.setReplayIndex(-1);
    s.setDisplayMode(resultDisplayMode(val));
  }, [s]);

  const runSolveNewton = useCallback((scope: Vars) => {
    try {
      const sVars = calculateStatVars(s.statType, s.statData, s.statFrequencyEnabled);
      const { x, residual } = newtonSolveX(
        s.currentInput.replace(/[‸⬚]/g, ''),
        scope,
        s.ans,
        s.angleMode,
        sVars,
      );
      s.setVars({ ...scope, X: x });
      s.setAns(x);
      s.setLastValue(x);
      s.setSolveResidual(residual);
      s.setSolveScreen('result');
      s.setShowingResult(true);
      s.setLcdError(null);
      s.setDisplayMode(resultDisplayMode(x));
    } catch (e) {
      if (e instanceof CalcError) s.setLcdError(e);
      else s.setLcdError(new CalcError('syntax'));
      s.setSolveScreen(null);
      s.solveAfterPromptsRef.current = false;
    }
  }, [s]);

  const handleCalc = useCallback(() => {
    if (s.isShift) {
      s.setIsShift(false);
      s.setLcdError(null);
      s.setSolveScreen(null);
      s.setShowingResult(false);
      const expr = s.currentInput.replace(/[‸⬚]/g, '');
      if (!expressionHasSolveUnknown(expr)) {
        s.setLcdError(new CalcError('variable'));
        s.solveAfterPromptsRef.current = false;
        return;
      }
      s.solveAfterPromptsRef.current = true;
      const others = collectSolvePromptVars(expr);
      if (others.length > 0) {
        s.setPromptVarsQueue(others);
        const first = others[0];
        s.setPromptVar(first);
        s.setPromptValue('0');
        s.setPrevPromptValue(String(s.vars[first] ?? 0));
      } else {
        s.setPromptVar(null);
        s.setPromptVarsQueue([]);
        s.setSolveScreen('confirm');
      }
      return;
    }
    if (s.isAlpha) {
      handleInput('=');
      s.setIsAlpha(false);
      return;
    }

    const varsInExpr = Array.from(new Set(s.currentInput.match(/[A-MYX]/g) || []));
    if (varsInExpr.length > 0) {
      s.setPromptVarsQueue(varsInExpr);
      const firstVar = varsInExpr[0];
      s.setPromptVar(firstVar);
      s.setPromptValue("0");
      s.setPrevPromptValue(s.vars[firstVar]?.toString() || "0");
    } else {
      s.solveRef.current();
    }
  }, [s, handleInput]);

  const tackleNextPrompt = useCallback(() => {
    if (!s.promptVar) return;

    const val = parseFloat(s.promptValue) || parseFloat(s.prevPromptValue) || 0;
    const merged = { ...s.vars, [s.promptVar]: val };
    s.setVars(merged);

    const nextQueue = s.promptVarsQueue.slice(1);
    s.setPromptVarsQueue(nextQueue);

    if (nextQueue.length > 0) {
      const nextVar = nextQueue[0];
      s.setPromptVar(nextVar);
      s.setPromptValue("0");
      s.setPrevPromptValue(String(merged[nextVar] ?? 0));
    } else {
      s.setPromptVar(null);
      if (s.solveAfterPromptsRef.current) {
        s.setSolveScreen('confirm');
      } else {
        const evalRes = performEvaluation(merged);
        if (evalRes) applyEvalSuccess(evalRes);
      }
    }
  }, [s, performEvaluation, applyEvalSuccess]);

  const solve = useCallback(() => {
    if (s.solveScreen === 'confirm') {
      runSolveNewton(s.vars);
      return;
    }
    if (s.solveScreen === 'result') {
      s.setSolveScreen('continue');
      s.setShowingResult(false);
      return;
    }
    if (s.solveScreen === 'continue') {
      s.setSolveScreen('confirm');
      return;
    }
    if (s.promptVar) {
      tackleNextPrompt();
      return;
    }
    if (s.calcMode === 'STAT_DATA') {
      const isTwoVar = s.statType !== '1-VAR';
      const maxCol = (isTwoVar ? 1 : 0) + (s.statFrequencyEnabled ? 1 : 0);

      s.setStatCursor(prev => {
        if (prev.col < maxCol) return { ...prev, col: prev.col + 1 };
        const nextRow = prev.row + 1;
        s.setStatData(d => {
          if (nextRow >= d.length) return appendStatRowIfRoom(d, s.statType, s.statFrequencyEnabled);
          return d;
        });
        if (nextRow >= getStatMaxRows(s.statType, s.statFrequencyEnabled)) return prev;
        return { row: nextRow, col: 0 };
      });
      return;
    }
    if (s.calcMode === 'MENU') {
      s.setCalcMode('COMP');
      return;
    }
    if (s.calcMode === 'EQN_QUAD') {
      if (s.eqnIndex < 2) {
        s.setEqnIndex(prev => prev + 1);
        return;
      }
      const results = solveQuadratic(
        parseFloat(s.eqnCoeffs[0]) || 0,
        parseFloat(s.eqnCoeffs[1]) || 0,
        parseFloat(s.eqnCoeffs[2]) || 0,
      );
      s.setEqnResults(results);
      s.setCalcMode('EQN_RESULT');
      s.setEqnResultIdx(0);
      return;
    }

    if (s.calcMode === 'EQN_RESULT') {
      if (s.eqnResultIdx < s.eqnResults.length - 1) {
        s.setEqnResultIdx(prev => prev + 1);
      } else {
        s.setCalcMode('EQN_QUAD');
        s.setEqnIndex(2);
      }
      return;
    }

    const evalRes = performEvaluation();
    if (evalRes) applyEvalSuccess(evalRes);
  }, [s, performEvaluation, applyEvalSuccess, tackleNextPrompt, runSolveNewton]);

  useEffect(() => {
    s.solveRef.current = solve;
  }, [s, solve]);

  const del = useCallback(() => {
    if (s.promptVar) {
      s.setPromptValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
      return;
    }
    s.setReplayIndex(-1);
    if (s.calcMode === 'STAT_DATA') {
      s.setStatData(prev => applyStatDelete(prev, s.statCursor.row, s.statCursor.col, s.statType, s.statFrequencyEnabled));
      return;
    }
    if (s.calcMode === 'EQN_QUAD') {
      s.setEqnCoeffs(prev => applyEqnDelete(prev, s.eqnIndex));
      return;
    }
    if (s.showingResult) {
      s.setShowingResult(false);
      s.setCurrentSequence([]);
      return;
    }

    const nextInput = deleteCompAtCursor(s.currentInput);
    if (nextInput === null) return;
    s.setCurrentSequence(prev => prev.slice(0, -1));
    s.setCurrentInput(nextInput);
  }, [s]);

  const clearAll = useCallback(() => {
    if (s.calcMode === 'STAT_DATA' || s.calcMode === 'STAT_MENU' || s.calcMode === 'STAT_RESULT' || s.calcMode === 'STAT_RESULT_SUB') {
      s.setCalcMode('COMP');
      return;
    }
    if (s.calcMode === 'EQN_QUAD' || s.calcMode === 'EQN_RESULT') {
      s.setEqnCoeffs(["0", "0", "0"]);
      s.setEqnIndex(0);
      s.setCalcMode('EQN_QUAD');
      s.setCurrentSequence([]);
      return;
    }
    if (s.solveScreen || (s.promptVar && s.solveAfterPromptsRef.current)) {
      s.setSolveScreen(null);
      s.setPromptVar(null);
      s.setPromptVarsQueue([]);
      s.setShowingResult(false);
      s.setLcdError(null);
      s.solveAfterPromptsRef.current = false;
      return;
    }
    s.setCurrentInput("‸");
    s.setCurrentSequence([]);
    s.setShowingResult(false);
    s.setIsShift(false);
    s.setIsAlpha(false);
    s.setIsSto(false);
    s.setIsRcl(false);
    s.setCalcMode('COMP');
    s.setLcdError(null);
    s.setSolveScreen(null);
    s.setPromptVar(null);
    s.setPromptVarsQueue([]);
    s.solveAfterPromptsRef.current = false;
    s.setShowHypMenu(false);
    s.setSetupPrompt(null);
    s.setSetupPage(0);
    s.setEngMode(null);
    s.setDmsResult(false);
    s.setReplayIndex(-1);
  }, [s]);

  const dismissLcdError = useCallback(() => {
    if (!s.lcdError) return false;
    if (
      (s.lcdError.kind === 'syntax' || s.lcdError.kind === 'math') &&
      s.lcdError.offset !== undefined
    ) {
      s.setCurrentInput(placeCaretAtOffset(s.currentInput, s.lcdError.offset));
      s.setShowingResult(false);
    }
    s.setLcdError(null);
    return true;
  }, [s]);

  const handleRight = useCallback(() => {
    if (dismissLcdError()) return;
    if (s.solveScreen) return;
    if (s.calcMode === 'STAT_DATA') {
      const isTwoVar = s.statType !== '1-VAR';
      const maxCol = (isTwoVar ? 1 : 0) + (s.statFrequencyEnabled ? 1 : 0);
      s.setStatCursor(prev => ({ ...prev, col: Math.min(maxCol, prev.col + 1) }));
      return;
    }
    if (s.calcMode === 'EQN_QUAD') {
      s.setEqnIndex(prev => (prev + 1) % 3);
      return;
    }
    if (s.showingResult) { s.setShowingResult(false); return; }
    s.setCurrentInput(moveCompCursorRight(s.currentInput));
  }, [s, dismissLcdError]);

  const handleLeft = useCallback(() => {
    if (dismissLcdError()) return;
    if (s.solveScreen) return;
    if (s.calcMode === 'STAT_DATA') {
      s.setStatCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
      return;
    }
    if (s.calcMode === 'EQN_QUAD') {
      s.setEqnIndex(prev => (prev + 2) % 3);
      return;
    }
    if (s.showingResult) { s.setShowingResult(false); return; }
    s.setCurrentInput(moveCompCursorLeft(s.currentInput));
  }, [s, dismissLcdError]);

  const handleDown = useCallback(() => {
    if (s.calcMode === 'SETUP') { s.setSetupPage(p => (p === 0 ? 1 : 0)); return; }
    if (s.solveScreen || s.promptVar) return;
    if (s.calcMode === 'COMP' && s.replayIndex >= 0) {
      let idx = s.replayIndex - 1;
      while (idx >= 0 && !isReplayableHistory(s.history[idx])) idx--;
      if (idx < 0) {
        s.setReplayIndex(-1);
        s.setCurrentInput('‸');
        s.setCurrentSequence([]);
      } else {
        s.setReplayIndex(idx);
        s.setCurrentInput(s.history[idx].rawInput + '‸');
        s.setCurrentSequence([...s.history[idx].sequence]);
      }
      return;
    }
    if (s.calcMode === 'STAT_DATA') {
      s.setStatCursor(prev => {
        const nextRow = prev.row + 1;
        s.setStatData(d => {
          if (nextRow >= d.length) return appendStatRowIfRoom(d, s.statType, s.statFrequencyEnabled);
          return d;
        });
        if (nextRow >= getStatMaxRows(s.statType, s.statFrequencyEnabled)) return prev;
        return { ...prev, row: nextRow };
      });
      return;
    }
    if (s.calcMode === 'EQN_RESULT') {
      if (s.eqnResultIdx < s.eqnResults.length - 1) {
        s.setEqnResultIdx(prev => prev + 1);
      }
      return;
    }
    s.setCurrentInput(moveCompCursorDown(s.currentInput));
  }, [s]);

  const handleUp = useCallback(() => {
    if (s.calcMode === 'SETUP') { s.setSetupPage(p => (p === 0 ? 1 : 0)); return; }
    if (s.solveScreen || s.promptVar) return;
    const blankLive = s.currentInput === '‸';
    if (s.calcMode === 'COMP' && s.history.length > 0 && (s.showingResult || s.replayIndex >= 0 || blankLive)) {
      let idx = s.replayIndex < 0 ? 0 : s.replayIndex + 1;
      while (idx < s.history.length && !isReplayableHistory(s.history[idx])) idx++;
      const item = s.history[idx];
      if (item && item.result !== null) {
        s.setReplayIndex(idx);
        s.setShowingResult(true);
        s.setAns(item.result);
        s.setLastValue(item.result);
        s.setDisplayMode(resultDisplayMode(item.result));
        s.setLcdError(null);
        s.setEngMode(null);
        s.setDmsResult(false);
        s.setCurrentInput(item.rawInput + '‸');
        s.setCurrentSequence([...item.sequence]);
      }
      return;
    }
    if (s.calcMode === 'STAT_DATA') {
      s.setStatCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
      return;
    }
    if (s.calcMode === 'EQN_RESULT') {
      if (s.eqnResultIdx > 0) {
        s.setEqnResultIdx(prev => prev - 1);
      }
      return;
    }
    s.setCurrentInput(moveCompCursorUp(s.currentInput));
  }, [s]);

  const toggleSD = useCallback(() => {
    if (!s.showingResult) return;
    s.setDisplayMode(prev => {
      if (prev === 'fraction') return 'decimal';
      return resultDisplayMode(s.ans) === 'fraction' ? 'fraction' : 'decimal';
    });
  }, [s]);

  const handleAlphaVarRef = useRef<((v: string) => void) | null>(null);
  const handleTrigRef = useRef<((type: string, v: string) => void) | null>(null);
  const handleParenthesesRef = useRef<((type: string, v: string) => void) | null>(null);

  const handleMemory = useCallback((action: string, v?: string) => {
    if (v === 'M' && s.isAlpha) {
      handleInput('M');
      s.setIsAlpha(false);
      s.setIsShift(false);
      return;
    }

    if (action === 'plus_minus') {
      let valToUse = s.ans;
      if (!s.showingResult) {
        const evalRes = performEvaluation();
        if (evalRes) {
          valToUse = evalRes.val;
          s.setAns(evalRes.val);
          s.prependHistory({
            rawInput: evalRes.raw,
            displayInput: formatMath(evalRes.raw),
            result: evalRes.val,
            latex: toLaTeX(evalRes.raw),
            sequence: [...evalRes.finalSequence, s.isShift ? 'SHIFT' : '', 'M+'].filter(Boolean),
            kind: 'calc',
          });
          s.setLastValue(evalRes.val);
          s.setShowingResult(true);
          s.setDisplayMode(resultDisplayMode(evalRes.val));
        } else {
          return;
        }
      }
      s.setVars(prev => ({ ...prev, M: s.isShift ? prev.M - valToUse : prev.M + valToUse }));
      if (s.showingResult) {
        s.prependHistory({
          rawInput: s.isShift ? 'M−' : 'M+',
          displayInput: s.isShift ? 'M−' : 'M+',
          result: valToUse,
          latex: '',
          sequence: s.isShift ? ['SHIFT', 'M+'] : ['M+'],
          kind: 'action',
        });
      }
    } else if (action === 'rcl_sto') {
      if (s.isShift) { s.setIsSto(true); s.setIsRcl(false); }
      else { s.setIsRcl(true); s.setIsSto(false); }
    }
    s.setIsShift(false);
    s.setIsAlpha(false);
  }, [s, handleInput, performEvaluation]);

  const handleAlphaVar = useCallback((v: string) => {
    if (s.isSto) {
      let beforeText = s.currentInput.replace('‸', '');
      let operand = findPrecedingOperand(beforeText);
      let storedRaw = '';
      let storedVal = s.ans;

      if (s.showingResult || !operand || beforeText === '') {
        s.setVars(prev => ({ ...prev, [v]: s.ans }));
        storedRaw = `Ans→${v}`;
        s.setCurrentInput(`${storedRaw}‸`);
      } else {
        try {
          const sVars = calculateStatVars(s.statType, s.statData, s.statFrequencyEnabled);
          storedVal = evaluateExpression(operand.replace(/Ans/g, String(s.ans)), { ...s.vars }, s.ans, s.angleMode, sVars);
          s.setVars(prev => ({ ...prev, [v]: storedVal }));
          s.setAns(storedVal);
          s.setLastValue(storedVal);
          s.setDisplayMode(resultDisplayMode(storedVal));
          storedRaw = beforeText + `→${v}`;
          s.setCurrentInput(storedRaw + '‸');
        } catch {
          s.setVars(prev => ({ ...prev, [v]: s.ans }));
          storedRaw = beforeText + `→${v}`;
          s.setCurrentInput(storedRaw + '‸');
        }
      }
      s.prependHistory({
        rawInput: storedRaw,
        displayInput: formatMath(storedRaw),
        result: storedVal,
        latex: toLaTeX(storedRaw),
        sequence: reconstructSequence(storedRaw),
        kind: 'action',
      });
      s.setShowingResult(true);
      s.setIsSto(false);
      s.setIsShift(false);
      s.setIsAlpha(false);
    } else if (s.isRcl) {
      handleInput(v);
      s.setIsRcl(false);
      s.setIsShift(false);
      s.setIsAlpha(false);
    } else if (s.isAlpha) {
      handleInput(v);
      s.setIsAlpha(false);
      s.setIsShift(false);
    } else {
      if (v === 'A') handleInput('-');
      if (v === 'B') {
        if (s.showingResult) s.setDmsResult(prev => !prev);
        else handleInput('°');
      }
      if (v === 'C') {
        if (s.isShift) { handleInput('abs(‸'); s.setIsShift(false); }
        else s.setShowHypMenu(true);
      }
      if (v === 'D') handleTrigRef.current?.('sin', 'D');
      if (v === 'E') handleTrigRef.current?.('cos', 'E');
      if (v === 'F') handleTrigRef.current?.('tan', 'F');
      if (v === 'X') handleParenthesesRef.current?.(')', 'X');
      if (v === 'Y') toggleSD();
      if (v === 'M') handleMemory('plus_minus', 'M');
    }
  }, [s, handleInput, toggleSD, handleMemory]);

  handleAlphaVarRef.current = handleAlphaVar;

  const handleTrig = useCallback((type: string, v: string) => {
    if (s.isSto || s.isRcl || s.isAlpha) {
      handleAlphaVar(v);
    } else {
      handleInput(type + (s.isShift ? '⁻¹(‸' : '(‸'));
      s.setIsShift(false);
    }
  }, [s, handleInput, handleAlphaVar]);

  handleTrigRef.current = handleTrig;

  const handleParentheses = useCallback((type: string, v: string, forceNormal?: boolean) => {
    if ((s.isSto || s.isRcl || s.isAlpha) && !forceNormal) {
      handleAlphaVar(v);
    }
    else if (s.isShift && !forceNormal) {
      handleInput(type === '(' ? '%' : ',');
      s.setIsShift(false);
    }
    else {
      handleInput(type);
    }
  }, [s, handleInput, handleAlphaVar]);

  handleParenthesesRef.current = handleParentheses;

  const handleFracKey = useCallback(() => {
    if (s.isShift) {
      handleInput("mix(‸,,)");
    } else {
      const wrapped = wrapFracTemplate(s.currentInput, s.showingResult);
      if (wrapped.insertInstead) {
        handleInput(wrapped.insertInstead);
      } else {
        s.setCurrentInput(wrapped.input);
        s.setShowingResult(wrapped.showingResult);
      }
    }
    s.setIsShift(false);
  }, [s, handleInput]);

  const handlePermComb = useCallback((type: 'P' | 'C') => {
    if (!s.isShift) {
      handleInput(type === 'P' ? '×' : '÷');
      return;
    }
    const wrapped = wrapPrecedingBinary(s.currentInput, s.showingResult, type === 'P' ? 'nPr' : 'nCr');
    s.setCurrentInput(wrapped.input);
    s.setShowingResult(wrapped.showingResult);
    s.setIsShift(false);
  }, [s, handleInput]);

  const handleIntegralKey = useCallback(() => {
    if (s.isShift) handleInput("diff(‸,x,)");
    else handleInput("int(‸,,,x)");
    s.setIsShift(false);
  }, [s, handleInput]);

  const handleSquareKey = useCallback(() => {
    let parts = s.currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    let symbol = s.isShift ? '³' : '²';

    if (s.showingResult) {
      s.setCurrentInput(`Ans${symbol}‸`);
      s.setShowingResult(false);
      return;
    }

    s.setCurrentInput(before + `${symbol}‸` + after);
    s.setIsShift(false);
  }, [s]);

  const handleExpKey = useCallback(() => {
    if (s.isShift) handleInput('π');
    else if (s.isAlpha) handleInput('e');
    else handleInput('×10^');
    s.setIsShift(false); s.setIsAlpha(false);
  }, [s, handleInput]);

  const handleEng = useCallback(() => {
    if (!s.showingResult) { s.setIsShift(false); return; }
    const shiftUp = s.isShift;
    s.setEngMode(prev => {
      if (prev === null) return 0;
      return shiftUp ? prev + 1 : prev - 1;
    });
    s.setIsShift(false);
  }, [s]);

  const handleDotKey = useCallback(() => {
    if (s.isShift) { handleInput('Ran#'); s.setIsShift(false); }
    else if (s.isAlpha) { handleInput('RanInt(‸,'); s.setIsAlpha(false); }
    else handleInput('.');
  }, [s, handleInput]);

  const handlePowerKey = useCallback((arg?: unknown) => {
    const forcePwr = arg === true;
    let parts = s.currentInput.split('‸');
    let before = parts[0], after = parts[1] || '';
    let operand = findPrecedingOperand(before);

    if (s.isShift && !forcePwr) {
      if (operand) {
        s.setCurrentInput(before.slice(0, -operand.length) + `root(${operand},‸)` + after);
      } else {
        s.setCurrentInput(before + `root(‸,)` + after);
      }
    } else {
      if (operand) {
        s.setCurrentInput(before + `^(‸)` + after);
      } else {
        s.setCurrentInput(before + `pwr(‸,)` + after);
      }
    }
    s.setIsShift(false);
  }, [s]);

  const handleFactorialKey = useCallback(() => {
    if (s.isShift) handleInput('!'); else handleInput('^-1');
    s.setIsShift(false);
  }, [s, handleInput]);

  const handleSquareRootKey = useCallback(() => {
    if (s.isShift) handleInput('root(3,‸)'); else handleInput('sqrt(‸)');
    s.setIsShift(false);
  }, [s, handleInput]);

  const handleLogKey = useCallback(() => {
    if (s.isShift) handleInput('Σ(‸,x,0,10)'); else handleInput('log_b(‸,');
    s.setIsShift(false);
  }, [s, handleInput]);

  const handleOpKey = useCallback((normal: string, shift: string) => {
    if (s.isShift) {
      if (shift === 'nCr') handlePermComb('C');
      else if (shift === 'nPr') handlePermComb('P');
      else if (shift === 'pol') handleInput('pol(‸,');
      else if (shift === 'rec') handleInput('rec(‸,');
      else handleInput(shift);
    } else {
      handleInput(normal);
    }
    s.setIsShift(false);
  }, [s, handleInput, handlePermComb]);

  const handleLog10Key = useCallback(() => {
    handleOpKey('log10(‸', '10^(‸)');
  }, [handleOpKey]);

  const handleAddKey = useCallback(() => { handleOpKey('+', 'pol'); }, [handleOpKey]);
  const handleSubKey = useCallback(() => { handleOpKey('-', 'rec'); }, [handleOpKey]);
  const handleMulKey = useCallback(() => { handleOpKey('×', 'nPr'); }, [handleOpKey]);
  const handleDivKey = useCallback(() => { handleOpKey('÷', 'nCr'); }, [handleOpKey]);

  const handleDigit0 = useCallback(() => {
    if (s.isShift) { handleInput('Rnd(‸'); s.setIsShift(false); }
    else handleInput('0');
  }, [s, handleInput]);

  const handleDigit1 = useCallback(() => {
    if (s.isShift && s.statType !== null) {
      s.setCalcMode('STAT_RESULT');
      s.setIsShift(false);
    } else {
      handleInput('1');
    }
  }, [s, handleInput]);

  const handleDigit9 = useCallback(() => {
    if (s.isShift) { s.setCalcMode('CLR_MENU'); s.setIsShift(false); }
    else handleInput('9');
  }, [s, handleInput]);

  const handleOpenParen = useCallback(() => {
    handleParentheses('(', '');
  }, [handleParentheses]);

  const setShiftMomentary = useCallback((val: boolean) => {
    s.setIsShift(val);
    if (val) s.setIsAlpha(false);
  }, [s]);

  const setAlphaMomentary = useCallback((val: boolean) => {
    s.setIsAlpha(val);
    if (val) s.setIsShift(false);
  }, [s]);

  return {
    handleInput,
    handleModeSwitch,
    handleCalc,
    solve,
    del,
    clearAll,
    handleRight,
    handleLeft,
    handleUp,
    handleDown,
    handleAlphaVar,
    handleTrig,
    handleParentheses,
    handleFracKey,
    handleIntegralKey,
    handleSquareKey,
    handleExpKey,
    handleEng,
    handleDotKey,
    handlePowerKey,
    handleFactorialKey,
    handleSquareRootKey,
    handleLogKey,
    handleLog10Key,
    handleAddKey,
    handleSubKey,
    handleMulKey,
    handleDivKey,
    handleDigit0,
    handleDigit1,
    handleDigit9,
    handleOpenParen,
    handleOpKey,
    handleMemory,
    setShiftMomentary,
    setAlphaMomentary,
  };
}
