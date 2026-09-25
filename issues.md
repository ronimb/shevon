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

- [x] `ncr-empty-box` — SHIFT × / ÷ (nPr / nCr) with no n painted `C⬚` / `P⬚`.
      Hardware is infix (`10C4`); a lone press is just C/P with the caret after
      the letter, no empty-slot box.

- [x] `root-sup-collision` — Superscript inside a radical used to strike the
      vinculum. Radicals now wrap in `.root` (flex) so the exponent sits in the
      body box under the bar. Round-2 re-smoke (24 Sep 2026).
- [x] `x2-vs-xy-visual` — x² key inserted unicode `²` while x^y used `.sup`;
      both now paint via `.sup`. Smoke A1 follow-up.
- [x] `trig-open-trap` — LCD used to paint a phantom `)` on open `sin(`.
      Closing `)` is user-typed only; the painter draws it only when it is in
      the IR. Insert is `sin(‸`.
- [x] `log10-implicit-mul` — `log10(100)` rewrote to `__log10*(100)` → Syntax
      ERROR (smoke B5). Implicit `digit(` multiply skips digits inside helper
      names.
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
      decimal (or an exact p/q). π stays decimal unless the value is an integer.
      **Associated:** `p4-exact`, `vis-result`.
- [x] `invented-frac` — S⇔D / Natural Display used the closest d≤1000 ratio
      (`cos(6°)` → 363/365). Now only exact p/q (e.g. `cos(60)=1/2`); otherwise
      10-digit decimal, and S⇔D does not invent a fraction.

---

## Engine / ranges

- [ ] `fact-max` — Factorial accepts up to 170; Casio Math ERROR above 69.
      **Associated:** `comp-range`.
- [ ] `sigma-bounds` — Σ end is capped at `start+1000`, not the manual ±1e10
      bounds; nested Pol/∫/d/dx/Σ is not banned.
      **Associated:** `comp-range`.
- [x] `solve-errors` — SOLVE failures were Syntax ERROR. Now Variable ERROR
      (no X), Can’t Solve (Newton miss), initial-X prompt, L−R, and Continue
      match E-20/E-21/E-41. LCD uses `CalcError` / `lcdError`.
      **Associated:** `p2-solve`.
      Kickoff: [`docs/prompts/p2-solve-errors.md`](docs/prompts/p2-solve-errors.md).

---

## Memory

- [x] `mem-abc-nan` — STO/RCL A/B/C Math ERROR when STAT type is null:
      `calculateStatVars(null)` used to return `A/B/C: NaN`, and
      `evaluateExpression` spread that over user memory. Fixed: null STAT
      returns `{}`. Smoke E2/E3.
- [x] `sto-without-equals` — Typed operand then STO letter stores that value
      and shows `5→C`; after `=` it shows `Ans→C`.
- [x] `sto-result-stale` — After `5` STO A the previous answer stayed on the
      result line. Store now puts the stored value there.

---

## Platform / extras

- [ ] `comp-keys` — Unmapped letter keys steal typing into the overlay; Shift
      on the PC keyboard is hold, while the overlay SHIFT is a toggle.
      **Associated:** `comp-keys` (COMP leftovers).
- [ ] `hist-letters` — Remaining letter shortcuts (A–F / M) are not fully
      audited against the physical-key History sequence contract (`ALPHA` +
      the faceplate key, not a chip labelled A–F). X/Y already log
      `ALPHA`, `)` / `ALPHA`, `S⇔D`.
      **Associated:** Now → Current history.
- [x] `replay-no-result` — ▲ recalled the expression but cleared the answer
      line. Replay now shows the stored result underneath.
- [x] `flash-map` — Calibration overlay removed from the app.
- [x] `p0-console` — Hitbox-calibration `console.log` went with the flash map.

---

## Closed

None yet in this file. Landed behavior (Fix/Sci/Norm, ENG, hyp, DMS symbols,
FREQ, EQN a/b/c labels, carets) is recorded in [`roadmap.md`](roadmap.md)
**Landed** — do not re-file those unless they regress.
