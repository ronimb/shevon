# Roadmap

Detailed plan for Shevon, the Casio fx-991ES PLUS emulator. This file is the
**source of truth for scheduled work**.

| If you need… | Go here |
|--------------|---------|
| Design rules (visual fidelity, behavior matching) | [`docs/principles.md`](docs/principles.md) |
| Open bugs | [`issues.md`](issues.md) |
| Ideas not yet assigned to a phase | [`backlog.md`](backlog.md) |
| Feature-by-feature Casio map | [`docs/coverage.md`](docs/coverage.md) |
| LCD element audit | [`docs/visual-fidelity-inventory.md`](docs/visual-fidelity-inventory.md) |

Canvases (`canvases/*.canvas.tsx`) are **views**. If a canvas disagrees with
this file, this file wins — refresh the canvas in the same change when the
phase story changed.

Status: `[ ]` open · `[x]` done (leave done items here until the next phase
wrap-up, then move them to **Landed**).

---

## Now

Priority (25 Sep 2026): **engine tech debt first**, then a sanity pass on
what already ships, then the five remaining Phase 2 items, then packaging
(pulled forward from Phase 4). Daily-driver bar is still COMP + STAT + EQN.
Do not open Phase 3 until Phase 2 closes. Lying menus wait for the matching
feature. Unbounded MthIO / LineIO is **not** tech debt (parked leftover).

Kickoff index: [`docs/prompts/tech-debt.md`](docs/prompts/tech-debt.md).
Slices: [`debt-source-map.md`](docs/prompts/debt-source-map.md),
[`debt-shell.md`](docs/prompts/debt-shell.md),
[`debt-value.md`](docs/prompts/debt-value.md).
Sanity: [`sanity-landed.md`](docs/prompts/sanity-landed.md).

### 1. Remaining engine tech debt (this program)

`p2-solve` already landed typed `CalcError` (gap 1). `debt-source-map` and
`debt-shell` have landed. One slice left. Do not start CMPLX / BASE-N / MATRIX
or `p4-exact` here.

- [x] `debt-source-map` — Source-map the IR rewrite; fill `CalcError.offset`;
      E-40 ◀▶ jump-to-token (`vis-errors` / `err-jump`). Move implicit
      multiply into the parser. Type the helper bag. Do not replace the AST
      walker or parse templates natively.
- [x] `debt-shell` — Split `Calculator.tsx` along existing seams (LCD,
      keyboard, mode router). One state store. First consumer: STAT recall
      (`insertStatVar` in `modes/stat.tsx`) is extractable for `p2-stat-mode`.
      Was backlog “Architecture”.
- [ ] `debt-value` — Evaluator returns `CalcValue` (`real` | `complex` |
      `pair`), not a bare `number`. COMP decimals/fractions must look the
      same. EQN a+bi uses the same type. Pol/Rec may become a pair
      (`pol-rec-line`) if it falls out of the type. Surd/π stay `p4-exact`.

### 2. Sanity check (landed functionality only)

After each debt slice, and once after all three: `npm test`, `npm run lint`,
and a browser pass of COMP (trig, frac, SOLVE Variable / Can’t Solve / L−R),
STAT editor + recall, EQN quadratic real + a+bi. File new defects in
`issues.md`. Do not treat leftovers (LineIO, Dist, linear EQN) as failures.

### 3. Remaining Phase 2

`p2-freq` and `p2-solve` have landed. Then: `p2-edit`, `p2-dist`,
`p2-stat-mode`, `p2-eqn-linear`, `p2-eqn-cubic`. See **Phase 2**.

### 4. Packaging (pulled forward)

`p4-packaging` — GitHub Pages, PWA, electron-builder portable exe, real app
icon. Still after the Phase 2 list; still before Phase 3 modes.

### Parked extra — Current history

Letter-shortcut audit (`hist-letters`) stays under **Emulator extras**. Not
this program.

Visual leftovers that are not tech debt (STAT ▲▼, Disp, `vis-elements`) stay
on the cross-cutting list. `vis-no-literal` has landed.

---

## Cross-cutting — visual fidelity

Applies to **every** phase. Principles:
[`docs/principles.md`](docs/principles.md).

- [ ] `vis-elements` — Audit each screen vs the hardware and add missing
      elements (mode/menu captions, dual-line answers, leftover unlabeled
      editors). EQN quadratic a/b/c labels and cell carets already landed.
- [ ] `vis-indicators` — Light status indicators from real state. ◀▶ and the
      COMP-history ▲▼ now light (Now slice); STAT ▲▼ and Disp still pending;
      CMPLX, MAT, VCT when those modes ship. (S/A/M/STO/RCL/STAT/D/R/G/FIX/SCI
      already work.)
- [ ] `vis-menus` — Fix with the matching feature, not as a standalone pass.
      MODE 2/4/6/7/8 → Phase 3; EQN 1/2/4 → `p2-eqn-linear` / `p2-eqn-cubic`;
      Dist → `p2-dist`. Until then the lie stands.
- [ ] `vis-result` — Same result forms as the unit: S⇔D fraction/surd/π,
      complex a+bi, ×10ⁿ, dual-line Pol/Rec r,θ. Fractions, mixed fractions,
      sci, ENG, and DMS °′″ already work.
- [ ] `vis-errors` — Math / Syntax ERROR E-40 ◀▶ jump-to-token landed
      (`debt-source-map`). Stack / Argument ERROR screens still missing —
      do not add them until a mode needs them.
- [x] `vis-no-literal` — Never show literal function text where the hardware
      shows a symbol or opens a menu. ENG/hyp dumps are gone; trig/hyp/`ln` now
      paint styled names and unclosed templates no longer leak IR stems (one
      shared table in `src/display.tsx` for the LCD and History).
- [ ] `vis-checklist` — Definition of done per feature: element + behavior
      parity vs the manual figure. Pixel-exactness not required.

`vis-cursor` (COMP / EQN / STAT carets) and EQN quadratic placement (`a`/`b`/`c`,
bottom-left entry) have landed — do not re-open unless a regression shows up.

---

## Phase 0 — Cursor-ready foundation

**Status: landed.** Goal was a repo that is understandable, testable, and
honest about what it is.

See **Landed**. One leftover diagnostic: [`issues.md`](issues.md) `p0-console`.

---

## Phase 1 — Make COMP and SETUP honest

**Status: landed.** Goal: every COMP faceplate key does the Casio thing, or is
explicitly disabled — never dump the letters ENG or hyp onto the LCD.

See **Landed**. Remaining COMP gaps that did not block Phase 1 are listed under
**COMP leftovers** below.

---

## Phase 2 — Finish STAT and EQN

**Status: in progress.** Close these before opening new modes.

- [x] `p2-freq` — SETUP STAT FREQ ON/OFF; editor row limits 80 / 40 / 26.
- [x] `p2-solve` — SOLVE: prompt remaining variables, “solve for x”, then
      equation + `x=` + `L-R=` on one screen; Continue to retry. Typed
      `CalcError` so Variable ERROR / Can’t Solve are real kinds.
      Issue: `solve-errors`.
      Kickoff prompt: [`docs/prompts/p2-solve-errors.md`](docs/prompts/p2-solve-errors.md).
- [ ] `p2-edit` — STAT Edit Ins and Del-A; DEL deletes a line in the editor
      (today DEL edits the cell). Issue: `stat-del`.
- [ ] `p2-dist` — 1-VAR Dist: P( Q( R( and normalized variate `'t`.
      Issue: `dist-empty`.
- [ ] `p2-stat-mode` — Stay in STAT when recalling variables instead of
      silently jumping to COMP (`insertStatVar` currently forces COMP).
      Issue: `stat-jump-comp`.
- [ ] `p2-eqn-linear` — EQN 2-unknown and 3-unknown linear systems.
- [ ] `p2-eqn-cubic` — EQN cubic. **Quadratic complex roots** (a+bi) landed.

---

## Phase 3 — Remaining Casio modes

**Status: not started.** One mode per slice, with manual sample operations as
tests before done. Do not start until Phase 2 closes.

- [ ] `p3-cmplx` — CMPLX: i, ∠, a+bi / r∠θ, arg, Conjg, `'r∠θ` / `'a+bi`.
- [ ] `p3-basen` — BASE-N: bases, d/h/b/o prefixes, logic ops, 16/32-bit ranges.
- [ ] `p3-matrix` — MATRIX: Dim/Data, MatA/B/C/Ans, det, Trn, inverse, Abs, powers.
- [ ] `p3-vector` — VECTOR: 2D/3D, dot, cross, Abs, VctAns.
- [ ] `p3-table` — TABLE: f(x), Start/End/Step, Insufficient MEM at >30 rows.
- [ ] `p3-const` — CONST 01–40 (CODATA 2007) and CONV 01–40 (NIST SP 811).

Lying MODE rows stay until the matching `p3-*` feature ships (`vis-menus`
policy). Do not add a separate not-implemented pass.

---

## Phase 4 — Fidelity and packaging

**Status: not started.** After the modes exist.

- [ ] `p4-exact` — Natural result forms: n√m, p/q π, mixed fractions — not just
      continued-fraction decimals. (Mixed/improper via SETUP ab/c vs d/c already
      exist; surd and π forms do not.)
- [ ] `p4-samples` — Automate every numbered sample operation in the PDF as a
      regression suite.
- [ ] `p4-packaging` — Verify GitHub Pages, PWA, and electron-builder portable
      exe; real app icon. **Pulled forward:** run after remaining Phase 2
      (see **Now** §4), before Phase 3.

---

## Emulator extras (scheduled, not Now)

**History sequence contract** (live Current history *and* saved History pane):
sequences log the **physical faceplate keys** that produce the expression,
including SHIFT/ALPHA. Overlay clicks and `reconstructSequence` (used on `=`)
must emit the same vocabulary for the same token. Chips use the same glyphs
as the keycaps (`sin`, `x^□`, `)`, `S⇔D`), not logical letters.

- Example: typing `x` inserts variable X and logs `ALPHA`, `)` — the key that
  wears the red X. Same for `y` → `ALPHA`, `S⇔D`. Digits are one chip each
  (`6`, `0`, not `60`).
- If ALPHA/SHIFT is already latched (Alt/Shift held, or overlay toggle), do
  not duplicate the modifier in the log.
- Corrections (DEL, overwrite) do not appear; Show Keys is the **final**
  recipe, same as `reconstructSequence`.

- [x] Keyboard `x` / `y` insert X / Y; live sequence and `reconstructSequence`
      both log `ALPHA`, `)` / `ALPHA`, `S⇔D`. Show Keys chips match keycaps.
- [x] **Current history** — live key strip **across the top** of the page
      (not in the History pane). Same chips as Show Keys; SHIFT/ALPHA are
      circular like the faceplate. Hidden by default; Show keys toggle.
      Opening the strip or History pane rescales the unit so it stays fully
      visible. AC clears the LCD and the strip. Records calculations **and**
      non-calc operations (STO letter, MODE, SETUP, CLR, M+/M−).
- [ ] Remaining letter shortcuts (and SHIFT/ALPHA overlays for A–F / M)
      audited against this contract.

Related defects: [`issues.md`](issues.md) `hist-letters`, `comp-keys`.

---

## COMP leftovers

Not a new phase. Pull into the current phase when they block honesty.
Coverage detail: [`docs/coverage.md`](docs/coverage.md).

- [ ] `comp-lineio` — SETUP MthIO / LineIO (currently display-only), overwrite
      cursor, SHIFT DEL (INS) wrap-as-argument. Issue: `lineio-display`.
- [ ] `comp-colon` — Multi-statements `:` (ALPHA CALC) and Disp indicator.
- [ ] `comp-drg` — SHIFT DRG `° r g` conversions (1G menu).
- [ ] `comp-bytes` — 99-byte input limit and cursor-k warning at 10 bytes left.
- [ ] `comp-sep` — SETUP Dot / Comma result decimal separator.
- [ ] `comp-calc` — CALC UX: Casio prompt flow, equalities, Linear input during
      prompt (SOLVE UX is `p2-solve`).
- [ ] `comp-range` — Per-function ranges from E-38–39; factorial max 69;
      Σ ±1e10 bounds; nested Pol/∫/d/dx/Σ ban.
- [ ] `comp-keys` — PC keyboard: remaining letter keys steal typing; Shift is
      hold vs overlay toggle. `x`/`y` now insert X/Y (see History sequence
      contract).

---

## Out of scope until later

- Contrast, battery, auto power-off (hardware; skip).
- Pixel-perfect LCD font (not before Phase 3 is done).
- Re-implementing Phase 0 / Phase 1 (see **Landed**).

---

## Landed

Do not re-open these unless a regression shows up.

**Phase 0** — App split, typed AST (no `new Function`), golden tests, README,
AI Studio deps gone, `calculator_new.png` committed. Remaining `console.log`
is the hitbox-calibration CSS dump, not expression logging.

**Phase 1** — SETUP Fix/Sci/Norm + FIX/SCI indicators, hyp menu + Abs,
Ran#/RanInt#, ENG, sexagesimal °′″, Rnd(, Gauss–Kronrod ∫, central-diff d/dx,
LCD ▲/▼ history replay, Math/Syntax ERROR dismiss, SHIFT 9 CLR.

**Phase 2 started** — STAT FREQ ON/OFF with 80/40/26 row caps; EQN quadratic
editor a/b/c labels, cell caret, bottom-left entry; STAT editor caret;
quadratic complex roots as a+bi.

**Visual** — COMP / EQN / STAT carets (`vis-cursor`); ENG/hyp/Abs/Ran# no
longer dump raw ASCII. `vis-no-literal`: shared LCD/History template table so
trig/hyp/`ln` paint styled names and unclosed templates never leak IR stems
(`ir-leak`, `ascii-tokens`). `vis-indicators`: ◀▶ + COMP-history ▲▼ light.

**SOLVE** — E-20/E-21/E-41: Variable ERROR, Can’t Solve, initial-X prompt,
X= result, L−R residual, Continue (`p2-solve`). LCD errors are one
`lcdError` (`CalcError`), not Syntax/Math booleans.

**Tests** — golden (manual samples + Phase 1/2 + vis-no-literal +
history/keys + SOLVE + E-40 offset/jump) + parser (implicit multiply) > 86.

**debt-source-map** — IR rewrite carries original offsets onto AST nodes and
`CalcError.offset`. Syntax / Math ERROR ◀▶ jumps to the fault token. Implicit
multiply is token-level in the parser (`log10(100)` stays 2). Helper bag is
typed.

**debt-shell** — `Calculator.tsx` composes `lcd.tsx`, `keyboard.ts`,
`useCalculatorState`, and `modeRouter.ts`. One store for `vars` / `ans` /
history. STAT recall lives in `modes/stat.tsx` (still jumps to COMP).

---

## How to use this file

When you pick up, finish, defer, or add **scheduled** work, edit this file in
that same change. New ideas with no phase go in [`backlog.md`](backlog.md).
Defects go in [`issues.md`](issues.md), with a phase or action id when one
exists.
