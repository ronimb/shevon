import React, { useState, useEffect, useRef } from 'react';
import calculatorImg from './calculator_new.png';
import type { KeyStyle } from './types.ts';
import { INITIAL_KEY_STYLES } from './keys.ts';
import { renderMiniButton } from './historyKeys.tsx';
import { isReplayableHistory, liveOperationSequence } from './historyOps.ts';
import { formatCalcPlain, formatMath } from './display.tsx';
import { LcdScreen } from './lcd.tsx';
import { useKeyFlash, usePcKeyboard } from './keyboard.ts';
import { useCalculatorState } from './useCalculatorState.ts';
import { useModeRouter } from './modeRouter.ts';
import { isDesktopApp } from './desktopBridge.ts';

const BRING_FRONT_KEY = 'calc_bring_front_accel';
const BRING_FRONT_DEFAULT = 'CommandOrControl+Shift+Space';

function eventToAccelerator(e: KeyboardEvent | React.KeyboardEvent): string | null {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return null;
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  const named: Record<string, string> = {
    ' ': 'Space',
    Escape: 'Esc',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
  };
  const key = named[e.key] ?? (e.key.length === 1 ? e.key.toUpperCase() : e.key);
  parts.push(key);
  return parts.length > 1 ? parts.join('+') : null;
}

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
  const [chipScale, setChipScale] = useState(1);
  const stripRef = useRef<HTMLDivElement>(null);
  const [showPane, setShowPane] = useState<boolean>(false);
  const [pinned, setPinned] = useState(false);
  const [showCurrentKeys, setShowCurrentKeys] = useState<boolean>(() => localStorage.getItem('calc_show_current_keys_on') === '1');
  const [paneView, setPaneView] = useState<'history' | 'help'>('history');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [bringAccel, setBringAccel] = useState(() => localStorage.getItem(BRING_FRONT_KEY) || BRING_FRONT_DEFAULT);
  const [captureBring, setCaptureBring] = useState(false);

  const store = useCalculatorState();
  const actions = useModeRouter(store);
  const isDesktop = isDesktopApp();

  useEffect(() => {
    const fit = () => {
      const chromeH = document.querySelector('.app-chrome')?.getBoundingClientRect().height ?? 40;
      const stripH = showCurrentKeys ? (stripRef.current?.getBoundingClientRect().height ?? 0) : 0;
      const paneW = showPane && (isDesktop || window.innerWidth >= 768) ? 382 : 0;
      const availH = Math.max(280, window.innerHeight - chromeH - stripH);
      const availW = Math.max(240, window.innerWidth - paneW);
      const next = Math.min(1, availH / 1000, availW / 504);
      // Same scale as the unit, clamped so a large window stays at the
      // current chip size and a tiny window keeps glyphs readable.
      const nextChip = Math.min(1, Math.max(0.52, next));
      setScale((prev) => (Math.abs(prev - next) < 0.004 ? prev : next));
      setChipScale((prev) => (Math.abs(prev - nextChip) < 0.004 ? prev : nextChip));
    };

    fit();
    window.addEventListener('resize', fit);
    const ro = new ResizeObserver(fit);
    if (stripRef.current) ro.observe(stripRef.current);
    return () => {
      window.removeEventListener('resize', fit);
      ro.disconnect();
    };
  }, [showCurrentKeys, showPane, isDesktop, chipScale]);

  useEffect(() => {
    localStorage.setItem('calc_show_current_keys_on', showCurrentKeys ? '1' : '0');
  }, [showCurrentKeys]);

  useEffect(() => {
    void window.shevonDesktop?.setHistoryOpen(showPane);
  }, [showPane]);

  useEffect(() => {
    if (!isDesktop) return;
    localStorage.setItem(BRING_FRONT_KEY, bringAccel);
    void window.shevonDesktop?.setBringToFrontAccelerator(bringAccel);
  }, [isDesktop, bringAccel]);

  useEffect(() => {
    if (!captureBring) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        setCaptureBring(false);
        return;
      }
      const accel = eventToAccelerator(e);
      if (!accel) return;
      setBringAccel(accel);
      setCaptureBring(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [captureBring]);

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
    handleFracKey: actions.handleFracKey,
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
    <div className="key-chip-row flex flex-wrap items-center" style={{ zoom: chipScale }}>
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

  const syncExprThumb = (el: HTMLDivElement) => {
    const thumb = el.nextElementSibling as HTMLElement | null;
    if (!thumb) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 1) {
      thumb.style.opacity = '0';
      return;
    }
    const w = Math.max(18, (el.clientWidth / el.scrollWidth) * el.clientWidth);
    const x = (el.scrollLeft / max) * (el.clientWidth - w);
    thumb.style.opacity = '1';
    thumb.style.width = `${w}px`;
    thumb.style.transform = `translateX(${x}px)`;
  };

  return (
    <div className="app-shell flex flex-col bg-[#121212] m-0 overflow-hidden font-sans">
      <div className={showCurrentKeys ? 'app-top keys-open' : 'app-top'}>
      <div className="app-chrome flex items-center gap-2 px-3 py-2 shrink-0" data-tauri-drag-region>
        <button
          type="button"
          onClick={() => setShowCurrentKeys(v => !v)}
          className="keys-toggle app-no-drag px-3 py-1.5 bg-[#1c1c1c] text-[10px] font-black tracking-widest uppercase text-blue-400/80 rounded-full border border-white/10 hover:bg-[#2a2a2a]"
        >
          {showCurrentKeys ? 'Hide keys' : 'Show keys'}
        </button>
        <div className="flex-1 min-h-[28px]" data-tauri-drag-region />
        <button
          type="button"
          onClick={() => setShowPane(!showPane)}
          className="more-toggle app-no-drag px-3 py-1.5 bg-[#1c1c1c] text-[10px] font-black tracking-widest uppercase text-white/70 rounded-full border border-white/10 hover:bg-[#2a2a2a]"
        >
          More
        </button>
        {isDesktop ? (
          <button
            type="button"
            title={pinned ? 'Unpin' : 'Pin on top'}
            aria-label={pinned ? 'Unpin' : 'Pin on top'}
            onClick={() => {
              const next = !pinned;
              setPinned(next);
              void window.shevonDesktop?.setAlwaysOnTop(next);
            }}
            className={`app-no-drag p-1.5 rounded-full border hover:bg-[#2a2a2a] ${pinned ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' : 'bg-[#1c1c1c] text-white/50 border-white/10'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
          </button>
        ) : null}
        {isDesktop ? (
          <button
            type="button"
            onClick={() => {
              if (window.shevonDesktop?.closeApp) void window.shevonDesktop.closeApp();
              else window.close();
            }}
            className="app-no-drag px-3 py-1.5 bg-[#1c1c1c] text-[10px] font-black tracking-widest uppercase text-white/50 rounded-full border border-white/10 hover:bg-[#2a2a2a]"
          >
            Close
          </button>
        ) : null}
      </div>
      {showCurrentKeys && (
        <div ref={stripRef} className="app-no-drag current-keys-strip w-full border-b border-white/10 px-3 py-0.5">
          {liveKeys.length === 0 ? (
            <div className="text-[11px] text-white/20 italic py-1">No current operation</div>
          ) : (
            renderKeyRow(liveKeys, 'live')
          )}
        </div>
      )}
      </div>
    <div className={`flex justify-center items-stretch flex-1 min-h-0 overflow-hidden gap-8 ${showPane ? 'flex-row' : 'flex-col md:flex-row'}`}>

      <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center">
      <div
        className="flex-shrink-0 flex items-center justify-center transition-all duration-300 relative"
        style={{
          height: `${1000 * scale}px`,
          width: `${504 * scale}px`,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left transform"
          style={{
            transform: `scale(${scale})`,
            width: '504px',
            height: '1000px'
          }}
        >
          <div
            ref={keysRootRef}
            className="app-no-drag calc-container relative w-[504px] h-[1000px] rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
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
          result={store.lastValue}
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
      </div>

      {showPane && (
        <div className={`app-no-drag relative z-[40] flex-shrink-0 bg-[#1a1a1a] rounded-3xl border border-white/5 shadow-2xl flex flex-col overflow-hidden ${isDesktop ? 'w-[350px] h-full max-h-none' : 'w-full md:w-[350px] h-fit max-h-[min(900px,calc(100vh-6rem))]'}`}>
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

          <div className="history-scroll flex-1 min-h-0 p-3">
            {paneView === 'history' ? (
              <div className="space-y-1.5">
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
                        <div key={item.id} className="history-row group flex flex-col bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all last:mb-0">
                          <div className="flex justify-between items-center mb-1">
                             <div className="text-[9px] text-white/10 font-black tracking-widest uppercase">#{store.history.length - idx}</div>
                             <div className="flex gap-3">
                               {isReplayableHistory(item) && (
                               <button
                                 onClick={() => {
                                   actions.handleHistoryLoad(item.rawInput, item.sequence);
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
                          <div className="flex-shrink min-w-0 text-white/90 text-xs">{item.rawInput}</div>
                        ) : (
                        <div className="history-expr-host">
                        <div
                          className="history-expr text-white/90 lcd-screen-mini"
                          ref={(el) => { if (el) syncExprThumb(el); }}
                          onScroll={(e) => syncExprThumb(e.currentTarget)}
                          dangerouslySetInnerHTML={{ __html: formatMath(item.rawInput) }}
                        />
                        <div className="history-expr-thumb" />
                        </div>
                        )}
                        {item.result !== null && (
                        <div className="flex-shrink-0 text-white text-sm font-bold tracking-tight tabular-nums opacity-90 border-l border-white/10 pl-2">
                          {formatCalcPlain(item.result)}
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
                {isDesktop ? (
                <section>
                  <h4 className="text-blue-400 font-bold mb-2 uppercase text-[10px] tracking-widest">Show / hide</h4>
                  <p className="text-white/50 text-[11px] leading-relaxed mb-3">
                    Same shortcut raises Shevon or sends it away.
                  </p>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setCaptureBring((v) => !v)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-[12px] font-bold tracking-wide ${captureBring ? 'border-blue-400/50 bg-blue-500/10 text-blue-200' : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'}`}
                  >
                    {captureBring ? 'Press a shortcut…' : bringAccel.replace('CommandOrControl', 'Ctrl')}
                  </button>
                </section>
                ) : null}

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
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">S</kbd> <span>Sin</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">`</kbd> <span>S⇔D (decimal ↔ fraction)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">C</kbd> <span>Cos</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">T</kbd> <span>Tan</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">L</kbd> <span>Log</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">R</kbd> <span>Square Root</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Q</kbd> <span>Square (x²)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">D</kbd> <span>Fraction</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">^</kbd> <span>Power (xⁿ)</span></div>
                    <div className="flex justify-between text-white/60"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white">,</kbd> <span>Comma (SHIFT ))</span></div>
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
