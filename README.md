# Shevon — Casio fx-991ES PLUS emulator

A high-fidelity, photo-realistic emulator of the Casio **fx-991ES PLUS**
scientific calculator. The UI is an overlay: absolutely-positioned key
hitboxes sit on top of `src/calculator_new.png`, and the LCD is rendered as a
custom Natural-V.P.A.M. display. Expressions are parsed into a typed AST
(`src/parser.ts`) and evaluated by a custom engine (`src/evaluator.ts`) — there
is no `eval`/`new Function` and no third-party math library.

The goal is Casio accuracy, not a generic scientific calculator: behavior is
checked against the official manual (`fx-570_991ES_PLUS_EN.pdf`).

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

COMP mode, STAT, and EQN are the most complete. Several faceplate keys and
modes are still stubbed or intentionally disabled rather than faked. Not yet
implemented (or only partial):

- **SETUP**: LineIO, Fix/Sci/Norm, `ab/c` vs `d/c`
- **COMP keys**: `hyp` menu, `Ran#`/`RanInt#`, `ENG`, sexagesimal `° ′ ″`, `Rnd(`
- **STAT/EQN**: FREQ toggle, editor Ins/Del, 1-VAR distributions, cubic/complex EQN roots, SOLVE
- **Other modes**: CMPLX, BASE-N, MATRIX, VECTOR, TABLE, CONST, CONV

See `canvases/casio-coverage.canvas.tsx` and `canvases/shevon-roadmap.canvas.tsx`
for the full coverage map and backlog.
