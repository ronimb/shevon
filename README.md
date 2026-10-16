# Shevon — scientific calculator emulator

A photo-realistic overlay of a scientific calculator. The UI is an overlay: absolutely-positioned key
hitboxes sit on top of `src/calculator_new.png`, and the LCD is rendered with
standard browser fonts and HTML (fractions, roots, and so on) — a close-enough
approximation, not a pixel-perfect or pixelated copy of the hardware display.
Visual fidelity means every on-screen element is present in the same relative
location and behaves the same (same timing, input, and output); exact
coordinates are not required.

The goal is hardware accuracy, not a generic scientific calculator. Design rules
are in [`docs/principles.md`](docs/principles.md). Expressions are parsed into
a typed AST (`src/parser.ts`) and evaluated by a custom engine
(`src/evaluator.ts`) — there is no `eval`/`new Function` and no third-party
math library. Behavior is checked against the official manual
(`manual.pdf`).

## Prerequisites

- Node.js 18+
- **Desktop exe (Tauri / WebView2):** Rust stable (`rustup`), MSVC
  Build Tools (Desktop development with C++), and the WebView2
  Runtime (preinstalled on current Windows 10/11; otherwise
  [Evergreen Bootstrapper](https://developer.microsoft.com/microsoft-edge/webview2/))

## Run locally (web)

```bash
npm install
npm run dev          # http://localhost:3000 — run in your own terminal
npm run stop:dev     # kill whatever holds port 3000 (no agent hunt)
```

Run `dev` from **Terminal → New Terminal** (or Windows Terminal), not
from an agent chat — agent terminals are hard to find later. No API
keys required. Optional: `DISABLE_HMR=true` in `.env` (see
`.env.example`) to avoid flicker while an agent edits files.

## Run as a desktop app (Tauri / WebView2)

```bash
npm run tauri:dev           # dev: Vite + Tauri together
npm run build:exe           # Windows .exe → dist-desktop/Shevon.exe (~10 MB)
```

`dist-desktop/Shevon.exe` is the daily portable (WebView2; tens of MB).
Rebuild with `npm run build:exe` after source changes.

Electron fallback (Chromium, ~100 MB):

```bash
npm run electron:dev
npm run build:exe:electron  # → dist-desktop/Shevon-electron.exe
```

## Unit pairing (form + function)

Use the kickoff named in [`roadmap.md`](roadmap.md) **Now** (e.g.
[`docs/prompts/g6-pair.md`](docs/prompts/g6-pair.md)). Cadence and
tables: [`docs/prompts/validate-unit.md`](docs/prompts/validate-unit.md).
Cursor: [`docs/prompts/validate-status.md`](docs/prompts/validate-status.md).
Pairing chats do not implement. Doc map: [`docs/README.md`](docs/README.md).

You need a local `manual.pdf` (gitignored).

## Other scripts

- `npm run build` — production web build into `dist/`
- `npm run preview` — preview the production build
- `npm run deploy` — build and publish `dist/` to GitHub Pages
- `npm run lint` — type-check with `tsc --noEmit`
- `npm run test` — run the Vitest suite (golden tests from the manual)

## Reference manual

The hardware manual `manual.pdf` is the source of truth for expected
behavior. It is intentionally **gitignored** (it is a large binary); drop your
own copy in the repo root to cross-check sample operations. Manual page
references (e.g. `E-16`) appear throughout the code and tests.

## Documentation

Full map: [`docs/README.md`](docs/README.md). Markdown is the source of
truth; canvases are optional ([`canvases/README.md`](canvases/README.md)).

Agents: [`AGENTS.md`](AGENTS.md). Naming: [`docs/principles.md`](docs/principles.md).

## Status

Daily driver: COMP + STAT + EQN. Phase 3 parked. Next work:
[`roadmap.md`](roadmap.md) **Now**. Coverage: [`docs/coverage.md`](docs/coverage.md).
