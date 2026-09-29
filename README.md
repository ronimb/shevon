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
npm run dev
```

Then open http://localhost:3000. No API keys or environment variables are
required. (`.env.example` documents the only optional dev toggle, `DISABLE_HMR`.)

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

Copy [`docs/prompts/validate-unit.md`](docs/prompts/validate-unit.md)
below the line into a **new** chat (or open the Validate canvas).
One group per sitting. G1 re-check closed `R30`; `R31` remains in
[`docs/tech-issues.md`](docs/tech-issues.md). Pairing chats do not
implement.

You need a local `manual.pdf` (gitignored). Bring that file with
you; the repo will not have it after clone/pull.

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

Markdown files are the **source of truth**. Canvases are visual views refreshed
from those files — not a second plan.

| File | Role |
|------|------|
| [`docs/principles.md`](docs/principles.md) | Visual fidelity and function-behavior rules |
| [`roadmap.md`](roadmap.md) | Phased roadmap, current work, landed work |
| [`issues.md`](issues.md) | Honesty / leftover bugs (with phase/action when one exists) |
| [`docs/tech-issues.md`](docs/tech-issues.md) | Landed-correctness review (`R*` / `ti-*`) |
| [`backlog.md`](backlog.md) | Feature ideas not yet assigned to a phase |
| [`docs/coverage.md`](docs/coverage.md) | Feature-by-feature hardware coverage |
| [`docs/visual-fidelity-inventory.md`](docs/visual-fidelity-inventory.md) | LCD element audit |

Agents: [`AGENTS.md`](AGENTS.md) and `.cursor/rules/`. Triage / oversight
chats follow [`docs/prompts/supervisor.md`](docs/prompts/supervisor.md)
([`triage.md`](docs/prompts/triage.md) is an alias). Do not
name the hardware vendor or original model (`docs/principles.md` **Naming**).

## Status

Daily driver is COMP + STAT + EQN (FREQ, Dist, stay-in-STAT, SOLVE,
EQN types 1–4). CMPLX, BASE-N, MATRIX, VECTOR, TABLE, CONST, and CONV
are menu chrome only.

Phase 2 is landed. `p4-packaging` and `p4-tauri` are in
(WebView2 daily exe ~10 MB; Electron kept as
`build:exe:electron`). Next id is [`roadmap.md`](roadmap.md)
**Now** (`show-keys-size`). Coverage:
[`docs/coverage.md`](docs/coverage.md).
