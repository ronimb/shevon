# Issues

Open defects — behavior that exists but is wrong, incomplete, or dishonest.
This file is the **source of truth for honesty leftovers and leftover-linked
bugs**.

Landed-correctness items (`R*` / `ti-*`) live in
[`docs/tech-issues.md`](docs/tech-issues.md). Do not copy those R-ids here.

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
- [ ] `setup-page2` — SETUP ▼ (page 2) on the unit is 1:ab/c 2:d/c
      3:CMPLX 4:STAT 5:Disp 6:CONT. Shevon shows 1:ab/c 2:d/c 3:STAT
      only. STAT FREQ still works on **3**. CMPLX format waits
      `p3-cmplx`; Disp is `comp-sep`; CONT is out of scope.
      **Associated:** `vis-menus`.

---

## COMP

- [ ] `calc-ux` — Unshifted CALC prompts every `[A-MYX]` in the raw string
      and then evaluates. Hardware (E-19) prompts memory letters only,
      shows the previous value, lets you recalc, and handles equalities
      as the figure shows. Linear-during-prompt is the current I/O for
      the value, not SETUP LineIO.
      **Associated:** `p2-calc` (was `comp-calc`).
      Kickoff: [`docs/prompts/p2-calc.md`](docs/prompts/p2-calc.md).
      **Now** row 1. Shared prompt helper already landed (`ti-store` /
      `ti-parse`).

---

## STAT / EQN

- [ ] `stat-jump-comp` — Recalling a STAT variable (`insertStatVar` in
      `src/modes/stat.tsx`) forces COMP. The unit stays in STAT.
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
- [ ] `surd-pi-form` — Surd input templates exist; results fall back to
      decimal (or an exact p/q). π stays decimal unless the value is an integer.
      **Associated:** `p4-exact`, `vis-result`.
- [ ] `prompt-prev-size` — SOLVE/CALC previous value (bottom-right, e.g.
      `12` at `Y?`) is painted smaller and faded (`0.7rem` / 50%
      opacity). The unit uses the normal result size. R7 behavior is
      fine; this is chrome only. Same paint as unshifted CALC.
      **Associated:** `vis-elements`.

---

## Engine / ranges

- [ ] `fact-max` — Factorial accepts up to 170; the hardware raises Math ERROR above 69.
      **Associated:** `comp-range`.
- [ ] `sigma-bounds` — Σ end is capped at `start+1000`, not the manual ±1e10
      bounds; nested Pol/∫/d/dx/Σ is not banned.
      **Associated:** `comp-range`.

---

## Platform / extras

- [ ] `comp-keys` — Unmapped letter keys steal typing into the overlay; Shift
      on the PC keyboard is hold, while the overlay SHIFT is a toggle.
      Letter shortcuts (L/R/Q/C/T/S/A/X/Y) and keys that do not need Shift
      to type (`.`, `-`, `/`, `0`, `1`, `9`) now call the same handlers as
      the faceplate. `+` `*` `(` `)` `^` still insert the unshifted symbol
      because those characters are typed with a held Shift (otherwise
      `+` would become Pol).
      **Associated:** `comp-keys` (COMP leftovers).
- [ ] `shift-ac-mem` — No OFF. Ron wants SHIFT AC to clear memory
      (A–F, X, Y, M, Ans) with a short LCD indication. Hardware SHIFT
      AC is OFF (roadmap **Out of scope**). CLR already does this:
      SHIFT 9 → 2 Memory (or 3 All).
      **Associated:** Emulator extras `shift-ac-mem`.
      Kickoff: [`docs/prompts/shift-ac-mem.md`](docs/prompts/shift-ac-mem.md).
- [ ] `hist-letters` — Remaining letter shortcuts (A–F / M) are not fully
      audited against the physical-key History sequence contract (`ALPHA` +
      the faceplate key, not a chip labelled A–F). X/Y already log
      `ALPHA`, `)` / `ALPHA`, `S⇔D`. `L` now matches the log key (`log10`),
      not log□ / Sum.
      **Associated:** Emulator extras (`hist-letters`).

---

## Closed

Wrap-up 26 Sep 2026 after `p2-edit` + sanity. Do not re-file unless they
regress. Landed behavior is also in [`roadmap.md`](roadmap.md) **Landed**.

- [x] `stat-del` — STAT editor DEL deletes the data line (E-23); Ins / Del-A
      on SHIFT 1 → 3 Edit. **Associated:** `p2-edit`.
- [x] `ncr-empty-box` — Lone nPr / nCr is infix C/P with the caret after the
      letter, no `⬚` box.
- [x] `root-sup-collision` — Superscript inside a radical sits under the
      vinculum (`.root` flex wrap).
- [x] `x2-vs-xy-visual` — x² and x^y both paint via `.sup`.
- [x] `trig-open-trap` — Open `sin(` does not paint a phantom `)`. Insert is
      `sin(‸`.
- [x] `log10-implicit-mul` — `log10(100)` stays a call (no `__log10*` rewrite).
- [x] `err-jump` — Syntax / Math ERROR ◀▶ jumps to `CalcError.offset` (E-40).
      Variable ERROR / Can’t Solve dismiss without a jump. **Associated:**
      `vis-errors`, `debt-source-map`.
- [x] `ascii-tokens` / `ir-leak` — Shared `paintTemplates` table; trig/hyp/`ln`
      paint styled names; unclosed templates never leak IR stems.
      **Associated:** `vis-no-literal`.
- [x] `pol-rec-line` — Top-level Pol/Rec paints `r=…, θ=…` or bottom-right
      `x=…, y=…`. **Associated:** `vis-result`, `debt-value`.
- [x] `invented-frac` — S⇔D / Natural Display only show an exact p/q.
- [x] `solve-errors` — Variable ERROR, Can’t Solve, initial-X, L−R, Continue.
      **Associated:** `p2-solve`.
- [x] `mem-abc-nan` — Null STAT no longer overlays A/B/C with NaN.
- [x] `sto-without-equals` / `sto-result-stale` — Typed operand then STO letter
      stores that value (`5→C`) and puts it on the result line.
- [x] `replay-no-result` — ▲ replay shows the stored result underneath.
- [x] `flash-map` / `p0-console` — Calibration overlay and its `console.log`
      removed.
