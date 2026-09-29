# Kickoff — `p4-tauri` (Electron → Tauri / WebView2)

Copy everything below the line into a **new agent chat** when this
slice is **Now**. One slice. Soft cutover only.

**Gate:** do not start until `p4-packaging` is checked in
`roadmap.md`. This does **not** block Phase 3. Do not start Phase 3
leftovers, LineIO, or `p4-exact` here.

This file is the **source of truth** for the migration plan (phases,
WebView verification, cutover). Canvases are views.

---

Follow `docs/principles.md` (especially **Naming**). Sources:
`roadmap.md` Phase 4 `p4-tauri`, `docs/coverage.md` Platform.
Update those files and `roadmap.md` **Now** in the same change.
Refresh canvases if the story changed. Afterward run
[`sanity-landed.md`](sanity-landed.md) as a COMP/STAT/EQN smoke —
the wrapper must not regress the unit.

You are **replacing the desktop shell**, not the calculator.
`p4-packaging` ships a ~100 MB Electron portable
(`dist-desktop/Shevon.exe`) — that size is Chromium. Target: a
Windows `.exe` that uses **WebView2** (Tauri 2) and stays in the
tens of MB. Keep Vite `dist/` (`base: './'`). Soft cutover: Tauri
becomes daily `npm run build:exe`; Electron remains as
`npm run build:exe:electron` until a later cleanup.

**Iterate with Ron.** Finish one phase, stop where noted, let him
try. Do not change calculator keys, modes, or EVAL.

## Inventory (Electron-only touchpoints)

| Path | Role |
|------|------|
| `electron-main.cjs` | Frameless window; History widen 382 px; always-on-top; global shortcut toggle hide/show; load `dist/` or localhost:3000 |
| `electron-preload.cjs` | `window.shevonDesktop` bridge |
| `package.json` `build` + `build:exe` | electron-builder portable |
| `src/Calculator.tsx` | `/Electron/i` UA; Pin / Close; `shevonDesktop` calls |
| `src/vite-env.d.ts` | `ShevonDesktop` types |
| `src/index.css` | `-webkit-app-region: drag` / `no-drag` |

Desktop API to port **1:1**:

1. `setHistoryOpen(open)` — widen/narrow by `HISTORY_EXTRA` (382)
2. `setAlwaysOnTop(on)` — Pin
3. `setBringToFrontAccelerator(accel)` — toggle hide/show when front
   (same as current `toggleWindow`)

Also preserve: frameless; title **Shevon**; icon
`public/icons/icon.png`; size from `CALC_W=504`, `CALC_H=1000`,
`CHROME_H=40`; Show keys / History never on the face; Close quits.

## Phases

### Phase A — Prerequisites

1. Confirm `p4-packaging` is checked.
2. `npm test`, `npm run lint`, `npm run build` green.
3. Re-confirm inventory above. Do not invent a second web stack.

### Phase B — WebView2 layout gate (no Tauri yet)

Catch LCD/overlay breakage in Edge’s engine before Rust.

1. `npm run build` then `npm run preview` (serve `dist/`).
2. Open that URL in **Edge** (WebView2 family), not only
   Chromium / Electron.
3. Ron + agent walk the **Phase B short matrix** below.
4. If the face is broken: fix CSS/layout only; do **not** start
   Phase C until that pass is clear.

#### Phase B short matrix (Edge + `dist/`)

| # | Check | Pass? |
|---|--------|-------|
| B1 | Faceplate + hitboxes: AC, digit, SHIFT, MODE flash correct keys | |
| B2 | LCD dual line; status S/A/M/STAT/D (Degree) | |
| B3 | Fraction template paint (stacked); note `R30` if `12.5`→25/2 — do not “fix” under this slice | |
| B4 | √ / xⁿ templates look like the unit | |
| B5 | Show keys on/off — unit rescales, no clip | |
| B6 | `sin(30)` `=` → 0.5; `log10(100)` `=` → 2 | |
| B7 | MODE 3 → type editor opens | |
| B8 | MODE 5 → 3 quadratic editor opens | |

### Phase C — Minimal Tauri host

1. Add Tauri 2 + Rust (`src-tauri/`).
2. Packaged app loads `dist/` (same idea as Electron `loadFile`).
3. Dev: optional `http://localhost:3000` for HMR.
4. Window: frameless, Shevon title, local icon, sized like Electron.
5. Scripts: `build:exe` → Tauri; rename current to
   `build:exe:electron`.
6. **Stop.** Ron launches the shell exe and confirms size ≪ 100 MB
   (APIs can still be stubs).

### Phase D — Port desktop APIs

1. Rust commands for the three APIs; thin JS shim keeps
   `window.shevonDesktop` so `Calculator.tsx` call sites barely change.
2. Replace `isElectronApp()` with `isDesktopApp()` (Electron **or**
   Tauri) so Pin / Close / pane widen still show.
3. Map drag region to Tauri (`data-tauri-drag-region` or equivalent)
   alongside existing `-webkit-app-region`.
4. Accelerator: today Electron `CommandOrControl+Shift+Space`.
   Parse/register equivalently in Tauri (or normalize in the shim).
   Document any label change under Keyboard.
5. Re-test Pin, More widen, bring-to-front toggle, Close.

### Phase E — Full WebView verification (Ron + Tauri exe)

Log new fails to `docs/tech-issues.md` or `issues.md` — never both.
Do not implement Phase 3 / LineIO / `p4-exact` here. Re-spot-check
Edge if Phase B found issues.

#### Shell / chrome

| # | Check | Pass? |
|---|--------|-------|
| E1 | Window fitted to face; no OS title bar on the unit | |
| E2 | Drag from top strip; Show keys / More / Pin / Close are not-drag | |
| E3 | More widens History; close More restores width; unit fully visible | |
| E4 | Pin toggles always-on-top | |
| E5 | Bring-to-front shortcut toggles hide/show when focused | |
| E6 | Close quits cleanly | |

#### LCD / overlay (WebView vs Chromium risk)

| # | Check | Pass? |
|---|--------|-------|
| E7 | Hitboxes + key flash (AC, digits, SHIFT, MODE) | |
| E8 | LCD + annunciators (S/A/M/STAT/D/R/G/FIX/SCI as applicable) | |
| E9 | Fraction / √ / xⁿ / ∫ templates (∫ limits on glyph if landed) | |
| E10 | Show keys rescale; no clip | |
| E11 | History Load → COMP (`R26`) | |

#### Function smoke ([`sanity-landed.md`](sanity-landed.md) level)

| # | Check | Pass? |
|---|--------|-------|
| E12 | Degree: `sin(30)` → 0.5; `log10(100)` → 2 | |
| E13 | STAT: type editor; recall stays in STAT | |
| E14 | EQN quadratic `a=1,b=0,c=-1` real roots | |
| E15 | `npm test` / `npm run lint` still green | |

#### Size / ship

| # | Check | Pass? |
|---|--------|-------|
| E16 | Exe size clearly under Electron ~100 MB (record MB) | |
| E17 | Coverage Platform names Tauri/WebView2; Electron = fallback script | |
| E18 | Stop tracking fat Electron `.exe` as the primary pullable binary | |

### Phase F — Docs and cutover

1. README: Rust + WebView2 prerequisites; `build:exe` vs
   `build:exe:electron`.
2. `docs/coverage.md` Platform row.
3. Check `roadmap.md` `p4-tauri` only after Ron signed Phase E.
4. Triage: after packaging, Phase 3 is still next for modes;
   `p4-tauri` stays Phase 4 scheduled unless pulled into **Now**.
5. Refresh packaging canvas parked / status row.

## Do not

- Start while `p4-packaging` is still **Now**.
- Start Phase 3 (`p3-*`), `p4-exact`, `p4-samples`, LineIO, or
  `setup-page2` chrome.
- Change COMP / STAT / EQN “while you’re in there.”
- Name the hardware vendor or original model.
- Delete, move, or gitignore-widen `manual.pdf`.
- `Read` `src/calculator_new.png` or `public/icons/*.png`.
- Keep shipping the 100 MB Electron portable as the daily answer.
- macOS/Linux targets (Windows-first).
- Force PWA install.

## Risks

| Risk | Mitigation |
|------|------------|
| WebView2 layout ≠ Chromium | Phase B Edge gate; Phase E matrix |
| Global shortcut / accel string mismatch | Shim + Keyboard re-bind test |
| Frameless drag broken | Explicit drag-region port + E2 |
| WebView2 missing on old Windows | README prerequisite; clear error |
| Accidental EVAL changes | No mode/evaluator edits; `npm test` each phase |
| Fat Electron still in git | E18 after Tauri is daily path |

## Done when

- Ron has completed Phase E on a Tauri/WebView2 exe much smaller
  than ~100 MB.
- `sin(30)` is 0.5. Tests/lint green.
- `roadmap.md` `p4-tauri` checked. Coverage names the small exe.
- Electron may remain as `build:exe:electron`, not the daily wrapper.

## Relative order

1. Finish / check `p4-packaging`.
2. Unit pairing G2+ may continue independently (browser or current exe).
3. When size matters: run Phases A→F in an implementation chat,
   stopping for Ron at B, C, and E.
4. Phase 3 may proceed after packaging; do not wait on Tauri.
