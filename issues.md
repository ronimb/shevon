# Issues

Open defects — behavior that exists but is wrong, incomplete, or dishonest.
This file is the **source of truth for bugs**.

Missing modes and net-new features live in [`roadmap.md`](roadmap.md). Ideas
with no phase yet live in [`backlog.md`](backlog.md).

When an issue is already scheduled, **Associated** names the phase or action
id from the roadmap. Fix the issue as part of that action; do not create a
second plan.

Status: `[ ]` open · `[x]` fixed (move to **Closed** at the next wrap-up).

---

## Honesty (menus that lie)

- [ ] `lying-menus` — MODE 2 (CMPLX), 4 (BASE-N), 6 (MATRIX), 7 (TABLE),
      8 (VECTOR) are listed, then silently return to COMP.
      **Associated:** `vis-menus`; implementations are Phase 3 (`p3-*`).
      **Policy:** leave the lie until the matching feature ships — no
      standalone disable pass.
- [ ] `eqn-menu-fallthrough` — EQN menu shows types 1/2/4; only type 3
      (quadratic) runs.
      **Associated:** `vis-menus`, `p2-eqn-linear`, `p2-eqn-cubic`.
      **Policy:** same as `lying-menus` — fix when those EQN types ship.
- [ ] `dist-empty` — STAT Dist submenu label exists; the submenu is empty.
      **Associated:** `p2-dist`.
- [ ] `lineio-display` — SETUP lists MthIO / LineIO; choosing them returns to
      COMP with no input-mode change.
      **Associated:** `comp-lineio`.

---

## STAT / EQN

- [ ] `stat-del` — In the STAT editor, DEL edits the cell; on the hardware it
      deletes the line. Ins / Del-A are missing.
      **Associated:** `p2-edit`.
- [ ] `stat-jump-comp` — Recalling a STAT variable (`insertStatVar`) forces
      COMP. The unit stays in STAT.
      **Associated:** `p2-stat-mode`.

---

## Display / LCD

- [ ] `ind-hardcoded` — CMPLX, MAT, VCT, and Disp render but stay dim
      (`opacity-10`); never tied to real state.
      **Associated:** `vis-indicators`. CMPLX/MAT/VCT lighting waits on Phase 3
      modes; Disp waits on multi-statement `:` (`comp-colon`). Leaving them lit
      with no backing state would be a lie (`docs/principles.md`).
- [ ] `ind-arrows` — ▲/▼ still do not light in the STAT editor (row nav).
      **Fixed for COMP:** ◀▶ annunciators now render in the status bar and light
      from caret navigability, and ▲/▼ light for COMP history replay (not only
      the EQN result). STAT row-nav lighting is the remaining gap.
      **Associated:** `vis-indicators`.
- [ ] `err-jump` — Syntax / Math ERROR: ◀▶ dismisses the error and returns to
      the expression; they do not jump the caret to the fault token (E-40).
      Stack / Argument ERROR screens are missing.
      **Associated:** `vis-errors`. **Blocked (Now slice):** true jump-to-token
      needs the evaluator to surface the fault offset; the Now visual slice must
      not touch the evaluator (`docs/prompts/now-visual-slice.md`), so this is
      deferred until a fault index is available.
- [x] `ascii-tokens` — Remaining function glyphs (trig/hyp/`ln`) now paint a
      styled hardware-style name via the shared template table in
      `src/display.tsx`; the LCD no longer emits the ASCII stem (`sin(`, `ln(`,
      `sinh(`, …). ENG/hyp/Abs/Ran# already passed when closed.
      **Associated:** `vis-no-literal`.
- [x] `ir-leak` — Fixed. `formatMath`/`toLaTeX` share one template table and a
      walker (`paintTemplates`) that paints unclosed `name(` with the SAME glyph
      (body = the rest of the string, like `^(`) instead of `break`ing, so IR
      stems never reach the LCD. Repro `sqrt(24^(2-2)‸` now shows a radical whose
      body still superscripts `2-2`; nested open templates no longer abort the
      pass. Not a Math ERROR / evaluator bug.
      **Associated:** `vis-no-literal` (Now visual slice). Prior review:
      agent transcript `65992cab-7adc-41c2-8ade-4549a8e80074`.
- [ ] `pol-rec-line` — Pol/Rec input templates exist; the result is a single
      scalar, not the dual-line r,θ / X,Y screen.
      **Associated:** `vis-result`.
- [ ] `surd-pi-form` — Surd input templates exist; results fall back to
      decimal/fraction. π stays decimal unless the value is an integer.
      **Associated:** `p4-exact`, `vis-result`.

---

## Engine / ranges

- [ ] `fact-max` — Factorial accepts up to 170; Casio Math ERROR above 69.
      **Associated:** `comp-range`.
- [ ] `sigma-bounds` — Σ end is capped at `start+1000`, not the manual ±1e10
      bounds; nested Pol/∫/d/dx/Σ is not banned.
      **Associated:** `comp-range`.
- [ ] `solve-errors` — SOLVE failures surface as Syntax ERROR instead of
      Variable ERROR / Can’t Solve. No L−R residual or Continue screen.
      **Associated:** `p2-solve`.

---

## Platform / extras

- [ ] `comp-keys` — Unmapped letter keys steal typing into the overlay; Shift
      on the PC keyboard is hold, while the overlay SHIFT is a toggle.
      **Associated:** `comp-keys` (COMP leftovers).
- [ ] `hist-letters` — Remaining letter shortcuts (A–F / M and SHIFT/ALPHA
      overlays) are not fully audited against the History sequence contract.
      **Associated:** Now → Current history.
- [ ] `p0-console` — Hitbox-calibration still `console.log`s CSS; keep
      diagnostics behind a debug flag.
      **Associated:** Phase 0 leftover.

---

## Closed

None yet in this file. Landed behavior (Fix/Sci/Norm, ENG, hyp, DMS symbols,
FREQ, EQN a/b/c labels, carets) is recorded in [`roadmap.md`](roadmap.md)
**Landed** — do not re-file those unless they regress.
