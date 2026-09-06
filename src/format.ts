/**
 * Casio-style number formatting and display-format state.
 *
 * The fx-991ES PLUS SETUP menu lets the user pick how results are displayed:
 *   - Fix n   (n = 0..9):  fixed number of decimal places
 *   - Sci n   (n = 1..10): scientific notation with n significant digits
 *   - Norm 1 / Norm 2:     "normal" display; Norm 1 switches to exponential
 *                          for |x| < 10^-2, Norm 2 for |x| < 10^-9. Both use
 *                          exponential for |x| >= 10^10.
 *
 * The same setting drives Rnd( : the calculator rounds the internal value to
 * the precision currently shown on screen. This module is the single source of
 * truth for both, so the evaluator and the display stay in sync.
 */

export type DisplayFormat =
  | { kind: 'norm'; n: 1 | 2 }
  | { kind: 'fix'; digits: number } // 0..9 decimal places
  | { kind: 'sci'; digits: number }; // 1..10 significant digits

export const DEFAULT_FORMAT: DisplayFormat = { kind: 'norm', n: 1 };

/** Total significant digits the LCD can show. */
const DISPLAY_DIGITS = 10;

function roundToSignificant(value: number, sig: number): number {
  if (value === 0 || !isFinite(value)) return value;
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const power = sig - 1 - exponent;
  const factor = Math.pow(10, power);
  return Math.round(value * factor) / factor;
}

/**
 * Round a value to the precision implied by the current display format. This is
 * exactly what Rnd( does on the hardware: with Fix 3, Rnd(10÷3) = 3.333 so
 * Rnd(10÷3)×3 = 9.999 instead of 10.
 */
export function roundToFormat(value: number, fmt: DisplayFormat): number {
  if (!isFinite(value)) return value;
  switch (fmt.kind) {
    case 'fix': {
      const factor = Math.pow(10, fmt.digits);
      return Math.round(value * factor) / factor;
    }
    case 'sci':
      return roundToSignificant(value, fmt.digits);
    case 'norm':
      return roundToSignificant(value, DISPLAY_DIGITS);
  }
}

export type NumberDisplay =
  | { type: 'plain'; text: string }
  | { type: 'sci'; mantissa: string; exponent: number };

function trimTrailingZeros(s: string): string {
  if (s.indexOf('.') === -1) return s;
  return s.replace(/0+$/, '').replace(/\.$/, '');
}

function sciDisplay(value: number, sigDigits: number, trim: boolean): NumberDisplay {
  const str = value.toExponential(Math.max(0, sigDigits - 1));
  const [rawMantissa, rawExp] = str.split('e');
  const mantissa = trim ? trimTrailingZeros(rawMantissa) : rawMantissa;
  return { type: 'sci', mantissa, exponent: parseInt(rawExp, 10) };
}

/** Plain (non-exponential) rendering trimmed to the 10-digit display budget. */
function plainDisplay(value: number): NumberDisplay {
  if (Number.isInteger(value)) {
    return { type: 'plain', text: value.toString() };
  }
  const absVal = Math.abs(value);
  const intPartLength = Math.max(1, Math.floor(Math.log10(absVal)) + 1);
  const maxDecimals = Math.max(0, DISPLAY_DIGITS - intPartLength);
  return { type: 'plain', text: trimTrailingZeros(value.toFixed(maxDecimals)) };
}

/** Format a value for the LCD according to the current display format. */
export function formatForDisplay(value: number, fmt: DisplayFormat): NumberDisplay {
  if (!isFinite(value) || isNaN(value)) return { type: 'plain', text: 'Error' };

  const absVal = Math.abs(value);
  if (absVal < 1e-15) return { type: 'plain', text: fmt.kind === 'fix' ? (0).toFixed(fmt.digits) : '0' };

  switch (fmt.kind) {
    case 'fix': {
      const rounded = roundToFormat(value, fmt);
      // Falls back to scientific once the integer part no longer fits.
      if (Math.abs(rounded) >= 1e10) return sciDisplay(rounded, DISPLAY_DIGITS, true);
      return { type: 'plain', text: rounded.toFixed(fmt.digits) };
    }
    case 'sci':
      return sciDisplay(value, fmt.digits, false);
    case 'norm': {
      const low = fmt.n === 1 ? 1e-2 : 1e-9;
      if (absVal >= 1e10 || absVal < low) return sciDisplay(value, DISPLAY_DIGITS, true);
      return plainDisplay(value);
    }
  }
}

/**
 * Engineering notation: exponent forced to a multiple of three. `offset` shifts
 * the exponent by ±3 per step (ENG decreases it / grows the mantissa, SHIFT ENG
 * increases it). offset 0 is the natural engineering form.
 */
export function formatEngineering(value: number, offset: number): { mantissa: string; exponent: number } {
  if (value === 0 || !isFinite(value)) return { mantissa: '0', exponent: 0 };
  const natural = 3 * Math.floor(Math.log10(Math.abs(value)) / 3);
  const exponent = natural + 3 * offset;
  const mantissa = value / Math.pow(10, exponent);
  const intDigits = Math.max(1, Math.floor(Math.log10(Math.abs(mantissa))) + 1);
  const decimals = Math.max(0, DISPLAY_DIGITS - intDigits);
  return { mantissa: trimTrailingZeros(mantissa.toFixed(decimals)), exponent };
}

/**
 * Convert decimal degrees into sexagesimal components for the °′″ result
 * toggle. Rounds seconds to two decimals and carries overflow, matching how the
 * hardware presents a DMS answer.
 */
export function formatDMS(value: number): { deg: number; min: number; sec: string } {
  const sign = value < 0 ? -1 : 1;
  let total = Math.abs(value);
  let deg = Math.floor(total);
  let remMin = (total - deg) * 60;
  let min = Math.floor(remMin);
  let sec = (remMin - min) * 60;

  // Round seconds and carry so we never show 60.
  let secRounded = Math.round(sec * 100) / 100;
  if (secRounded >= 60) {
    secRounded -= 60;
    min += 1;
  }
  if (min >= 60) {
    min -= 60;
    deg += 1;
  }
  return { deg: sign * deg, min, sec: trimTrailingZeros(secRounded.toFixed(2)) };
}

export function describeFormat(fmt: DisplayFormat): string {
  if (fmt.kind === 'fix') return `Fix ${fmt.digits}`;
  if (fmt.kind === 'sci') return `Sci ${fmt.digits}`;
  return `Norm ${fmt.n}`;
}
