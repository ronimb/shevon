import React from 'react';

export const toLaTeX = (expr: string): string => {
  let proc = expr.replace(/[‸⬚]/g, '');

  const getBalanced = (s: string, startIdx: number): { content: string, endIdx: number } | null => {
    let count = 0;
    for (let i = startIdx; i < s.length; i++) {
        if (s[i] === '(') count++;
        else if (s[i] === ')') {
            count--;
            if (count === 0) return { content: s.substring(startIdx + 1, i), endIdx: i };
        }
    }
    return null;
  };

  const splitTopLevelArgs = (s: string) => {
    const args: string[] = [];
    let current = '';
    let pCount = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') pCount++;
        else if (s[i] === ')') pCount--;
        if (s[i] === ',' && pCount === 0) {
            args.push(current);
            current = '';
        } else {
            current += s[i];
        }
    }
    args.push(current);
    return args;
  };

  const renderLaTeX = (s: string): string => {
    let text = s;
    const templates = ['int', 'diff', 'frac', 'mix', 'root', 'sqrt', 'sqr', 'cube', 'log_b', 'log10', 'ln', 'abs', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sin', 'cos', 'tan', 'pwr', 'Σ', 'nCr', 'nPr', 'factorial', 'exp', 'pow'];
    
    // Process templates inner-out by always finding the first template with a balanced pair
    let lastLength = -1;
    while (text.length !== lastLength) {
        lastLength = text.length;
        let earliestIdx = Infinity;
        let bestT = '';
        
        for (const t of templates) {
            let idx = text.indexOf(t + '(');
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                bestT = t;
            }
        }
        
        if (bestT) {
            const bal = getBalanced(text, earliestIdx + bestT.length);
            if (bal) {
                // IMPORTANT: Process the inner content first to handle nested templates
                const innerProcessed = renderLaTeX(bal.content);
                const args = splitTopLevelArgs(innerProcessed);
                let replaced = '';
                
                if (bestT === 'int') replaced = `\\int_{${args[1]}}^{${args[2]}} ${args[0]} \\, d${args[3] || 'x'}`;
                else if (bestT === 'diff') replaced = `\\frac{d}{d${args[1] || 'x'}}\\left(${args[0]}\\right)\\bigg|_{${args[1] || 'x'}=${args[2]}}`;
                else if (bestT === 'frac') replaced = `\\frac{${args[0]}}{${args[1]}}`;
                else if (bestT === 'mix') replaced = `${args[0]}\\frac{${args[1]}}{${args[2]}}`;
                else if (bestT === 'root') replaced = `\\sqrt[${args[0]}]{${args[1]}}`;
                else if (bestT === 'sqrt') replaced = `\\sqrt{${args[0]}}`;
                else if (bestT === 'sqr') replaced = `{${args[0]}}^2`;
                else if (bestT === 'cube') replaced = `{${args[0]}}^3`;
                else if (bestT === 'pwr') replaced = `{${args[0]}}^{${args[1]}}`;
                else if (bestT === 'log_b') replaced = `\\log_{${args[0]}}(${args[1]})`;
                else if (bestT === 'log10') replaced = `\\log_{10}(${args[0]})`;
                else if (bestT === 'ln') replaced = `\\ln(${args[0]})`;
                else if (bestT === 'abs') replaced = `|${args[0]}|`;
                else if (bestT === 'sin') replaced = `\\sin(${args[0]})`;
                else if (bestT === 'cos') replaced = `\\cos(${args[0]})`;
                else if (bestT === 'tan') replaced = `\\tan(${args[0]})`;
                else if (bestT === 'sin⁻¹') replaced = `\\arcsin(${args[0]})`;
                else if (bestT === 'cos⁻¹') replaced = `\\arccos(${args[0]})`;
                else if (bestT === 'tan⁻¹') replaced = `\\arctan(${args[0]})`;
                else if (bestT === 'Σ') replaced = `\\sum_{${args[1] || 'x'}=${args[2]}}^{${args[3]}} ${args[0]}`;
                else if (bestT === 'nCr') replaced = `{\\textstyle \\binom{${args[0]}}{${args[1]}}}`;
                else if (bestT === 'nPr') replaced = `{}^{${args[0]}}P_{${args[1]}}`;
                else if (bestT === 'factorial') replaced = `{${args[0]}}!`;
                else if (bestT === 'exp') replaced = `e^{${args[0]}}`;
                else if (bestT === 'pow') replaced = `{${args[0]}}^{${args[1]}}`;

                text = text.substring(0, earliestIdx) + replaced + text.substring(bal.endIdx + 1);
                // After a replacement, we must break and start again to ensure correct order
                continue; 
            }
        }
        break; // No more templates with balanced parens found
    }
    return text;
  };

  let s = renderLaTeX(proc);
  
  // Basic replacements for symbols outside templates
  s = s.replace(/×/g, '\\times ')
       .replace(/÷/g, '\\div ')
       .replace(/π/g, '\\pi ')
       .replace(/×10\^/g, '\\times 10^');

  return s;
};

export const formatMath = (input: string): string => {
  const isEmpty = (text: string) => {
    if (!text) return true;
    let clean = text.replace(/[‸⬚]/g, '');
    return clean.trim() === '';
  };

  const slot = (text: any) => {
    if (typeof text !== 'string') return '<span class="empty-slot">⬚</span>';
    if (text.includes('‸')) return text;
    if (isEmpty(text)) return '<span class="empty-slot">⬚</span>';
    return text;
  };
  
  let h = input;

  // Replace factorial internal representation back to symbol for display
  h = h.replace(/factorial\(([^)]*)\)/g, '$1!');

  // Protect equals signs temporarily to avoid interference with tag replacements
  h = h.replace(/=/g, '___EQUALS___');

  const getBalanced = (s: string, startIdx: number): { content: string, endIdx: number } | null => {
    let count = 0;
    for (let i = startIdx; i < s.length; i++) {
        if (s[i] === '(') count++;
        else if (s[i] === ')') {
            count--;
            if (count === 0) return { content: s.substring(startIdx + 1, i), endIdx: i };
        }
    }
    return null;
  };

  const splitTopLevelArgs = (s: string) => {
    const args: string[] = [];
    let current = '';
    let pCount = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') pCount++;
        else if (s[i] === ')') pCount--;
        if (s[i] === ',' && pCount === 0) {
            args.push(current);
            current = '';
        } else {
            current += s[i];
        }
    }
    args.push(current);
    return args;
  };

  // Improved recursive template rendering for display
  const renderTemplates = (s: string): string => {
    let proc = s;
    const templates = ['nCr', 'nPr', 'pol', 'rec', 'mix', 'frac', 'int', 'diff', 'root', 'sqrt', 'sqr', 'cube', 'log_b', 'log10', 'e^', '10^', 'pwr', 'Σ'];
    
    let lastLength = -1;
    while (proc.length !== lastLength) {
        lastLength = proc.length;
        let earliestIdx = Infinity;
        let bestT = '';
        
        for (const t of templates) {
            let idx = proc.indexOf(t + '(');
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                bestT = t;
            }
        }
        
        if (bestT) {
            const bal = getBalanced(proc, earliestIdx + bestT.length);
            if (bal) {
                const innerProcessed = renderTemplates(bal.content);
                const args = splitTopLevelArgs(innerProcessed);
                let replaced = '';
                
                if (bestT === 'nCr' || bestT === 'nPr') {
                   let sym = bestT === 'nCr' ? 'C' : 'P';
                   replaced = `<span class="comb-perm">${slot(args[0])}<span class="comb-perm-sym">${sym}</span>${slot(args[1] || '')}</span>`;
                } else if (bestT === 'pol' || bestT === 'rec') {
                   let sym = bestT === 'pol' ? 'Pol' : 'Rec';
                   replaced = `<span class="trig-fun">${sym}</span>(${slot(args[0])},${slot(args[1] || '')})`;
                } else if (bestT === 'frac') {
                    replaced = `<div class="frac-container"><span class="frac-num">${slot(args[0])}</span><span class="frac-den">${slot(args[1] || '')}</span></div>`;
                } else if (bestT === 'mix') {
                    replaced = `<div class="mix-container"><span class="mix-whole">${slot(args[0])}</span><div class="frac-container"><span class="frac-num">${slot(args[1] || '')}</span><span class="frac-den">${slot(args[2] || '')}</span></div></div>`;
                } else if (bestT === 'int') {
                    replaced = `<div class="int-container"><div class="int-bounds"><span>${slot(args[2])}</span><span>${slot(args[1])}</span></div><span class="int-symbol">∫</span><div class="int-body">${slot(args[0])} d${slot(args[3] || 'x')}</div></div>`;
                } else if (bestT === 'diff') {
                    const varName = args[1] || 'x';
                    const varDisplay = slot(varName);
                    // Avoid cursor duplication in the 'at' portion by stripping cursor from the second mention
                    const varSilent = varName.replace('‸', '');
                    replaced = `<div class="diff-container"><div class="diff-frac"><span class="diff-top">d</span><span>d${varDisplay}</span></div>(${slot(args[0])})<div class="diff-at">${varSilent}=${slot(args[2])}</div></div>`;
                } else if (bestT === 'root') {
                    replaced = `<span class="sup">${slot(args[0])}</span><span class="root-symbol">√</span><span class="root-body">${slot(args[1] || '')}</span>`;
                } else if (bestT === 'sqrt') {
                    replaced = `<span class="root-symbol">√</span><span class="root-body">${slot(args[0])}</span>`;
                } else if (bestT === 'sqr') {
                    replaced = `${slot(args[0])}<span class="sup">2</span>`;
                } else if (bestT === 'cube') {
                    replaced = `${slot(args[0])}<span class="sup">3</span>`;
                } else if (bestT === 'pwr') {
                    replaced = `${slot(args[0])}<span class="sup">${slot(args[1] || '')}</span>`;
                } else if (bestT === 'log_b') {
                    replaced = `log<span class="sub">${slot(args[0])}</span>(${slot(args[1] || '')})`;
                } else if (bestT === 'log10') {
                    replaced = `log(${slot(args[0])})`;
                } else if (bestT === 'e^') {
                    replaced = `e<span class="sup">${slot(args[0])}</span>`;
                } else if (bestT === '10^') {
                    replaced = `10<span class="sup">${slot(args[0])}</span>`;
                } else if (bestT === 'Σ') {
                    replaced = `<div class="sum-container"><div class="sum-bounds"><span>${slot(args[3])}</span><span>${slot(args[1] || 'x')}=${slot(args[2])}</span></div><span class="sum-symbol">Σ</span><div class="sum-body">${slot(args[0])}</div></div>`;
                }

                proc = proc.substring(0, earliestIdx) + replaced + proc.substring(bal.endIdx + 1);
                continue;
            }
        }
        break;
    }
    return proc;
  };

  h = renderTemplates(h);

  h = h.replace(/→([A-M X-Y])/g, '<span style="font-size: 0.8em; margin: 0 4px;">→</span>$1')
       .replace(/\^\(([^)]*)\)/g, (m, p1) => `<span class="sup">${slot(p1)}</span>`) 
       .replace(/\^\(([^)]*)$/g, (m, p1) => `<span class="sup">${slot(p1)}</span>`) 
       .replace(/\^-1/g, '<span class="sup">-1</span>')
       .replace(/‸/g, '<span class="cursor"></span>');
  
  // Restore equals signs with proper styling
  h = h.replace(/___EQUALS___/g, '<span class="equal-symbol mx-1">=</span>');

  h = h.replace(/<span class="empty-slot">⬚<\/span><span class="cursor"><\/span>/g, '<span class="cursor"></span>')
       .replace(/<span class="cursor"><\/span><span class="empty-slot">⬚<\/span>/g, '<span class="cursor"></span>');
  
  // Custom absolute-positioned HTML spans for rendering overbars and hats beautifully inside monospace fonts
  h = h
    .replace(/(x\u0304|x̄|x̅|X\u0304|X̄|X̅)/g, '<span class="relative inline-block" style="line-height: 1em;">x<span class="absolute left-[0.025em] right-[0.025em] -top-[0.08em] border-t-[1.5px] border-current"></span></span>')
    .replace(/(y\u0304|ȳ|y̅|Y\u0304|Ȳ|Y̅)/g, '<span class="relative inline-block" style="line-height: 1em;">y<span class="absolute left-[0.025em] right-[0.025em] -top-[0.08em] border-t-[1.5px] border-current"></span></span>')
    .replace(/(x\u03021|x̂1|X\u03021|X̂1)/g, '<span class="inline-flex items-baseline" style="line-height: 1em;"><span class="relative inline-block">x<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span><sub class="text-[0.6em] ml-[0.05em] align-sub">1</sub></span>')
    .replace(/(x\u03022|x̂2|X\u03022|X̂2)/g, '<span class="inline-flex items-baseline" style="line-height: 1em;"><span class="relative inline-block">x<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span><sub class="text-[0.6em] ml-[0.05em] align-sub">2</sub></span>')
    .replace(/(x\u0302|x̂|X\u0302|X̂)/g, '<span class="relative inline-block" style="line-height: 1em;">x<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span>')
    .replace(/(y\u0302|ŷ|Y\u0302|Ŷ)/g, '<span class="relative inline-block" style="line-height: 1em;">y<span class="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span></span>');

  return h;
};

export const renderMathSymbol = (sym: string): React.ReactNode => {
  const norm = sym.normalize('NFD');
  if (norm.startsWith('x') && (norm.includes('\u0304') || norm.includes('\u0305') || norm.includes('̄') || norm.includes('̅'))) {
    return (
      <span className="relative inline-block" style={{ lineHeight: '1em' }}>
        x<span className="absolute left-[0.025em] right-[0.025em] -top-[0.05em] border-t-[1.5px] border-current" />
      </span>
    );
  }
  if (norm.startsWith('y') && (norm.includes('\u0304') || norm.includes('\u0305') || norm.includes('̄') || norm.includes('̅'))) {
    return (
      <span className="relative inline-block" style={{ lineHeight: '1em' }}>
        y<span className="absolute left-[0.025em] right-[0.025em] -top-[0.05em] border-t-[1.5px] border-current" />
      </span>
    );
  }
  if (norm.startsWith('x') && (norm.includes('\u0302') || norm.includes('̂'))) {
    const has1 = norm.includes('1');
    const has2 = norm.includes('2');
    return (
      <span className="inline-flex items-baseline" style={{ lineHeight: '1em' }}>
        <span className="relative inline-block">
          x<span className="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span>
        </span>
        {has1 && <sub className="text-[0.6em] ml-[0.05em] align-sub">1</sub>}
        {has2 && <sub className="text-[0.6em] ml-[0.05em] align-sub">2</sub>}
      </span>
    );
  }
  if (norm.startsWith('y') && (norm.includes('\u0302') || norm.includes('̂'))) {
    return (
      <span className="relative inline-block" style={{ lineHeight: '1em' }}>
        y<span className="absolute left-0 right-0 -top-[0.25em] text-center font-bold text-[0.8em]">^</span>
      </span>
    );
  }
  return <span>{sym}</span>;
};

export const formatResultNumber = (n: number | undefined | null): React.ReactNode => {
    if (n === undefined || n === null || isNaN(n)) return "Error";
    if (!isFinite(n)) return "Error";
    
    const absVal = Math.abs(n);
    if (absVal < 1e-15) {
      return "0";
    }
    
    // Casio typically displays in scientific notation if >= 10^10 or < 10^-9
    const useSci = absVal >= 1e10 || absVal < 1e-9;
    
    if (useSci) {
      // Format as base ×10^exponent with a 10-digit mantissa
      const sciStr = n.toExponential(9);
      const parts = sciStr.split('e');
      let mantissa = parts[0];
      const exponent = parts[1];
      
      // Trim unnecessary trailing zeros
      if (mantissa.indexOf('.') !== -1) {
        mantissa = mantissa.replace(/0+$/, '');
        if (mantissa.endsWith('.')) {
          mantissa = mantissa.slice(0, -1);
        }
      }
      
      const expPower = parseInt(exponent, 10);
      
      return (
        <span className="inline-flex items-center font-mono select-all">
          <span>{mantissa}</span>
          <span className="text-[0.6em] font-sans mx-0.5 self-center translate-y-[0.05em]">×10</span>
          <span className="text-[0.8em] self-start relative -top-[0.25em] font-bold">{expPower}</span>
        </span>
      );
    }
    
    // Integer within 10-digit limit
    if (Number.isInteger(n)) {
      return <span className="font-mono select-all">{n.toString()}</span>;
    }
    
    // Decimal: format number to fit exactly under the 10-digit total budget
    const intPartLength = Math.max(1, Math.floor(Math.log10(absVal)) + 1);
    const maxDecimals = Math.max(0, 10 - intPartLength);
    
    const fixedStr = n.toFixed(maxDecimals);
    let cleanStr = fixedStr;
    if (cleanStr.indexOf('.') !== -1) {
      cleanStr = cleanStr.replace(/0+$/, '');
      if (cleanStr.endsWith('.')) {
        cleanStr = cleanStr.slice(0, -1);
      }
    }
    
    return <span className="font-mono select-all">{cleanStr}</span>;
};
