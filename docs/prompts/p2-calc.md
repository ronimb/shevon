# Kickoff — `p2-calc` (unshifted CALC, E-19)

Copy everything below the line into a **new agent chat**. One slice.
`R29` is in. Do not start Dist, stay-in-STAT, EQN 1/2/4, LineIO, or
packaging. Do not change SOLVE except to share prompt helpers.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Phase 2 `p2-calc`,
`issues.md` `calc-ux`, `docs/coverage.md` CALC / SOLVE, manual **E-19**.
Update those files in the same change. Refresh canvases if the Phase 2
story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are aligning **unshifted CALC** with the hardware. SHIFT CALC (SOLVE)
already landed (`p2-solve`). ALPHA CALC still inserts `=` (`comp-colon`
is not this slice).

Today (`modeRouter.ts` `handleCalc` when not SHIFT): every `[A-MYX]` in
the raw caret string is queued, each letter is `A?` with a dummy `"0"`
default, then `evaluateExpression`. No letters → it just runs `=`.

## Must do

1. Read E-19 (and the CALC figures). Element + behavior parity — not
   pixel-perfect. Do not invent a second prompt UI.
2. Prompt **memory letters that CALC actually asks for** (A–F, M, X, Y
   that are variables in the expression). Do not treat letters inside
   function stems / IR as variables. Reuse or share
   `collectSolvePromptVars`-style scanning; do not keep the raw
   `/[A-MYX]/g` sweep if it is wrong vs the figure.
3. Prompt screen matches the unit: expression above, `A?` (or X? …)
   bottom-left, previous stored value available the way E-19 shows
   (today: `promptVar` / `prevPromptValue` in `lcd.tsx`).
4. After `=`, recalc: CALC again re-prompts with the values just stored,
   same as the hardware’s “change a letter and calculate again” flow.
5. Equalities: if E-19 shows CALC on an expression that contains `=`,
   match that figure. A single equation is not SOLVE (do not run Newton).
6. Value entry during the prompt uses the current COMP I/O (MthIO).
   “Linear during prompt” means number entry on the prompt line, not
   implementing SETUP LineIO.

## Do not

- Implement SETUP MthIO / LineIO (`comp-lineio` / `lineio-display`).
- Change SOLVE screens (confirm / x= / L−R / Continue) except shared
  letter collection.
- Start `p2-dist`, `p2-stat-mode`, EQN 1/2/4, or packaging.
- Colon / Disp (`comp-colon`).

## Files

- `src/modeRouter.ts` — unshifted `handleCalc` / `tackleNextPrompt`
- `src/modes/comp.ts` — letter collection helpers
- `src/lcd.tsx` — prompt paint if E-19 needs a tweak
- `src/manual.golden.test.ts` — E-19 samples (prompt order, no
  stem-letter false positives, recalc, equality if the figure has one)

## Done when

- Browser: `3A+B` CALC prompts A then B with previous values; `=` yields
  the hardware result; CALC again re-prompts. A Syntax-looking letter inside
  a function name is not a prompt.
- Existing SOLVE tests still pass.
- `issues.md` `calc-ux` checked only if E-19 behavior is in.
- `roadmap.md` `p2-calc` checked only if the whole slice is in.
