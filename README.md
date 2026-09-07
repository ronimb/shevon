# Shevon — Casio fx-991ES PLUS emulator

A photo-realistic overlay emulator of the Casio **fx-991ES PLUS**
scientific calculator. The UI is an overlay: absolutely-positioned key
hitboxes sit on top of `src/calculator_new.png`, and the LCD is rendered with
standard browser fonts and HTML (fractions, roots, and so on) — a close-enough
approximation, not a pixel-perfect or pixelated copy of the hardware display.
Visual fidelity means every on-screen element is present in the same relative
location and behaves the same (same timing, input, and output); exact
coordinates are not required.

Expressions are parsed into a typed AST (`src/parser.ts`) and evaluated by a
custom engine (`src/evaluator.ts`) — there is no `eval`/`new Function` and no
third-party math library. Behavior is checked against the official manual
(`fx-570_991ES_PLUS_EN.pdf`).

## Prerequisites

- Node.js 18+

## Run locally (web)

```bash
npm install
npm run dev
```

Then open http://localhost:3000. No API keys or environment variables are
required. (`.env.example` documents the only optional dev toggle, `DISABLE_HMR`.)

## Run as a desktop app (Electron)

```bash
npm run electron:dev          # dev: Vite + Electron together
npm run build:exe             # build a portable Windows .exe into dist-desktop/
```

## Other scripts

- `npm run build` — production web build into `dist/`
- `npm run preview` — preview the production build
- `npm run deploy` — build and publish `dist/` to GitHub Pages
- `npm run lint` — type-check with `tsc --noEmit`
- `npm run test` — run the Vitest suite (golden tests from the manual)

## Reference manual

The Casio manual `fx-570_991ES_PLUS_EN.pdf` is the source of truth for expected
behavior. It is intentionally **gitignored** (it is a large binary); drop your
own copy in the repo root to cross-check sample operations. Manual page
references (e.g. `E-16`) appear throughout the code and tests.

## Status / what is unimplemented

COMP is the most complete mode. STAT and EQN have working cores with UX
gaps. Visual fidelity of already-shipped templates is not fully audited.

Remaining:

- **Visual**: existing Natural Display templates (known miss: ∫ puts a/b to the left of the sign; Casio is b above / a below the symbol, then f(x)dx to the right)
- **SETUP leftovers**: LineIO (menu item is a no-op)
- **COMP leftovers**: STO A/B/C then RCL is Math ERROR (`calculateStatVars(null)` injects A/B/C=NaN over user memory); Ran# is not Casio 3-digit; DMS displays ° for minutes/seconds; ERROR ◄/► does not jump to the bad token
- **STAT/EQN**: FREQ toggle, editor Ins/Del, 1-VAR Dist, stay in STAT on recall, EQN a/b/c labels, 2-/3-unknown and cubic EQN, SOLVE UX
- **Other modes**: CMPLX, BASE-N, MATRIX, VECTOR, TABLE, CONST, CONV (menu rows fall through to COMP)

See `canvases/casio-coverage.canvas.tsx` and `canvases/shevon-roadmap.canvas.tsx`
for the full coverage map and backlog.
