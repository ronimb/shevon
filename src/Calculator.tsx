import React, { useState, useEffect, useRef } from 'react';
import calculatorImg from './calculator_new.png';
import type { KeyStyle } from './types.ts';
import { INITIAL_KEY_STYLES } from './keys.ts';
import { renderMiniButton } from './historyKeys.tsx';
import { isReplayableHistory, liveOperationSequence } from './historyOps.ts';
import { formatMath } from './display.tsx';
import { LcdScreen } from './lcd.tsx';
import { useKeyFlash, usePcKeyboard } from './keyboard.ts';
import { useCalculatorState } from './useCalculatorState.ts';
import { useModeRouter } from './modeRouter.ts';

const Calculator: React.FC = () => {
  const [keyStyles] = useState<Record<string, KeyStyle>>(() => {
    try {
      const saved = localStorage.getItem('calc_flash_map_styles');
      if (saved) return { ...INITIAL_KEY_STYLES, ...JSON.parse(saved) };
    } catch { /* keep defaults */ }
    return INITIAL_KEY_STYLES;
  });

  const keysRootRef = useRef<HTMLDivElement>(null);
  const { flashKey, unflashKey } = useKeyFlash(keysRootRef);

  const [scale, setScale] = useState(1);
  const [showPane, setShowPane] = useState<boolean>(false);
  const [showCurrentKeys, setShowCurrentKeys] = useState<boolean>(() => localStorage.getItem('calc_show_current_keys_on') === '1');
  const [paneView, setPaneView] = useState<'history' | 'help'>('history');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const store = useCalculatorState();
  const actions = useModeRouter(store);

  useEffect(() => {
    const handleResize = () => {
      const stripH = showCurrentKeys ? 110 : 0;
      const paneW = showPane && window.innerWidth >= 768 ? 398 : 0;
      const availH = Math.max(320, window.innerHeight - stripH - 40);
      const availW = Math.max(280, window.innerWidth - paneW - 40);
      setScale(Math.min(1, availH / 1000, availW / 504));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showCurrentKeys, showPane]);

  useEffect(() => {
    localStorage.setItem('calc_show_current_keys_on', showCurrentKeys ? '1' : '0');
  }, [showCurrentKeys]);

  usePcKeyboard({
    setShiftMomentary: actions.setShiftMomentary,
    setAlphaMomentary: actions.setAlphaMomentary,
    setCurrentSequence: store.setCurrentSequence,
    clearAll: actions.clearAll,
    del: actions.del,
    solve: actions.solve,
    handleRight: actions.handleRight,
    handleLeft: actions.handleLeft,
    handleUp: actions.handleUp,
    handleDown: actions.handleDown,
    handleInput: actions.handleInput,
    handleCalc: actions.handleCalc,
    handleParentheses: actions.handleParentheses,
    handleTrig: actions.handleTrig,
    handleLog10Key: actions.handleLog10Key,
    handleDotKey: actions.handleDotKey,
    handleSubKey: actions.handleSubKey,
    handleDivKey: actions.handleDivKey,
    handleDigit0: actions.handleDigit0,
    handleDigit1: actions.handleDigit1,
    handleDigit9: actions.handleDigit9,
    handleSquareRootKey: actions.handleSquareRootKey,
    handleSquareKey: actions.handleSquareKey,
    handlePowerKey: actions.handlePowerKey,
    handleAlphaVar: actions.handleAlphaVar,
    flashKey,
    unflashKey,
    isShift: store.isShift,
    isAlpha: store.isAlpha,
    isSto: store.isSto,
    isRcl: store.isRcl,
  });

  const withFlash = (fn: (e?: React.MouseEvent<HTMLButtonElement>) => void, label?: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (label) store.setCurrentSequence(prev => [...prev, label]);
    fn(e);
  };

  const clearHistory = () => {
    store.setHistory([]);
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
        data-key={id}
        className={`key ${className}`}
        style={inlineStyle}
        onMouseDown={() => {
          if (momentary) momentary.onDown();
        }}
        onMouseUp={() => {
           if (momentary) momentary.onUp();
        }}
        onMouseLeave={() => {
          if (momentary) momentary.onUp();
        }}
        onPointerDown={(e) => {
          flashKey(id);
          if (momentary) {
            e.currentTarget.setPointerCapture(e.pointerId);
            momentary.onDown();
          }
        }}
        onPointerUp={() => {
          if (momentary) momentary.onUp();
        }}
        onClick={(e) => {
          if (momentary) return;
          e.stopPropagation();
          action(e);
        }}
      />
    );
  };

  const liveKeys = liveOperationSequence({
    calcMode: store.calcMode,
    setupPage: store.setupPage,
    setupPrompt: store.setupPrompt,
    isSto: store.isSto,
    isRcl: store.isRcl,
    currentInput: store.currentInput,
    isShift: store.isShift,
    solveScreen: store.solveScreen,
    lcdErrorKind: store.lcdError?.kind ?? null,
  });

  const renderKeyRow = (seq: string[], keyPrefix: string) => (
    <div className="flex flex-wrap gap-1.5 items-center">
      {seq.map((label, i) => (
        <React.Fragment key={`${keyPrefix}-${i}`}>
          {renderMiniButton(label, `${keyPrefix}-${i}`)}
          {i < seq.length - 1 && <span className="text-[10px] text-white/15 mx-1 font-black">›</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col bg-[#121212] min-h-screen m-0 overflow-x-hidden font-sans">
      <button
        type="button"
        onClick={() => setShowCurrentKeys(v => !v)}
        className="fixed top-4 left-4 z-50 px-3 py-2 bg-[#1c1c1c] text-[10px] font-black tracking-widest uppercase text-blue-400/80 rounded-full shadow-lg border border-white/10 hover:bg-[#2a2a2a]"
      >
        {showCurrentKeys ? 'Hide keys' : 'Show keys'}
      </button>
      {showCurrentKeys && (
        <div className="current-keys-strip w-full border-b border-white/10 pl-32 pr-16 py-3">
          <span className="block text-[10px] font-black tracking-widest uppercase text-white/25 mb-1.5">Current keys</span>
          {liveKeys.length === 0 ? (
            <div className="text-[11px] text-white/20 italic">No current operation</div>
          ) : (
            renderKeyRow(liveKeys, 'live')
          )}
        </div>
      )}
    <div className="flex flex-col md:flex-row justify-center items-start p-5 gap-8 flex-1">
      <button
        onClick={() => setShowPane(!showPane)}
        className="fixed top-4 right-4 z-50 p-3 bg-[#1c1c1c] text-white/80 rounded-full shadow-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors"
        title="Toggle History & Help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </button>

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
            ref={keysRootRef}
            className="calc-container relative w-[504px] h-[1000px] rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{
              backgroundImage: `url(${calculatorImg})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          >

        <LcdScreen
          isShift={store.isShift}
          isAlpha={store.isAlpha}
          isSto={store.isSto}
          isRcl={store.isRcl}
          vars={store.vars}
          statType={store.statType}
          angleMode={store.angleMode}
          displayFormat={store.displayFormat}
          displayMode={store.displayMode}
          mixedFraction={store.mixedFraction}
          calcMode={store.calcMode}
          showingResult={store.showingResult}
          lcdError={store.lcdError}
          solveScreen={store.solveScreen}
          solveResidual={store.solveResidual}
          promptVar={store.promptVar}
          promptValue={store.promptValue}
          prevPromptValue={store.prevPromptValue}
          currentInput={store.currentInput}
          ans={store.ans}
          history={store.history}
          replayIndex={store.replayIndex}
          eqnCoeffs={store.eqnCoeffs}
          eqnIndex={store.eqnIndex}
          eqnResults={store.eqnResults}
          eqnResultIdx={store.eqnResultIdx}
          showHypMenu={store.showHypMenu}
          setupPrompt={store.setupPrompt}
          setupPage={store.setupPage}
          statFrequencyEnabled={store.statFrequencyEnabled}
          statData={store.statData}
          statCursor={store.statCursor}
          statSubMenu={store.statSubMenu}
          engMode={store.engMode}
          dmsResult={store.dmsResult}
        />

        {renderMappingKey('calc', withFlash(actions.handleCalc, 'CALC'), 'sci sr1 sc1')}
        {renderMappingKey('integral', withFlash(actions.handleIntegralKey, '∫'), 'sci sr1 sc2')}
        {renderMappingKey('inv', withFlash(actions.handleFactorialKey, 'x-1'), 'sci sr1 sc5')}
        {renderMappingKey('log', withFlash(actions.handleLogKey, 'log_box'), 'sci sr1 sc6')}

        {renderMappingKey('frac', withFlash(actions.handleFracKey, 'frac'), 'key-frac')}
        {renderMappingKey('sqrt', withFlash(actions.handleSquareRootKey, '√'), 'sci sr2 sc2')}
        {renderMappingKey('sqr', withFlash(actions.handleSquareKey, 'x²'), 'sci sr2 sc3')}
        {renderMappingKey('pwr', withFlash(actions.handlePowerKey, 'xⁿ'), 'sci sr2 sc4')}
        {renderMappingKey('log10', withFlash(actions.handleLog10Key, 'log'), 'sci sr2 sc5')}
        {renderMappingKey('ln', withFlash(() => actions.handleOpKey('ln(‸', 'e^(‸)'), 'ln'), 'sci sr2 sc6')}

        {renderMappingKey('A', withFlash(() => actions.handleAlphaVar('A'), '(-)'), 'sci sr3 sc1')}
        {renderMappingKey('B', withFlash(() => actions.handleAlphaVar('B'), '°\'"'), 'sci sr3 sc2')}
        {renderMappingKey('C', withFlash(() => actions.handleAlphaVar('C'), 'hyp'), 'sci sr3 sc3')}
        {renderMappingKey('sin', withFlash(() => actions.handleTrig('sin', 'D'), 'sin'), 'sci sr3 sc4')}
        {renderMappingKey('cos', withFlash(() => actions.handleTrig('cos', 'E'), 'cos'), 'sci sr3 sc5')}
        {renderMappingKey('tan', withFlash(() => actions.handleTrig('tan', 'F'), 'tan'), 'sci sr3 sc6')}

        {renderMappingKey('rcl', withFlash(() => actions.handleMemory('rcl_sto'), 'RCL'), 'sci sr4 sc1')}
        {renderMappingKey('eng', withFlash(actions.handleEng, 'ENG'), 'sci sr4 sc2')}
        {renderMappingKey('paren-open', withFlash(actions.handleOpenParen, '('), 'sci sr4 sc3')}
        {renderMappingKey('paren-close', withFlash(() => actions.handleAlphaVar('X'), ')'), 'sci sr4 sc4')}
        {renderMappingKey('sd', withFlash(() => actions.handleAlphaVar('Y'), 'S⇔D'), 'key-sd')}
        {renderMappingKey('mplus', withFlash(() => actions.handleAlphaVar('M'), 'M+'), 'key-mplus')}

        {renderMappingKey('up', withFlash(actions.handleUp, 'UP'), 'key-up')}
        {renderMappingKey('down', withFlash(actions.handleDown, 'DOWN'), 'key-down')}
        {renderMappingKey('left', withFlash(actions.handleLeft, 'LEFT'), 'key-left')}
        {renderMappingKey('right', withFlash(actions.handleRight, 'RIGHT'), 'key-right')}
        {renderMappingKey('shift', withFlash(() => {
          store.setIsShift(prev => !prev);
          store.setIsAlpha(false);
        }, 'SHIFT'), 'key-shift')}
        {renderMappingKey('alpha', withFlash(() => {
          store.setIsAlpha(prev => !prev);
          store.setIsShift(false);
        }, 'ALPHA'), 'key-alpha')}

        {renderMappingKey('mode', withFlash(actions.handleModeSwitch, 'MODE'), 'sci sr0 sc6 absolute top-[372px] left-[346px] w-[42px] h-[28px] rounded-[12px] border border-white/5 bg-white/0')}

        {renderMappingKey('7', withFlash(() => actions.handleInput('7'), '7'), 'num nr1 nc1')}
        {renderMappingKey('8', withFlash(() => actions.handleInput('8'), '8'), 'num nr1 nc2')}
        {renderMappingKey('9', withFlash(actions.handleDigit9, '9'), 'num nr1 nc3')}
        {renderMappingKey('del', withFlash(actions.del, 'DEL'), 'num nr1 nc4')}
        {renderMappingKey('ac', withFlash(actions.clearAll, 'AC'), 'num nr1 nc5')}

        {renderMappingKey('4', withFlash(() => actions.handleInput('4'), '4'), 'num nr2 nc1')}
        {renderMappingKey('5', withFlash(() => actions.handleInput('5'), '5'), 'num nr2 nc2')}
        {renderMappingKey('6', withFlash(() => actions.handleInput('6'), '6'), 'num nr2 nc3')}
        {renderMappingKey('mul', withFlash(actions.handleMulKey, '×'), 'num nr2 nc4')}
        {renderMappingKey('div', withFlash(actions.handleDivKey, '÷'), 'num nr2 nc5')}

        {renderMappingKey('1', withFlash(actions.handleDigit1, '1'), 'num nr3 nc1')}
        {renderMappingKey('2', withFlash(() => actions.handleInput('2'), '2'), 'num nr3 nc2')}
        {renderMappingKey('3', withFlash(() => actions.handleInput('3'), '3'), 'num nr3 nc3')}
        {renderMappingKey('add', withFlash(actions.handleAddKey, '+'), 'num nr3 nc4')}
        {renderMappingKey('sub', withFlash(actions.handleSubKey, '-'), 'num nr3 nc5')}

        {renderMappingKey('0', withFlash(actions.handleDigit0, '0'), 'num nr4 nc1')}
        {renderMappingKey('dot', withFlash(actions.handleDotKey, '.'), 'num nr4 nc2')}
        {renderMappingKey('exp', withFlash(actions.handleExpKey, '×10ˣ'), 'num nr4 nc3')}
        {renderMappingKey('ans', withFlash(() => actions.handleInput('Ans'), 'Ans'), 'num nr4 nc4')}
        {renderMappingKey('solve', withFlash(actions.solve, '='), 'num nr4 nc5')}
        </div>
      </div>
    </div>

      {showPane && (
        <div className="relative z-[40] w-full md:w-[350px] flex-shrink-0 bg-[#1a1a1a] rounded-3xl border border-white/5 shadow-2xl flex flex-col overflow-hidden h-fit max-h-[min(900px,calc(100vh-6rem))]">
          <div className="flex border-b border-white/5 relative pr-10">
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
            <button
              onClick={() => setShowPane(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white"
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
                {store.history.length === 0 ? (
                  <div className="py-20 text-center text-white/10 text-xs italic">
                    History is empty
                  </div>
                ) : (
                  store.history.map((item, idx) => (
                        <div key={item.id} className="history-row group flex flex-col bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all mb-2 last:mb-0">
                          <div className="flex justify-between items-center mb-1">
                             <div className="text-[9px] text-white/10 font-black tracking-widest uppercase">#{store.history.length - idx}</div>
                             <div className="flex gap-3">
                               {isReplayableHistory(item) && (
                               <button
                                 onClick={() => {
                                   store.setCurrentInput(item.rawInput + "‸");
                                   store.setCurrentSequence([...item.sequence]);
                                   store.setShowingResult(false);
                                   store.setReplayIndex(-1);
                                 }}
                                 className="text-[9px] text-blue-400/40 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                               >
                                 Load
                               </button>
                               )}
                           {item.latex ? (
                           <button
                             onClick={() => copyToClipboard(item.latex)}
                             className="text-[9px] text-white/5 hover:text-white/30 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                           >
                             LaTeX
                           </button>
                           ) : null}
                         </div>
                      </div>
                      <div className="flex items-center justify-between overflow-hidden gap-3">
                        {item.kind === 'action' && !item.rawInput.includes('→') ? (
                          <div className="flex-shrink min-w-0 text-white/90 text-sm">{item.rawInput}</div>
                        ) : (
                        <div
                          className="flex-shrink min-w-0 text-white/90 text-sm overflow-x-auto overflow-y-hidden whitespace-nowrap custom-scrollbar pb-1 lcd-screen-mini"
                          dangerouslySetInnerHTML={{ __html: formatMath(item.rawInput) }}
                        />
                        )}
                        {item.result !== null && (
                        <div className="flex-shrink-0 text-white text-xl font-black tracking-tighter tabular-nums opacity-90 border-l border-white/10 pl-3">
                          {item.result.toLocaleString(undefined, { maximumFractionDigits: 10 })}
                        </div>
                        )}
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
                        <div className="mt-3 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                          {renderKeyRow(item.sequence, `${idx}`)}
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
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">=</kbd> <span>= (ALPHA CALC)</span></div>
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
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">S</kbd> <span>S⇔D (decimal ↔ fraction)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">C</kbd> <span>Cos</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">T</kbd> <span>Tan</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">L</kbd> <span>Log</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">R</kbd> <span>Square Root</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Q</kbd> <span>Square (x²)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">^</kbd> <span>Power (xⁿ)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">A</kbd> <span>Answer (Ans)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">X</kbd> <span>Variable X (ALPHA ))</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Y</kbd> <span>Variable Y (ALPHA S⇔D)</span></div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Calculator;
