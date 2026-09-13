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

Priority (12 Sep 2026): COMP visual leftovers first, then close Phase 2
(SOLVE first). Daily-driver bar is COMP + STAT + EQN. Do not open Phase 3
until Phase 2 closes. Packaging stays in Phase 4. Lying menus wait for the
matching feature — no separate “disable the row” pass.

### 1. Visual leftovers (this slice)

Work that is already on screen in COMP. Do not fake-light CMPLX/MAT/VCT, and
do not add Stack/Argument ERROR until those modes exist.

- [ ] `vis-indicators` — **Landed:** ◀▶ annunciators now light from caret
      navigability, and ▲▼ light for COMP history replay (not only EQN result).
      **Remaining:** STAT editor ▲▼ row-nav; Disp (needs `comp-colon`); CMPLX/
      MAT/VCT stay dim until Phase 3. Issue: `ind-hardcoded`, `ind-arrows`.
- [ ] `vis-errors` — Syntax / Math ERROR: E-40 ◀▶ **jump-to-token** (today
      they only dismiss). Issue: `err-jump`. **Deferred:** needs an evaluator
      fault offset, which the Now display slice must not touch.
- [x] `vis-no-literal` — Hardware-style glyphs for the remaining ASCII tokens
      (trig / hyp / `ln`) **and** unclosed templates no longer leak IR names.
      `formatMath` + `toLaTeX` share one template table + walker in
      `src/display.tsx`; `sqrt(24^(2-2)‸` shows a radical, not the letters
      `sqrt`. Issue: `ascii-tokens`, `ir-leak` (both fixed).
      Kickoff prompt: [`docs/prompts/now-visual-slice.md`](docs/prompts/now-visual-slice.md).
- [ ] `vis-elements` — Only gaps on screens we already ship (mode/menu
      captions, dual-line answers). Skip unlabeled editors that belong to
      unbuilt EQN types. (No in-scope element gap actioned in the visual slice.)

`vis-menus` is **not** this slice (see policy below). Surd/π result forms stay
in Phase 4 (`p4-exact`). Dual-line Pol/Rec is `vis-result` / `pol-rec-line` —
pull in only if it blocks the COMP visual pass.

### 2. After that — close Phase 2

Needed for the daily-driver bar and the Phase 3 gate, even though STAT editor
/ Dist / linear EQN are not daily pain. **Do `p2-solve` first.**

See **Phase 2** for the full list.

### Parked extra — Current history

Still scheduled, not this slice. UI + remaining letter-shortcut audit live
under **Emulator extras** below. Keyboard `x`/`y` + `ALPHA`,`X`/`Y` logging
already landed.

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
- [ ] `vis-errors` — Math / Syntax / Stack / Argument ERROR with the E-40
      ◀▶ jump-to-token behavior (today ◀▶ only dismisses the error).
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
- [ ] `p2-solve` — SOLVE: prompt remaining variables, initial X, L−R residual,
      Continue screen. Issue: `solve-errors`. **First Phase 2 item after the
      visual slice.**
- [ ] `p2-edit` — STAT Edit Ins and Del-A; DEL deletes a line in the editor
      (today DEL edits the cell). Issue: `stat-del`.
- [ ] `p2-dist` — 1-VAR Dist: P( Q( R( and normalized variate `'t`.
      Issue: `dist-empty`.
- [ ] `p2-stat-mode` — Stay in STAT when recalling variables instead of
      silently jumping to COMP (`insertStatVar` currently forces COMP).
      Issue: `stat-jump-comp`.
- [ ] `p2-eqn-linear` — EQN 2-unknown and 3-unknown linear systems.
- [ ] `p2-eqn-cubic` — EQN cubic; quadratic complex roots in Natural Display.

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
      exe; real app icon.

---

## Emulator extras (scheduled, not Now)

**History sequence contract** (live Current history *and* saved History pane):
sequences log the Casio key presses that match the PC keyboard shortcut,
including modifiers. Overlay clicks and `reconstructSequence` (used on `=`)
must emit the same vocabulary for the same token.

- Example: typing `x` inserts variable X and logs `ALPHA`, `X` — not a bare
  `x`, and not the physical `)` key that wears the ALPHA-X legend. Same for
  `y` → `ALPHA`, `Y`.
- If ALPHA/SHIFT is already latched (Alt/Shift held, or overlay toggle), do
  not duplicate the modifier in the log.

- [x] Keyboard `x` / `y` insert X / Y; live sequence and `reconstructSequence`
      both log `ALPHA`, `X` / `ALPHA`, `Y`.
- [ ] **Current history** — a prominent live record of the key order and
      presses for the *current* computation (same key-glyph treatment as the
      side-pane History “Show Keys” row, but for one in-progress calculation).
      - Visible by default (not buried behind History expand / pane closed).
      - Simple hide/show toggle.
      - Resets when AC is pressed.
      - `currentSequence` is already accumulated in `Calculator.tsx`; it is
        not shown live today. Past calculations keep using the History pane.
      - Must follow the History sequence contract above.
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
editor a/b/c labels, cell caret, bottom-left entry; STAT editor caret.

**Visual** — COMP / EQN / STAT carets (`vis-cursor`); ENG/hyp/Abs/Ran# no
longer dump raw ASCII. `vis-no-literal`: shared LCD/History template table so
trig/hyp/`ln` paint styled names and unclosed templates never leak IR stems
(`ir-leak`, `ascii-tokens`). `vis-indicators`: ◀▶ + COMP-history ▲▼ light.

**Tests** — 47 golden (manual samples + Phase 1/2 + vis-no-literal) + 16
parser = 63.

---

## How to use this file

When you pick up, finish, defer, or add **scheduled** work, edit this file in
that same change. New ideas with no phase go in [`backlog.md`](backlog.md).
Defects go in [`issues.md`](issues.md), with a phase or action id when one
exists.
