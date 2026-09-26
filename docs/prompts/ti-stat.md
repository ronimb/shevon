# Kickoff — `ti-stat` (FREQ overwrite, STAT memory, x̂/ŷ)

Copy everything below the line into a **new agent chat**. This is slice 1
of the tech-issues program. Do not start `ti-numerics` or Phase 2 leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R14` `R3` `R18`, `roadmap.md` **Now** §1 `ti-stat`, manual STAT editor /
regression (E-23, E-26–29). Update `docs/tech-issues.md` and `roadmap.md`
in the same change. Refresh canvases if the program story changed. After
the slice, run [`sanity-landed.md`](sanity-landed.md).

You are fixing **landed STAT correctness** only: cell entry, memory overlay,
and invalid x̂/ŷ. Do not implement Dist or stay-in-STAT.

## Must do

1. **R14** — In the STAT editor, the first digit (or sign/dot that starts
   a new number) **replaces** the current cell. Default FREQ is `1`; typing
   `5` must store `5`, not `15`. Same rule for any non-zero cell you start
   typing into. DEL still deletes the **line** (E-23 / `p2-edit`), not a
   digit — so overwrite is the only way to change FREQ.
2. **R3** — `evaluateExpression` must not spread STAT regression letters
   (`A` `B` `C` `R` `N`) over user memory on a COMP line. STAT recall
   tokens (`stat_*` / the STAT menu inserts) still resolve. Null type
   already returns `{}` (`mem-abc-nan`); selected type must not clobber
   STO A/B/C either. Distinct from `stat-jump-comp`.
3. **R18** — x̂ / ŷ on an invalid domain (zero slope, ln of x≤0, 1/X at 0,
   …) is Math ERROR, not `0`.
4. Tests cover FREQ overwrite, “STO A then STAT type then COMP A still A”,
   and at least one invalid x̂/ŷ → Math ERROR.

## Do not

- Implement Dist (`p2-dist`) or stay-in-STAT (`p2-stat-mode`).
- Start `ti-numerics`, STO/prompt slices, CALC E-19, EQN 1/2/4, LineIO,
  or packaging.
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/modes/stat.tsx` — `applyStatDigit`, `calculateStatVars`
- `src/evaluator.ts` — `baseEnv` merge; `__xhat` / `__yhat`
- `src/manual.golden.test.ts` (and STAT helper tests)

## Done when

- Browser: FREQ cell `1`, type `5` → `5`; 1-VAR mean uses that weight.
- Browser: STO 7 → A, enter STAT A+BX with data, MODE 1, RCL A → 7 (not
  the fit intercept).
- Invalid x̂/ŷ is Math ERROR.
- `docs/tech-issues.md` R14/R3/R18 and `roadmap.md` `ti-stat` checked only
  if the whole slice is in.
