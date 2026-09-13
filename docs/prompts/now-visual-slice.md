# Kickoff prompt — Now visual slice

Copy everything below the line into a **new agent chat**. Do not start Phase 2,
Current history, or an evaluator rewrite in that chat.

---

Follow `docs/principles.md`. Markdown is the source of truth: `roadmap.md` Now,
`issues.md`, `docs/visual-fidelity-inventory.md`. Update those files in the
same change as the code. Refresh canvases if the Now story changed.

You are implementing the **Now visual leftovers** slice only.

## Do not mix this up with a Math ERROR / evaluator ticket

A screenshot of `√(24^(2-2)…)` on the emulator was reviewed in a prior chat.
The user clarified: **the bug is not Math ERROR**. The LCD must never show
function IR “under the hood” (the letters `sqrt`). `24^(2-2)` is `24^0 = 1`;
once parens close, that expression is not a domain error.

Do **not** rewrite `processTemplatesForJS` / `resolveExponents` / the eval
string-lowerer in this slice. Leave `sqrt(` in the key-handler IR. This is a
**display** change (`formatMath` / LCD), plus the other Now visual items
below.

## Must-fix: IR names must never appear on the LCD (`vis-no-literal`)

Issue: `ascii-tokens` / `ir-leak` in `issues.md`.

**Repro:** type an unclosed square root whose body still has an open power,
e.g. IR `sqrt(24^(2-2)‸`. Today `formatMath` only replaces `sqrt(` when
`getBalanced` finds a matching `)`. If it does not, the walker **`break`s**,
so the LCD prints `sqrt(`. Power `^(` already has an unclosed `$` fallback,
which is why the exponent still looks like a superscript while `sqrt` leaks.

**Same hole in other functions** — do not special-case `sqrt`:

1. **Has a glyph, but only if closed:** `nCr`, `nPr`, `pol`, `rec`, `mix`,
   `frac`, `int`, `diff`, `root`, `sqrt`, `sqr`, `cube`, `log_b`, `log10`,
   `e^`, `10^`, `pwr`, `Σ`, `RanInt`, `Rnd`, `abs`. Nested open templates
   abort the whole pass at the leftmost unclosed `name(`.
2. **No LCD glyph even when closed:** `sin`/`cos`/`tan` and inverses,
   `sinh`/`cosh`/`tanh` and inverses, `ln`. History `toLaTeX` already maps
   several of these; the LCD does not.

**General solution (implement this, not a `$` fallback only for sqrt):**

- Treat IR stems as **never LCD-visible**. One table: IR stem → how to paint
  it, including the open-ended case. Share it with `toLaTeX` so LCD and
  history cannot drift.
- **Closed:** `name( … )` → glyph; body is the balanced contents.
- **Open:** `name( …` with no matching `)` → **same glyph**, body is the rest
  of the string (what `^(` already does). Casio shows an open radical while
  you type; it does not wait for `)`.
- **Do not `break` the scan** when the first hit is unclosed. Render that
  open template, then keep walking the body so `sqrt(24^(2-2)‸` is a radical
  whose body still runs the `^(` superscript pass.
- Put **every `PATS` token** in that table, including trig / hyp / `ln`.
- If the hardware shows a symbol or a named template (Abs, log, sin),
  `formatMath` never emits the IR stem, open or closed.

Acceptance: unclosed `sqrt(24^(2-2)‸` shows a radical, not the letters
`sqrt`. Closed `sin(30)` does not print `sin(`. ENG/hyp/Abs/Ran# must stay
non-literal.

## Also in this slice

- `vis-indicators` — Light **existing-state** indicators only: Disp, ◀▶, and
  ▲▼ for COMP history replay (not only EQN result). Leave CMPLX/MAT/VCT dim.
  Issues: `ind-hardcoded`, `ind-arrows`.
- `vis-errors` — Syntax / Math ERROR: E-40 ◀▶ **jump the caret to the fault
  token** (today they only dismiss). Do not add Stack/Argument ERROR screens.
  Issue: `err-jump`.
- `vis-elements` — Only gaps on screens we already ship. Skip unlabeled
  editors for unbuilt EQN types.

## Out of scope (do not start)

- `vis-menus` / lying MODE rows (fix when the feature ships)
- Phase 2 (`p2-solve` is next **after** this slice)
- Current history UI
- Phase 3 modes, Phase 4 surd/π forms / packaging
- Evaluator IR rewrite, `24^-2` / `log10` implicit-mult / cube-root-of-negative
  (those are engine leftovers, not this display slice)

## Done when

- Tests cover open `sqrt(` (and at least one other open template) plus closed
  trig/`ln` so IR stems cannot regress onto the LCD.
- `roadmap.md` / `issues.md` checkboxes updated for what actually landed.
- Browser: type an unclosed √ with a nested open `x^y`, confirm no `sqrt`
  letters; confirm ◀▶ on a Syntax ERROR moves to the bad token; confirm ▲▼
  can light for COMP history.

Follow `docs/principles.md`: element + behavior parity, not pixel-perfect
mimicry.
