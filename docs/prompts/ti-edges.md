# Kickoff — `ti-edges` (signed square, Pol/Rec, %, EQN a=0, display, ∫, persist)

Copy everything below the line into a **new agent chat**. This is slice 7
of the tech-issues program. Do not start `p2-calc` or later leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R15` `R16` `R17` `R19` `R21` `R22` `R23` `R24`, `roadmap.md` **Now**
§1 `ti-edges`. Update `docs/tech-issues.md` and `roadmap.md` in the
same change. Refresh canvases if the program story changed. After the
slice, run [`sanity-landed.md`](sanity-landed.md).

You are fixing **remaining medium landed edges** only: signed square,
Pol/Rec memory writes, percent-of, EQN a=0, tiny-value display, ∫
budget, persistence, and the blank result line. Do not start another
`ti-*` slice or Phase 2 leftovers.

## Must do

1. **R15** — Confirm `(−) 3 x²` on the hardware (priority: postfix
   x² above prefix `(−)`), then match it. The faceplate sequence
   inserts `-3²` and must equal **−9**, not `(−3)²` = 9. Packed
   `(−3)²` stays 9.
2. **R16** — Pol / Rec write X,Y through `setVars`, not by mutating
   the live `vars` object. Refresh / a later stale `setVars` must
   not drop those letters. Pair display stays as-is (`debt-value`).
3. **R17** — `+` / `−` percent-of matches the unit: `200+10%` is
   220, `200-10%` is 180. Bare / `×` / `÷` percent stay `/100`
   (`10%` = 0.1, `200×10%` = 20).
4. **R19** — EQN quadratic with `a=0` is Math ERROR (including
   0=0). Do not solve it as a line or “No solution”.
5. **R21** — `|x| < 1e-15` uses Norm’s sci switch, not a forced
   `0`. Exact 0 still paints `0`.
6. **R22** — Adaptive ∫ has an evaluation budget. A singularity
   is Time Out, not a frozen tab. Ordinary polynomials still
   match displayed precision.
7. **R23** — Persisted Ans / vars / angle are validated on load.
   Bad `localStorage` falls back to 0 / empty letters / DEG.
8. **R24** — Result line is blank while typing. Idle / AC still
   shows `0`. Hardware leaves the answer blank until `=`.
9. Tests cover the signed square, Pol/Rec `setVars` write, `200+10%`,
   EQN a=0, tiny Norm sci, ∫ Time Out, persistence fallbacks, and
   the blank result line.

## Do not

- Start another `ti-*` slice.
- Implement Dist (`p2-dist`), stay-in-STAT, CALC E-19, EQN 1/2/4,
  LineIO, or packaging.
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/evaluator.ts` — signed square, Pol/Rec write bag, `%`, ∫ budget
- `src/modeRouter.ts` — `setVars` after Pol/Rec; EQN a=0 error
- `src/modes/eqn.tsx` — quadratic `a=0`
- `src/format.ts` — tiny-value Norm sci
- `src/useCalculatorState.ts` — persist validation
- `src/lcd.tsx` — blank result line
- `src/types.ts` — Time Out kind if the LCD needs it
- `src/manual.golden.test.ts`

## Done when

- `(−) 3 x²` / `-3²` is −9; `(−3)²` is 9.
- Pol/Rec persist X,Y via `setVars`.
- `200+10%` is 220.
- EQN a=0 is Math ERROR.
- `1e-16` is Norm sci, not `0`.
- Singular ∫ is Time Out and returns.
- Bad storage cannot lock a fake angle or NaN Ans.
- Typing `1+2` leaves the result line blank.
- `docs/tech-issues.md` R15/R16/R17/R19/R21–R24 and `roadmap.md`
  `ti-edges` checked only if the whole slice is in.
