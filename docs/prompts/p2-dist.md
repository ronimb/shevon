# Kickoff — `p2-dist` (1-VAR Dist P( Q( R( `'t`)

Copy everything below the line into a **new agent chat**. One slice.
`p2-calc` is in. Do not start stay-in-STAT, EQN 1/2/4, LineIO, or
packaging.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Phase 2 `p2-dist`,
`issues.md` `dist-empty`, `docs/coverage.md` STAT Dist, `roadmap.md`
`vis-menus`, manual **E-25**. Update those files in the same change.
Refresh canvases if the Phase 2 story changed. Afterward run
[`sanity-landed.md`](sanity-landed.md).

You are filling the **STAT Dist submenu** so 1-VAR normal distribution
matches the hardware. Sum / Var / MinMax / Reg already insert. Dist
row 5 exists; `getStatSubMenuOptions('Dist')` returns `[]`.

## Must do

1. Read E-25 (and the Dist figures). Element + behavior parity — not
   pixel-perfect. Use the numbered sample operations as tests.
2. SHIFT 1 → 5 Dist shows the hardware rows: **P( Q( R( `'t`**.
   Picking a row inserts that symbol the same way other STAT recalls
   insert. An empty Dist submenu is a lie — do not leave it.
3. P( Q( R( are the standard-normal probabilities the figure shows
   (not invented names). `'t` is the normalized variate from the
   current 1-VAR data. Never fake a plausible number.
4. Dist is a **1-VAR** feature. If the unit hides or rejects Dist on
   regression types, match that. Do not invent Dist for A+BX etc.
5. Recalling a Dist symbol may still jump to COMP — that is
   `stat-jump-comp` / `p2-stat-mode`, not this slice.

## Do not

- Start `p2-stat-mode`, EQN 1/2/4, LineIO, or packaging.
- Re-work CALC / SOLVE except if a shared insert helper is required.
- Disable lying MODE/EQN rows.
- Change quadratic STAT r vs A B C m1 m2 n (backlog).

## Files

- `src/modes/stat.tsx` — Dist options, insert tokens, submenu paint
- `src/modeRouter.ts` — STAT_RESULT / STAT_RESULT_SUB if Dist needs
  its own path
- `src/evaluator.ts` — P( Q( R( `'t` if they are not already helpers
- `src/display.tsx` — paint if the unit uses a glyph, not ASCII `P(`
- `src/manual.golden.test.ts` — E-25 samples

## Done when

- Browser: 1-VAR data in, SHIFT 1 → 5 Dist shows P( Q( R( `'t`;
  each row inserts and `=` matches the E-25 sample (displayed
  precision).
- Tests/lint green. `issues.md` `dist-empty` and `roadmap.md`
  `p2-dist` checked only if the whole slice is in. Coverage Dist
  Missing → Done (or Partial if stay-in-STAT still jumps).
