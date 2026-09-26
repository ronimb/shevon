# Kickoff — `ti-numerics` (tan poles, odd roots, integer n!, `0^0`)

Copy everything below the line into a **new agent chat**. This is slice 2
of the tech-issues program. Do not start `ti-store` or Phase 2 leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R1` `R5` `R6` `R20`, `roadmap.md` **Now** §1 `ti-numerics`. Update
`docs/tech-issues.md` and `roadmap.md` in the same change. Refresh canvases
if the program story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are fixing **landed COMP numerics** only: undefined tan, real odd
roots, integer factorial / nCr / nPr, and two fake `1`s. Do not implement
STO, parse, Dist, or CALC E-19.

## Must do

1. **R1** — `tan` poles are Math ERROR for every odd quarter-turn, not
   only exact `90` DEG. Cover `270°`, `−90°`, GRA `100`, RAD `π/2`, and
   equivalents (`450°`, GRA `300`, `3π/2`, …). Nearby defined angles
   (`0`, `180`, `45`) still return a number.
2. **R5** — Odd roots of negatives are real. `root(3,-8)` (SHIFT √) is
   `−2`. Even roots of negatives stay Math ERROR. Do not change `^` /
   `pwr` of a negative (that path may still error).
3. **R6** — Factorial / nCr / nPr are Math ERROR on non-integers and
   negatives. Do not `Math.round` / `floor(abs)` the inputs into an
   answer (`3.7!` must not become `24`; `nCr(-5,2)` must not become
   `10`). Distinct from `fact-max` (170 vs 69) — do not cap at 69.
4. **R20** — `0^0` (caret or `pwr`) and a lone `!` are Math ERROR, not
   `1`. `0!` is still `1`; `2^0` is still `1`.
5. Tests cover the poles above, `³√(−8) = −2`, integer-only n! / nCr /
   nPr, and `0^0` / lone `!` → Math ERROR.

## Do not

- Start `ti-store`, `ti-parse`, or later `ti-*` slices.
- Implement Dist (`p2-dist`), stay-in-STAT, CALC E-19, EQN 1/2/4,
  LineIO, or packaging.
- Change the factorial max from 170 to 69 (`fact-max` / `comp-range`).
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/evaluator.ts` — `__tan`, `__nthroot`, `factorial`, `__ncr` /
  `__npr`, `__pow` / `**`
- `src/manual.golden.test.ts`

## Done when

- `tan(270)` / `tan(-90)` / GRA `tan(100)` are Math ERROR.
- `root(3,-8)` is `−2`; `root(2,-4)` is Math ERROR.
- `3.7!` and `nCr(-5,2)` are Math ERROR; `5!` and `nCr(10,4)` still
  match E-18.
- `0^0` and `!` are Math ERROR.
- `docs/tech-issues.md` R1/R5/R6/R20 and `roadmap.md` `ti-numerics`
  checked only if the whole slice is in.
