# Kickoff — `R17` (revert +/− `%` to ÷100)

Copy everything below the line into a **new agent chat**. One slice.
Do not start `R28`, `R29`, or `p2-calc` in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R17`, `roadmap.md` **Now** row 1, manual E-11. Update
`docs/tech-issues.md` and `roadmap.md` **Now** in the same change.
Afterward run [`sanity-landed.md`](sanity-landed.md).

Ron’s unit treats `%` as ÷100. `ti-edges` made `200+10%` → 220; that
read was wrong. Revert +/− `%` to the same ÷100 as bare / `×` / `÷`.

## Must do

1. `200+10%` → **200.1**. `200-10%` → **199.9** (200 − 0.1), not 180.
2. Bare `10%` → 0.1. `200×10%` → 20. `200÷10%` stays the ÷100 meaning.
3. Replace tests that expect 220 / 180.
4. Check `[x]` on `R17` and move **Now** to `R28` only if this slice
   is fully in.

## Do not

- Invent a percent-of operator. The unit is ÷100.
- Start `R28`, `R29`, `p2-calc`, Dist, EQN 1/2/4, LineIO, or packaging.
- Disable lying MODE/EQN rows.

## Files

- `src/evaluator.ts` — `%` rewrite
- `src/manual.golden.test.ts`
- `docs/coverage.md` Percent row (Partial → Done if the unit matches)

## Done when

- Browser: `200+10%` = 200.1; `10%` = 0.1; `200×10%` = 20.
- Tests/lint green. Coverage Percent gap cleared or still honest.
